<?php

namespace App\Repository;

use App\Entity\Center;
use App\Entity\Session;
use App\Entity\TutorSchedule;
use App\Entity\User;
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

    /**
     * Trouve toutes les sessions pour une date donnée, non annulées
     */
    public function findSessionsForDate(\DateTimeInterface $date): array
    {
        return $this->createQueryBuilder('s')
            ->leftJoin('s.idTutor', 't')
            ->addSelect('t')
            ->where('s.date_slot = :date')
            ->andWhere('s.is_canceled = false OR s.is_canceled IS NULL')
            ->andWhere('t.id IS NOT NULL')
            ->setParameter('date', $date->format('Y-m-d'))
            ->orderBy('s.scheduled_at', 'ASC')
            ->getQuery()
            ->getResult();
    }


    public function getSessionsDataByTutor($tutor): array
    {
        $sessions = $this->createQueryBuilder('s')
            ->leftJoin('s.id_subscription', 'sub')
            ->andWhere('s.idTutor = :tutor')
            ->andWhere('(sub IS NULL OR (sub.is_suspended = false OR (sub.is_canceled = true AND sub.resiliation_date IS NOT NULL)))')
            ->andWhere('(sub IS NULL OR sub.resiliation_date IS NULL OR s.scheduled_at <= sub.resiliation_date)')
            ->setParameter('tutor', $tutor)
            ->orderBy('s.scheduled_at', 'ASC')
            ->getQuery()
            ->getResult();

        return array_map(function(Session $s) {
            return [
                'id'                 => $s->getId(),
                'payment_date'       => $s->getPaymentDate()?->format('Y-m-d'),
                'stripe_number'      => $s->getStripeNumber(),
                'school_subjects'    => $s->getSchoolSubjects(),
                'scheduled_at'       => $s->getScheduledAt()?->format(\DateTimeInterface::ATOM),
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
                        'stripe_key'     => $stu->getIdStripe(),
                        'url_notion'     => $stu->getUrlNotion(),
                        'id_pipedrive'   => $stu->getIdPipedrive(),
                        // 'id_sinao'       => $stu->get,
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
                                'scheduled_at'  => $s->getScheduledAt()?->format(\DateTimeInterface::ATOM),
                                'resume'        => $s->getResume(),
                                'tutor_id'      => $s->getIdTutor()?->getId(),
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
                'scheduled_by'       => $s->getScheduledBy(),
                'is_absent'         => $s->isIsAbsent(),
                'absent_by'         => $s->getAbsentBy(),
                'session_type'       => $s->getSessionType(),
                'is_canceled'        => $s->isIsCanceled(),
                'canceled_by'        => $s->getCanceledBy(),
                'is_paid'            => $s->isIsPaid(),
                'center'             => $s->getCenter() ? [
                    'id'      => $s->getCenter()->getId(),
                    'name'    => $s->getCenter()->getName(),
                    'address' => $s->getCenter()->getAddress(),
                ] : null,
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

    public function getTutorsAndSessionsWithStudentsByCenterAndDate(Center $center, \DateTimeImmutable $date, $users): array
    {
        $tutors = [];
        foreach ($users as $user) {
            if (!in_array('ROLE_TUTOR', $user->getRoles())) continue; 

            // Requête DQL pour récupérer les sessions non suspendues
            $startOfDay = $date->setTime(0, 0, 0);
            $endOfDay = $date->setTime(23, 59, 59);
            
            $sessionsDuJour = $this->createQueryBuilder('s')
            ->leftJoin('s.id_subscription', 'sub')
            ->where('s.idTutor = :tutor')
            ->andWhere('s.center = :center')
            ->andWhere('s.scheduled_at >= :startOfDay')
            ->andWhere('s.scheduled_at <= :endOfDay')
            ->andWhere('(sub IS NULL OR (sub.is_suspended = false OR (sub.is_canceled = true AND sub.resiliation_date IS NOT NULL)))')
            ->andWhere('(sub IS NULL OR sub.resiliation_date IS NULL OR s.scheduled_at <= sub.resiliation_date)')
            ->setParameter('tutor', $user)
            ->setParameter('center', $center)
            ->setParameter('startOfDay', $startOfDay)
            ->setParameter('endOfDay', $endOfDay)
            ->getQuery()
            ->getResult();
        

            $sessionsArr = [];
            foreach ($sessionsDuJour as $session) {
                $studentsArr = [];
                foreach ($session->getIdStudent() as $student) {
                    $studentsArr[] = [
                        'id' => $student->getId(),
                        'firstname' => $student->getFirstname(),
                        'lastname'  => $student->getLastname(),
                        'email'     => $student->getEmail(),
                        'session_id' => $session->getId(), 
                        'class' => $student->getClass(), 
                        'centers' => $student->getIdCenter()
                        ? [
                            'id'      => $student->getIdCenter()->getId(),
                            'name'    => $student->getIdCenter()->getName(),
                            'address' => $student->getIdCenter()->getAddress(),
                            'city'    => $student->getIdCenter()->getCity(),
                        ]
                        : null,
                        // Ajoute ici ce que tu veux
                    ];
                }
                // Vérifier si l'abonnement est suspendu
                $isSuspended = false;
                foreach ($session->getIdSubscription() as $subscription) {
                    if ($subscription->isIsSuspended()) {
                        $isSuspended = true;
                        break;
                    }
                }
                
                $sessionsArr[] = [
                    'id'            => $session->getId(),
                    'scheduled_at'  => $session->getScheduledAt()?->format('Y-m-d H:i:s'),
                    'resume'        => $session->getResume(),
                    'is_canceled'        => $session->isIsCanceled(),
                    'canceled_by'        => $session->getCanceledBy(),
                    'session_type'             => $session->getSessionType(),
                    'is_paid'         => $session->isIsPaid(),
                    'is_absent'        => $session->isIsAbsent(),
                    'is_suspended'   => $isSuspended,
                    'students'      => $studentsArr,
                    'school_subjects' => $session->getSchoolSubjects(),
                ];
            }

            if (empty($sessionsArr)) continue;

            $tutors[] = [
                'id'        => $user->getId(),
                'firstname' => $user->getFirstname(),
                'lastname'  => $user->getLastname(),
                'email'     => $user->getEmail(),
                'events' => array_map(fn(TutorSchedule $tutorSchedule) => [
                    'id'   => $tutorSchedule->getId(),
                    'day' => $tutorSchedule->getDay(),
                    'start_hour' => $tutorSchedule->getStartHour(),
                    'end_hour' => $tutorSchedule->getEndHour(),
                ], $user->getTutorSchedules()->toArray()),
                // autres infos tuteur...
                'sessions'  => $sessionsArr,
            ];
        }
        return $tutors;
    }


    public function getTutorsAndSessionsWithStudentsByCenterAndWeek(Center $center, \DateTimeImmutable $date, $users): array
    {
        // Calcule le début (lundi) et la fin (dimanche) de la semaine
        $startOfWeek = $date->modify(('Monday' === $date->format('l')) ? 'this monday' : 'last monday')->setTime(0, 0, 0);
        $endOfWeek = $startOfWeek->modify('+6 days')->setTime(23, 59, 59);

        $tutors = [];
        foreach ($users as $user) {
            if (!in_array('ROLE_TUTOR', $user->getRoles())) continue;

            // Requête DQL pour récupérer les sessions non suspendues de la semaine
            $sessionsSemaine = $this->createQueryBuilder('s')
                ->leftJoin('s.id_subscription', 'sub')
                ->where('s.idTutor = :tutor')
                ->andWhere('s.center = :center')
                ->andWhere('s.scheduled_at >= :startOfWeek')
                ->andWhere('s.scheduled_at <= :endOfWeek')
                ->andWhere('(sub IS NULL OR (sub.is_suspended = false OR (sub.is_canceled = true AND sub.resiliation_date IS NOT NULL)))')
                ->andWhere('(sub IS NULL OR sub.resiliation_date IS NULL OR s.scheduled_at <= sub.resiliation_date)')
                ->setParameter('tutor', $user)
                ->setParameter('center', $center)
                ->setParameter('startOfWeek', $startOfWeek)
                ->setParameter('endOfWeek', $endOfWeek)
                ->getQuery()
                ->getResult();

            $sessionsArr = [];
            foreach ($sessionsSemaine as $session) {
                $studentsArr = [];
                foreach ($session->getIdStudent() as $student) {
                    $studentsArr[] = [
                        'id' => $student->getId(),
                        'firstname' => $student->getFirstname(),
                        'lastname'  => $student->getLastname(),
                        'email'     => $student->getEmail(),
                        'session_id' => $session->getId(),
                        'class' => $student->getClass(),
                        'centers' => $student->getIdCenter()
                            ? [
                                'id'      => $student->getIdCenter()->getId(),
                                'name'    => $student->getIdCenter()->getName(),
                                'address' => $student->getIdCenter()->getAddress(),
                                'city'    => $student->getIdCenter()->getCity(),
                            ]
                            : null,
                    ];
                }
                
                // Vérifier si l'abonnement est suspendu  
                $isSuspended = false;
                foreach ($session->getIdSubscription() as $subscription) {
                    if ($subscription->isIsSuspended()) {
                        $isSuspended = true;
                        break;
                    }
                }
                
                $sessionsArr[] = [
                    'id'            => $session->getId(),
                    'session_type'  => $session->getSessionType(),
                    'scheduled_at'  => $session->getScheduledAt()?->format('Y-m-d H:i:s'),
                    'resume'        => $session->getResume(),
                    'is_canceled'   => $session->isIsCanceled(),
                    'canceled_by'   => $session->getCanceledBy(),
                    'is_absent'     => $session->isIsAbsent(),
                    'absent_by'     => $session->getAbsentBy(),
                    'is_suspended'  => $isSuspended,
                    'students'      => $studentsArr,
                    'school_subjects' => $session->getSchoolSubjects(),
                ];
            }

            if (empty($sessionsArr)) continue;

            $tutors[] = [
                'id'        => $user->getId(),
                'firstname' => $user->getFirstname(),
                'lastname'  => $user->getLastname(),
                'email'     => $user->getEmail(),
                'events' => array_map(fn(TutorSchedule $tutorSchedule) => [
                    'id'   => $tutorSchedule->getId(),
                    'day' => $tutorSchedule->getDay(),
                    'start_hour' => $tutorSchedule->getStartHour(),
                    'end_hour' => $tutorSchedule->getEndHour(),
                ], $user->getTutorSchedules()->toArray()),
                // autres infos tuteur...
                'sessions'  => $sessionsArr,
            ];
        }
        return $tutors;
    }


    public function findByStudentAndCenterAndPeriod(
        int $studentId,
        Center $center,
        \DateTimeImmutable $start,
        \DateTimeImmutable $end
    ): array {
        return $this->createQueryBuilder('s')
            ->join('s.id_student', 'stu')                     // nom de la propriété, pas idStudent
            ->andWhere('stu.id = :stuId')
            ->andWhere('s.center = :center')
            ->andWhere('s.scheduled_at BETWEEN :start AND :end') // propriété $scheduled_at
            ->setParameters([
                'stuId'   => $studentId,
                'center'  => $center,
                'start'   => $start,
                'end'     => $end,
            ])
            ->getQuery()
            ->getResult();
    }

    public function findByStudentAndCenterAndPeriodAndTimeSlot(
        int $studentId,
        Center $center,
        \DateTimeImmutable $start,
        \DateTimeImmutable $end,
        int $dayOfWeek,
        int $hour,
        int $minute
    ): array {
        // D'abord récupérer toutes les sessions de la période
        $allSessions = $this->createQueryBuilder('s')
            ->join('s.id_student', 'stu')
            ->andWhere('stu.id = :stuId')
            ->andWhere('s.center = :center')
            ->andWhere('s.scheduled_at BETWEEN :start AND :end')
            ->setParameters([
                'stuId'   => $studentId,
                'center'  => $center,
                'start'   => $start,
                'end'     => $end,
            ])
            ->getQuery()
            ->getResult();
        
        // Filtrer en PHP par jour de la semaine et heure
        $filteredSessions = [];
        foreach ($allSessions as $session) {
            $scheduledAt = $session->getScheduledAt();
            if ($scheduledAt && 
                (int)$scheduledAt->format('w') === ($dayOfWeek === 1 ? 0 : $dayOfWeek - 1) && // Conversion MySQL vers PHP
                (int)$scheduledAt->format('H') === $hour &&
                (int)$scheduledAt->format('i') === $minute) {
                $filteredSessions[] = $session;
            }
        }
        
        return $filteredSessions;
    }

    /**
     * Suspend toutes les sessions futures d'un étudiant
     */
    public function suspendFutureSessionsByStudent(int $studentId): int
    {
        $now = new \DateTimeImmutable();
        
        return $this->getEntityManager()
            ->createQuery('
                UPDATE App\Entity\Session s 
                SET s.is_suspended = :suspended 
                WHERE :studentId MEMBER OF s.id_student 
                AND s.scheduled_at > :now
            ')
            ->setParameters([
                'suspended' => true,
                'studentId' => $studentId,
                'now' => $now
            ])
            ->execute();
    }

    /**
     * Réactive toutes les sessions suspendues d'un étudiant
     */
    public function unsuspendSessionsByStudent(int $studentId): int
    {
        return $this->getEntityManager()
            ->createQuery('
                UPDATE App\Entity\Session s 
                SET s.is_suspended = :suspended 
                WHERE :studentId MEMBER OF s.id_student 
                AND s.is_suspended = :currentSuspended
            ')
            ->setParameters([
                'suspended' => false,
                'studentId' => $studentId,
                'currentSuspended' => true
            ])
            ->execute();
    }

    /**
     * Trouve les sessions suspendues pour des étudiants donnés
     */
    public function findSuspendedSessionsByStudents(array $studentIds): array
    {
        return $this->createQueryBuilder('s')
            ->join('s.id_student', 'stu')
            ->where('stu.id IN (:studentIds)')
            ->andWhere('s.is_suspended = :suspended')
            ->setParameters([
                'studentIds' => $studentIds,
                'suspended' => true
            ])
            ->getQuery()
            ->getResult();
    }
}
