<?php

namespace App\Controller;

use App\Entity\Subscription;
use App\Entity\Session;
use App\Repository\CenterRepository;
use App\Repository\SubscriptionRepository;
use App\Repository\StudentRepository;
use App\Repository\UserRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;
use Symfony\Component\PasswordHasher\Hasher\UserPasswordHasherInterface;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Contracts\HttpClient\HttpClientInterface;
use App\Repository\SessionRepository;

#[Route('/api/subs', name: 'api_subscription_')]
class SubscriptionController extends AbstractController
{
    private EntityManagerInterface $em;
    private UserPasswordHasherInterface $passwordHasher;
    private CenterRepository $centerRepository;
    private SubscriptionRepository $subscriptionRepository;
    private StudentRepository $studentRepository;
    private SessionRepository $sessionRepository;

    public function __construct(
        EntityManagerInterface $em,
        CenterRepository $centerRepository,
        SubscriptionRepository $subscriptionRepository,
        StudentRepository $studentRepository,
        SessionRepository $sessionRepository,
        private UserRepository $userRepository,
        private HttpClientInterface $httpClient
    ) {
        $this->em               = $em;
        $this->centerRepository = $centerRepository;
        $this->subscriptionRepository = $subscriptionRepository;
        $this->studentRepository = $studentRepository;
        $this->sessionRepository = $sessionRepository;
    }

    #[Route('', name: 'create', methods: ['POST'])]
    public function create(Request $request): JsonResponse
    {
        $data = json_decode($request->getContent(), true);

        if (!\is_array($data)) {
            return new JsonResponse(['error' => 'Invalid JSON body'], JsonResponse::HTTP_BAD_REQUEST);
        }
    
        $subscription = new Subscription();

        if (!empty($data['student_id'])) {
            $student = $this->studentRepository->find($data['student_id']);
            if (!$student) {
                return new JsonResponse(['error' => 'Étudiant non trouvé'], JsonResponse::HTTP_NOT_FOUND);
            }
            $subscription->setIdStudent($student);
        }
        
        // Dates (converties proprement)
        $subscription->setCreatedAt(new \DateTimeImmutable());
        $subscription->setUpdatedAt(null);
        $subscription->setSubscriptionStartDate(isset($data['subscription_start_date']) ? new \DateTime($data['subscription_start_date']) : null);
        $subscription->setSubscriptionEndDate(isset($data['subscription_end_date']) ? new \DateTime($data['subscription_end_date']) : null);
        $subscription->setFirstDebitDate(isset($data['first_debit_date'])  ? new \DateTime($data['first_debit_date'] ): null);
        $subscription->setRecurrentDebitDate(isset($data['recurrent_debit_date']) ? $data['recurrent_debit_date']: null);
        $subscription->setDateCaution(isset($data['date_caution']) ? new \DateTime($data['date_caution']) : null);
        // Champs simples
        $subscription->setInstallmentCount($data['installment_count'] ?? null);
        $subscription->setSessionSchedule($data['session_schedule'] ?? null);
        $subscription->setDiscount($data['discount'] ?? null);
        $subscription->setSchoolSubjects($data['school_subjects'] ?? null);
        $subscription->setOfferType($data['offer_type'] ?? '');
        $subscription->setOfferAmount($data['offer_amount'] ?? null);
        $subscription->setMembershipFee($data['membership_fee'] ?? null);
        $subscription->setCombinedId($data['combined_id'] ?? null);
        $subscription->setSubscriptionType($data['subscription_type'] ?? '');
        $subscription->setIsValide($data['is_valide'] ?? false);
        $subscription->setIsSuspended($data['is_suspended'] ?? false);
        $subscription->setPaymentMode($data['payment_mode'] ?? null);
        $subscription->setCaution($data['caution'] ?? false);
        $subscription->setFavoriteSlots($data['favorite_slots'] ?? null);
        $subscription->setCreatedBy($data['created_by']);
        $subscription->setUpdatedBy(null);
        $subscription->setSessionPerWeek($data['session_per_week'] ?? null);
        $subscription->setWeekCount($data['week_count'] ?? null);
        $subscription->setSelectedWeeks($data['selected_weeks'] ?? null);
        $subscription->setKnownWeeks($data['known_weeks'] ?? null);
        $subscription->setIsProgramed(false);
    
        $this->em->persist($subscription);
        $this->em->flush();
    
        return new JsonResponse([
            'id' => $subscription->getId(),
            'student' => $subscription->getIdStudent()?->getId(),
            'combined_id' => $subscription->getCombinedId(),
        ], JsonResponse::HTTP_CREATED);
    }
    #[Route('/{id}', name: 'subscription_show', methods: ['GET'], requirements: ['id' => '\d+'])]
    public function show(int $id): JsonResponse
    {
        /** @var Subscription|null $subscription */
        $subscription = $this->subscriptionRepository->find($id);

        if (!$subscription) {
            return new JsonResponse(
                ['error' => 'Subscription not found'],
                JsonResponse::HTTP_NOT_FOUND
            );
        }

        /* -----------  Préparation de la réponse  ----------- */
        $student   = $subscription->getIdStudent();
        $sessions  = $subscription->getSessions();

        return new JsonResponse([
            'id'                     => $subscription->getId(),
            'combined_id'            => $subscription->getCombinedId(),
            'subscription_type'      => $subscription->getSubscriptionType(),
            'is_valide'              => $subscription->isIsValide(),
            'payment_mode'           => $subscription->getPaymentMode(),
            'subscription_start_date'=> $subscription->getSubscriptionStartDate()?->format('Y-m-d'),
            'subscription_end_date'  => $subscription->getSubscriptionEndDate()?->format('Y-m-d'),
            'first_debit_date'       => $subscription->getFirstDebitDate()?->format('Y-m-d'),
            'recurrent_debit_date'   => $subscription->getRecurrentDebitDate(),
            'installment_count'      => $subscription->getInstallmentCount(),
            'session_per_week'       => $subscription->getSessionPerWeek(),
            'week_count'             => $subscription->getWeekCount(),
            'selected_weeks'         => $subscription->getSelectedWeeks(),
            'known_weeks'            => $subscription->getKnownWeeks(),
            'discount'               => $subscription->getDiscount(),
            'offer_amount'           => $subscription->getOfferAmount(),
            'offer_type'             => $subscription->getOfferType(),
            'membership_fee'         => $subscription->getMembershipFee(),
            'school_subjects'        => $subscription->getSchoolSubjects(),
            'favorite_slots'         => $subscription->getFavoriteSlots(),
            'is_suspended'         => $subscription->isIsSuspended(),
            'is_programed'         => $subscription->isIsProgramed(),
            'programed_at'         => $subscription->getProgramedAt(),
            'engagement'             => $subscription->getEngagement(),

            'student' => $student ? [
                'id'        => $student->getId(),
                'firstname' => $student->getFirstname(),
                'lastname'  => $student->getLastname(),
                'class'    => $student->getClass(),
            ] : null,
            'sessions' => array_map(fn($s) => [
                'id'         => $s->getId(),
                // 'start_time' => $s->getS
                // 'end_time'   => $s->getEndTime()?->format('Y-m-d H:i:s'),
            ], $sessions->toArray()),

            'created_at' => $subscription->getCreatedAt()?->format(\DateTimeInterface::ATOM),
            'created_by' => $subscription->getCreatedBy(),
            'updated_at' => $subscription->getUpdatedAt()?->format(\DateTimeInterface::ATOM),
            'updated_by' => $subscription->getUpdatedBy(),
        ], JsonResponse::HTTP_OK);
    }

    #[Route('/combined/{combinedId}', name: 'subs_by_combined', methods: ['GET'])]
    public function byCombined(string $combinedId): JsonResponse   // <-- même nom, string
    {
        $subs = $this->subscriptionRepository->findByCombinedId($combinedId);

        if (!$subs) {
            return new JsonResponse(
                ['message' => 'Aucun abonnement trouvé pour ce combined_id'],
                JsonResponse::HTTP_NOT_FOUND
            );
        }


        // On ne retourne que ce qui est utile au front (id, type, etc.)
        $data = array_map(fn($subscription) => [
            'id'                     => $subscription->getId(),
            'combined_id'            => $subscription->getCombinedId(),
            'subscription_type'      => $subscription->getSubscriptionType(),
            'is_valide'              => $subscription->isIsValide(),
            'payment_mode'           => $subscription->getPaymentMode(),
            'subscription_start_date'=> $subscription->getSubscriptionStartDate()?->format('Y-m-d'),
            'subscription_end_date'  => $subscription->getSubscriptionEndDate()?->format('Y-m-d'),
            'first_debit_date'       => $subscription->getFirstDebitDate()?->format('Y-m-d'),
            'recurrent_debit_date'   => $subscription->getRecurrentDebitDate(),
            'installment_count'      => $subscription->getInstallmentCount(),
            'session_per_week'       => $subscription->getSessionPerWeek(),
            'week_count'             => $subscription->getWeekCount(),
            'selected_weeks'         => $subscription->getSelectedWeeks(),
            'known_weeks'            => $subscription->getKnownWeeks(),
            'discount'               => $subscription->getDiscount(),
            'offer_amount'           => $subscription->getOfferAmount(),
            'offer_type'             => $subscription->getOfferType(),
            'membership_fee'         => $subscription->getMembershipFee(),
            'school_subjects'        => $subscription->getSchoolSubjects(),
            'favorite_slots'         => $subscription->getFavoriteSlots(),
            'is_suspended'         => $subscription->isIsSuspended(),
            'student' => ($student = $subscription->getIdStudent()) ? [
                'id'        => $student->getId(),
                'firstname' => $student->getFirstname(),
                'lastname'  => $student->getLastname(),
                'class'     => $student->getClass(),
            ] : null,
            'created_at' => $subscription->getCreatedAt()?->format(\DateTimeInterface::ATOM),
            'created_by' => $subscription->getCreatedBy(),
            'updated_at' => $subscription->getUpdatedAt()?->format(\DateTimeInterface::ATOM),
            'updated_by' => $subscription->getUpdatedBy(),
            // ajoute les champs nécessaires…
        ], $subs);

        return new JsonResponse($data, JsonResponse::HTTP_OK);
    }

    #[Route('/{id}/validate', name: 'validate', methods: ['PATCH'])]
    public function validate(int $id, Request $request): JsonResponse
    {
        // 1) Récupère l’abonnement
        $subscription = $this->subscriptionRepository->find($id);
        if (!$subscription) {
            throw new NotFoundHttpException('Abonnement introuvable.');
        }

        // 2) Récupère l’email de qui valide
        $data = json_decode($request->getContent(), true);
        $updatedBy = $data['updated_by'] ?? null;
        if (!$updatedBy) {
            return new JsonResponse(
                ['error' => 'Le champ "updated_by" est requis.'],
                JsonResponse::HTTP_BAD_REQUEST
            );
        }

        // 3) Met à jour les champs
        $subscription->setIsValide(true);
        $subscription->setUpdatedBy($updatedBy);
        $subscription->setUpdatedAt(new \DateTimeImmutable());

        // 4) Persiste
        $this->em->persist($subscription);
        $this->em->flush();

        // 5) Retourne l’état mis à jour
        return new JsonResponse([
            'id'         => $subscription->getId(),
            'is_valide'  => $subscription->isIsValide(),
            'updated_by' => $subscription->getUpdatedBy(),
            'updated_at' => $subscription->getUpdatedAt()?->format(\DateTimeInterface::ATOM),
        ], JsonResponse::HTTP_OK);
    }

    #[Route('/{id}/programed', name: 'programed', methods: ['PATCH'])]
    public function programmed(int $id, Request $request): JsonResponse
    {
        // 1) Récupère l’abonnement
        $subscription = $this->subscriptionRepository->find($id);
        if (!$subscription) {
            throw new NotFoundHttpException('Abonnement introuvable.');
        }

        // 2) Récupère l’email de qui valide
        $data = json_decode($request->getContent(), true);
        $programedBy = $data['programed_by'] ?? null;
        if (!$programedBy) {
            return new JsonResponse(
                ['error' => 'Le champ "programedBy" est requis.'],
                JsonResponse::HTTP_BAD_REQUEST
            );
        }

        // 3) Met à jour les champs
        $subscription->setIsProgramed(true);
        $subscription->setProgramedBy($programedBy);
        $subscription->setProgramedAt(new \DateTimeImmutable());

        // 4) Persiste
        $this->em->persist($subscription);
        $this->em->flush();

        // 5) Retourne l’état mis à jour
        return new JsonResponse([
            'id'         => $subscription->getId(),
            'is_valide'  => $subscription->isIsProgramed(),
            'updated_by' => $subscription->getProgramedBy(),
            'updated_at' => $subscription->getProgramedAt()?->format(\DateTimeInterface::ATOM),
        ], JsonResponse::HTTP_OK);
    }

    #[Route('/student/{studentId}', name: 'subscriptions_by_student', methods: ['GET'])]
    public function byStudent(int $studentId): JsonResponse
    {
        $student = $this->studentRepository->find($studentId);
        if (!$student) {
            return new JsonResponse(['error' => 'Étudiant non trouvé'], JsonResponse::HTTP_NOT_FOUND);
        }
    
        // DOCTRINE attend 'id_student' comme dans l'entité
        $subs = $this->subscriptionRepository->findBy(['id_student' => $student]);
    
        $data = array_map(fn($subscription) => [
            'id'                     => $subscription->getId(),
            'combined_id'            => $subscription->getCombinedId(),
            'subscription_type'      => $subscription->getSubscriptionType(),
            'is_valide'              => $subscription->isIsValide(),
            'payment_mode'           => $subscription->getPaymentMode(),
            'subscription_start_date'=> $subscription->getSubscriptionStartDate()?->format('Y-m-d'),
            'subscription_end_date'  => $subscription->getSubscriptionEndDate()?->format('Y-m-d'),
            'first_debit_date'       => $subscription->getFirstDebitDate()?->format('Y-m-d'),
            'recurrent_debit_date'   => $subscription->getRecurrentDebitDate(),
            'installment_count'      => $subscription->getInstallmentCount(),
            'session_per_week'       => $subscription->getSessionPerWeek(),
            'week_count'             => $subscription->getWeekCount(),
            'selected_weeks'         => $subscription->getSelectedWeeks(),
            'known_weeks'            => $subscription->getKnownWeeks(),
            'discount'               => $subscription->getDiscount(),
            'offer_amount'           => $subscription->getOfferAmount(),
            'offer_type'             => $subscription->getOfferType(),
            'membership_fee'         => $subscription->getMembershipFee(),
            'school_subjects'        => $subscription->getSchoolSubjects(),
            'favorite_slots'         => $subscription->getFavoriteSlots(),
            'is_programed'           => $subscription->isIsProgramed(),
            'is_suspended'           => $subscription->isIsSuspended(),
            'programed_at'           => $subscription->getProgramedAt(),
            'created_at'             => $subscription->getCreatedAt()?->format(\DateTimeInterface::ATOM),
            'created_by'             => $subscription->getCreatedBy(),
            'updated_at'             => $subscription->getUpdatedAt()?->format(\DateTimeInterface::ATOM),
            'updated_by'             => $subscription->getUpdatedBy(),
            'is_canceled'             => $subscription->isIsCanceled(),
            'canceled_by'             => $subscription->getCanceledBy(),
            'url' => $subscription->getSubscriptionURLs()->first() && $subscription->getSubscriptionURLs()->first() !== false ? $subscription->getSubscriptionURLs()->first()->getUrl() : null
        ], $subs);
    
        return new JsonResponse($data, JsonResponse::HTTP_OK);
    }

    #[Route('/{id}/cancel', name: 'subscription_cancel', methods: ['PATCH'])]
    public function cancelSubscription(int $id, Request $request): JsonResponse
    {
        $subscription = $this->subscriptionRepository->find($id);
        if (!$subscription) {
            return new JsonResponse(['error' => 'Abonnement introuvable'], JsonResponse::HTTP_NOT_FOUND);
        }

        $data = json_decode($request->getContent(), true);
        $canceledBy = $data['canceled_by'] ?? null;
        $isSuspended = $data['is_suspended'];
        $resiliationDate = $data['resiliation_date'] ?? null;


        if (!$canceledBy) {
            return new JsonResponse(['error' => 'Le champ canceled_by (email) est requis.'], JsonResponse::HTTP_BAD_REQUEST);
        }

        $subscription->setIsCanceled(true);
        $subscription->setCanceledBy($canceledBy);
        $subscription->setIsSuspended($isSuspended);
        $subscription->setCanceledAt(new \DateTimeImmutable());
        $subscription->setUpdatedAt(new \DateTimeImmutable());
        
        // Définir la date de résiliation si fournie
        if ($resiliationDate) {
            $subscription->setResiliationDate(new \DateTime($resiliationDate));
        }

        $this->em->persist($subscription);
        $this->em->flush();

        return new JsonResponse([
            'id'           => $subscription->getId(),
            'is_canceled'  => $subscription->isIsCanceled(),
            'canceled_by'  => $subscription->getCanceledBy(),
            'canceled_at'  => $subscription->getCanceledAt()?->format(\DateTimeInterface::ATOM),
            'is_suspended'  => $subscription->isIsSuspended(),
            'resiliation_date' => $subscription->getResiliationDate()?->format('Y-m-d'),
            'updated_at'   => $subscription->getUpdatedAt()?->format(\DateTimeInterface::ATOM),
        ], JsonResponse::HTTP_OK);
    }

    #[Route('/{id}/reactivate', name: 'subscription_reactivate', methods: ['PATCH'])]
    public function reactivateSubscription(int $id, Request $request): JsonResponse
    {
        $subscription = $this->subscriptionRepository->find($id);
        if (!$subscription) {
            return new JsonResponse(['error' => 'Abonnement introuvable'], JsonResponse::HTTP_NOT_FOUND);
        }

        $data = json_decode($request->getContent(), true);
        $updatedBy = $data['updated_by'] ?? null;

        if (!$updatedBy) {
            return new JsonResponse(['error' => 'Le champ updated_by (email) est requis.'], JsonResponse::HTTP_BAD_REQUEST);
        }

        $subscription->setIsCanceled(false);
        $subscription->setCanceledBy(null);
        $subscription->setCanceledAt(null);
        $subscription->setIsSuspended(false);
        $subscription->setResiliationDate(null);
        $subscription->setUpdatedAt(new \DateTimeImmutable());
        $subscription->setUpdatedBy($updatedBy);

        $this->em->persist($subscription);
        $this->em->flush();

        return new JsonResponse([
            'id'           => $subscription->getId(),
            'is_canceled'  => $subscription->isIsCanceled(),
            'canceled_by'  => $subscription->getCanceledBy(),
            'canceled_at'  => $subscription->getCanceledAt()?->format(\DateTimeInterface::ATOM),
            'is_suspended'  => $subscription->isIsSuspended(),
            'resiliation_date' => $subscription->getResiliationDate()?->format('Y-m-d'),
            'updated_at'   => $subscription->getUpdatedAt()?->format(\DateTimeInterface::ATOM),
            'message'      => 'Abonnement réactivé avec succès'
        ], JsonResponse::HTTP_OK);
    }

    #[Route('/{id}/download-pdf', name: 'download_pdf', methods: ['GET'])]
    public function downloadPDF(int $id): Response
    {
        $subscription = $this->subscriptionRepository->find($id);
        if (!$subscription) {
            return new JsonResponse(['error' => 'Abonnement introuvable'], JsonResponse::HTTP_NOT_FOUND);
        }

        // Récupérer l'URL du PDF depuis la subscription
        $subscriptionUrl = $subscription->getSubscriptionURLs()->first();
        if (!$subscriptionUrl || !$subscriptionUrl->getUrl()) {
            return new JsonResponse(['error' => 'URL du contrat introuvable'], JsonResponse::HTTP_NOT_FOUND);
        }

        $pdfUrl = $subscriptionUrl->getUrl();

        try {
            // Extraire le chemin du fichier depuis l'URL
            $urlPath = parse_url($pdfUrl, PHP_URL_PATH);
            $filePath = $this->getParameter('kernel.project_dir') . '/public' . $urlPath;
            
            // Vérifier que le fichier existe
            if (!file_exists($filePath) || !is_readable($filePath)) {
                return new JsonResponse(['error' => 'Fichier PDF non trouvé ou non accessible'], JsonResponse::HTTP_NOT_FOUND);
            }
            
            // Lire le contenu du fichier
            $content = file_get_contents($filePath);
            
            // Créer le nom du fichier
            $fileName = "contrat_{$subscription->getSubscriptionType()}_{$subscription->getId()}.pdf";
            
            // Retourner le PDF comme réponse de téléchargement
            $response = new Response($content);
            $response->headers->set('Content-Type', 'application/pdf');
            $response->headers->set('Content-Disposition', "attachment; filename=\"{$fileName}\"");
            $response->headers->set('Content-Length', strlen($content));
            
            return $response;

        } catch (\Exception $e) {
            return new JsonResponse([
                'error' => 'Erreur lors du téléchargement du PDF',
                'message' => $e->getMessage()
            ], JsonResponse::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * Réactive toutes les sessions suspendues d'un contrat (étudiant associé)
     */
    #[Route('/{id}/unsuspend-sessions', name: 'unsuspend_sessions', methods: ['POST'])]
    public function unsuspendContractSessions(int $id): JsonResponse
    {
        $subscription = $this->subscriptionRepository->find($id);
        if (!$subscription) {
            return new JsonResponse(['error' => 'Contrat introuvable'], JsonResponse::HTTP_NOT_FOUND);
        }

        $student = $subscription->getIdStudent();
        if (!$student) {
            return new JsonResponse(['error' => 'Aucun étudiant associé à ce contrat'], JsonResponse::HTTP_BAD_REQUEST);
        }

        // Réactiver toutes les sessions suspendues de cet étudiant
        $unsuspendedCount = $this->sessionRepository->unsuspendSessionsByStudent($student->getId());

        return new JsonResponse([
            'success' => true,
            'contract_id' => $subscription->getId(),
            'student_id' => $student->getId(),
            'student_name' => $student->getFirstname() . ' ' . $student->getLastname(),
            'unsuspended_sessions_count' => $unsuspendedCount,
            'message' => "Sessions réactivées pour {$student->getFirstname()} {$student->getLastname()}"
        ], JsonResponse::HTTP_OK);
    }

    /**
     * Récupérer tous les contrats résiliés avec les informations de résiliation
     */
    #[Route('/canceled', name: 'get_canceled', methods: ['GET'])]
    public function getCanceledSubscriptions(): JsonResponse
    {
        // Récupérer tous les abonnements annulés
        $canceledSubs = $this->subscriptionRepository->findBy(['is_canceled' => true], ['canceled_at' => 'DESC']);

        $data = array_map(function($subscription) {
            $student = $subscription->getIdStudent();

            return [
                'id'                     => $subscription->getId(),
                'combined_id'            => $subscription->getCombinedId(),
                'subscription_type'      => $subscription->getSubscriptionType(),
                'subscription_start_date'=> $subscription->getSubscriptionStartDate()?->format('Y-m-d'),
                'subscription_end_date'  => $subscription->getSubscriptionEndDate()?->format('Y-m-d'),
                'resiliation_date'       => $subscription->getResiliationDate()?->format('Y-m-d'),
                'is_canceled'            => $subscription->isIsCanceled(),
                'canceled_by'            => $subscription->getCanceledBy(),
                'canceled_at'            => $subscription->getCanceledAt()?->format('Y-m-d H:i:s'),
                'is_suspended'           => $subscription->isIsSuspended(),
                'student' => $student ? [
                    'id'        => $student->getId(),
                    'firstname' => $student->getFirstname(),
                    'lastname'  => $student->getLastname(),
                    'class'     => $student->getClass(),
                    'email'     => $student->getEmail(),
                    'phone'     => $student->getPhone(),
                ] : null,
                'created_at'             => $subscription->getCreatedAt()?->format('Y-m-d H:i:s'),
                'created_by'             => $subscription->getCreatedBy(),
            ];
        }, $canceledSubs);

        return new JsonResponse($data, JsonResponse::HTTP_OK);
    }

    /**
     * Créer un contrat Genius
     */
    #[Route('/genius', name: 'create_genius', methods: ['POST'])]
    public function createGeniusContract(Request $request): JsonResponse
    {
        $data = json_decode($request->getContent(), true);

        if (!$data) {
            return $this->json(['error' => 'Données invalides'], 400);
        }

        // Validation des champs requis
        $requiredFields = ['student_id', 'contract_type', 'session_per_week', 'engagement', 'contract_start_date'];
        foreach ($requiredFields as $field) {
            if (!isset($data[$field]) || empty($data[$field])) {
                return $this->json(['error' => "Le champ {$field} est requis"], 400);
            }
        }

        // Récupérer l'étudiant
        $student = $this->studentRepository->find($data['student_id']);
        if (!$student) {
            return $this->json(['error' => 'Étudiant non trouvé'], 404);
        }

        // Mettre à jour les matières scolaires si fournies
        if (isset($data['school_subjects']) && is_array($data['school_subjects'])) {
            $student->setSchoolSubjects($data['school_subjects']);
            $this->em->persist($student);
        }

        // Valider le type de contrat
        $validContractTypes = ['genius_access', 'genius_plus', 'genius_premium'];
        if (!in_array($data['contract_type'], $validContractTypes)) {
            return $this->json(['error' => 'Type de contrat invalide'], 400);
        }

        // Calculer automatiquement le nombre de séances selon les créneaux favoris
        $actualSessionsPerWeek = 1; // Par défaut
        if (isset($data['favorite_slots_annuel']) && is_array($data['favorite_slots_annuel'])) {
            $actualSessionsPerWeek = count($data['favorite_slots_annuel']);
        }
        
        // Valider le nombre de séances
        $validSessionsPerWeek = [1, 2, 3, 4];
        if (!in_array($actualSessionsPerWeek, $validSessionsPerWeek)) {
            return $this->json(['error' => "Nombre de créneaux invalide: $actualSessionsPerWeek. Doit être entre 1 et 4."], 400);
        }

        // Calculer le prix et le nombre de séances selon la période du contrat
        // Les cours commencent le 15 septembre et finissent le 14 juin (max 9 mois)
        // Si le contrat commence en milieu de mois, on facture le mois complet
        $startDate = new \DateTime($data['contract_start_date']);
        $fixedEndDate = new \DateTime('2026-06-14');

        // Calculer le nombre de MOIS civils à facturer
        // Du mois de début (complet) au mois de fin (complet si avant le 14)
        $startMonth = (int)$startDate->format('n'); // 1-12
        $startYear = (int)$startDate->format('Y');
        $endMonth = 6; // Juin
        $endYear = 2026;

        // Calculer le nombre de mois entre le début et juin 2026
        $monthsToCharge = (($endYear - $startYear) * 12) + ($endMonth - $startMonth) + 1;

        // Maximum 9 mois de facturation (sept à juin, hors juillet-août)
        $monthsToCharge = min($monthsToCharge, 9);

        // Calculer le nombre de semaines réelles pour le nombre de séances
        $interval = $startDate->diff($fixedEndDate);
        $totalDays = $interval->days;
        $actualWeeks = ceil($totalDays / 7);

        // Le prix de base est un prix MENSUEL
        $baseMensuelPrice = $this->calculateGeniusBasePrice($data['contract_type'], $actualSessionsPerWeek);

        // Prix total = prix mensuel × nombre de mois à facturer
        $basePriceProrated = $baseMensuelPrice * $monthsToCharge;

        $registrationFee = $data['registration_fee'] ?? 0;
        $discount = $data['discount'] ?? 0;
        $finalPrice = $this->calculateGeniusFinalPrice($basePriceProrated, $registrationFee, $discount);

        // Créer la subscription Genius
        $subscription = new Subscription();
        $subscription->setIdStudent($student);
        $subscription->setSubscriptionType($data['contract_type']);
        $subscription->setOfferType(null);
        $subscription->setSessionPerWeek($actualSessionsPerWeek);
        $subscription->setWeekCount($actualWeeks); // Nombre de semaines réelles du contrat
        $subscription->setDiscount($discount);
        $subscription->setMembershipFee((float)$registrationFee);
        $subscription->setOfferAmount($finalPrice);
        $subscription->setPaymentMode('mensuel');
        $subscription->setIsValide(false);
        $subscription->setEngagement($data['engagement']);
        
        // Sauvegarder les créneaux favoris si fournis
        if (isset($data['favorite_slots_annuel']) && is_array($data['favorite_slots_annuel'])) {
            error_log("=== DEBUG CREATION CONTRAT ===");
            error_log("Favorite slots reçus: " . json_encode($data['favorite_slots_annuel']));
            $subscription->setFavoriteSlots($data['favorite_slots_annuel']);
            error_log("Favorite slots sauvegardés dans subscription");
        } else {
            error_log("=== WARNING ===");
            error_log("Aucun créneau favori reçu lors de la création du contrat Genius");
            error_log("Données reçues: " . json_encode($data));
        }
        
        // Convertir les dates
        try {
            $subscription->setSubscriptionStartDate($startDate);
            $subscription->setFirstDebitDate($startDate);

            // Tous les contrats Genius se terminent le 14 juin 2026
            $subscription->setSubscriptionEndDate($fixedEndDate);

        } catch (\Exception $e) {
            return $this->json(['error' => 'Format de date invalide'], 400);
        }

        $subscription->setCreatedAt(new \DateTimeImmutable());
        $subscription->setCreatedBy($this->getUser() ? $this->getUser()->getUserIdentifier() : 'system');

        // Sauvegarder
        $this->em->persist($subscription);
        $this->em->flush();

        // Sessions seront créées plus tard via le bouton "Programmer"
        // if (isset($data['favorite_slots_annuel']) && is_array($data['favorite_slots_annuel'])) {
        //     $this->createSessionsFromFavoriteSlots($subscription, $data['favorite_slots_annuel'], $student);
        // }

        return $this->json([
            'success' => true,
            'contract' => [
                'id' => $subscription->getId(),
                'subscription_type' => $subscription->getSubscriptionType(),
                'offer_type' => $subscription->getOfferType(),
                'contract_type' => $data['contract_type'],
                'session_per_week' => $subscription->getSessionPerWeek(),
                'engagement' => $data['engagement'],
                'registration_fee' => $registrationFee,
                'discount' => $subscription->getDiscount(),
                'contract_start_date' => $subscription->getSubscriptionStartDate()->format('Y-m-d'),
                'base_price' => $basePriceProrated,
                'final_price' => $finalPrice,
                'weeks_count' => $actualWeeks,
                'school_subjects' => $data['school_subjects'] ?? null,
                'favorite_slots_annuel' => $data['favorite_slots_annuel'] ?? null,
                'created_at' => $subscription->getCreatedAt()->format('Y-m-d H:i:s'),
            ]
        ], 201);
    }

    /**
     * Calculer le prix de base selon la grille tarifaire Genius
     */
    private function calculateGeniusBasePrice(string $contractType, int $sessionPerWeek): int
    {
        $pricing = [
            'genius_access' => [
                1 => 180,  // 1h30
                2 => 360,  // 3h00
                3 => 540,  // 4h30
                4 => 720,  // 6h00
            ],
            'genius_plus' => [
                1 => 300,  // 1h30
                2 => 600,  // 3h00
                3 => 900,  // 4h30
                4 => 1200, // 6h00
            ],
            'genius_premium' => [
                1 => 360,  // 1h30
                2 => 720,  // 3h00
                3 => 1080, // 4h30
                4 => 1440, // 6h00
            ],
        ];

        return $pricing[$contractType][$sessionPerWeek] ?? 0;
    }

    /**
     * Calculer le prix final avec remise et frais d'inscription
     */
    private function calculateGeniusFinalPrice(int $basePrice, int $registrationFee, int $discount): int
    {
        $totalWithFees = $basePrice + $registrationFee;
        $discountAmount = ($totalWithFees * $discount) / 100;
        return $totalWithFees - $discountAmount;
    }

    /**
     * Créer les sessions basées sur les créneaux favoris
     */
    private function createSessionsFromFavoriteSlots(Subscription $subscription, array $favoriteSlots, $student): void
    {
        // Simple: créer toutes les sessions pour chaque créneau pendant 36 semaines
        foreach ($favoriteSlots as $slot) {
            // Récupérer le tuteur
            $tutor = $this->userRepository->find($slot['tutorId']);
            if (!$tutor) {
                continue;
            }

            // Récupérer le centre de l'étudiant  
            $center = $student->getIdCenter();
            if (!$center) {
                continue;
            }

            // Date de début
            $startDate = $subscription->getSubscriptionStartDate();
            $firstDate = $this->getNextDateForDay($startDate, $slot['day']);
            
            // Convertir l'heure du format "15h00" vers "15:00"
            $timeFormatted = $this->convertHourFormat($slot['hour']);

            // Créer 36 sessions (une par semaine)
            for ($week = 0; $week < 36; $week++) {
                $sessionDate = clone $firstDate;
                $sessionDate->modify("+{$week} weeks");

                $session = new Session();
                $session->setSessionType('recurring_genius');
                $session->setScheduledAt(new \DateTimeImmutable($sessionDate->format('Y-m-d') . ' ' . $timeFormatted));
                $session->setSchoolSubjects($slot['matieres']);
                $session->setScheduledBy($this->getUser() ? $this->getUser()->getUserIdentifier() : 'system');
                $session->setCenter($center);
                $session->addIdSubscription($subscription);
                
                // Ajouter l'étudiant et le tuteur
                $session->addIdStudent($student);
                $session->setIdTutor($tutor);
                
                // Définir les propriétés requises
                $session->setPaymentDate(new \DateTime($sessionDate->format('Y-m-d')));
                $session->setDateSlot(new \DateTime($sessionDate->format('Y-m-d')));
                $session->setIsCanceled(false);
                $session->setCreatedAt(new \DateTimeImmutable());
                $session->setCreatedBy($this->getUser() ? $this->getUser()->getUserIdentifier() : 'system');
                $session->setUpdatedBy($this->getUser() ? $this->getUser()->getUserIdentifier() : 'system');

                $this->em->persist($session);
            }
        }

        $this->em->flush();
    }

    /**
     * Programmer les sessions pour un contrat (avec gestion spécifique Genius)
     */
    #[Route('/{id}/program-sessions', name: 'program_sessions', methods: ['POST'])]
    public function programSessions(int $id): JsonResponse
    {
        
        $subscription = $this->subscriptionRepository->find($id);
        if (!$subscription) {
            error_log("ERREUR: Subscription non trouvée avec ID: $id");
            return $this->json(['error' => 'Subscription not found'], 404);
        }

        // Récupérer l'étudiant
        $student = $subscription->getIdStudent();
        if (!$student) {
            error_log("ERREUR: Aucun étudiant associé à la subscription ID: $id");
            return $this->json(['error' => 'Student not found'], 404);
        }

        // Vérifier le type de contrat
        $subscriptionType = $subscription->getSubscriptionType();
        
        // Condition spécifique pour les contrats Genius
        if (in_array($subscriptionType, ['genius_access', 'genius_plus', 'genius_premium'])) {
            error_log("-> Redirection vers programGeniusContractSessions");
            return $this->programGeniusContractSessions($subscription, $student);
        } else {
            error_log("-> Redirection vers programRegularContractSessions");
            // Pour les autres types de contrats (annuel, trimestriel, etc.)
            return $this->programRegularContractSessions($subscription, $student);
        }
    }

    /**
     * Méthode dédiée pour programmer les sessions des contrats Genius
     */
    private function programGeniusContractSessions(Subscription $subscription, $student): JsonResponse
    {
        try {
            // Debug : afficher les données du contrat
            error_log("=== DEBUG CONTRAT GENIUS ===");
            error_log("Subscription ID: " . $subscription->getId());
            error_log("Subscription Type: " . $subscription->getSubscriptionType());
            
            // Récupérer les créneaux favoris pour Genius
            $favoriteSlots = $subscription->getFavoriteSlots();
            error_log("Favorite Slots: " . ($favoriteSlots ? json_encode($favoriteSlots) : 'NULL'));
            
            // Vérification alternative si les créneaux favoris sont vides
            if (!$favoriteSlots || !is_array($favoriteSlots) || empty($favoriteSlots)) {
                // Essayer de récupérer les créneaux depuis les sessions existantes (si contrat déjà partiellement programmé)
                $existingSessions = $this->sessionRepository->findBy(['id_subscription' => $subscription]);
                
                if (!empty($existingSessions)) {
                    error_log("Sessions existantes trouvées, contrat déjà programmé");
                    return $this->json([
                        'error' => 'Ce contrat semble déjà programmé. Sessions existantes: ' . count($existingSessions)
                    ], 400);
                }
                
                return $this->json([
                    'error' => 'Aucun créneau favori trouvé pour ce contrat Genius. Veuillez vérifier que les créneaux ont été correctement sauvegardés lors de la création du contrat.',
                    'debug_info' => [
                        'subscription_id' => $subscription->getId(),
                        'favorite_slots' => $favoriteSlots,
                        'subscription_type' => $subscription->getSubscriptionType(),
                        'subscription_start_date' => $subscription->getSubscriptionStartDate()?->format('Y-m-d'),
                        'subscription_end_date' => $subscription->getSubscriptionEndDate()?->format('Y-m-d')
                    ]
                ], 400);
            }

            // Créer les sessions spécifiques Genius
            $sessionData = $this->createGeniusSessionsFromSlots($subscription, $favoriteSlots, $student);
            
            // Vérifier que $sessionData n'est pas null
            if (!$sessionData || !is_array($sessionData)) {
                throw new \Exception('Erreur lors de la création des sessions: données retournées invalides');
            }
            
            $totalSessionsCreated = $sessionData['sessions_created'] ?? 0;
            $numberOfWeeks = $sessionData['weeks_planned'] ?? 0;
            
            // Marquer le contrat comme programmé
            $subscription->setIsProgramed(true);
            $subscription->setProgramedAt(new \DateTimeImmutable());
            $subscription->setProgramedBy($this->getUser() ? $this->getUser()->getUserIdentifier() : 'system');
            $this->em->persist($subscription);
            $this->em->flush();
            
            // Calculer le nombre total d'heures (chaque session Genius = 1h30)
            $totalHours = $totalSessionsCreated * 1.5;
            
            return $this->json([
                'success' => true,
                'message' => 'Sessions Genius programmées avec succès',
                'subscription_id' => $subscription->getId(),
                'contract_type' => $subscription->getSubscriptionType(),
                'sessions_created' => $totalSessionsCreated,
                'total_hours' => $totalHours,
                'weeks_planned' => $numberOfWeeks,
                'slots_per_week' => count($favoriteSlots)
            ]);
        } catch (\Exception $e) {
            return $this->json(['error' => 'Erreur lors de la programmation Genius: ' . $e->getMessage()], 500);
        }
    }

    /**
     * Méthode pour programmer les sessions des contrats réguliers (non-Genius)
     */
    private function programRegularContractSessions(Subscription $subscription, $student): JsonResponse
    {
        // Logique pour les contrats annuels/trimestriels normaux
        try {
            $favoriteSlots = $subscription->getFavoriteSlots();
            if (!$favoriteSlots) {
                return $this->json(['error' => 'Aucun créneau trouvé pour ce contrat'], 400);
            }

            // Ici tu peux ajouter la logique pour les contrats réguliers
            // Pour l'instant, on retourne un message
            return $this->json([
                'success' => true,
                'message' => 'Programmation des contrats réguliers pas encore implémentée',
                'subscription_id' => $subscription->getId(),
                'contract_type' => $subscription->getSubscriptionType()
            ]);
        } catch (\Exception $e) {
            return $this->json(['error' => 'Erreur lors de la programmation: ' . $e->getMessage()], 500);
        }
    }

    /**
     * Créer les sessions spécifiques aux contrats Genius
     * Utilise la même logique que SessionController::create()
     */
    private function createGeniusSessionsFromSlots(Subscription $subscription, array $favoriteSlots, $student): array
    {
        $totalSessionsCreated = 0;
        
        // Date de début du contrat
        $startDate = $subscription->getSubscriptionStartDate();
        if (!$startDate) {
            error_log("ERREUR: Date de début manquante pour subscription ID: " . $subscription->getId());
            return ['sessions_created' => 0, 'weeks_planned' => 0];
        }

        // Tous les contrats Genius se terminent le 14 juin 2026
        $endDate = new \DateTime('2026-06-14');

        $weeksBetween = ceil($startDate->diff($endDate)->days / 7);
        
        error_log("=== CRÉATION SESSIONS GENIUS ===");
        error_log("Date début: " . $startDate->format('Y-m-d'));
        error_log("Date fin fixe: " . $endDate->format('Y-m-d'));
        error_log("Nombre de semaines: $weeksBetween");
        error_log("Nombre de créneaux: " . count($favoriteSlots));
        
        // Récupérer le centre de l'étudiant
        $center = $student->getIdCenter();
        if (!$center) {
            error_log("ERREUR: Centre non trouvé pour l'étudiant ID: " . $student->getId());
            return ['sessions_created' => 0, 'weeks_planned' => 0];
        }
        
        // Pour chaque créneau configuré
        foreach ($favoriteSlots as $slot) {
            if (!isset($slot['tutorId']) || !isset($slot['day']) || !isset($slot['hour'])) {
                error_log("Créneau invalide: " . json_encode($slot));
                continue;
            }
            
            // Récupérer le tuteur
            $tutor = $this->userRepository->find($slot['tutorId']);
            if (!$tutor) {
                error_log("Tuteur non trouvé: " . $slot['tutorId']);
                continue;
            }
            
            // Calculer la première date pour ce jour de la semaine
            $firstDate = $this->getNextDateForDay($startDate, $slot['day']);
            $timeFormatted = $this->convertHourFormat($slot['hour']); // 9h30 -> 9:30
            
            // Créer toutes les sessions jusqu'à la date de fin
            for ($week = 0; $week < $weeksBetween; $week++) {
                $sessionDate = clone $firstDate;
                $sessionDate->modify("+{$week} weeks");
                
                // Si on dépasse la date de fin, arrêter
                if ($sessionDate > $endDate) {
                    break;
                }
                
                // Créer la session (même logique que SessionController)
                $session = new Session();
                
                // Dates requises
                $session->setPaymentDate($sessionDate);
                $session->setDateSlot($sessionDate);
                
                // Données de base
                $session->setSchoolSubjects($slot['matieres'] ?? []);
                $session->setResume('Session Genius - Durée: 1h30');
                $session->setCreatedAt(new \DateTimeImmutable());
                $session->setCreatedBy($this->getUser() ? $this->getUser()->getUserIdentifier() : 'system');
                $session->setIsPaid(false);
                $session->setIsAbsent(false);
                $session->setUpdatedBy($this->getUser() ? $this->getUser()->getUserIdentifier() : 'system');
                $session->setCenter($center);
                
                // Programmation
                $session->setIdTutor($tutor);
                $session->setScheduledAt(new \DateTimeImmutable($sessionDate->format('Y-m-d') . ' ' . $timeFormatted));
                $session->setScheduledBy($this->getUser() ? $this->getUser()->getUserIdentifier() : 'system');
                $session->setSessionType('genius_recurring');
                $session->setIsCanceled(false);
                
                // Relations
                $session->addIdStudent($student);
                $session->addIdSubscription($subscription);
                
                $this->em->persist($session);
                $totalSessionsCreated++;
            }
        }
        
        $this->em->flush();
        
        error_log("Sessions créées avec succès: $totalSessionsCreated");
        
        return [
            'sessions_created' => $totalSessionsCreated,
            'weeks_planned' => $weeksBetween
        ];
    }

    /**
     * Calculer la prochaine occurrence d'un jour de la semaine
     */
    private function getNextDateForDay(\DateTime $startDate, string $dayName): \DateTime
    {
        $dayMapping = [
            'lundi' => 'monday',
            'mardi' => 'tuesday', 
            'mercredi' => 'wednesday',
            'jeudi' => 'thursday',
            'vendredi' => 'friday',
            'samedi' => 'saturday',
            'dimanche' => 'sunday'
        ];

        $englishDay = $dayMapping[strtolower($dayName)] ?? 'monday';
        $nextDate = clone $startDate;
        
        // Si on est déjà le bon jour, garder la date, sinon aller au prochain
        if (strtolower($nextDate->format('l')) !== $englishDay) {
            $nextDate->modify("next {$englishDay}");
        }

        return $nextDate;
    }

    /**
     * Convertir le format d'heure de "15h00" vers "15:00"
     */
    private function convertHourFormat(string $hour): string
    {
        // Remplacer "h" par ":" pour le format DateTime
        return str_replace('h', ':', $hour);
    }

}
