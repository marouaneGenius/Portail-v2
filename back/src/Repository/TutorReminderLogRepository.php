<?php

namespace App\Repository;

use App\Entity\TutorReminderLog;
use App\Entity\User;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

/**
 * @extends ServiceEntityRepository<TutorReminderLog>
 */
class TutorReminderLogRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, TutorReminderLog::class);
    }

    /**
     * Vérifie si un tuteur a déjà reçu un rappel pour une date de session donnée
     */
    public function hasReminderBeenSent(User $tutor, \DateTimeInterface $sessionDate): bool
    {
        $result = $this->createQueryBuilder('trl')
            ->select('COUNT(trl.id)')
            ->where('trl.tutor = :tutor')
            ->andWhere('trl.sessionDate = :sessionDate')
            ->andWhere('trl.successful = true')
            ->setParameter('tutor', $tutor)
            ->setParameter('sessionDate', $sessionDate->format('Y-m-d'))
            ->getQuery()
            ->getSingleScalarResult();

        return $result > 0;
    }

    /**
     * Vérifie si un rappel quotidien a déjà été envoyé aujourd'hui
     */
    public function hasDailyReminderBeenSent(\DateTimeInterface $today = null): bool
    {
        if ($today === null) {
            $today = new \DateTime();
        }

        $result = $this->createQueryBuilder('trl')
            ->select('COUNT(trl.id)')
            ->where('trl.reminderDate = :today')
            ->andWhere('trl.successful = true')
            ->setParameter('today', $today->format('Y-m-d'))
            ->getQuery()
            ->getSingleScalarResult();

        return $result > 0;
    }

    /**
     * Récupère les statistiques des rappels envoyés
     */
    public function getReminderStats(\DateTimeInterface $from, \DateTimeInterface $to): array
    {
        return $this->createQueryBuilder('trl')
            ->select('COUNT(trl.id) as total')
            ->addSelect('SUM(CASE WHEN trl.successful = true THEN 1 ELSE 0 END) as successful')
            ->addSelect('SUM(CASE WHEN trl.successful = false THEN 1 ELSE 0 END) as failed')
            ->where('trl.reminderDate BETWEEN :from AND :to')
            ->setParameter('from', $from->format('Y-m-d'))
            ->setParameter('to', $to->format('Y-m-d'))
            ->getQuery()
            ->getSingleResult();
    }

    /**
     * Nettoie les anciens logs (garde seulement les 30 derniers jours)
     */
    public function cleanOldLogs(): int
    {
        $thirtyDaysAgo = new \DateTime('-30 days');

        return $this->createQueryBuilder('trl')
            ->delete()
            ->where('trl.createdAt < :date')
            ->setParameter('date', $thirtyDaysAgo)
            ->getQuery()
            ->execute();
    }
}