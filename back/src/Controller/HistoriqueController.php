<?php

namespace App\Controller;

use App\Repository\ModificationHistoryRepository;
use App\Repository\UserRepository;
use App\Repository\StudentRepository;
use App\Repository\StudentParentRepository;
use App\Repository\CenterRepository;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\Validator\Validator\ValidatorInterface;
use Symfony\Component\Validator\Constraints as Assert;

/**
 * Contrôleur pour l'API d'historique des modifications
 * 
 * Fournit tous les endpoints nécessaires pour consulter, filtrer et exporter
 * l'historique des modifications des entités.
 */
#[Route('/api/historique', name: 'api_historique_')]
class HistoriqueController extends AbstractController
{
    private ModificationHistoryRepository $historyRepository;
    private UserRepository $userRepository;
    private StudentRepository $studentRepository;
    private StudentParentRepository $parentRepository;
    private CenterRepository $centerRepository;
    private ValidatorInterface $validator;

    public function __construct(
        ModificationHistoryRepository $historyRepository,
        UserRepository $userRepository,
        StudentRepository $studentRepository,
        StudentParentRepository $parentRepository,
        CenterRepository $centerRepository,
        ValidatorInterface $validator
    ) {
        $this->historyRepository = $historyRepository;
        $this->userRepository = $userRepository;
        $this->studentRepository = $studentRepository;
        $this->parentRepository = $parentRepository;
        $this->centerRepository = $centerRepository;
        $this->validator = $validator;
    }

    /**
     * Liste les modifications avec filtres et pagination
     * 
     * @Route("/modifications", name="list", methods={"GET"})
     */
    public function listModifications(Request $request): JsonResponse
    {
        // Validation des paramètres
        $errors = $this->validateListParameters($request);
        if (!empty($errors)) {
            return $this->json(['errors' => $errors], Response::HTTP_BAD_REQUEST);
        }

        // Extraction des paramètres
        $page = max(1, (int) $request->query->get('page', 1));
        $limit = min(100, max(10, (int) $request->query->get('limit', 20)));
        
        $filters = $this->extractFilters($request);

        try {
            // Récupération des données avec filtres
            $result = $this->historyRepository->findWithFilters($filters, $page, $limit);

            // Transformation des données pour l'affichage
            $formattedData = array_map([$this, 'formatModificationForDisplay'], $result['data']);

            return $this->json([
                'success' => true,
                'data' => $formattedData,
                'pagination' => [
                    'current_page' => $result['current_page'],
                    'total_pages' => $result['pages'],
                    'total_items' => $result['total'],
                    'per_page' => $result['per_page']
                ],
                'filters_applied' => $filters
            ]);

        } catch (\Exception $e) {
            return $this->json([
                'success' => false,
                'error' => 'Erreur lors de la récupération des modifications',
                'details' => $this->getParameter('kernel.environment') === 'dev' ? $e->getMessage() : null
            ], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * Obtient les options pour les filtres (dropdowns)
     * 
     * @Route("/filter-options", name="filter_options", methods={"GET"})
     */
    public function getFilterOptions(): JsonResponse
    {
        try {
            $options = $this->historyRepository->getFilterOptions();

            // Ajouter les utilisateurs
            $users = $this->userRepository->findBy(['is_deleted' => false], ['firstname' => 'ASC']);
            $options['users'] = array_map(function($user) {
                return [
                    'id' => $user->getId(),
                    'name' => trim(($user->getFirstname() ?? '') . ' ' . ($user->getLastname() ?? '')),
                    'email' => $user->getEmail()
                ];
            }, $users);

            // Ajouter les élèves
            $students = $this->studentRepository->findBy([], ['firstname' => 'ASC']);
            $options['students'] = array_map(function($student) {
                return [
                    'id' => $student->getId(),
                    'name' => trim(($student->getFirstname() ?? '') . ' ' . ($student->getLastname() ?? '')),
                    'class' => $student->getClass()
                ];
            }, $students);

            // Ajouter les parents
            $parents = $this->parentRepository->findBy([], ['firstname' => 'ASC']);
            $options['parents'] = array_map(function($parent) {
                return [
                    'id' => $parent->getId(),
                    'name' => trim(($parent->getFirstname() ?? '') . ' ' . ($parent->getLastname() ?? '')),
                    'email' => $parent->getEmail()
                ];
            }, $parents);

            // Ajouter les centres
            $centers = $this->centerRepository->findBy([], ['name' => 'ASC']);
            $options['centers'] = array_map(function($center) {
                return [
                    'id' => $center->getId(),
                    'name' => $center->getName(),
                    'city' => $center->getCity()
                ];
            }, $centers);

            return $this->json([
                'success' => true,
                'options' => $options
            ]);

        } catch (\Exception $e) {
            // Log the actual error for debugging
            error_log('Filter options error: ' . $e->getMessage());
            
            return $this->json([
                'success' => false,
                'error' => 'Erreur lors de la récupération des options de filtres',
                'debug' => $this->getParameter('kernel.environment') === 'dev' ? $e->getMessage() : null
            ], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * Exporte les modifications en CSV
     * 
     * @Route("/export", name="export", methods={"GET"})
     */
    public function exportModifications(Request $request): Response
    {
        try {
            $filters = $this->extractFilters($request);
            $modifications = $this->historyRepository->exportWithFilters($filters);

            // Génération du CSV
            $csv = $this->generateCsv($modifications);
            
            $filename = 'historique_modifications_' . date('Y-m-d_H-i-s') . '.csv';

            $response = new Response($csv);
            $response->headers->set('Content-Type', 'text/csv; charset=utf-8');
            $response->headers->set('Content-Disposition', 'attachment; filename="' . $filename . '"');
            
            return $response;

        } catch (\Exception $e) {
            return $this->json([
                'success' => false,
                'error' => 'Erreur lors de l\'export des modifications'
            ], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * Obtient les détails d'une modification spécifique
     * 
     * @Route("/modification/{id}", name="detail", methods={"GET"})
     */
    public function getModificationDetail(int $id): JsonResponse
    {
        try {
            $modification = $this->historyRepository->find($id);
            
            if (!$modification) {
                return $this->json([
                    'success' => false,
                    'error' => 'Modification non trouvée'
                ], Response::HTTP_NOT_FOUND);
            }

            return $this->json([
                'success' => true,
                'data' => $this->formatModificationForDisplay($modification, true)
            ]);

        } catch (\Exception $e) {
            return $this->json([
                'success' => false,
                'error' => 'Erreur lors de la récupération des détails'
            ], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * Obtient l'historique pour une entité spécifique
     * 
     * @Route("/entity/{entityType}/{entityId}", name="entity_history", methods={"GET"})
     */
    public function getEntityHistory(string $entityType, int $entityId): JsonResponse
    {
        try {
            $modifications = $this->historyRepository->findByEntity($entityType, $entityId);
            
            $formattedData = array_map([$this, 'formatModificationForDisplay'], $modifications);

            return $this->json([
                'success' => true,
                'data' => $formattedData,
                'entity_type' => $entityType,
                'entity_id' => $entityId
            ]);

        } catch (\Exception $e) {
            return $this->json([
                'success' => false,
                'error' => 'Erreur lors de la récupération de l\'historique de l\'entité'
            ], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * Obtient les statistiques des modifications
     * 
     * @Route("/stats", name="stats", methods={"GET"})
     */
    public function getStats(Request $request): JsonResponse
    {
        try {
            $since = $request->query->get('since');
            $sinceDate = $since ? new \DateTime($since) : new \DateTime('-30 days');

            $stats = $this->historyRepository->getModificationStats($sinceDate);
            $activeUsers = $this->historyRepository->getMostActiveUsers(10, $sinceDate);

            return $this->json([
                'success' => true,
                'data' => [
                    'modification_stats' => $stats,
                    'most_active_users' => $activeUsers,
                    'period' => [
                        'since' => $sinceDate->format('Y-m-d'),
                        'until' => (new \DateTime())->format('Y-m-d')
                    ]
                ]
            ]);

        } catch (\Exception $e) {
            return $this->json([
                'success' => false,
                'error' => 'Erreur lors de la récupération des statistiques'
            ], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * Valide les paramètres de la liste
     */
    private function validateListParameters(Request $request): array
    {
        $errors = [];

        // Validation de la page
        $page = $request->query->get('page');
        if ($page !== null && (!is_numeric($page) || $page < 1)) {
            $errors['page'] = 'La page doit être un nombre entier positif';
        }

        // Validation de la limite
        $limit = $request->query->get('limit');
        if ($limit !== null && (!is_numeric($limit) || $limit < 1 || $limit > 100)) {
            $errors['limit'] = 'La limite doit être un nombre entre 1 et 100';
        }

        // Validation des dates
        $dateFrom = $request->query->get('date_from');
        if ($dateFrom && !$this->isValidDate($dateFrom)) {
            $errors['date_from'] = 'Format de date invalide (attendu: Y-m-d)';
        }

        $dateTo = $request->query->get('date_to');
        if ($dateTo && !$this->isValidDate($dateTo)) {
            $errors['date_to'] = 'Format de date invalide (attendu: Y-m-d)';
        }

        return $errors;
    }

    /**
     * Extrait les filtres depuis la requête
     */
    private function extractFilters(Request $request): array
    {
        return array_filter([
            'user_id' => $request->query->get('user_id'),
            'entity_type' => $request->query->get('entity_type'),
            'entity_id' => $request->query->get('entity_id'),
            'action' => $request->query->get('action'),
            'field_name' => $request->query->get('field_name'),
            'date_from' => $request->query->get('date_from'),
            'date_to' => $request->query->get('date_to'),
            'search' => $request->query->get('search'),
            'student_name' => $request->query->get('student_name'),
            'parent_name' => $request->query->get('parent_name')
        ], function($value) {
            return $value !== null && $value !== '';
        });
    }

    /**
     * Formate une modification pour l'affichage
     */
    private function formatModificationForDisplay($modification, bool $detailed = false): array
    {
        $data = [
            'id' => $modification->getId(),
            'created_at' => $modification->getCreatedAt()->format('Y-m-d H:i:s'),
            'created_at_human' => $modification->getCreatedAt()->format('d/m/Y à H:i'),
            'user' => $modification->getUser() ? [
                'id' => $modification->getUser()->getId(),
                'name' => $modification->getUser()->getFirstname() . ' ' . $modification->getUser()->getLastname(),
                'email' => $modification->getUser()->getEmail()
            ] : ['name' => 'Système', 'email' => null],
            'entity_type' => $modification->getEntityType(),
            'entity_type_label' => $this->getEntityTypeLabel($modification->getEntityType()),
            'entity_id' => $modification->getEntityId(),
            'entity_name' => $modification->getEntityName(),
            'field_name' => $modification->getFieldName(),
            'field_label' => $this->getFieldLabel($modification->getFieldName()),
            'action' => $modification->getAction(),
            'action_label' => $this->getActionLabel($modification->getAction()),
            'old_value_display' => $modification->getFormattedOldValue(),
            'new_value_display' => $modification->getFormattedNewValue()
        ];

        if ($detailed) {
            $data['old_value_raw'] = $modification->getOldValue();
            $data['new_value_raw'] = $modification->getNewValue();
            $data['ip_address'] = $modification->getIpAddress();
            $data['user_agent'] = $modification->getUserAgent();
            $data['metadata'] = $modification->getMetadata();
        }

        return $data;
    }

    /**
     * Génère le CSV pour l'export
     */
    private function generateCsv(array $modifications): string
    {
        $output = fopen('php://temp', 'r+');
        
        // En-têtes
        fputcsv($output, [
            'Date',
            'Utilisateur',
            'Type entité',
            'Nom entité',
            'Action',
            'Champ',
            'Ancienne valeur',
            'Nouvelle valeur',
            'IP'
        ], ';');

        // Données
        foreach ($modifications as $modification) {
            fputcsv($output, [
                $modification->getCreatedAt()->format('d/m/Y H:i:s'),
                $modification->getUser() ? 
                    $modification->getUser()->getFirstname() . ' ' . $modification->getUser()->getLastname() : 
                    'Système',
                $this->getEntityTypeLabel($modification->getEntityType()),
                $modification->getEntityName(),
                $this->getActionLabel($modification->getAction()),
                $this->getFieldLabel($modification->getFieldName()),
                $modification->getFormattedOldValue(),
                $modification->getFormattedNewValue(),
                $modification->getIpAddress()
            ], ';');
        }

        rewind($output);
        $csv = stream_get_contents($output);
        fclose($output);

        // Ajouter BOM pour Excel
        return "\xEF\xBB\xBF" . $csv;
    }

    /**
     * Traduit le type d'entité
     */
    private function getEntityTypeLabel(string $entityType): string
    {
        $labels = [
            'student' => 'Élève',
            'parent' => 'Parent',
            'center' => 'Centre',
            'user' => 'Utilisateur',
            'team' => 'Équipe'
        ];

        return $labels[$entityType] ?? $entityType;
    }

    /**
     * Traduit l'action
     */
    private function getActionLabel(string $action): string
    {
        $labels = [
            'create' => 'Création',
            'update' => 'Modification',
            'delete' => 'Suppression'
        ];

        return $labels[$action] ?? $action;
    }

    /**
     * Traduit le nom du champ
     */
    private function getFieldLabel(string $fieldName): string
    {
        $labels = [
            'firstname' => 'Prénom',
            'lastname' => 'Nom',
            'email' => 'Email',
            'phone' => 'Téléphone',
            'address' => 'Adresse',
            'city' => 'Ville',
            'zip_code' => 'Code postal',
            'gender' => 'Genre',
            'class' => 'Classe',
            'name' => 'Nom',
            'entity' => 'Entité'
        ];

        return $labels[$fieldName] ?? $fieldName;
    }

    /**
     * Valide le format de date
     */
    private function isValidDate(string $date): bool
    {
        $d = \DateTime::createFromFormat('Y-m-d', $date);
        return $d && $d->format('Y-m-d') === $date;
    }
}