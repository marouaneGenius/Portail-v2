<?php

namespace App\EventListener;

use App\Service\HistoryTracker;
use App\Entity\Student;
use App\Entity\StudentParent;
use App\Entity\Center;
use App\Entity\User;
use App\Entity\Session;
use Doctrine\ORM\Event\PostPersistEventArgs;
use Doctrine\ORM\Event\PreUpdateEventArgs;
use Doctrine\ORM\Event\PostUpdateEventArgs;
use Doctrine\ORM\Event\PostRemoveEventArgs;
use Doctrine\ORM\Events;
use Psr\Log\LoggerInterface;

/**
 * Event Listener pour capturer automatiquement toutes les modifications d'entités
 * 
 * Ce listener s'active automatiquement lors des opérations Doctrine
 * et utilise le HistoryTracker pour enregistrer les changements.
 */
class EntityModificationListener
{
    private HistoryTracker $historyTracker;
    private LoggerInterface $logger;
    
    /**
     * Stockage temporaire des changements pour éviter les problèmes de flush
     */
    private array $pendingChanges = [];

    /**
     * Entités à tracer automatiquement
     */
    private const TRACKED_ENTITIES = [
        Session::class,
        Student::class,
        StudentParent::class,
        Center::class,
        User::class
    ];

    public function __construct(HistoryTracker $historyTracker, LoggerInterface $logger)
    {
        $this->historyTracker = $historyTracker;
        $this->logger = $logger;
    }

    /**
     * Écoute les créations d'entités
     */
    public function postPersist(PostPersistEventArgs $args): void
    {
        $entity = $args->getObject();
        
        if (!$this->shouldTrackEntity($entity)) {
            return;
        }

        try {
            $this->historyTracker->trackCreation($entity);
            
            $this->logger->info('Entité créée et tracée', [
                'entity_class' => get_class($entity),
                'entity_id' => $entity->getId()
            ]);
            
        } catch (\Exception $e) {
            $this->logger->error('Erreur lors du tracking de création', [
                'entity_class' => get_class($entity),
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
        }
    }

    /**
     * Écoute les modifications d'entités (preUpdate - collecte les changements)
     */
    public function preUpdate(PreUpdateEventArgs $args): void
    {
        $entity = $args->getObject();
        
        if (!$this->shouldTrackEntity($entity)) {
            return;
        }

        try {
            $changeSet = $args->getEntityChangeSet();
            
            // Filtrer les changements vides ou non significatifs
            $filteredChangeSet = $this->filterChangeSet($changeSet);
            
            if (empty($filteredChangeSet)) {
                return;
            }

            // Stocker les changements pour traitement en postUpdate
            $entityKey = spl_object_id($entity);
            $this->pendingChanges[$entityKey] = [
                'entity' => $entity,
                'changes' => $filteredChangeSet
            ];
            
        } catch (\Exception $e) {
            $this->logger->error('Erreur lors du stockage des changements', [
                'entity_class' => get_class($entity),
                'error' => $e->getMessage()
            ]);
        }
    }

    /**
     * Écoute les modifications d'entités (postUpdate - traite les changements stockés)
     */
    public function postUpdate(PostUpdateEventArgs $args): void
    {
        $entity = $args->getObject();
        $entityKey = spl_object_id($entity);
        
        // Vérifier si nous avons des changements en attente pour cette entité
        if (!isset($this->pendingChanges[$entityKey])) {
            return;
        }

        try {
            $pendingChange = $this->pendingChanges[$entityKey];
            
            $this->historyTracker->trackUpdate($pendingChange['entity'], $pendingChange['changes']);
            
            $this->logger->info('Entité modifiée et tracée', [
                'entity_class' => get_class($entity),
                'entity_id' => $entity->getId(),
                'modified_fields' => array_keys($pendingChange['changes'])
            ]);
            
            // Nettoyer le changement traité
            unset($this->pendingChanges[$entityKey]);
            
        } catch (\Exception $e) {
            $this->logger->error('Erreur lors du tracking de modification', [
                'entity_class' => get_class($entity),
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
        }
    }

    /**
     * Écoute les suppressions d'entités
     */
    public function postRemove(PostRemoveEventArgs $args): void
    {
        $entity = $args->getObject();
        
        if (!$this->shouldTrackEntity($entity)) {
            return;
        }

        try {
            $this->historyTracker->trackDeletion($entity);
            
            $this->logger->info('Entité supprimée et tracée', [
                'entity_class' => get_class($entity),
                'entity_id' => method_exists($entity, 'getId') ? $entity->getId() : 'unknown'
            ]);
            
        } catch (\Exception $e) {
            $this->logger->error('Erreur lors du tracking de suppression', [
                'entity_class' => get_class($entity),
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
        }
    }

    /**
     * Détermine si une entité doit être tracée
     */
    private function shouldTrackEntity(object $entity): bool
    {
        $entityClass = get_class($entity);
        
        // Vérifier si l'entité est dans la liste des entités tracées
        if (!in_array($entityClass, self::TRACKED_ENTITIES)) {
            return false;
        }

        // Ne pas tracer les entités de l'historique pour éviter les boucles infinies
        if ($entity instanceof \App\Entity\ModificationHistory) {
            return false;
        }

        // Vérifier que l'entité a un ID (éviter de tracer les entités non persistées en preUpdate)
        if (method_exists($entity, 'getId') && $entity->getId() === null) {
            return false;
        }

        return true;
    }

    /**
     * Filtre le changeset pour ignorer les modifications non significatives
     */
    private function filterChangeSet(array $changeSet): array
    {
        $filtered = [];

        foreach ($changeSet as $field => $changes) {
            [$oldValue, $newValue] = $changes;

            // Ignorer les champs techniques non significatifs
            if ($this->isIgnoredField($field)) {
                continue;
            }

            // Ignorer les changements où old = new (cas particuliers)
            if ($this->areValuesEqual($oldValue, $newValue)) {
                continue;
            }

            $filtered[$field] = $changes;
        }

        return $filtered;
    }

    /**
     * Vérifie si un champ doit être ignoré
     */
    private function isIgnoredField(string $field): bool
    {
        $ignoredFields = [
            'updatedAt',
            'updated_at', 
            'lastLogin',
            'last_login',
            'loginCount',
            'login_count',
            'version' // Pour les entités avec versioning
        ];

        return in_array($field, $ignoredFields);
    }

    /**
     * Compare deux valeurs pour déterminer si elles sont équivalentes
     */
    private function areValuesEqual($oldValue, $newValue): bool
    {
        // Cas spéciaux pour les dates
        if ($oldValue instanceof \DateTime && $newValue instanceof \DateTime) {
            return $oldValue->getTimestamp() === $newValue->getTimestamp();
        }

        if ($oldValue instanceof \DateTimeImmutable && $newValue instanceof \DateTimeImmutable) {
            return $oldValue->getTimestamp() === $newValue->getTimestamp();
        }

        // Cas des chaînes vides vs null
        if (($oldValue === null || $oldValue === '') && ($newValue === null || $newValue === '')) {
            return true;
        }

        // Comparaison par défaut
        return $oldValue === $newValue;
    }

    /**
     * Méthode pour tracer des actions personnalisées depuis les contrôleurs
     * 
     * Usage dans un contrôleur :
     * $this->container->get(EntityModificationListener::class)->trackCustomAction(...)
     */
    public function trackCustomAction(
        string $entityType,
        int $entityId,
        string $action,
        string $description,
        array $metadata = []
    ): void {
        try {
            $this->historyTracker->trackCustomAction($entityType, $entityId, $action, $description, $metadata);
            
            $this->logger->info('Action personnalisée tracée', [
                'entity_type' => $entityType,
                'entity_id' => $entityId,
                'action' => $action
            ]);
            
        } catch (\Exception $e) {
            $this->logger->error('Erreur lors du tracking d\'action personnalisée', [
                'entity_type' => $entityType,
                'entity_id' => $entityId,
                'action' => $action,
                'error' => $e->getMessage()
            ]);
        }
    }
}