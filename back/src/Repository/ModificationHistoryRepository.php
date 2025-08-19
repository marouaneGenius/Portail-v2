<?php

namespace App\Repository;

use App\Entity\ModificationHistory;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;
use Doctrine\ORM\Query;
use Doctrine\ORM\QueryBuilder;

/**
 * Repository pour l'entité ModificationHistory avec méthodes de filtrage avancées
 * 
 * @extends ServiceEntityRepository<ModificationHistory>
 */
class ModificationHistoryRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, ModificationHistory::class);
    }

    /**
     * Trouve les modifications avec filtres et pagination
     * 
     * @param array $filters Filtres à appliquer
     * @param int $page Page actuelle (1-based)
     * @param int $limit Nombre d'éléments par page
     * @return array ['data' => [], 'total' => int, 'pages' => int]
     */
    public function findWithFilters(array $filters = [], int $page = 1, int $limit = 50): array
    {
        $qb = $this->createFilteredQueryBuilder($filters);
        
        // Clone pour compter le total sans pagination
        $countQb = clone $qb;
        $total = (int) $countQb
            ->select('COUNT(mh.id)')
            ->getQuery()
            ->getSingleScalarResult();

        // Appliquer la pagination
        $offset = ($page - 1) * $limit;
        $qb->setFirstResult($offset)
           ->setMaxResults($limit)
           ->orderBy('mh.createdAt', 'DESC');

        $data = $qb->getQuery()->getResult();

        return [
            'data' => $data,
            'total' => $total,
            'pages' => (int) ceil($total / $limit),
            'current_page' => $page,
            'per_page' => $limit
        ];
    }

    /**
     * Exporte les modifications en format array pour CSV
     */
    public function exportWithFilters(array $filters = []): array
    {
        $qb = $this->createFilteredQueryBuilder($filters);
        $qb->orderBy('mh.createdAt', 'DESC')
           ->setMaxResults(10000); // Limite de sécurité pour l'export

        return $qb->getQuery()->getResult();
    }

    /**
     * Trouve les modifications pour une entité spécifique
     */
    public function findByEntity(string $entityType, int $entityId, int $limit = 100): array
    {
        return $this->createQueryBuilder('mh')
            ->leftJoin('mh.user', 'u')
            ->addSelect('u')
            ->andWhere('mh.entityType = :entityType')
            ->andWhere('mh.entityId = :entityId')
            ->setParameter('entityType', $entityType)
            ->setParameter('entityId', $entityId)
            ->orderBy('mh.createdAt', 'DESC')
            ->setMaxResults($limit)
            ->getQuery()
            ->getResult();
    }

    /**
     * Statistiques des modifications par type d'entité
     */
    public function getModificationStats(\DateTime $since = null): array
    {
        $qb = $this->createQueryBuilder('mh')
            ->select('mh.entityType, mh.action, COUNT(mh.id) as count')
            ->groupBy('mh.entityType, mh.action')
            ->orderBy('count', 'DESC');

        if ($since) {
            $qb->andWhere('mh.createdAt >= :since')
               ->setParameter('since', $since);
        }

        return $qb->getQuery()->getResult();
    }

    /**
     * Utilisateurs les plus actifs
     */
    public function getMostActiveUsers(int $limit = 10, \DateTime $since = null): array
    {
        $qb = $this->createQueryBuilder('mh')
            ->select('u.firstname, u.lastname, u.email, COUNT(mh.id) as modifications_count')
            ->leftJoin('mh.user', 'u')
            ->andWhere('mh.user IS NOT NULL')
            ->groupBy('u.id')
            ->orderBy('modifications_count', 'DESC')
            ->setMaxResults($limit);

        if ($since) {
            $qb->andWhere('mh.createdAt >= :since')
               ->setParameter('since', $since);
        }

        return $qb->getQuery()->getResult();
    }

    /**
     * Nettoie les anciennes modifications (RGPD / performance)
     */
    public function cleanOldModifications(\DateTime $before): int
    {
        return $this->createQueryBuilder('mh')
            ->delete()
            ->andWhere('mh.createdAt < :before')
            ->setParameter('before', $before)
            ->getQuery()
            ->execute();
    }

    /**
     * Crée un QueryBuilder avec les filtres appliqués
     */
    private function createFilteredQueryBuilder(array $filters): QueryBuilder
    {
        $qb = $this->createQueryBuilder('mh')
            ->leftJoin('mh.user', 'u')
            ->addSelect('u');

        // Filtre par utilisateur
        if (!empty($filters['user_id'])) {
            $qb->andWhere('mh.user = :user_id')
               ->setParameter('user_id', $filters['user_id']);
        }

        // Filtre par type d'entité
        if (!empty($filters['entity_type'])) {
            $qb->andWhere('mh.entityType = :entity_type')
               ->setParameter('entity_type', $filters['entity_type']);
        }

        // Filtre par entité spécifique (élève, parent, centre)
        if (!empty($filters['entity_id'])) {
            $qb->andWhere('mh.entityId = :entity_id')
               ->setParameter('entity_id', $filters['entity_id']);
        }

        // Filtre par action
        if (!empty($filters['action'])) {
            $qb->andWhere('mh.action = :action')
               ->setParameter('action', $filters['action']);
        }

        // Filtre par champ modifié
        if (!empty($filters['field_name'])) {
            $qb->andWhere('mh.fieldName = :field_name')
               ->setParameter('field_name', $filters['field_name']);
        }

        // Filtre par plage de dates
        if (!empty($filters['date_from'])) {
            $qb->andWhere('mh.createdAt >= :date_from')
               ->setParameter('date_from', new \DateTime($filters['date_from']));
        }

        if (!empty($filters['date_to'])) {
            $dateTo = new \DateTime($filters['date_to']);
            $dateTo->setTime(23, 59, 59); // Fin de journée
            $qb->andWhere('mh.createdAt <= :date_to')
               ->setParameter('date_to', $dateTo);
        }

        // Recherche textuelle dans les valeurs
        if (!empty($filters['search'])) {
            $qb->andWhere($qb->expr()->orX(
                $qb->expr()->like('mh.entityName', ':search'),
                $qb->expr()->like('mh.fieldName', ':search'),
                $qb->expr()->like('CAST(mh.oldValue AS TEXT)', ':search'),
                $qb->expr()->like('CAST(mh.newValue AS TEXT)', ':search')
            ))
            ->setParameter('search', '%' . $filters['search'] . '%');
        }

        // Filtre par nom d'élève (recherche dans entity_name quand entity_type = 'student')
        if (!empty($filters['student_name'])) {
            $qb->andWhere('mh.entityType = :student_entity_type')
               ->andWhere('mh.entityName LIKE :student_name')
               ->setParameter('student_entity_type', 'student')
               ->setParameter('student_name', '%' . $filters['student_name'] . '%');
        }

        // Filtre par nom de parent (recherche dans entity_name quand entity_type = 'parent')
        if (!empty($filters['parent_name'])) {
            $qb->andWhere('mh.entityType = :parent_entity_type')
               ->andWhere('mh.entityName LIKE :parent_name')
               ->setParameter('parent_entity_type', 'parent')
               ->setParameter('parent_name', '%' . $filters['parent_name'] . '%');
        }

        return $qb;
    }

    /**
     * Obtient les valeurs distinctes pour les filtres
     */
    public function getFilterOptions(): array
    {
        try {
            // Types d'entités
            $entityTypes = $this->createQueryBuilder('mh')
                ->select('DISTINCT mh.entityType')
                ->orderBy('mh.entityType')
                ->getQuery()
                ->getSingleColumnResult();
        } catch (\Exception $e) {
            $entityTypes = [];
        }

        try {
            // Actions
            $actions = $this->createQueryBuilder('mh')
                ->select('DISTINCT mh.action')
                ->orderBy('mh.action')
                ->getQuery()
                ->getSingleColumnResult();
        } catch (\Exception $e) {
            $actions = [];
        }

        try {
            // Champs les plus modifiés
            $fields = $this->createQueryBuilder('mh')
                ->select('DISTINCT mh.fieldName')
                ->orderBy('mh.fieldName')
                ->setMaxResults(50)
                ->getQuery()
                ->getSingleColumnResult();
        } catch (\Exception $e) {
            $fields = [];
        }

        return [
            'entity_types' => $entityTypes ?: [],
            'actions' => $actions ?: [],
            'fields' => $fields ?: []
        ];
    }
}