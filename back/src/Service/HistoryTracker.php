<?php

namespace App\Service;

use App\Entity\ModificationHistory;
use App\Entity\User;
use App\Entity\Student;
use App\Entity\StudentParent;
use App\Entity\Center;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\Security\Core\Authentication\Token\Storage\TokenStorageInterface;
use Symfony\Component\HttpFoundation\RequestStack;
use Psr\Log\LoggerInterface;

/**
 * Service pour tracer automatiquement les modifications des entités
 * 
 * Ce service capture et enregistre toutes les modifications importantes
 * des entités (équipes, élèves, parents, centres) avec contexte complet.
 */
class HistoryTracker
{
    private EntityManagerInterface $entityManager;
    private TokenStorageInterface $security;
    private RequestStack $requestStack;
    private LoggerInterface $logger;

    /**
     * Champs sensibles à ne pas tracer
     */
    private const SENSITIVE_FIELDS = [
        'password',
        'token',
        'secret',
        'salt',
        'hash'
    ];

    /**
     * Mapping des types d'entités
     */
    private const ENTITY_TYPE_MAPPING = [
        Student::class => 'student',
        StudentParent::class => 'parent',
        Center::class => 'center',
        User::class => 'user'
    ];

    public function __construct(
        EntityManagerInterface $entityManager,
        TokenStorageInterface $security,
        RequestStack $requestStack,
        LoggerInterface $logger
    ) {
        $this->entityManager = $entityManager;
        $this->security = $security;
        $this->requestStack = $requestStack;
        $this->logger = $logger;
    }

    /**
     * Trace la création d'une entité
     */
    public function trackCreation(object $entity): void
    {
        $entityType = $this->getEntityType($entity);
        if (!$entityType) {
            return;
        }

        try {
            $history = new ModificationHistory();
            $history->setUser($this->getCurrentUser())
                   ->setEntityType($entityType)
                   ->setEntityId($this->getEntityId($entity))
                   ->setEntityName($this->getEntityName($entity))
                   ->setFieldName('entity')
                   ->setAction('create')
                   ->setOldValue(null)
                   ->setNewValue(['type' => 'entity', 'value' => 'Entité créée'])
                   ->setIpAddress($this->getClientIp())
                   ->setUserAgent($this->getUserAgent())
                   ->setMetadata($this->getEntityMetadata($entity));

            $this->entityManager->persist($history);
            $this->entityManager->flush();

        } catch (\Exception $e) {
            $this->logger->error('Erreur lors du tracking de création', [
                'entity' => get_class($entity),
                'error' => $e->getMessage()
            ]);
        }
    }

    /**
     * Trace les modifications d'une entité
     */
    public function trackUpdate(object $entity, array $changeSet): void
    {
        $entityType = $this->getEntityType($entity);
        if (!$entityType) {
            return;
        }

        try {
            foreach ($changeSet as $fieldName => $changes) {
                // Ignorer les champs sensibles
                if ($this->isSensitiveField($fieldName)) {
                    continue;
                }

                [$oldValue, $newValue] = $changes;

                $history = new ModificationHistory();
                $history->setUser($this->getCurrentUser())
                       ->setEntityType($entityType)
                       ->setEntityId($this->getEntityId($entity))
                       ->setEntityName($this->getEntityName($entity))
                       ->setFieldName($fieldName)
                       ->setAction('update')
                       ->setOldValue($this->formatValue($fieldName, $oldValue))
                       ->setNewValue($this->formatValue($fieldName, $newValue))
                       ->setIpAddress($this->getClientIp())
                       ->setUserAgent($this->getUserAgent())
                       ->setMetadata($this->getEntityMetadata($entity));

                $this->entityManager->persist($history);
            }

            $this->entityManager->flush();

        } catch (\Exception $e) {
            $this->logger->error('Erreur lors du tracking de modification', [
                'entity' => get_class($entity),
                'error' => $e->getMessage()
            ]);
        }
    }

    /**
     * Trace la suppression d'une entité
     */
    public function trackDeletion(object $entity): void
    {
        $entityType = $this->getEntityType($entity);
        if (!$entityType) {
            return;
        }

        try {
            $history = new ModificationHistory();
            $history->setUser($this->getCurrentUser())
                   ->setEntityType($entityType)
                   ->setEntityId($this->getEntityId($entity))
                   ->setEntityName($this->getEntityName($entity))
                   ->setFieldName('entity')
                   ->setAction('delete')
                   ->setOldValue(['type' => 'entity', 'value' => 'Entité existante'])
                   ->setNewValue(['type' => 'entity', 'value' => 'Entité supprimée'])
                   ->setIpAddress($this->getClientIp())
                   ->setUserAgent($this->getUserAgent())
                   ->setMetadata($this->getEntityMetadata($entity));

            $this->entityManager->persist($history);
            $this->entityManager->flush();

        } catch (\Exception $e) {
            $this->logger->error('Erreur lors du tracking de suppression', [
                'entity' => get_class($entity),
                'error' => $e->getMessage()
            ]);
        }
    }

    /**
     * Trace une action personnalisée
     */
    public function trackCustomAction(
        string $entityType,
        int $entityId,
        string $action,
        string $description,
        array $metadata = []
    ): void {
        try {
            $history = new ModificationHistory();
            $history->setUser($this->getCurrentUser())
                   ->setEntityType($entityType)
                   ->setEntityId($entityId)
                   ->setFieldName('action')
                   ->setAction($action)
                   ->setOldValue(null)
                   ->setNewValue(['type' => 'action', 'value' => $description])
                   ->setIpAddress($this->getClientIp())
                   ->setUserAgent($this->getUserAgent())
                   ->setMetadata($metadata);

            $this->entityManager->persist($history);
            $this->entityManager->flush();

        } catch (\Exception $e) {
            $this->logger->error('Erreur lors du tracking d\'action personnalisée', [
                'action' => $action,
                'error' => $e->getMessage()
            ]);
        }
    }

    /**
     * Obtient le type d'entité à partir de la classe
     */
    private function getEntityType(object $entity): ?string
    {
        $entityClass = get_class($entity);
        return self::ENTITY_TYPE_MAPPING[$entityClass] ?? null;
    }

    /**
     * Obtient l'ID de l'entité
     */
    private function getEntityId(object $entity): ?int
    {
        if (method_exists($entity, 'getId')) {
            return $entity->getId();
        }
        return null;
    }

    /**
     * Obtient le nom affiché de l'entité
     */
    private function getEntityName(object $entity): ?string
    {
        switch (get_class($entity)) {
            case Student::class:
                return $entity->getFirstname() . ' ' . $entity->getLastname();
            
            case StudentParent::class:
                return $entity->getFirstname() . ' ' . $entity->getLastname();
            
            case Center::class:
                return $entity->getName();
            
            case User::class:
                return $entity->getFirstname() . ' ' . $entity->getLastname();
            
            default:
                return null;
        }
    }

    /**
     * Formate une valeur pour le stockage JSON
     */
    private function formatValue(string $fieldName, $value): ?array
    {
        if ($value === null) {
            return null;
        }

        // Dates
        if ($value instanceof \DateTime || $value instanceof \DateTimeImmutable) {
            return [
                'type' => 'datetime',
                'value' => $value->format('Y-m-d H:i:s'),
                'display' => $value->format('d/m/Y H:i')
            ];
        }

        // Booléens
        if (is_bool($value)) {
            return [
                'type' => 'boolean',
                'value' => $value,
                'display' => $value ? 'Oui' : 'Non'
            ];
        }

        // Relations (entités)
        if (is_object($value)) {
            if (method_exists($value, 'getId')) {
                return [
                    'type' => 'relation',
                    'value' => $value->getId(),
                    'display' => $this->getEntityName($value) ?? 'ID: ' . $value->getId(),
                    'class' => get_class($value)
                ];
            }
        }

        // Arrays
        if (is_array($value)) {
            return [
                'type' => 'array',
                'value' => $value,
                'display' => implode(', ', array_filter($value))
            ];
        }

        // Valeurs simples
        return [
            'type' => 'string',
            'value' => (string) $value,
            'display' => (string) $value
        ];
    }

    /**
     * Vérifie si un champ est sensible
     */
    private function isSensitiveField(string $fieldName): bool
    {
        $fieldLower = strtolower($fieldName);
        foreach (self::SENSITIVE_FIELDS as $sensitive) {
            if (strpos($fieldLower, $sensitive) !== false) {
                return true;
            }
        }
        return false;
    }

    /**
     * Obtient l'utilisateur actuel
     */
    private function getCurrentUser(): ?User
    {
        $token = $this->security->getToken();
        if (!$token) {
            return null;
        }
        
        $user = $token->getUser();
        return $user instanceof User ? $user : null;
    }

    /**
     * Obtient l'IP du client
     */
    private function getClientIp(): ?string
    {
        $request = $this->requestStack->getCurrentRequest();
        if (!$request) {
            return null;
        }

        return $request->getClientIp();
    }

    /**
     * Obtient le User-Agent
     */
    private function getUserAgent(): ?string
    {
        $request = $this->requestStack->getCurrentRequest();
        if (!$request) {
            return null;
        }

        return $request->headers->get('User-Agent');
    }

    /**
     * Obtient les métadonnées de l'entité
     */
    private function getEntityMetadata(object $entity): array
    {
        $metadata = [
            'entity_class' => get_class($entity),
            'tracked_at' => (new \DateTime())->format('Y-m-d H:i:s')
        ];

        // Ajouter des métadonnées spécifiques selon le type d'entité
        switch (get_class($entity)) {
            case Student::class:
                $metadata['student_class'] = $entity->getClass();
                if ($entity->getIdCenter()) {
                    $metadata['center_id'] = $entity->getIdCenter()->getId();
                    $metadata['center_name'] = $entity->getIdCenter()->getName();
                }
                break;
            
            case Center::class:
                $metadata['center_city'] = $entity->getCity();
                break;
        }

        return $metadata;
    }
}