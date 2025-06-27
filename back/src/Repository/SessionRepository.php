<?php

namespace App\Repository;

use App\Entity\Session;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

/**
 * @extends ServiceEntityRepository<Session>
 *
 * @method Session|null find($id, $lockMode = null, $lockVersion = null)
 * @method Session|null findOneBy(array $criteria, array $orderBy = null)
 * @method Session[]    findAll()
 * @method Session[]    findBy(array $criteria, array $orderBy = null, $limit = null, $offset = null)
 */
class SessionRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, Session::class);
    }


    public function getSessionsDataByTutor($tutor): array
    {
        $sessions = $this->createQueryBuilder('s')
            ->andWhere('s.id_tutor = :tutor')
            ->setParameter('tutor', $tutor)
            ->orderBy('s.date_slot', 'ASC')
            ->getQuery()
            ->getResult();

        return array_map(function(Session $s) {
            return [
                'id'                 => $s->getId(),
                'payment_date'       => $s->getPaymentDate()?->format('Y-m-d'),
                'stripe_number'      => $s->getStripeNumber(),
                'school_subjects'    => $s->getSchoolSubjects(),
                'date_slot'          => $s->getDateSlot()?->format(\DateTimeInterface::ATOM),
                'resume'             => $s->getResume(),
                'tutor_id'           => $s->getIdTutor()?->getId(),
                'students' => array_map(function(\App\Entity\Student $stu) {
                    return [
                        'id'             => $stu->getId(),
                        'firstname'      => $stu->getFirstname(),
                        'lastname'       => $stu->getLastname(),
                        'gender'         => $stu->getGender(),
                        'class'          => $stu->getClass(),
                        'phone'          => $stu->getPhone(),
                        'email'          => $stu->getEmail(),
                        'is_active'      => $stu->isIsActive(),
                        'is_deleted'     => $stu->isIsDeleted(),
                        'stripe_key'     => $stu->getStripeKey(),
                        'url_notion'     => $stu->getUrlNotion(),
                        'id_pipedrive'   => $stu->getIdPipedrive(),
                        'id_sinao'       => $stu->getIdSinao(),
                        'id_center'      => $stu->getIdCenter()?->getId(),
                        'created_at'     => $stu->getCreatedAt()?->format(\DateTimeInterface::ATOM),
                        'created_by'     => $stu->getCreatedBy(),
                        'updated_at'     => $stu->getUpdatedAt()?->format(\DateTimeInterface::ATOM),
                        'updated_by'     => $stu->getUpdatedBy(),
                        'school_subjects'=> $stu->getSchoolSubjects(),
                        'sessions' => array_map(function(\App\Entity\Session $s) {
                            return [
                                'id'            => $s->getId(),
                                'payment_date'  => $s->getPaymentDate()?->format('Y-m-d'),
                                'stripe_number' => $s->getStripeNumber(),
                                'school_subjects'=> $s->getSchoolSubjects(),
                                'date_slot'     => $s->getDateSlot()?->format(\DateTimeInterface::ATOM),
                                'resume'        => $s->getResume(),
                                'tutor_id'      => $s->getIdTutor()?->getId(),
                                'scheduled_at'  => $s->getScheduledAt()?->format(\DateTimeInterface::ATOM),
                                'scheduled_by'  => $s->getScheduledBy(),
                                'session_type'  => $s->getSessionType(),
                                'is_canceled'   => $s->isIsCanceled(),
                                'canceled_by'   => $s->getCanceledBy(),
                                'is_paid'       => $s->isIsPaid(),
                                // si besoin, tu peux ajouter ici aussi student_ids, reports...
                            ];
                        }, $stu->getSessions()->toArray()),
                        'subscription_urls' => array_map(
                            fn($url) => [
                                'id'  => $url->getId(),
                                'url' => $url->getUrl()  // adapte selon champ réel
                            ],
                            $stu->getSubscriptionURLs()->toArray()
                        ),
                    ];
                }, $s->getIdStudent()->toArray()),
                'subscription_ids'   => array_map(
                    fn($sub) => $sub->getId(),
                    $s->getIdSubscription()->toArray()
                ),
                'scheduled_at'       => $s->getScheduledAt()?->format(\DateTimeInterface::ATOM),
                'scheduled_by'       => $s->getScheduledBy(),
                'session_type'       => $s->getSessionType(),
                'is_canceled'        => $s->isIsCanceled(),
                'canceled_by'        => $s->getCanceledBy(),
                'is_paid'            => $s->isIsPaid(),
                'reports'            => array_map(
                    fn($r) => [
                        'id'        => $r->getId(),
                        'content'   => $r->getContent(),    // adapte selon ta classe Report
                        'createdAt' => $r->getCreatedAt()?->format(\DateTimeInterface::ATOM),
                    ],
                    $s->getReports()->toArray()
                ),
            ];
        }, $sessions);
    }




    public function getSessionsByCenterAndScheduledAt(
        \App\Entity\Center $center,
        \DateTimeInterface $date
    ): array {
        $qb = $this->createQueryBuilder('s')
            ->leftJoin('s.id_tutor', 't')->addSelect('t')
            ->andWhere('s.center = :center')
            ->andWhere('DATE(s.scheduled_at) = :day')       // filtrer sur scheduled_at
            ->setParameter('center', $center)
            ->setParameter('day',   $date->format('Y-m-d'))
            ->orderBy('s.scheduled_at', 'ASC');
    
        $sessions = $qb->getQuery()->getResult();
    
        return array_map(function(\App\Entity\Session $s) {
            $tutor = $s->getIdTutor();
            return [
                'id'            => $s->getId(),
                'payment_date'  => $s->getPaymentDate()?->format('Y-m-d'),
                'scheduled_at'  => $s->getScheduledAt()?->format(\DateTimeInterface::ATOM),
                'resume'        => $s->getResume(),
    
                'tutor' => $tutor ? [
                    'id'        => $tutor->getId(),
                    'firstname' => $tutor->getFirstname(),
                    'lastname'  => $tutor->getLastname(),
                    'email'     => $tutor->getEmail(),
                ] : null,
    
                'students' => array_map(fn($stu) => [
                    'id'        => $stu->getId(),
                    'firstname' => $stu->getFirstname(),
                    'lastname'  => $stu->getLastname(),
                ], $s->getIdStudent()->toArray()),
    
                'reports' => array_map(fn($r) => [
                    'id'      => $r->getId(),
                    'content' => $r->getContent(),
                ], $s->getReports()->toArray()),
            ];
        }, $sessions);
    }



//    /**
//     * @return Session[] Returns an array of Session objects
//     */
//    public function findByExampleField($value): array
//    {
//        return $this->createQueryBuilder('s')
//            ->andWhere('s.exampleField = :val')
//            ->setParameter('val', $value)
//            ->orderBy('s.id', 'ASC')
//            ->setMaxResults(10)
//            ->getQuery()
//            ->getResult()
//        ;
//    }

//    public function findOneBySomeField($value): ?Session
//    {
//        return $this->createQueryBuilder('s')
//            ->andWhere('s.exampleField = :val')
//            ->setParameter('val', $value)
//            ->getQuery()
//            ->getOneOrNullResult()
//        ;
//    }
}
