<?php

namespace App\Entity;

use App\Repository\ModificationHistoryRepository;
use Doctrine\DBAL\Types\Types;
use Doctrine\ORM\Mapping as ORM;

/**
 * Entité pour tracer l'historique des modifications des équipes, élèves, parents et centres
 * 
 * Cette entité capture automatiquement tous les changements apportés aux entités principales
 * avec les informations sur qui, quoi, quand et depuis où la modification a été faite.
 */
#[ORM\Entity(repositoryClass: ModificationHistoryRepository::class)]
#[ORM\Table(name: 'modification_history')]
#[ORM\Index(columns: ['user_id'], name: 'idx_modification_user')]
#[ORM\Index(columns: ['entity_type'], name: 'idx_modification_entity_type')]
#[ORM\Index(columns: ['entity_id'], name: 'idx_modification_entity_id')]
#[ORM\Index(columns: ['created_at'], name: 'idx_modification_created_at')]
#[ORM\Index(columns: ['entity_type', 'entity_id'], name: 'idx_modification_entity')]
class ModificationHistory
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    private ?int $id = null;

    /**
     * Utilisateur qui a effectué la modification
     */
    #[ORM\ManyToOne(targetEntity: User::class)]
    #[ORM\JoinColumn(name: 'user_id', nullable: true)] // nullable pour les modifications système
    private ?User $user = null;

    /**
     * Type d'entité modifiée (team, student, parent, center, etc.)
     */
    #[ORM\Column(name: 'entity_type', length: 50)]
    private ?string $entityType = null;

    /**
     * ID de l'entité modifiée
     */
    #[ORM\Column(name: 'entity_id')]
    private ?int $entityId = null;

    /**
     * Nom de l'entité modifiée (pour affichage)
     */
    #[ORM\Column(name: 'entity_name', length: 255, nullable: true)]
    private ?string $entityName = null;

    /**
     * Nom du champ modifié
     */
    #[ORM\Column(name: 'field_name', length: 100)]
    private ?string $fieldName = null;

    /**
     * Ancienne valeur (JSON pour gérer tous types de données)
     */
    #[ORM\Column(name: 'old_value', type: Types::JSON, nullable: true)]
    private ?array $oldValue = null;

    /**
     * Nouvelle valeur (JSON pour gérer tous types de données)
     */
    #[ORM\Column(name: 'new_value', type: Types::JSON, nullable: true)]
    private ?array $newValue = null;

    /**
     * Type d'action (create, update, delete)
     */
    #[ORM\Column(length: 20)]
    private ?string $action = null;

    /**
     * Adresse IP de l'utilisateur
     */
    #[ORM\Column(name: 'ip_address', length: 45, nullable: true)]
    private ?string $ipAddress = null;

    /**
     * User Agent du navigateur
     */
    #[ORM\Column(name: 'user_agent', type: Types::TEXT, nullable: true)]
    private ?string $userAgent = null;

    /**
     * Date et heure de la modification
     */
    #[ORM\Column(name: 'created_at')]
    private ?\DateTimeImmutable $createdAt = null;

    /**
     * Données supplémentaires contextuelles (JSON)
     */
    #[ORM\Column(type: Types::JSON, nullable: true)]
    private ?array $metadata = null;

    public function __construct()
    {
        $this->createdAt = new \DateTimeImmutable();
    }

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getUser(): ?User
    {
        return $this->user;
    }

    public function setUser(?User $user): static
    {
        $this->user = $user;
        return $this;
    }

    public function getEntityType(): ?string
    {
        return $this->entityType;
    }

    public function setEntityType(string $entityType): static
    {
        $this->entityType = $entityType;
        return $this;
    }

    public function getEntityId(): ?int
    {
        return $this->entityId;
    }

    public function setEntityId(int $entityId): static
    {
        $this->entityId = $entityId;
        return $this;
    }

    public function getEntityName(): ?string
    {
        return $this->entityName;
    }

    public function setEntityName(?string $entityName): static
    {
        $this->entityName = $entityName;
        return $this;
    }

    public function getFieldName(): ?string
    {
        return $this->fieldName;
    }

    public function setFieldName(string $fieldName): static
    {
        $this->fieldName = $fieldName;
        return $this;
    }

    public function getOldValue(): ?array
    {
        return $this->oldValue;
    }

    public function setOldValue(?array $oldValue): static
    {
        $this->oldValue = $oldValue;
        return $this;
    }

    public function getNewValue(): ?array
    {
        return $this->newValue;
    }

    public function setNewValue(?array $newValue): static
    {
        $this->newValue = $newValue;
        return $this;
    }

    public function getAction(): ?string
    {
        return $this->action;
    }

    public function setAction(string $action): static
    {
        $this->action = $action;
        return $this;
    }

    public function getIpAddress(): ?string
    {
        return $this->ipAddress;
    }

    public function setIpAddress(?string $ipAddress): static
    {
        $this->ipAddress = $ipAddress;
        return $this;
    }

    public function getUserAgent(): ?string
    {
        return $this->userAgent;
    }

    public function setUserAgent(?string $userAgent): static
    {
        $this->userAgent = $userAgent;
        return $this;
    }

    public function getCreatedAt(): ?\DateTimeImmutable
    {
        return $this->createdAt;
    }

    public function setCreatedAt(\DateTimeImmutable $createdAt): static
    {
        $this->createdAt = $createdAt;
        return $this;
    }

    public function getMetadata(): ?array
    {
        return $this->metadata;
    }

    public function setMetadata(?array $metadata): static
    {
        $this->metadata = $metadata;
        return $this;
    }

    /**
     * Retourne la valeur formatée pour l'affichage
     */
    public function getFormattedOldValue(): string
    {
        return $this->formatValue($this->oldValue);
    }

    /**
     * Retourne la nouvelle valeur formatée pour l'affichage
     */
    public function getFormattedNewValue(): string
    {
        return $this->formatValue($this->newValue);
    }

    /**
     * Formate une valeur pour l'affichage
     */
    private function formatValue(?array $value): string
    {
        if ($value === null) {
            return 'null';
        }

        if (isset($value['type']) && isset($value['value'])) {
            switch ($value['type']) {
                case 'boolean':
                    return $value['value'] ? 'Oui' : 'Non';
                case 'date':
                    return date('d/m/Y', strtotime($value['value']));
                case 'datetime':
                    return date('d/m/Y H:i', strtotime($value['value']));
                case 'array':
                    return is_array($value['value']) ? implode(', ', $value['value']) : (string)$value['value'];
                case 'relation':
                    return $value['display'] ?? 'ID: ' . $value['value'];
                default:
                    return (string)$value['value'];
            }
        }

        return json_encode($value);
    }
}