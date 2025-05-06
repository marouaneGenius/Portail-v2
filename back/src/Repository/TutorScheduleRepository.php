<?php

namespace App\Repository;

use App\Entity\TutorSchedule;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

/**
 * @extends ServiceEntityRepository<TutorSchedule>
 *
 * @method TutorSchedule|null find($id, $lockMode = null, $lockVersion = null)
 * @method TutorSchedule|null findOneBy(array $criteria, array $orderBy = null)
 * @method TutorSchedule[]    findAll()
 * @method TutorSchedule[]    findBy(array $criteria, array $orderBy = null, $limit = null, $offset = null)
 */
class TutorScheduleRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, TutorSchedule::class);
    }

//    /**
//     * @return TutorSchedule[] Returns an array of TutorSchedule objects
//     */
//    public function findByExampleField($value): array
//    {
//        return $this->createQueryBuilder('t')
//            ->andWhere('t.exampleField = :val')
//            ->setParameter('val', $value)
//            ->orderBy('t.id', 'ASC')
//            ->setMaxResults(10)
//            ->getQuery()
//            ->getResult()
//        ;
//    }

//    public function findOneBySomeField($value): ?TutorSchedule
//    {
//        return $this->createQueryBuilder('t')
//            ->andWhere('t.exampleField = :val')
//            ->setParameter('val', $value)
//            ->getQuery()
//            ->getOneOrNullResult()
//        ;
//    }
}
