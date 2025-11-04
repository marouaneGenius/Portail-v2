<?php

namespace App\Controller;

use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\Routing\Annotation\Route;

#[Route('/api/pronote')]
class PronoteDataController extends AbstractController
{
    public function __construct(
        private EntityManagerInterface $em,
    ) {}

    /**
     * Récupère toutes les données Pronote d'un élève
     */
    #[Route('/data/{studentId}', name: 'api_pronote_data', methods: ['GET'])]
    public function getData(int $studentId): JsonResponse
    {
        try {
            // Récupérer les notes
            $gradesQuery = $this->em->createQuery(
                'SELECT g FROM App\Entity\PronoteGrade g
                 WHERE g.student = :studentId
                 ORDER BY g.scraped_at DESC'
            )->setParameter('studentId', $studentId);
            $grades = $gradesQuery->getResult();

            // Récupérer les examens
            $examsQuery = $this->em->createQuery(
                'SELECT e FROM App\Entity\PronoteExam e
                 WHERE e.student = :studentId
                 ORDER BY e.scraped_at DESC'
            )->setParameter('studentId', $studentId);
            $exams = $examsQuery->getResult();

            // Récupérer les devoirs
            $homeworkQuery = $this->em->createQuery(
                'SELECT h FROM App\Entity\PronoteHomework h
                 WHERE h.student = :studentId
                 ORDER BY h.scraped_at DESC'
            )->setParameter('studentId', $studentId);
            $homework = $homeworkQuery->getResult();

            return $this->json([
                'grades' => array_map(fn($grade) => [
                    'id' => $grade->getId(),
                    'date' => $grade->getDate(),
                    'subject' => $grade->getSubject(),
                    'grade' => $grade->getGrade(),
                    'scrapedAt' => $grade->getScrapedAt()?->format('Y-m-d H:i:s'),
                ], $grades),
                'exams' => array_map(fn($exam) => [
                    'id' => $exam->getId(),
                    'day' => $exam->getDay(),
                    'month' => $exam->getMonth(),
                    'subject' => $exam->getSubject(),
                    'dateTime' => $exam->getDateTime(),
                    'salle' => $exam->getSalle(),
                    'scrapedAt' => $exam->getScrapedAt()?->format('Y-m-d H:i:s'),
                ], $exams),
                'homework' => array_map(fn($hw) => [
                    'id' => $hw->getId(),
                    'date' => $hw->getDate(),
                    'subject' => $hw->getSubject(),
                    'status' => $hw->getStatus(),
                    'description' => $hw->getDescription(),
                    'scrapedAt' => $hw->getScrapedAt()?->format('Y-m-d H:i:s'),
                ], $homework),
            ]);
        } catch (\Exception $e) {
            return $this->json([
                'error' => 'Erreur lors de la récupération des données Pronote',
                'message' => $e->getMessage()
            ], 500);
        }
    }
}
