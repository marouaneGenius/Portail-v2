<?php

namespace App\Repository;

use App\Entity\User;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

/**
 * @extends ServiceEntityRepository<User>
 *
 * @method User|null find($id, $lockMode = null, $lockVersion = null)
 * @method User|null findOneBy(array $criteria, array $orderBy = null)
 * @method User[]    findAll()
 * @method User[]    findBy(array $criteria, array $orderBy = null, $limit = null, $offset = null)
 */
class UserRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, User::class);
    }


        /**
     * Retourne tous les users qui ont ROLE_TUTOR dans leur JSON roles.
     *
     * @return User[]
     */
    public function findTutors(): array
    {
        $conn = $this->getEntityManager()->getConnection();

        // 1) Récupérer les IDs en SQL natif
        $sql = 'SELECT id FROM users WHERE roles::text LIKE :role';
        /** @var \Doctrine\DBAL\Result $result */
        $result = $conn->executeQuery(
            $sql,
            ['role' => '%"ROLE_TUTOR"%'],    // paramètre lié
            ['role' => \PDO::PARAM_STR]      // type, facultatif
        );
    
        // fetchAllAssociative() est dispo sur Result
        $rows = $result->fetchAllAssociative();
        $ids  = array_column($rows, 'id', 'id'); // clés & valeurs = id
    
        if (empty($ids)) {
            return [];
        }
    
        // 2) Hydrater les entités Doctrine par ces IDs
        return $this->createQueryBuilder('u')
            ->andWhere('u.id IN (:ids)')
            ->setParameter('ids', array_keys($ids))
            ->getQuery()
            ->getResult();
    }

//    /**
//     * @return User[] Returns an array of User objects
//     */
//    public function findByRole($value): array
//    {
//        return $this->createQueryBuilder('u')
//            ->andWhere('u.exampleField = :val')
//            ->setParameter('val', $value)
//            ->orderBy('u.id', 'ASC')
//            ->setMaxResults(10)
//            ->getQuery()
//            ->getResult()
//        ;
//    }

//    public function findOneBySomeField($value): ?User
//    {
//        return $this->createQueryBuilder('u')
//            ->andWhere('u.exampleField = :val')
//            ->setParameter('val', $value)
//            ->getQuery()
//            ->getOneOrNullResult()
//        ;
//    }
}
