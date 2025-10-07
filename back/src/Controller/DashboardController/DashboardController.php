<?php

namespace App\Controller\DashboardController;

use App\Repository\SessionRepository;
use App\Repository\StudentRepository;
use App\Repository\UserRepository;
use App\Repository\CenterRepository;
use App\Repository\SubscriptionRepository;
use App\Repository\ModificationHistoryRepository;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;
use Doctrine\ORM\EntityManagerInterface;

class DashboardController extends AbstractController
{
    public function __construct(
        private readonly SessionRepository $sessionRepo,
        private readonly StudentRepository $studentRepo,
        private readonly UserRepository $userRepo,
        private readonly CenterRepository $centerRepo,
        private readonly SubscriptionRepository $subscriptionRepo,
        private readonly ModificationHistoryRepository $historyRepo,
        private readonly EntityManagerInterface $em
    ) {}

    #[Route('/', name: 'welcom')]
    public function index(): Response
    {
        return new Response('welcom');
    }

    #[Route('/api/dashboard/stats', name: 'dashboard_stats', methods: ['GET'])]
    public function getStats(): JsonResponse
    {
        try {
            // KPI 1: Total des étudiants actifs
            $totalStudents = $this->studentRepo->count([]);

            // KPI 2: Total des tuteurs actifs (PostgreSQL JSON operator)
            $conn = $this->em->getConnection();
            $totalTutors = $conn->executeQuery(
                "SELECT COUNT(DISTINCT id) FROM users WHERE roles::jsonb @> '\"ROLE_TUTOR\"'::jsonb"
            )->fetchOne();

            // KPI 3: Total des centres
            $totalCenters = $this->centerRepo->count([]);

            // KPI 4: Séances du mois en cours
            $firstDayOfMonth = new \DateTime('first day of this month 00:00:00');
            $lastDayOfMonth = new \DateTime('last day of this month 23:59:59');

            $sessionsThisMonth = $this->sessionRepo->createQueryBuilder('s')
                ->select('COUNT(s.id)')
                ->where('s.date_slot >= :start')
                ->andWhere('s.date_slot <= :end')
                ->setParameter('start', $firstDayOfMonth)
                ->setParameter('end', $lastDayOfMonth)
                ->getQuery()
                ->getSingleScalarResult();

            // KPI 5: Séances à venir (futures)
            $now = new \DateTime();
            $upcomingSessions = $this->sessionRepo->createQueryBuilder('s')
                ->select('COUNT(s.id)')
                ->where('s.date_slot > :now')
                ->setParameter('now', $now)
                ->getQuery()
                ->getSingleScalarResult();

            // KPI 6: Abonnements actifs
            $activeSubscriptions = $this->subscriptionRepo->count([]);

            // KPI: Contrats validés
            $validatedContracts = $this->subscriptionRepo->createQueryBuilder('sub')
                ->select('COUNT(sub.id)')
                ->where('sub.is_valide = :validated')
                ->setParameter('validated', true)
                ->getQuery()
                ->getSingleScalarResult();

            // KPI: Contrats par type
            $contractsByType = $this->subscriptionRepo->createQueryBuilder('sub')
                ->select('sub.subscription_type as type', 'COUNT(sub.id) as count')
                ->where('sub.is_valide = :validated')
                ->setParameter('validated', true)
                ->groupBy('sub.subscription_type')
                ->getQuery()
                ->getResult();

            // KPI 7: Séances du jour (créneaux avec tuteur + au moins 1 élève)
            $startOfDay = new \DateTime('today 00:00:00');
            $endOfDay = new \DateTime('today 23:59:59');

            $sessionsToday = $this->sessionRepo->createQueryBuilder('s')
                ->select('COUNT(DISTINCT s.id)')
                ->leftJoin('s.id_student', 'student')
                ->where('s.date_slot >= :start')
                ->andWhere('s.date_slot <= :end')
                ->andWhere('s.idTutor IS NOT NULL')
                ->andWhere('student.id IS NOT NULL')
                ->setParameter('start', $startOfDay)
                ->setParameter('end', $endOfDay)
                ->getQuery()
                ->getSingleScalarResult();

            // KPI 8: Séances payées du mois (créneaux avec tuteur + au moins 1 élève + payées)
            $monthlyRevenue = $this->sessionRepo->createQueryBuilder('s')
                ->select('COUNT(DISTINCT s.id)')
                ->leftJoin('s.id_student', 'student')
                ->where('s.date_slot >= :start')
                ->andWhere('s.date_slot <= :end')
                ->andWhere('s.is_paid = :paid')
                ->andWhere('s.idTutor IS NOT NULL')
                ->andWhere('student.id IS NOT NULL')
                ->setParameter('start', $firstDayOfMonth)
                ->setParameter('end', $lastDayOfMonth)
                ->setParameter('paid', true)
                ->getQuery()
                ->getSingleScalarResult();

            // KPI 9: Évolution des étudiants (ce mois vs mois dernier)
            $firstDayLastMonth = new \DateTime('first day of last month 00:00:00');
            $lastDayLastMonth = new \DateTime('last day of last month 23:59:59');

            $studentsLastMonth = $this->em->createQueryBuilder()
                ->select('COUNT(s.id)')
                ->from('App\Entity\Student', 's')
                ->where('s.created_at <= :end')
                ->setParameter('end', $lastDayLastMonth)
                ->getQuery()
                ->getSingleScalarResult();

            $studentGrowth = $studentsLastMonth > 0
                ? round((($totalStudents - $studentsLastMonth) / $studentsLastMonth) * 100, 1)
                : 0;

            // KPI 10: Séances mois dernier (créneaux avec tuteur + au moins 1 élève)
            $sessionsLastMonth = $this->sessionRepo->createQueryBuilder('s')
                ->select('COUNT(DISTINCT s.id)')
                ->leftJoin('s.id_student', 'student')
                ->where('s.date_slot >= :start')
                ->andWhere('s.date_slot <= :end')
                ->andWhere('s.idTutor IS NOT NULL')
                ->andWhere('student.id IS NOT NULL')
                ->setParameter('start', $firstDayLastMonth)
                ->setParameter('end', $lastDayLastMonth)
                ->getQuery()
                ->getSingleScalarResult();

            $sessionGrowth = $sessionsLastMonth > 0
                ? round((($sessionsThisMonth - $sessionsLastMonth) / $sessionsLastMonth) * 100, 1)
                : 0;

            // Activité récente (dernières 10 actions)
            $recentActivity = $this->historyRepo->createQueryBuilder('h')
                ->orderBy('h.createdAt', 'DESC')
                ->setMaxResults(10)
                ->getQuery()
                ->getResult();

            $recentActivityData = array_map(function($history) {
                $user = $history->getUser();
                return [
                    'id' => $history->getId(),
                    'action' => $history->getAction(),
                    'entityType' => $history->getEntityType(),
                    'entityName' => $history->getEntityName(),
                    'fieldName' => $history->getFieldName(),
                    'createdAt' => $history->getCreatedAt()?->format('Y-m-d H:i:s'),
                    'user' => $user ? [
                        'id' => $user->getId(),
                        'firstname' => $user->getFirstname(),
                        'lastname' => $user->getLastname(),
                    ] : null,
                ];
            }, $recentActivity);

            return new JsonResponse([
                'totalStudents' => (int)$totalStudents,
                'totalTutors' => (int)$totalTutors,
                'totalCenters' => (int)$totalCenters,
                'sessionsThisMonth' => (int)$sessionsThisMonth,
                'upcomingSessions' => (int)$upcomingSessions,
                'activeSubscriptions' => (int)$activeSubscriptions,
                'sessionsToday' => (int)$sessionsToday,
                'monthlyRevenue' => $monthlyRevenue ? (float)$monthlyRevenue : 0,
                'studentGrowth' => $studentGrowth,
                'sessionGrowth' => $sessionGrowth,
                'validatedContracts' => (int)$validatedContracts,
                'contractsByType' => $contractsByType,
                'recentActivity' => $recentActivityData,
            ]);
        } catch (\Exception $e) {
            return new JsonResponse([
                'error' => 'Erreur lors de la récupération des statistiques',
                'message' => $e->getMessage()
            ], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }
}
