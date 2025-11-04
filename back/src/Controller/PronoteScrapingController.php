<?php

namespace App\Controller;

use App\Entity\Student;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\HttpClient\HttpClient;
use Psr\Log\LoggerInterface;

#[Route('/api/pronote')]
class PronoteScrapingController extends AbstractController
{
    private const SCRAPER_API_URL = 'http://scrapper:3000';

    public function __construct(
        private EntityManagerInterface $em,
        private LoggerInterface $logger
    ) {}

    /**
     * Déclenche le scraping Pronote pour un élève
     */
    #[Route('/scrape/{id}', name: 'pronote_scrape_student', methods: ['POST'])]
    public function scrapeStudent(Student $student): JsonResponse
    {
        try {
            // Vérifier que l'élève a des identifiants Pronote
            if (!$student->hasPronoteCredentials()) {
                return $this->json([
                    'success' => false,
                    'message' => 'Cet élève n\'a pas d\'identifiants Pronote configurés (school_app doit être "pronote" et tous les champs doivent être remplis)'
                ], Response::HTTP_BAD_REQUEST);
            }

            $this->logger->info('Déclenchement du scraping Pronote', [
                'student_id' => $student->getId(),
                'student_name' => $student->getFirstname() . ' ' . $student->getLastname()
            ]);

            // Appel à l'API du scraper
            $client = HttpClient::create();
            $response = $client->request('POST', self::SCRAPER_API_URL . '/api/scrape/' . $student->getId(), [
                'timeout' => 120, // 2 minutes timeout
                'headers' => [
                    'Content-Type' => 'application/json',
                ],
            ]);

            $statusCode = $response->getStatusCode();
            $data = $response->toArray(false);

            if ($statusCode === 200 && isset($data['success']) && $data['success']) {
                $this->logger->info('Scraping Pronote réussi', [
                    'student_id' => $student->getId(),
                    'data_keys' => isset($data['data']) ? array_keys($data['data']) : []
                ]);

                return $this->json([
                    'success' => true,
                    'message' => 'Scraping Pronote terminé avec succès',
                    'data' => $data['data'] ?? null
                ]);
            } else {
                $this->logger->error('Échec du scraping Pronote', [
                    'student_id' => $student->getId(),
                    'status_code' => $statusCode,
                    'error' => $data['error'] ?? 'Erreur inconnue'
                ]);

                return $this->json([
                    'success' => false,
                    'message' => 'Échec du scraping Pronote',
                    'error' => $data['error'] ?? 'Erreur inconnue'
                ], Response::HTTP_INTERNAL_SERVER_ERROR);
            }

        } catch (\Exception $e) {
            $this->logger->error('Exception lors du scraping Pronote', [
                'student_id' => $student->getId(),
                'exception' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return $this->json([
                'success' => false,
                'message' => 'Erreur lors de la communication avec le service de scraping',
                'error' => $e->getMessage()
            ], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * Vérifie le statut des identifiants Pronote d'un élève
     */
    #[Route('/status/{id}', name: 'pronote_check_status', methods: ['GET'])]
    public function checkStatus(Student $student): JsonResponse
    {
        $hasCredentials = $student->hasPronoteCredentials();

        return $this->json([
            'success' => true,
            'hasCredentials' => $hasCredentials,
            'schoolApp' => $student->getSchoolApp(),
            'pronoteLink' => $student->getPronoteLink(),
            'pronoteUsername' => $student->getPronoteUsername(),
            'pronotePassword' => $student->getPronotePassword() ? '***' : null, // Masqué pour la sécurité
            'studentId' => $student->getId(),
            'studentName' => $student->getFirstname() . ' ' . $student->getLastname()
        ]);
    }

    /**
     * Health check du service de scraping
     */
    #[Route('/health', name: 'pronote_scraper_health', methods: ['GET'])]
    public function healthCheck(): JsonResponse
    {
        try {
            $client = HttpClient::create();
            $response = $client->request('GET', self::SCRAPER_API_URL . '/health', [
                'timeout' => 5
            ]);

            $data = $response->toArray();

            return $this->json([
                'success' => true,
                'scraper_status' => 'online',
                'scraper_info' => $data
            ]);

        } catch (\Exception $e) {
            return $this->json([
                'success' => false,
                'scraper_status' => 'offline',
                'error' => $e->getMessage()
            ], Response::HTTP_SERVICE_UNAVAILABLE);
        }
    }
}
