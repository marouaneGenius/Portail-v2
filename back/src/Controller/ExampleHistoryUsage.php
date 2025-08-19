<?php

namespace App\Controller;

use App\Entity\Student;
use App\EventListener\EntityModificationListener;
use App\Repository\ModificationHistoryRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Annotation\Route;

/**
 * Contrôleur d'exemple montrant comment utiliser le système d'historique
 * 
 * Ce contrôleur démontre différentes façons d'utiliser le tracking
 * des modifications dans votre application.
 */
#[Route('/api/example-history', name: 'api_example_history_')]
class ExampleHistoryUsage extends AbstractController
{
    public function __construct(
        private EntityModificationListener $historyListener,
        private ModificationHistoryRepository $historyRepository,
        private EntityManagerInterface $entityManager
    ) {}

    /**
     * Exemple 1: Modification d'un élève avec tracking automatique
     * 
     * @Route("/update-student/{id}", name="update_student", methods={"PUT"})
     */
    public function updateStudent(int $id, Request $request): JsonResponse
    {
        $data = json_decode($request->getContent(), true);
        
        // Récupérer l'élève
        $student = $this->entityManager->getRepository(Student::class)->find($id);
        if (!$student) {
            return $this->json(['error' => 'Élève non trouvé'], 404);
        }

        // Modifier l'élève - le tracking se fait automatiquement via l'Event Listener
        if (isset($data['firstname'])) {
            $student->setFirstname($data['firstname']);
        }
        
        if (isset($data['lastname'])) {
            $student->setLastname($data['lastname']);
        }
        
        if (isset($data['class'])) {
            $student->setClass($data['class']);
        }

        // Sauvegarder - les modifications seront automatiquement tracées
        $this->entityManager->flush();

        return $this->json([
            'success' => true,
            'message' => 'Élève modifié avec succès',
            'student' => [
                'id' => $student->getId(),
                'firstname' => $student->getFirstname(),
                'lastname' => $student->getLastname(),
                'class' => $student->getClass()
            ]
        ]);
    }

    /**
     * Exemple 2: Action personnalisée avec tracking manuel
     * 
     * @Route("/assign-team/{studentId}/{teamId}", name="assign_team", methods={"POST"})
     */
    public function assignStudentToTeam(int $studentId, int $teamId): JsonResponse
    {
        // Votre logique métier pour assigner l'élève à l'équipe
        // ... 

        // Tracer l'action personnalisée
        $this->historyListener->trackCustomAction(
            'student',
            $studentId,
            'team_assignment',
            "Élève assigné à l'équipe ID: {$teamId}",
            [
                'team_id' => $teamId,
                'assignment_date' => (new \DateTime())->format('Y-m-d H:i:s'),
                'context' => 'manual_assignment'
            ]
        );

        return $this->json([
            'success' => true,
            'message' => 'Élève assigné à l\'équipe avec succès'
        ]);
    }

    /**
     * Exemple 3: Consultation de l'historique d'un élève
     * 
     * @Route("/student-history/{id}", name="student_history", methods={"GET"})
     */
    public function getStudentHistory(int $id): JsonResponse
    {
        // Récupérer l'historique complet de l'élève
        $history = $this->historyRepository->findByEntity('student', $id);

        // Formater les données pour l'affichage
        $formattedHistory = array_map(function($modification) {
            return [
                'id' => $modification->getId(),
                'date' => $modification->getCreatedAt()->format('d/m/Y H:i:s'),
                'user' => $modification->getUser() ? 
                    $modification->getUser()->getFirstname() . ' ' . $modification->getUser()->getLastname() :
                    'Système',
                'action' => $modification->getAction(),
                'field' => $modification->getFieldName(),
                'old_value' => $modification->getFormattedOldValue(),
                'new_value' => $modification->getFormattedNewValue(),
                'ip_address' => $modification->getIpAddress()
            ];
        }, $history);

        return $this->json([
            'success' => true,
            'student_id' => $id,
            'modifications_count' => count($formattedHistory),
            'history' => $formattedHistory
        ]);
    }

    /**
     * Exemple 4: Statistiques des modifications récentes
     * 
     * @Route("/recent-stats", name="recent_stats", methods={"GET"})
     */
    public function getRecentStats(Request $request): JsonResponse
    {
        $days = (int) $request->query->get('days', 7);
        $since = new \DateTime("-{$days} days");

        // Statistiques par type d'entité et action
        $stats = $this->historyRepository->getModificationStats($since);

        // Utilisateurs les plus actifs
        $activeUsers = $this->historyRepository->getMostActiveUsers(10, $since);

        // Compter les modifications par jour
        $qb = $this->historyRepository->createQueryBuilder('mh')
            ->select('DATE(mh.createdAt) as modification_date, COUNT(mh.id) as count')
            ->where('mh.createdAt >= :since')
            ->setParameter('since', $since)
            ->groupBy('modification_date')
            ->orderBy('modification_date', 'ASC');

        $dailyStats = $qb->getQuery()->getResult();

        return $this->json([
            'success' => true,
            'period' => [
                'since' => $since->format('Y-m-d'),
                'days' => $days
            ],
            'stats_by_entity_action' => $stats,
            'most_active_users' => $activeUsers,
            'daily_modifications' => $dailyStats
        ]);
    }

    /**
     * Exemple 5: Recherche avancée dans l'historique
     * 
     * @Route("/search", name="search", methods={"GET"})
     */
    public function searchModifications(Request $request): JsonResponse
    {
        // Construire les filtres depuis les paramètres de requête
        $filters = [];
        
        if ($entityType = $request->query->get('entity_type')) {
            $filters['entity_type'] = $entityType;
        }
        
        if ($userId = $request->query->get('user_id')) {
            $filters['user_id'] = (int) $userId;
        }
        
        if ($action = $request->query->get('action')) {
            $filters['action'] = $action;
        }
        
        if ($dateFrom = $request->query->get('date_from')) {
            $filters['date_from'] = $dateFrom;
        }
        
        if ($dateTo = $request->query->get('date_to')) {
            $filters['date_to'] = $dateTo;
        }
        
        if ($search = $request->query->get('search')) {
            $filters['search'] = $search;
        }

        $page = max(1, (int) $request->query->get('page', 1));
        $limit = min(100, max(10, (int) $request->query->get('limit', 20)));

        // Effectuer la recherche
        $result = $this->historyRepository->findWithFilters($filters, $page, $limit);

        return $this->json([
            'success' => true,
            'filters_applied' => $filters,
            'pagination' => [
                'current_page' => $result['current_page'],
                'total_pages' => $result['pages'],
                'total_items' => $result['total'],
                'per_page' => $result['per_page']
            ],
            'modifications' => array_map(function($modification) {
                return [
                    'id' => $modification->getId(),
                    'date' => $modification->getCreatedAt()->format('Y-m-d H:i:s'),
                    'user' => $modification->getUser() ?
                        $modification->getUser()->getFirstname() . ' ' . $modification->getUser()->getLastname() :
                        'Système',
                    'entity_type' => $modification->getEntityType(),
                    'entity_name' => $modification->getEntityName(),
                    'action' => $modification->getAction(),
                    'field' => $modification->getFieldName(),
                    'summary' => $this->createModificationSummary($modification)
                ];
            }, $result['data'])
        ]);
    }

    /**
     * Exemple 6: Export personnalisé des modifications
     * 
     * @Route("/custom-export", name="custom_export", methods={"GET"})
     */
    public function customExport(Request $request): JsonResponse
    {
        $entityType = $request->query->get('entity_type', 'student');
        $since = new \DateTime($request->query->get('since', '-30 days'));
        
        // Récupérer les modifications pour export
        $modifications = $this->historyRepository->exportWithFilters([
            'entity_type' => $entityType,
            'date_from' => $since->format('Y-m-d')
        ]);

        // Créer un résumé des modifications par entité
        $entitiesSummary = [];
        foreach ($modifications as $modification) {
            $entityKey = $modification->getEntityId();
            
            if (!isset($entitiesSummary[$entityKey])) {
                $entitiesSummary[$entityKey] = [
                    'entity_id' => $modification->getEntityId(),
                    'entity_name' => $modification->getEntityName(),
                    'modifications_count' => 0,
                    'fields_modified' => [],
                    'last_modification' => null
                ];
            }
            
            $entitiesSummary[$entityKey]['modifications_count']++;
            $entitiesSummary[$entityKey]['fields_modified'][] = $modification->getFieldName();
            $entitiesSummary[$entityKey]['last_modification'] = $modification->getCreatedAt()->format('Y-m-d H:i:s');
        }

        // Dédoublonner les champs modifiés
        foreach ($entitiesSummary as &$summary) {
            $summary['fields_modified'] = array_unique($summary['fields_modified']);
        }

        return $this->json([
            'success' => true,
            'export_info' => [
                'entity_type' => $entityType,
                'since' => $since->format('Y-m-d'),
                'total_modifications' => count($modifications),
                'entities_affected' => count($entitiesSummary)
            ],
            'entities_summary' => array_values($entitiesSummary)
        ]);
    }

    /**
     * Crée un résumé lisible d'une modification
     */
    private function createModificationSummary($modification): string
    {
        $action = match($modification->getAction()) {
            'create' => 'a créé',
            'update' => 'a modifié',
            'delete' => 'a supprimé',
            default => 'a effectué une action sur'
        };

        $userName = $modification->getUser() ?
            $modification->getUser()->getFirstname() . ' ' . $modification->getUser()->getLastname() :
            'Le système';

        $entityName = $modification->getEntityName() ?: "l'entité ID " . $modification->getEntityId();

        if ($modification->getAction() === 'update') {
            return "{$userName} {$action} le champ '{$modification->getFieldName()}' de {$entityName}";
        }

        return "{$userName} {$action} {$entityName}";
    }
}