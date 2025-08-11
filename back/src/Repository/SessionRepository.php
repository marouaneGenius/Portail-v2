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

    public function getTutorsAndSessionsWithStudentsByCenterAndDate(Center $center, \DateTimeImmutable $date, $users): array
    {
        $tutors = [];
        foreach ($users as $user) {
            if (!in_array('ROLE_TUTOR', $user->getRoles())) continue; 

            $sessionsDuJour = $user->getSessions()->filter(function($session) use ($center, $date) {
                   return $session->getCenter()?->getId() === $center->getId()
                    && $session->getScheduledAt() !== null
                    && $session->getScheduledAt()->format('Y-m-d') === $date->format('Y-m-d')
                    ;
            });

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
                $sessionsArr[] = [
                    'id'            => $session->getId(),
                    'scheduled_at'  => $session->getScheduledAt()?->format('Y-m-d H:i:s'),
                    'resume'        => $session->getResume(),
                    'is_canceled'        => $session->isIsCanceled(),
                    'is_absent'        => $session->isIsAbsent(),
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

            $sessionsSemaine = $user->getSessions()->filter(function($session) use ($center, $startOfWeek, $endOfWeek) {
                $scheduledAt = $session->getScheduledAt();
                return $session->getCenter()?->getId() === $center->getId()
                    && $scheduledAt !== null
                    && $scheduledAt >= $startOfWeek
                    && $scheduledAt <= $endOfWeek;
            });

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
                $sessionsArr[] = [
                    'id'            => $session->getId(),
                    'scheduled_at'  => $session->getScheduledAt()?->format('Y-m-d H:i:s'),
                    'resume'        => $session->getResume(),
                    'is_canceled'   => $session->isIsCanceled(),
                    'is_absent'     => $session->isIsAbsent(),
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
            ->andWhere('s.Scheduled_at BETWEEN :start AND :end') // propriété $Scheduled_at
            ->setParameters([
                'stuId'   => $studentId,
                'center'  => $center,
                'start'   => $start,
                'end'     => $end,
            ])
            ->getQuery()
            ->getResult();
    }
}
