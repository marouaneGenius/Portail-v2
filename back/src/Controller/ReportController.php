<?php

namespace App\Controller;

use App\Entity\Report;
use App\Entity\Student;
use App\Entity\Session;
use App\Repository\ReportRepository;
use App\Repository\StudentRepository;
use App\Repository\SessionRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Annotation\Route;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\IsGranted;

#[Route('/api/report')]
class ReportController extends AbstractController
{
    public function __construct(
        private EntityManagerInterface $em,
        private ReportRepository $reportRepository,
        private StudentRepository $studentRepository,
        private SessionRepository $sessionRepository
    ) {}

    #[Route('', name: 'api_reports_create', methods: ['POST'])]
    #[IsGranted('ROLE_TUTOR')]
    public function create(Request $request): JsonResponse
    {
        $data = json_decode($request->getContent(), true);

        // Champs requis
        $required = ['id_student', 'id_session'];
        foreach ($required as $field) {
            if (empty($data[$field] ?? null)) {
                return $this->json(
                    ['error' => sprintf('Le champ "%s" est requis.', $field)],
                    JsonResponse::HTTP_BAD_REQUEST
                );
            }
        }

        // Vérifier que l'étudiant existe
        $student = $this->studentRepository->find($data['id_student']);
        if (!$student) {
            return $this->json(
                ['error' => 'Étudiant introuvable.'],
                JsonResponse::HTTP_BAD_REQUEST
            );
        }

        // Vérifier que la session existe
        $session = $this->sessionRepository->find($data['id_session']);
        if (!$session) {
            return $this->json(
                ['error' => 'Séance introuvable.'],
                JsonResponse::HTTP_BAD_REQUEST
            );
        }

        // Vérifier que la séance est passée
        if ($session->getDateSlot() > new \DateTime()) {
            return $this->json(
                ['error' => 'Impossible de créer un compte-rendu pour une séance future.'],
                JsonResponse::HTTP_BAD_REQUEST
            );
        }

        // Vérifier que le tuteur connecté était le tuteur de cette séance
        if ($session->getIdUser()->getId() !== $this->getUser()->getId()) {
            return $this->json(
                ['error' => 'Vous ne pouvez créer un compte-rendu que pour vos propres séances.'],
                JsonResponse::HTTP_FORBIDDEN
            );
        }

        // Vérifier que l'élève était présent dans cette séance
        if ($session->getIdStudent()->getId() !== $student->getId()) {
            return $this->json(
                ['error' => 'Cet élève n\'était pas présent dans cette séance.'],
                JsonResponse::HTTP_BAD_REQUEST
            );
        }

        // Vérifier qu'il n'y a pas déjà un rapport pour cette séance
        $existingReport = $this->reportRepository->findOneBy(['id_session' => $session]);
        if ($existingReport) {
            return $this->json(
                ['error' => 'Un compte-rendu existe déjà pour cette séance.'],
                JsonResponse::HTTP_BAD_REQUEST
            );
        }

        $report = new Report();
        $report
            ->setIdStudent($student)
            ->setIdUser($this->getUser())
            ->setIdSession($session)
            ->setContent($data['content'] ?? null)
            ->setPointsWorked($data['points_worked'] ?? null)
            ->setObservations($data['observations'] ?? null)
            ->setHomeworkRecommendations($data['homework_recommendations'] ?? null)
            ->setSessionDuration($data['session_duration'] ?? null)
            ->setSkillsAssessment($data['skills_assessment'] ?? [])
            ->setCreatedAt(new \DateTimeImmutable())
            ->setCreatedBy($this->getUser()->getId())
        ;

        $this->em->persist($report);
        $this->em->flush();

        return $this->json([
            'id' => $report->getId(),
            'id_student' => $report->getIdStudent()->getId(),
            'id_user' => $report->getIdUser()->getId(),
            'id_session' => $report->getIdSession()?->getId(),
            'content' => $report->getContent(),
            'points_worked' => $report->getPointsWorked(),
            'observations' => $report->getObservations(),
            'homework_recommendations' => $report->getHomeworkRecommendations(),
            'session_duration' => $report->getSessionDuration(),
            'skills_assessment' => $report->getSkillsAssessment(),
            'created_at' => $report->getCreatedAt()->format(\DateTime::ATOM),
            'created_by' => $report->getCreatedBy(),
            'tutor_name' => $report->getIdUser()->getFirstname() . ' ' . $report->getIdUser()->getLastname(),
        ], JsonResponse::HTTP_CREATED);
    }

    #[Route('', name: 'api_reports_list', methods: ['GET'])]
    public function list(Request $request): JsonResponse
    {
        $studentId = $request->query->get('student_id');
        
        if ($studentId) {
            $reports = $this->reportRepository->findBy(['id_student' => $studentId], ['created_at' => 'DESC']);
        } else {
            $reports = $this->reportRepository->findBy([], ['created_at' => 'DESC']);
        }

        $data = array_map(fn(Report $r) => [
            'id' => $r->getId(),
            'id_student' => $r->getIdStudent()->getId(),
            'student_name' => $r->getIdStudent()->getFirstname() . ' ' . $r->getIdStudent()->getLastname(),
            'id_user' => $r->getIdUser()->getId(),
            'tutor_name' => $r->getIdUser()->getFirstname() . ' ' . $r->getIdUser()->getLastname(),
            'id_session' => $r->getIdSession()?->getId(),
            'content' => $r->getContent(),
            'points_worked' => $r->getPointsWorked(),
            'observations' => $r->getObservations(),
            'homework_recommendations' => $r->getHomeworkRecommendations(),
            'session_duration' => $r->getSessionDuration(),
            'skills_assessment' => $r->getSkillsAssessment(),
            'created_at' => $r->getCreatedAt()->format(\DateTime::ATOM),
            'created_by' => $r->getCreatedBy(),
        ], $reports);

        return $this->json($data);
    }

    #[Route('/{id}', name: 'api_reports_show', methods: ['GET'])]
    public function show(int $id): JsonResponse
    {
        $report = $this->reportRepository->find($id);
        if (!$report) {
            return $this->json(['error' => 'Rapport introuvable'], JsonResponse::HTTP_NOT_FOUND);
        }

        return $this->json([
            'id' => $report->getId(),
            'id_student' => $report->getIdStudent()->getId(),
            'student_name' => $report->getIdStudent()->getFirstname() . ' ' . $report->getIdStudent()->getLastname(),
            'id_user' => $report->getIdUser()->getId(),
            'tutor_name' => $report->getIdUser()->getFirstname() . ' ' . $report->getIdUser()->getLastname(),
            'id_session' => $report->getIdSession()?->getId(),
            'content' => $report->getContent(),
            'points_worked' => $report->getPointsWorked(),
            'observations' => $report->getObservations(),
            'homework_recommendations' => $report->getHomeworkRecommendations(),
            'session_duration' => $report->getSessionDuration(),
            'skills_assessment' => $report->getSkillsAssessment(),
            'created_at' => $report->getCreatedAt()->format(\DateTime::ATOM),
            'created_by' => $report->getCreatedBy(),
        ]);
    }

    #[Route('/{id}', name: 'api_reports_update', methods: ['PUT'])]
    #[IsGranted('ROLE_TUTOR')]
    public function update(int $id, Request $request): JsonResponse
    {
        $report = $this->reportRepository->find($id);
        if (!$report) {
            return $this->json(['error' => 'Rapport introuvable'], JsonResponse::HTTP_NOT_FOUND);
        }

        // Vérifier que le tuteur peut modifier ce rapport (soit il l'a créé, soit il est admin)
        if ($report->getCreatedBy() !== $this->getUser()->getId() && !$this->isGranted('ROLE_ADMIN')) {
            return $this->json(['error' => 'Non autorisé'], JsonResponse::HTTP_FORBIDDEN);
        }

        $data = json_decode($request->getContent(), true);

        // Mettre à jour les champs
        if (array_key_exists('content', $data)) {
            $report->setContent($data['content']);
        }
        if (array_key_exists('points_worked', $data)) {
            $report->setPointsWorked($data['points_worked']);
        }
        if (array_key_exists('observations', $data)) {
            $report->setObservations($data['observations']);
        }
        if (array_key_exists('homework_recommendations', $data)) {
            $report->setHomeworkRecommendations($data['homework_recommendations']);
        }
        if (array_key_exists('session_duration', $data)) {
            $report->setSessionDuration($data['session_duration']);
        }
        if (array_key_exists('skills_assessment', $data)) {
            $report->setSkillsAssessment($data['skills_assessment']);
        }

        $report->setUpdatedAt(new \DateTimeImmutable());
        $report->setUpdatedBy($this->getUser()->getUserIdentifier());

        $this->em->flush();

        return $this->json([
            'id' => $report->getId(),
            'content' => $report->getContent(),
            'points_worked' => $report->getPointsWorked(),
            'observations' => $report->getObservations(),
            'homework_recommendations' => $report->getHomeworkRecommendations(),
            'session_duration' => $report->getSessionDuration(),
            'skills_assessment' => $report->getSkillsAssessment(),
            'updated_at' => $report->getUpdatedAt()->format(\DateTime::ATOM),
            'updated_by' => $report->getUpdatedBy(),
        ]);
    }

    #[Route('/{id}', name: 'api_reports_delete', methods: ['DELETE'])]
    #[IsGranted('ROLE_ADMIN')]
    public function delete(int $id): JsonResponse
    {
        $report = $this->reportRepository->find($id);
        if (!$report) {
            return $this->json(['error' => 'Rapport introuvable'], JsonResponse::HTTP_NOT_FOUND);
        }

        $this->em->remove($report);
        $this->em->flush();

        return new JsonResponse(null, JsonResponse::HTTP_NO_CONTENT);
    }

    #[Route('/student/{studentId}', name: 'api_reports_by_student', methods: ['GET'])]
    public function getByStudent(int $studentId): JsonResponse
    {
        $student = $this->studentRepository->find($studentId);
        if (!$student) {
            return $this->json(['error' => 'Étudiant introuvable'], JsonResponse::HTTP_NOT_FOUND);
        }

        $reports = $this->reportRepository->findBy(['id_student' => $studentId], ['created_at' => 'DESC']);

        $data = array_map(fn(Report $r) => [
            'id' => $r->getId(),
            'id_session' => $r->getIdSession()?->getId(),
            'session_date' => $r->getIdSession()?->getDateSlot()?->format('Y-m-d'),
            'content' => $r->getContent(),
            'points_worked' => $r->getPointsWorked(),
            'observations' => $r->getObservations(),
            'homework_recommendations' => $r->getHomeworkRecommendations(),
            'session_duration' => $r->getSessionDuration(),
            'skills_assessment' => $r->getSkillsAssessment(),
            'created_at' => $r->getCreatedAt()->format(\DateTime::ATOM),
            'tutor_name' => $r->getIdUser()->getFirstname() . ' ' . $r->getIdUser()->getLastname(),
            'tutor_id' => $r->getIdUser()->getId(),
        ], $reports);

        return $this->json($data);
    }

    #[Route('/available-sessions/{studentId}', name: 'api_reports_available_sessions', methods: ['GET'])]
    #[IsGranted('ROLE_TUTOR')]
    public function getAvailableSessionsForReport(int $studentId): JsonResponse
    {
        $student = $this->studentRepository->find($studentId);
        if (!$student) {
            return $this->json(['error' => 'Étudiant introuvable'], JsonResponse::HTTP_NOT_FOUND);
        }

        // Récupérer les séances passées du tuteur connecté avec cet élève
        $sessions = $this->em->createQueryBuilder()
            ->select('s')
            ->from('App\Entity\Session', 's')
            ->leftJoin('App\Entity\Report', 'r', 'WITH', 'r.id_session = s.id')
            ->where('s.id_student = :studentId')
            ->andWhere('s.id_user = :tutorId')
            ->andWhere('s.date_slot < :now')
            ->andWhere('r.id IS NULL') // Pas encore de rapport
            ->setParameter('studentId', $studentId)
            ->setParameter('tutorId', $this->getUser()->getId())
            ->setParameter('now', new \DateTime())
            ->orderBy('s.date_slot', 'DESC')
            ->getQuery()
            ->getResult();

        $data = array_map(fn($s) => [
            'id' => $s->getId(),
            'date_slot' => $s->getDateSlot()->format('Y-m-d H:i'),
            'label' => 'Séance du ' . $s->getDateSlot()->format('d/m/Y à H:i'),
        ], $sessions);

        return $this->json($data);
    }
}