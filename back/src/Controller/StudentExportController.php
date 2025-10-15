<?php

namespace App\Controller;

use App\Service\StudentExportService;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\IsGranted;

#[Route('/api/student/export')]
class StudentExportController extends AbstractController
{
    public function __construct(
        private StudentExportService $exportService
    ) {}

    /**
     * Récupère les options disponibles pour les filtres (centres, classes)
     *
     * @return JsonResponse
     */
    #[Route('/options', name: 'api_student_export_options', methods: ['GET'])]
    #[IsGranted('ROLE_USER')]
    public function getExportOptions(): JsonResponse
    {
        $centers = $this->exportService->getAllCenters();
        $classes = $this->exportService->getAllClasses();

        $centersData = array_map(function ($center) {
            return [
                'id' => $center->getId(),
                'name' => $center->getName(),
            ];
        }, $centers);

        return $this->json([
            'centers' => $centersData,
            'classes' => $classes,
            'statuses' => [
                ['value' => 'registered', 'label' => 'Inscrit'],
                ['value' => 'trial_session', 'label' => 'A effectué une séance d\'essai'],
                ['value' => 'active_subscription', 'label' => 'Abonnement en cours'],
                ['value' => 'resiliated_subscription', 'label' => 'Abonnement résilié'],
                ['value' => 'terminated_subscription', 'label' => 'Abonnement terminé'],
            ]
        ]);
    }

    /**
     * Exporte les élèves au format CSV selon les filtres fournis
     *
     * @param Request $request JSON { centers?: [], classes?: [], statuses?: [] }
     * @return Response Fichier CSV
     */
    #[Route('', name: 'api_student_export', methods: ['POST'])]
    #[IsGranted('ROLE_USER')]
    public function exportStudents(Request $request): Response
    {
        $data = json_decode($request->getContent(), true);

        $filters = [
            'centers' => $data['centers'] ?? [],
            'classes' => $data['classes'] ?? [],
            'statuses' => $data['statuses'] ?? [],
        ];

        // Récupérer les données filtrées
        $exportData = $this->exportService->getFilteredStudentsForExport($filters);

        // Générer le CSV
        $csv = $this->exportService->generateCSV($exportData);

        // Créer la réponse avec le fichier CSV
        $response = new Response($csv);
        $response->headers->set('Content-Type', 'text/csv; charset=utf-8');
        $response->headers->set('Content-Disposition', 'attachment; filename="export_eleves_' . date('Y-m-d_H-i-s') . '.csv"');

        return $response;
    }

    /**
     * Prévisualise les données qui seront exportées (sans générer le CSV)
     *
     * @param Request $request JSON { centers?: [], classes?: [], statuses?: [] }
     * @return JsonResponse
     */
    #[Route('/preview', name: 'api_student_export_preview', methods: ['POST'])]
    #[IsGranted('ROLE_USER')]
    public function previewExport(Request $request): JsonResponse
    {
        $data = json_decode($request->getContent(), true);

        $filters = [
            'centers' => $data['centers'] ?? [],
            'classes' => $data['classes'] ?? [],
            'statuses' => $data['statuses'] ?? [],
        ];

        // Récupérer les données filtrées
        $exportData = $this->exportService->getFilteredStudentsForExport($filters);

        return $this->json([
            'count' => count($exportData),
            'preview' => array_slice($exportData, 0, 10), // Limiter à 10 pour la prévisualisation
        ]);
    }
}
