<?php
// src/Controller/SessionController.php
namespace App\Controller;

use App\Entity\Session;
use App\Entity\Center;
use App\Repository\CenterRepository;
use App\Repository\SessionRepository;
use App\Repository\UserRepository;
use App\Repository\StudentRepository;
use App\Repository\SubscriptionRepository;
use App\Service\ZapierSmsSender;
use App\Service\StripeCustomerService;
use Doctrine\ORM\EntityManagerInterface;
use GuzzleHttp\Psr7\Response;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\HttpKernel\Exception\BadRequestHttpException;
use Psr\Log\LoggerInterface;

use Stripe\StripeClient;

#[Route('/api/sessions', name: 'session_')]
class SessionController extends AbstractController
{

    private ZapierSmsSender $smsSender;
    public function __construct(
        private readonly EntityManagerInterface $em,
        private readonly UserRepository $userRepo,
        private readonly StudentRepository $studentRepo,
        private readonly SubscriptionRepository $subRepo,
        private readonly SessionRepository $sessionRepo,
        private readonly CenterRepository $centerRepo,
        private readonly StripeClient $stripe,
        private readonly StripeCustomerService $stripeCustomerService,
        ZapierSmsSender $smsSender
    ) {
        $this->smsSender = $smsSender;
    }

    #[Route('', name: 'create', methods: ['POST'])]
    public function create(Request $request): JsonResponse
    {
        $data = json_decode($request->getContent(), true);
        if (!\is_array($data)) {
            throw new BadRequestHttpException('Corps invalide, JSON attendu.');
        }

        // Rediriger vers la création de séance d'essai si c'est le type demandé
        if (($data['session_type'] ?? null) === 'trial_session') {
            return $this->createTrialSession($request);
        }

        // Logique pour les séances normales...
        // 1) dates obligatoires
        if (empty($data['payment_date']) || empty($data['date_slot'])) {
            throw new BadRequestHttpException('payment_date et date_slot sont requis.');
        }

        // 2) retrouver le tutor et au moins un étudiant ou abonnement
        $tutor = $this->userRepo->find($data['tutor_id'] ?? null);
        if (!$tutor) {
            return new JsonResponse(['error'=>'Tuteur introuvable'], JsonResponse::HTTP_NOT_FOUND);
        }

        $center = $this->centerRepo->find($data['center_id'] ?? null);
        if (!$center) {
            return new JsonResponse(['error'=>'Centre introuvable'], JsonResponse::HTTP_NOT_FOUND);
        }

        $students = [];
        foreach ((array)($data['student_ids'] ?? []) as $stuId) {
            if ($stu = $this->studentRepo->find($stuId)) {
                $students[] = $stu;
            }
        }
        if (empty($students)) {
            throw new BadRequestHttpException('Au moins un student_id valide est requis.');
        }

        $subs = [];
        foreach ((array)($data['subscription_ids'] ?? []) as $subId) {
            if ($sub = $this->subRepo->find($subId)) {
                $subs[] = $sub;
            }
        }

        // 3) hydrater la session
        $session = new Session();
        $session->setPaymentDate(new \DateTime($data['payment_date']));
        $session->setDateSlot(new \DateTime($data['date_slot']));
        $session->setStripeNumber($data['stripe_number'] ?? null);
        $session->setSchoolSubjects($data['school_subjects'] ?? null);
        $session->setResume($data['resume'] ?? null);
        $session->setCreatedAt(new \DateTimeImmutable());
        $session->setCreatedBy($data['created_by']);
        $session->setIsPaid($data['is_paid']);
        $session->setIsAbsent($data['is_absent']);
        $session->setUpdatedBy($data['updated_by']);
        $session->setCenter($center);

        $session->setIdTutor($tutor);
        $session->setScheduledAt(
            isset($data['scheduled_at']) 
                ? new \DateTimeImmutable($data['scheduled_at']) 
                : null
        );
        $session->setScheduledBy($data['scheduled_by'] ?? null);
        $session->setSessionType($data['session_type'] ?? null);
        $session->setIsCanceled((bool)($data['is_canceled'] ?? false));
        $session->setCanceledBy($data['canceled_by'] ?? null);

        foreach ($students as $stu) {
            $session->addIdStudent($stu);
        }
        foreach ($subs as $s) {
            $session->addIdSubscription($s);
        }

        // 4) persister et flush
        $this->em->persist($session);
        $this->em->flush();

        // 5) réponse pour séance normale
        return new JsonResponse([
            'id'            => $session->getId(),
            'payment_date'  => $session->getPaymentDate()->format('Y-m-d'),
            'date_slot'     => $session->getDateSlot()->format('Y-m-d'),
            'tutor_id'      => $tutor->getId(),
            'center_id'     => $center->getId(),
            'student_ids'   => array_map(fn($s)=> $s->getId(), $students),
            'subscription_ids' => array_map(fn($s)=> $s->getId(), $subs),
        ], JsonResponse::HTTP_CREATED);
    }

    #[Route('/trial-session', name: 'create_trial_session', methods: ['POST'])]
    public function createTrialSession(Request $request): JsonResponse
    {
        $data = json_decode($request->getContent(), true);
        if (!\is_array($data)) {
            throw new BadRequestHttpException('Corps invalide, JSON attendu.');
        }

        // 1) Validation des champs requis pour séance d'essai
        $requiredFields = ['student_ids', 'scheduled_at', 'school_subjects'];
        foreach ($requiredFields as $field) {
            if (empty($data[$field])) {
                throw new BadRequestHttpException("Le champ '$field' est requis pour une séance d'essai.");
            }
        }

        // 2) Récupération des étudiants
        $students = [];
        foreach ((array)$data['student_ids'] as $stuId) {
            if ($stu = $this->studentRepo->find($stuId)) {
                $students[] = $stu;
            }
        }
        if (empty($students)) {
            throw new BadRequestHttpException('Au moins un étudiant valide est requis.');
        }

        // 3) Récupération du centre depuis le premier étudiant
        $mainStudent = $students[0];
        $center = $mainStudent->getIdCenter();
        if (!$center) {
            throw new BadRequestHttpException('L\'étudiant principal n\'a pas de centre assigné.');
        }

        // 4) Création de la session d'essai
        $session = new Session();
        $session->setSessionType('trial_session');
        $session->setScheduledAt(new \DateTimeImmutable($data['scheduled_at']));
        $session->setSchoolSubjects($data['school_subjects']);
        $session->setScheduledBy($data['scheduled_by'] ?? 'system');
        $session->setCenter($center);
        
        // Dates par défaut
        $session->setPaymentDate(new \DateTime());
        $session->setDateSlot(new \DateTime($data['scheduled_at']));
        
        // États par défaut
        $session->setIsCanceled(false);
        $session->setIsPaid(false);
        $session->setIsAbsent(false);
        $session->setCreatedAt(new \DateTimeImmutable());
        $session->setCreatedBy($data['scheduled_by'] ?? 'system');
        $session->setUpdatedBy($data['scheduled_by'] ?? 'system');
        if (array_key_exists('tutor_id', $data)) {
            $tutor = $this->userRepo->find($data['tutor_id']);
            if (!$tutor) {
                return new JsonResponse(['error' => 'Tuteur introuvable'], JsonResponse::HTTP_NOT_FOUND);
            }
            $session->setIdTutor($tutor);
        }

        // Ajouter tous les étudiants
        foreach ($students as $student) {
            $session->addIdStudent($student);
            // Persister l'étudiant au cas où il ne serait pas dans l'EntityManager
            $this->em->persist($student);
            error_log("Ajout étudiant ID " . $student->getId() . " à la session");
        }
        
        // Vérifier que les étudiants sont bien associés
        error_log("Nombre d'étudiants associés à la session : " . $session->getIdStudent()->count());

        // 5) Persister la session
        $this->em->persist($session);
        
        // Forcer la persistence des étudiants dans la relation
        foreach ($session->getIdStudent() as $student) {
            $this->em->persist($student);
        }
        
        $this->em->flush();

        // Vérification que la session a bien un ID après le flush
        $sessionId = $session->getId();
        if (!$sessionId) {
            return new JsonResponse(['error' => 'Erreur lors de la création de la session'], JsonResponse::HTTP_INTERNAL_SERVER_ERROR);
        }
        
        error_log("Session créée avec ID : " . $sessionId);
        error_log("Nombre d'étudiants dans la session après flush : " . $session->getIdStudent()->count());

        // 6) Créer le lien de paiement Stripe et envoyer SMS
        try {
            return $this->createTrialSessionPayment($session);
        } catch (\Exception $e) {
            // Log l'erreur mais ne supprime pas la session
            error_log("Erreur dans createTrialSessionPayment: " . $e->getMessage());
            
            // Retourner les détails de la session créée sans le paiement
            return new JsonResponse([
                'success' => true,
                'session_id' => $sessionId,
                'error' => 'Session créée mais erreur lors du paiement: ' . $e->getMessage(),
                'students' => array_map(fn($s) => [
                    'id' => $s->getId(),
                    'firstname' => $s->getFirstname(),
                    'lastname' => $s->getLastname()
                ], $students),
                'scheduled_at' => $session->getScheduledAt()->format(\DateTime::ATOM),
                'center' => [
                    'id' => $center->getId(),
                    'name' => $center->getName(),
                    'city' => $center->getCity()
                ]
            ], JsonResponse::HTTP_CREATED);
        }
    }

    #[Route('/trial-session-group', name: 'create_trial_session_group', methods: ['POST'])]
    public function createTrialSessionGroup(Request $request): JsonResponse
    {
        $data = json_decode($request->getContent(), true);
        if (!\is_array($data)) {
            throw new BadRequestHttpException('Corps invalide, JSON attendu.');
        }

        // 1) Validation des champs requis pour sessions groupées
        if (empty($data['sessions']) || !is_array($data['sessions'])) {
            throw new BadRequestHttpException('Le champ "sessions" est requis et doit être un tableau.');
        }

        if (empty($data['total_price']) || !is_numeric($data['total_price'])) {
            throw new BadRequestHttpException('Le champ "total_price" est requis et doit être numérique.');
        }

        $parentEmail = $data['parent_email'] ?? null;
        $familyName = $data['family_name'] ?? 'Famille';

        // 2) Créer toutes les sessions individuellement
        $createdSessions = [];
        $allStudents = [];

        foreach ($data['sessions'] as $sessionData) {
            // Validation des champs requis pour chaque session
            $requiredFields = ['student_id', 'scheduled_at', 'school_subjects'];
            foreach ($requiredFields as $field) {
                if (empty($sessionData[$field])) {
                    throw new BadRequestHttpException("Le champ '$field' est requis pour chaque session.");
                }
            }

            // Récupération de l'étudiant
            $student = $this->studentRepo->find($sessionData['student_id']);
            if (!$student) {
                throw new BadRequestHttpException("Étudiant avec ID {$sessionData['student_id']} introuvable.");
            }
            $allStudents[] = $student;

            // Récupération du centre
            $center = $student->getIdCenter();
            if (!$center) {
                throw new BadRequestHttpException("L'étudiant {$student->getFirstname()} {$student->getLastname()} n'a pas de centre assigné.");
            }

            // Création de la session
            $session = new Session();
            $session->setSessionType('trial_session');
            $session->setScheduledAt(new \DateTimeImmutable($sessionData['scheduled_at']));
            $session->setSchoolSubjects($sessionData['school_subjects']);
            $session->setScheduledBy($sessionData['scheduled_by'] ?? 'system');
            $session->setCenter($center);
            
            // Dates par défaut
            $session->setPaymentDate(new \DateTime());
            $session->setDateSlot(new \DateTime($sessionData['scheduled_at']));
            
            // États par défaut
            $session->setIsCanceled(false);
            $session->setIsPaid(false);
            $session->setIsAbsent(false);
            $session->setCreatedAt(new \DateTimeImmutable());
            $session->setCreatedBy($sessionData['scheduled_by'] ?? 'system');
            $session->setUpdatedBy($sessionData['scheduled_by'] ?? 'system');

            // Tuteur si fourni
            if (!empty($sessionData['tutor_id'])) {
                $tutor = $this->userRepo->find($sessionData['tutor_id']);
                if (!$tutor) {
                    throw new BadRequestHttpException("Tuteur avec ID {$sessionData['tutor_id']} introuvable.");
                }
                $session->setIdTutor($tutor);
            }

            // Ajouter l'étudiant à cette session
            $session->addIdStudent($student);
            $this->em->persist($student);
            $this->em->persist($session);

            $createdSessions[] = $session;
        }

        // 3) Flush toutes les sessions
        $this->em->flush();

        // 4) Récupérer le parent du premier étudiant
        $mainStudent = $allStudents[0];
        $parents = $mainStudent->getIdParent();
        $mainParent = $parents->first();
        
        if (!$mainParent) {
            return new JsonResponse([
                'error' => 'Aucun parent trouvé pour l\'étudiant principal'
            ], JsonResponse::HTTP_BAD_REQUEST);
        }

        // 5) Créer UN SEUL lien de paiement pour toutes les sessions
        try {
            return $this->createGroupTrialSessionPayment($createdSessions, $allStudents, $data['total_price'], [
                'phone' => $mainParent->getPhone(),
                'email' => $parentEmail,
                'family_name' => $familyName
            ]);
        } catch (\Exception $e) {
            error_log("Erreur dans createGroupTrialSessionPayment: " . $e->getMessage());
            
            return new JsonResponse([
                'success' => true,
                'sessions_created' => count($createdSessions),
                'error' => 'Sessions créées mais erreur lors du paiement: ' . $e->getMessage(),
                'students' => array_map(fn($s) => [
                    'id' => $s->getId(),
                    'firstname' => $s->getFirstname(),
                    'lastname' => $s->getLastname()
                ], $allStudents)
            ], JsonResponse::HTTP_CREATED);
        }
    }

    private function createTrialSessionPayment(Session $session): JsonResponse
    {
        $students = $session->getIdStudent();
        $mainStudent = $students->first();

        if (!$mainStudent) {
            return new JsonResponse(['error' => 'Aucun étudiant associé à la session'], JsonResponse::HTTP_BAD_REQUEST);
        }

        // Vérifier qu'il y a des parents
        $parents = $mainStudent->getIdParent();
        $parent = $parents->first();
        if (!$parent) {
            return new JsonResponse(['error' => 'Aucun parent trouvé pour cet étudiant'], JsonResponse::HTTP_BAD_REQUEST);
        }

        try {
            // 1) Calcul du prix basé sur le nombre d'étudiants
            $studentCount = $students->count();
            $totalAmount = $studentCount * 3000; // 30€ en centimes par étudiant
            
            $description = $studentCount > 1 
                ? sprintf('Séance d\'essai – %d étudiants (30€ × %d)', $studentCount, $studentCount)
                : 'Séance d\'essai – 1 étudiant';

            // 2) Création du lien de paiement via le service optimisé
            $sessionId = $this->stripeCustomerService->createCheckoutSession(
                $mainStudent,
                $totalAmount,
                $description,
                [
                    'session_id' => $session->getId(),
                    'session_type' => 'trial_session',
                    'student_count' => $studentCount,
                    'student_ids' => implode(',', array_map(fn($s) => $s->getId(), $students->toArray())),
                ]
            );

            // 3) Récupération de l'URL de paiement
            $paymentUrl = $this->stripeCustomerService->getCheckoutSessionUrl($sessionId);
            error_log("Payment URL récupérée: " . $paymentUrl);

            // 4) Mise à jour de la session avec l'ID Stripe et le lien de paiement
            $session->setStripeNumber($sessionId);
            $session->setPaymentLink($paymentUrl);
            error_log("Avant flush - Session ID: " . $session->getId() . ", Payment Link: " . $session->getPaymentLink());

            // Persister explicitement la session avant le flush
            $this->em->persist($session);
            $this->em->flush();

            // Rafraîchir l'entité depuis la BDD pour vérifier
            $this->em->refresh($session);
            error_log("Après flush et refresh - Payment link en BDD: " . ($session->getPaymentLink() ?? 'NULL'));

            // 5) Préparation des données pour le SMS
            $phone = $parent->getPhone();
            $centre = $mainStudent->getIdCenter()->getName();
            $ville = $mainStudent->getIdCenter()->getCity();
            $adresse = $mainStudent->getIdCenter()->getAddress() ?? '';
            $dateCours = $session->getScheduledAt();
            $heureDebut = $session->getScheduledAt()->format('H:i');
            
            // Construire les prénoms des étudiants
            $studentNames = array_map(fn($s) => $s->getFirstname(), $students->toArray());
            $prenom = count($studentNames) > 1 
                ? implode(', ', array_slice($studentNames, 0, -1)) . ' et ' . end($studentNames)
                : $studentNames[0];

            // 6) Envoi du SMS via Zapier
            $this->smsSender->sendSessionPaymentLink(
                $phone,
                $centre,
                $dateCours,
                $heureDebut,
                $ville,
                $adresse,
                $prenom,
                $paymentUrl
            );

            // 7) Réponse avec toutes les informations
            return new JsonResponse([
                'success' => true,
                'session_id' => $session->getId(),
                'payment_link' => $paymentUrl,
                'student_count' => $studentCount,
                'total_amount' => $totalAmount / 100, // En euros
                'students' => array_map(fn($s) => [
                    'id' => $s->getId(),
                    'firstname' => $s->getFirstname(),
                    'lastname' => $s->getLastname()
                ], $students->toArray()),
                'scheduled_at' => $session->getScheduledAt()->format(\DateTime::ATOM),
                'center' => [
                    'id' => $mainStudent->getIdCenter()->getId(),
                    'name' => $centre,
                    'city' => $ville
                ],
                'sms_sent' => true,
                'parent_phone' => $phone,
                'message' => sprintf('Séance d\'essai créée pour %d étudiant%s - Lien de paiement envoyé par SMS (%d€)', 
                    $studentCount, $studentCount > 1 ? 's' : '', $totalAmount / 100)
            ], JsonResponse::HTTP_CREATED);

        } catch (\Exception $e) {
            // Log l'erreur complète pour débugger
            error_log("Erreur complète dans createTrialSessionPayment: " . $e->getMessage());
            error_log("Stack trace: " . $e->getTraceAsString());
            
            // Ne pas supprimer la session, juste retourner l'erreur
            return new JsonResponse([
                'success' => false,
                'session_id' => $session->getId(),
                'error' => 'Session créée mais erreur lors du processus de paiement: ' . $e->getMessage(),
                'students' => array_map(fn($s) => [
                    'id' => $s->getId(),
                    'firstname' => $s->getFirstname(),
                    'lastname' => $s->getLastname()
                ], $session->getIdStudent()->toArray()),
                'scheduled_at' => $session->getScheduledAt()->format(\DateTime::ATOM),
                'center' => [
                    'id' => $session->getCenter()->getId(),
                    'name' => $session->getCenter()->getName(),
                    'city' => $session->getCenter()->getCity()
                ]
            ], JsonResponse::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    private function createGroupTrialSessionPayment(array $sessions, array $allStudents, float $totalPrice, array $parentInfo): JsonResponse
    {
        try {
            // 1) Validation des données d'entrée
            if (empty($sessions) || empty($allStudents)) {
                return new JsonResponse([
                    'error' => 'Données insuffisantes pour créer le paiement groupé'
                ], JsonResponse::HTTP_BAD_REQUEST);
            }

            // 2) Calcul du prix total en centimes
            $totalAmountCentimes = $totalPrice * 100;
            $studentCount = count($allStudents);
            
            $description = sprintf('Séances d\'essai groupées – %d étudiants (30€ × %d)', $studentCount, $studentCount);

            // 3) Récupérer le premier étudiant pour les données du parent
            $mainStudent = $allStudents[0];

            // 4) Création du lien de paiement via le service Stripe
            $stripeSessionId = $this->stripeCustomerService->createCheckoutSession(
                $mainStudent,
                $totalAmountCentimes,
                $description,
                [
                    'session_type' => 'trial_session_group',
                    'student_count' => $studentCount,
                    'student_ids' => implode(',', array_map(fn($s) => $s->getId(), $allStudents)),
                    'session_ids' => implode(',', array_map(fn($s) => $s->getId(), $sessions)),
                ]
            );

            // 5) Récupération de l'URL de paiement
            $paymentUrl = $this->stripeCustomerService->getCheckoutSessionUrl($stripeSessionId);

            // 6) Mise à jour de toutes les sessions avec le même ID Stripe et le lien de paiement
            foreach ($sessions as $session) {
                $session->setStripeNumber($stripeSessionId);
                $session->setPaymentLink($paymentUrl);
            }
            $this->em->flush();

            // 7) Préparation des données pour le SMS
            $phone = $parentInfo['phone'];
            $centre = $mainStudent->getIdCenter()->getName();
            $ville = $mainStudent->getIdCenter()->getCity();
            $adresse = $mainStudent->getIdCenter()->getAddress() ?? '';
            
            // Utiliser la date de la première session
            $firstSession = $sessions[0];
            $dateCours = $firstSession->getScheduledAt();
            $heureDebut = $firstSession->getScheduledAt()->format('H:i');
            
            // Construire les prénoms de tous les étudiants
            $studentNames = array_map(fn($s) => $s->getFirstname(), $allStudents);
            $prenom = count($studentNames) > 1 
                ? implode(', ', array_slice($studentNames, 0, -1)) . ' et ' . end($studentNames)
                : $studentNames[0];

            // 8) Envoi d'UN SEUL SMS pour tous les étudiants
            $this->smsSender->sendSessionPaymentLink(
                $phone,
                $centre,
                $dateCours,
                $heureDebut,
                $ville,
                $adresse,
                $prenom,
                $paymentUrl
            );

            // 9) Réponse avec toutes les informations
            return new JsonResponse([
                'success' => true,
                'payment_link' => $paymentUrl,
                'stripe_session_id' => $stripeSessionId,
                'student_count' => $studentCount,
                'session_count' => count($sessions),
                'total_amount' => $totalPrice, // En euros
                'students' => array_map(fn($s) => [
                    'id' => $s->getId(),
                    'firstname' => $s->getFirstname(),
                    'lastname' => $s->getLastname()
                ], $allStudents),
                'sessions' => array_map(fn($s) => [
                    'id' => $s->getId(),
                    'scheduled_at' => $s->getScheduledAt()->format(\DateTime::ATOM),
                    'subjects' => $s->getSchoolSubjects()
                ], $sessions),
                'center' => [
                    'id' => $mainStudent->getIdCenter()->getId(),
                    'name' => $centre,
                    'city' => $ville
                ],
                'sms_sent' => true,
                'parent_phone' => $phone,
                'message' => sprintf('Séances d\'essai groupées créées pour %d étudiant%s - UN SEUL lien de paiement envoyé par SMS (%d€)', 
                    $studentCount, $studentCount > 1 ? 's' : '', $totalPrice)
            ], JsonResponse::HTTP_CREATED);

        } catch (\Exception $e) {
            error_log("Erreur dans createGroupTrialSessionPayment: " . $e->getMessage());
            error_log("Stack trace: " . $e->getTraceAsString());
            
            return new JsonResponse([
                'success' => false,
                'error' => 'Erreur lors de la création du paiement groupé: ' . $e->getMessage(),
                'student_count' => count($allStudents ?? []),
                'session_count' => count($sessions ?? [])
            ], JsonResponse::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    #[Route('/tutor/{id}/count', name: 'tutor_student_count', methods: ['GET'])]
    public function getTutorStudentCount(int $id, Request $request): JsonResponse
    {
        try {
            $scheduledAt = $request->query->get('scheduled_at');
            if (!$scheduledAt) {
                return new JsonResponse([
                    'error' => 'Le paramètre scheduled_at est requis'
                ], JsonResponse::HTTP_BAD_REQUEST);
            }

            // Convertir la date/heure en objet DateTime
            $scheduledDateTime = new \DateTimeImmutable($scheduledAt);
            
            // Récupérer toutes les sessions du tuteur pour ce créneau exact
            $sessions = $this->sessionRepo->createQueryBuilder('s')
                ->where('s.idTutor = :tutorId')
                ->andWhere('s.scheduled_at = :scheduledAt')
                ->andWhere('s.is_canceled = false') // Ne pas compter les sessions annulées
                ->setParameter('tutorId', $id)
                ->setParameter('scheduledAt', $scheduledDateTime)
                ->getQuery()
                ->getResult();

            // Compter le nombre total d'étudiants
            $totalStudents = 0;
            foreach ($sessions as $session) {
                $totalStudents += $session->getIdStudent()->count();
            }

            return new JsonResponse([
                'tutor_id' => $id,
                'scheduled_at' => $scheduledAt,
                'student_count' => $totalStudents,
                'sessions_count' => count($sessions)
            ]);

        } catch (\Exception $e) {
            return new JsonResponse([
                'error' => 'Erreur lors du calcul du nombre d\'étudiants: ' . $e->getMessage()
            ], JsonResponse::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    #[Route('/tutor/{id}', name: 'sessions_by_tutor', methods: ['GET'])]
    public function forTutor(int $id, UserRepository $userRepo): JsonResponse
    {
        $tutor = $userRepo->find($id);
        if (!$tutor) {
            return new JsonResponse(['error' => 'Tuteur introuvable'], JsonResponse::HTTP_NOT_FOUND);
        }

        $data = $this->sessionRepo->getSessionsDataByTutor($tutor);
        return new JsonResponse($data);
    }


    #[Route('/center/{id}/sessions-by-date', name: 'sessions_by_center_date', methods: ['GET'])]
    public function sessionsByCenterAndScheduledDate(int $id, Request $request,  CenterRepository $centerRepo): JsonResponse 
    {
        $center = $centerRepo->find($id);
        if (!$center) {
            return new JsonResponse(['error' => 'Centre introuvable'], JsonResponse::HTTP_NOT_FOUND);
        }

        $dateParam = $request->query->get('date'); 
        $date = \DateTimeImmutable::createFromFormat('Y-m-d', $dateParam);
        
        if (!$date) {
            return new JsonResponse(
                ['error' => 'Paramètre date invalide, format attendu YYYY-MM-DD'],
                JsonResponse::HTTP_BAD_REQUEST
            );
        }


        
        $start = $date->setTime(0, 0, 0);
        $users = $this->userRepo->findTutorsAvailableInCenter($center);

        $periodParam = $request->query->get('period');

        if ($periodParam === 'week') {
            $data = $this->sessionRepo->getTutorsAndSessionsWithStudentsByCenterAndWeek($center, $start, $users);
        } else {
            $data = $this->sessionRepo->getTutorsAndSessionsWithStudentsByCenterAndDate($center, $start, $users);
        }

        return new JsonResponse($data);
    }


    #[Route('/{id}', name: 'session_update', methods: ['PUT', 'PATCH'])]
    public function update(int $id, Request $request, LoggerInterface $logger): JsonResponse
    {
        $data = json_decode($request->getContent(), true);
        if (!\is_array($data)) {
            throw new BadRequestHttpException('Corps invalide, JSON attendu.');
        }

        // 1) Récupérer la session ciblée
        $session = $this->sessionRepo->find($id);
        if (!$session) {
            return new JsonResponse(['error' => 'Session introuvable'], JsonResponse::HTTP_NOT_FOUND);
        }

        // 2) Capture des valeurs d'origine AVANT modification
        $oldScheduledAt  = $session->getScheduledAt();                                // ex. 2025-06-15 09:30
        $originalTime    = $oldScheduledAt->format('H:i');                            // "09:30"
        $originalDow     = (int)$oldScheduledAt->format('w');                         // 1 = lundi
        $originalTutorId = $session->getIdTutor()->getId();

        // Période : à partir de la séance courante jusqu'à la fin de l'année
        $startPeriod = $oldScheduledAt;
        $year  = (int)$oldScheduledAt->format('Y');
        $month = (int)$oldScheduledAt->format('n');
        if ($month >= 9) {
            // Séance en septembre–décembre N → fin 15 août N+1
            $endPeriod = new \DateTimeImmutable(($year + 1) . '-08-15 23:59:59');
        } else {
            // Séance en janvier–août N → fin 15 août de cette année
            $endPeriod = new \DateTimeImmutable($year . '-08-15 23:59:59');
        }

        // $updateAll = $data['update_all'] ? true: false;
        $updateAll = array_key_exists('update_all', $data) ? $data['update_all'] : false;

        // 3) Mise à jour de la séance ciblée
        if (array_key_exists('scheduled_at', $data)) {
            $session->setScheduledAt(
                $data['scheduled_at'] 
                    ? new \DateTimeImmutable($data['scheduled_at']) 
                    : null
            );
        }
        if (array_key_exists('tutor_id', $data)) {
            $tutor = $this->userRepo->find($data['tutor_id']);
            if (!$tutor) {
                return new JsonResponse(['error' => 'Tuteur introuvable'], JsonResponse::HTTP_NOT_FOUND);
            }
            $session->setIdTutor($tutor);
        }
        if (array_key_exists('student_ids', $data)) {
            // Détacher tous les étudiants existants
            foreach ($session->getIdStudent() as $stu) {
                $session->removeIdStudent($stu);
            }
            // Attacher les nouveaux
            foreach ((array)$data['student_ids'] as $stuId) {
                if ($s = $this->studentRepo->find($stuId)) {
                    $session->addIdStudent($s);
                }
            }
        }

        // (Optionnel) autres champs…
        if (array_key_exists('payment_date', $data)) {
            $session->setPaymentDate(new \DateTime($data['payment_date']));
        }
        if (array_key_exists('is_canceled', $data)) {
            $session->setIsCanceled($data['is_canceled']);
        }
        if (array_key_exists('is_absent', $data)) {
            $session->setIsAbsent($data['is_absent']);
        }
        if (array_key_exists('date_slot', $data)) {
            $session->setDateSlot(new \DateTime($data['date_slot']));
        }
        if (array_key_exists('school_subjects', $data)) {
            $session->setSchoolSubjects($data['school_subjects']);
        }

        // 4) Si on applique à toutes les prochaines séances
        if ($updateAll) {
            $studentIds = $data['student_ids'] ?? [];
            foreach ($studentIds as $stuId) {
                $others = $this->sessionRepo
                    ->findByStudentAndCenterAndPeriod(
                        $stuId,
                        $session->getCenter(),
                        $startPeriod,
                        $endPeriod
                    );
        
                foreach ($others as $other) {
                    if ($other->getId() === $session->getId()) continue;
                    if ($other->getIdTutor()->getId() !== $originalTutorId) continue;
                    if ((int)$other->getScheduledAt()->format('w') !== $originalDow) continue;
                    if ($other->getScheduledAt()->format('H:i') !== $originalTime) continue;
        
                    // 1) Mise à jour de l'heure
                    if (isset($data['scheduled_at'])) {
                        $newTime  = (new \DateTimeImmutable($data['scheduled_at']))->format('H:i:s');
                        $datePart = $other->getScheduledAt()->format('Y-m-d');
                        $other->setScheduledAt(new \DateTimeImmutable("$datePart $newTime"));
                    }
        
                    // 2) Mise à jour du tuteur
                    if (isset($data['tutor_id'])) {
                        $newTutor = $this->userRepo->find($data['tutor_id']);
                        if ($newTutor) {
                            $other->setIdTutor($newTutor);
                        }
                    }

                    if (array_key_exists('school_subjects', $data)) {
                        $other->setSchoolSubjects($data['school_subjects']);
                    }
                    
        
                    $this->em->persist($other);
                }
            }
        }
        

        // 5) Persist & flush de la séance ciblée
        $this->em->persist($session);
        $this->em->flush();

        // 6) Réponse
        return new JsonResponse([
            'id'               => $session->getId(),
            'scheduled_at'     => $session->getScheduledAt()?->format(\DateTime::ATOM),
            'tutor_id'         => $session->getIdTutor()?->getId(),
            'student_ids'      => array_map(fn($s) => $s->getId(), $session->getIdStudent()->toArray()),
            'is_canceled'      => $session->isIsCanceled(),
            'is_absent'        => $session->isIsAbsent(),
            'all'               => $updateAll 

        ], JsonResponse::HTTP_OK);
    }


    #[Route('/update-subjects/{id}', name: 'session_update_subjects', methods: ['PATCH'])]
    public function updateSubjects(
        int $id,
        Request $request,
        LoggerInterface $logger
    ): JsonResponse {
        $data = json_decode($request->getContent(), true);
        if (!\is_array($data)) {
            throw new BadRequestHttpException('Corps invalide, JSON attendu.');
        }

        // 1) Récupérer la session ciblée
        $session = $this->sessionRepo->find($id);
        if (!$session) {
            return new JsonResponse(['error' => 'Session introuvable'], JsonResponse::HTTP_NOT_FOUND);
        }

        // 2) Vérifier les données reçues
        if (!array_key_exists('school_subjects', $data)) {
            return new JsonResponse(['error' => 'Aucune matière à appliquer'], JsonResponse::HTTP_BAD_REQUEST);
        }

        $updateAll = $data['update_all'] ?? false;
        $studentId = $data['student_id'] ?? null;
        if (!$studentId) {
            // Pour éviter les erreurs
            if ($session->getIdStudent()->count()) {
                $studentId = $session->getIdStudent()->first()->getId();
            } else {
                return new JsonResponse(['error' => 'Aucun étudiant spécifié ou trouvé'], JsonResponse::HTTP_BAD_REQUEST);
            }
        }

        // 3) Modification d’UNE séance
        if (!$updateAll) {
            $session->setSchoolSubjects($data['school_subjects']);
            $this->em->persist($session);
            $this->em->flush();

            return new JsonResponse([
                'id' => $session->getId(),
                'school_subjects' => $session->getSchoolSubjects(),
                'multiple' => false
            ], JsonResponse::HTTP_OK);
        }

        // 4) Modification de TOUTES les séances de cet élève sur l’année scolaire
        // (adapter la période selon besoin)
        $oldScheduledAt = $session->getScheduledAt();
        $year = (int)$oldScheduledAt->format('Y');
        $month = (int)$oldScheduledAt->format('n');
        if ($month >= 9) {
            $endPeriod = new \DateTimeImmutable(($year + 1) . '-08-15 23:59:59');
        } else {
            $endPeriod = new \DateTimeImmutable($year . '-08-15 23:59:59');
        }
        $startPeriod = $oldScheduledAt;

        $sessions = $this->sessionRepo->findByStudentAndCenterAndPeriod(
            $studentId,
            $session->getCenter(),
            $startPeriod,
            $endPeriod
        );

        // Filtre : même jour de la semaine et même heure/minute
        $targetDow = (int)$oldScheduledAt->format('w'); // 0=dimanche, 1=lundi...
        $targetHour = (int)$oldScheduledAt->format('H');
        $targetMinute = (int)$oldScheduledAt->format('i');

        $updated = 0;
        foreach ($sessions as $s) {
            $sAt = $s->getScheduledAt();
            if (
                (int)$sAt->format('w') !== $targetDow ||
                (int)$sAt->format('H') !== $targetHour ||
                (int)$sAt->format('i') !== $targetMinute
            ) {
                continue; // Ignore les séances qui ne sont pas sur le même créneau
            }
            $s->setSchoolSubjects($data['school_subjects']);
            $this->em->persist($s);
            $updated++;
        }
        $this->em->flush();

        return new JsonResponse([
            'count' => $updated,
            'student_id' => $studentId,
            'school_subjects' => $data['school_subjects'],
            'multiple' => true
        ], JsonResponse::HTTP_OK);
    }

    #[Route('/{id}/action', name: 'action', methods: ['PATCH'])]
    public function cancel(Session $session, Request $request): JsonResponse
    {
        $data = json_decode($request->getContent(), true);
        
        if (!isset($data['is_canceled'])) {
            throw new BadRequestHttpException('Le champ is_canceled est requis');
        }

        $session->setIsCanceled((bool)$data['is_canceled']);
        
        if (isset($data['canceled_by'])) {
            $session->setCanceledBy($data['canceled_by']);
        }

        $this->em->flush();

        return new JsonResponse([
            'id' => $session->getId(),
            'is_canceled' => $session->isIsCanceled(),
            'updated_at' => (new \DateTime())->format('Y-m-d H:i:s')
        ]);
    }

    #[Route('/{id}/payment-link', name: 'payment_link', methods: ['POST'])]
    public function createPaymentLink(Session $session, Request $request): JsonResponse
    {
        // 1. Vérifier que la session n'a pas déjà été payée
        if ($session->isIsPaid()) {
            return new JsonResponse(
                ['error' => 'Cette session a déjà été payée'], 
                JsonResponse::HTTP_BAD_REQUEST
            );
        }
    
        // 3. Récupérer les données nécessaires
        $data = json_decode($request->getContent(), true);
        $student = $session->getIdStudent()->first();
    
        if (!$student) {
            return new JsonResponse(
                ['error' => 'Aucun étudiant associé à cette session'], 
                JsonResponse::HTTP_BAD_REQUEST
            );
        }
    
        try {
            // Calculer le prix basé sur le nombre d'étudiants (30€ par étudiant)
            $studentCount = $session->getIdStudent()->count();
            $totalAmount = $studentCount * 3000; // 30€ en centimes par étudiant
            
            $description = $studentCount > 1 
                ? sprintf('Session d\'essai – %d étudiants (30€ × %d)', $studentCount, $studentCount)
                : 'Session d\'essai – 1 étudiant';

            // Créer le lien de paiement via le service optimisé
            $sessionId = $this->stripeCustomerService->createCheckoutSession(
                $student,
                $totalAmount,
                $description,
                [
                    'session_id' => $session->getId(),
                    'student_id' => $student->getId()
                ]
            );

            // Mettre à jour la session
            $session->setStripeNumber($sessionId);
            $session->setIsPaid(false); // Explicitement marqué comme non payé
            $this->em->flush();

            // Récupération de l'URL pour l'envoi SMS et réponse
            $paymentUrl = $this->stripeCustomerService->getCheckoutSessionUrl($sessionId);
    
            // 6. Envoyer le SMS
            $students = $session->getIdStudent();
            $mainStudent = $students->first();

            if (!$mainStudent) {
                throw new \LogicException('Aucun étudiant associé à la session');
            }

            $parents = $mainStudent->getIdParent();
            /** @var \App\Entity\StudentParent|null $parent */
            $parent = $parents->first();

            if (!$parent) {
                throw new \LogicException('Aucun parent trouvé pour cet étudiant');
            }

            $phone = $parent->getPhone();
            $centre = $mainStudent->getIdCenter()->getCity();
            $dateCours = $session->getDateSlot();
            $heureDebut = $session->getScheduledAt() instanceof \DateTimeImmutable
                ? $session->getScheduledAt()->format('H:i')
                : $session->getDateSlot()->format('H:i');
            $ville = $mainStudent->getIdCenter()->getCity();
            $adresse = $mainStudent->getIdCenter()->getAddress() ?? '';
            
            // Construire le nom des étudiants
            $studentNames = [];
            foreach ($students as $student) {
                $studentNames[] = $student->getFirstname();
            }
            $prenom = count($studentNames) > 1 
                ? implode(', ', array_slice($studentNames, 0, -1)) . ' et ' . end($studentNames)
                : $studentNames[0];
            
            $link = $paymentUrl;

            $this->smsSender->sendSessionPaymentLink(
                $phone,
                $centre,
                $dateCours,
                $heureDebut,
                $ville,
                $adresse,
                $prenom,
                $link
            );
    
            return new JsonResponse([
                'payment_link' => $paymentUrl,
                'session_id' => $session->getId(),
                'student_count' => $studentCount,
                'total_amount' => $totalAmount / 100, // Montant en euros
                'students' => array_map(fn($s) => [
                    'id' => $s->getId(),
                    'firstname' => $s->getFirstname(),
                    'lastname' => $s->getLastname()
                ], $students->toArray()),
                'expires_at' => date('c', time() + 7 * 24 * 60 * 60),
                'is_paid' => false,
                'message' => sprintf('Lien de paiement envoyé par SMS pour %d étudiant%s (%d€)', 
                    $studentCount, $studentCount > 1 ? 's' : '', $totalAmount / 100)
            ]);
    
        } catch (\Exception $e) {
            return new JsonResponse(
                ['error' => 'Erreur lors de la création du paiement: ' . $e->getMessage()], 
                JsonResponse::HTTP_INTERNAL_SERVER_ERROR
            );
        }
    }

    #[Route('/{id}/payment-status', name: 'check_payment_status', methods: ['GET'])]
    public function checkPaymentStatus(int $id): JsonResponse
    {
        try {
            $session = $this->sessionRepo->find($id);
            
            if (!$session) {
                return new JsonResponse(
                    ['error' => 'Session non trouvée'], 
                    JsonResponse::HTTP_NOT_FOUND
                );
            }

            // Si la session est déjà marquée comme payée en base
            if ($session->isIsPaid()) {
                return new JsonResponse([
                    'is_paid' => true,
                    'payment_details' => [
                        'amount_paid' => $session->getIdStudent()->count() * 30, // 30€ par étudiant
                        'payment_date' => $session->getUpdatedAt()?->format('Y-m-d H:i:s')
                    ],
                    'message' => 'Paiement confirmé'
                ]);
            }

            // Vérifier si la session a un stripe_number (checkout session ID) pour vérifier sur Stripe
            $stripeSessionId = $session->getStripeNumber();
            if (!$stripeSessionId) {
                return new JsonResponse([
                    'is_paid' => false,
                    'message' => 'Aucune session de paiement associée'
                ]);
            }

            // Vérifier le statut directement sur Stripe avec l'ID de la session
            $stripe = new \Stripe\StripeClient($_ENV['STRIPE_PRIVATE_KEY']);
            
            try {
                // Récupérer directement la checkout session par son ID
                $checkoutSession = $stripe->checkout->sessions->retrieve($stripeSessionId);
                
                if ($checkoutSession->payment_status === 'paid') {
                    // Marquer la session comme payée en base de données
                    $session->setIsPaid(true);
                    $session->setUpdatedAt(new \DateTimeImmutable());
                    $this->em->persist($session);
                    $this->em->flush();

                    return new JsonResponse([
                        'is_paid' => true,
                        'payment_details' => [
                            'amount_paid' => $checkoutSession->amount_total / 100, // Convertir centimes en euros
                            'payment_date' => date('Y-m-d H:i:s', $checkoutSession->created),
                            'stripe_payment_intent' => $checkoutSession->payment_intent,
                            'stripe_session_id' => $stripeSessionId
                        ],
                        'message' => 'Paiement confirmé sur Stripe et mis à jour en base'
                    ]);
                }

                // Session trouvée mais pas encore payée
                return new JsonResponse([
                    'is_paid' => false,
                    'payment_status' => $checkoutSession->payment_status,
                    'session_url' => $checkoutSession->url,
                    'expires_at' => $checkoutSession->expires_at ? date('Y-m-d H:i:s', $checkoutSession->expires_at) : null,
                    'message' => 'Paiement en attente'
                ]);
                
            } catch (\Stripe\Exception\InvalidRequestException $e) {
                // Session Stripe non trouvée
                return new JsonResponse([
                    'is_paid' => false,
                    'error' => 'Session de paiement Stripe introuvable: ' . $e->getMessage(),
                    'message' => 'Session de paiement expirée ou invalide'
                ]);
            }

        } catch (\Exception $e) {
            return new JsonResponse(
                ['error' => 'Erreur lors de la vérification du paiement: ' . $e->getMessage()], 
                JsonResponse::HTTP_INTERNAL_SERVER_ERROR
            );
        }
    }

    #[Route('/move-future-slots/{id}', name: 'session_move_future_slots', methods: ['PATCH', 'PUT'])]
    public function moveFutureSlots( int $id, Request $request, LoggerInterface $logger ): JsonResponse {
        $data = json_decode($request->getContent(), true);
        if (!\is_array($data)) {
            throw new BadRequestHttpException('Corps invalide, JSON attendu.');
        }
    
        // 1) Récupérer la session ciblée
        $session = $this->sessionRepo->find($id);
        if (!$session) {
            return new JsonResponse(['error' => 'Session introuvable'], JsonResponse::HTTP_NOT_FOUND);
        }
    
        $updateAll = $data['update_all'] ?? false;
        $studentId = $data['student_id'] ?? null;
        if (!$studentId) {
            if ($session->getIdStudent()->count()) {
                $studentId = $session->getIdStudent()->first()->getId();
            } else {
                return new JsonResponse(['error' => 'Aucun étudiant spécifié ou trouvé'], JsonResponse::HTTP_BAD_REQUEST);
            }
        }
    
        if (!array_key_exists('scheduled_at', $data) || !$data['scheduled_at']) {
            return new JsonResponse(['error' => 'Aucune nouvelle date/heure transmise'], JsonResponse::HTTP_BAD_REQUEST);
        }
    
        // Si on reçoit un tuteur
        $newTutor = null;
        if (isset($data['tutor_id'])) {
            $newTutor = $this->userRepo->find($data['tutor_id']);
            if (!$newTutor) {
                return new JsonResponse(['error' => 'Tuteur introuvable'], JsonResponse::HTTP_NOT_FOUND);
            }
        }

        if (array_key_exists('updated_by', $data)) {
            $session->setUpdatedBy($data['updated_by']);
        }

        // Si c'est un PUT (reprogrammation par parent), réactiver la séance annulée
        $isPutRequest = $request->getMethod() === 'PUT';
        $isParentReschedule = $data['rescheduled_by_parent'] ?? false;
        $isAdminReschedule = isset($data['is_canceled']) && $data['is_canceled'] === false;

        if ($isPutRequest && ($isParentReschedule || $isAdminReschedule) && $session->isIsCanceled()) {
            $session->setIsCanceled(false);
            $session->setCanceledBy(null);
            $userType = $isParentReschedule ? 'parent' : 'admin';
            $logger->info("Session réactivée lors de la reprogrammation par {$userType}", [
                'session_id' => $session->getId(),
                'user' => $data['updated_by'] ?? 'unknown'
            ]);
        }
    
        // Modifier seulement UNE séance
        if (!$updateAll) {
            $session->setScheduledAt(new \DateTimeImmutable($data['scheduled_at']));
            if ($newTutor) {
                $session->setIdTutor($newTutor);
            }
            if (array_key_exists('updated_by', $data)) {
                $session->setUpdatedBy($data['updated_by']);
            }

            // Mettre à jour les matières si fourni
            if (array_key_exists('school_subjects', $data) && is_array($data['school_subjects'])) {
                $session->setSchoolSubjects($data['school_subjects']);
            }

            $this->em->persist($session);
            $this->em->flush();
    
            return new JsonResponse([
                'id' => $session->getId(),
                'scheduled_at' => $session->getScheduledAt()?->format(\DateTime::ATOM),
                'tutor_id' => $session->getIdTutor()?->getId(),
                'school_subjects' => $session->getSchoolSubjects(),
                'is_canceled' => $session->isIsCanceled(),
                'canceled_by' => $session->getCanceledBy(),
                'multiple' => false,
                'rescheduled' => $isPutRequest && $isParentReschedule
            ], JsonResponse::HTTP_OK);
        }
    
        // Modifier TOUTES les séances futures (période de l'année scolaire)
        $oldScheduledAt = $session->getScheduledAt();
        $year = (int)$oldScheduledAt->format('Y');
        $month = (int)$oldScheduledAt->format('n');
        if ($month >= 9) {
            $endPeriod = new \DateTimeImmutable(($year + 1) . '-08-15 23:59:59');
        } else {
            $endPeriod = new \DateTimeImmutable($year . '-08-15 23:59:59');
        }
        $startPeriod = $oldScheduledAt;
    
        // Récupère SEULEMENT les séances du même créneau (même jour et même heure)
        $originalDow = (int)$oldScheduledAt->format('w'); // 0=dimanche, 1=lundi...
        $originalHour = (int)$oldScheduledAt->format('H');
        $originalMinute = (int)$oldScheduledAt->format('i');
        
        // Conversion pour MySQL DAYOFWEEK (1=dimanche, 2=lundi...)  
        // PHP: 0=dimanche, 1=lundi... 6=samedi
        // MySQL: 1=dimanche, 2=lundi... 7=samedi
        $mysqlDayOfWeek = $originalDow + 1;
        
        $sessions = $this->sessionRepo->findByStudentAndCenterAndPeriodAndTimeSlot(
            $studentId,
            $session->getCenter(),
            $startPeriod,
            $endPeriod,
            $mysqlDayOfWeek,
            $originalHour,
            $originalMinute
        );
    
        $updated = 0;
        $newDatetime = new \DateTimeImmutable($data['scheduled_at']);
        $targetDow = (int)$newDatetime->format('w');
        $targetHour = (int)$newDatetime->format('H');
        $targetMinute = (int)$newDatetime->format('i');
    
        foreach ($sessions as $s) {
            // On ne touche qu'aux séances à venir
            if ($s->getScheduledAt() < new \DateTimeImmutable('today')) continue;
    
            // Calcul dynamique du jour et heure
            $currentDate = $s->getScheduledAt();
            $currentDow = (int)$currentDate->format('w');
            $delta = ($targetDow - $currentDow + 7) % 7;
            
            $newSessionDate = $currentDate->modify("+$delta days")->setTime($targetHour, $targetMinute);
            $s->setScheduledAt($newSessionDate);
    
            if ($newTutor) {
                $s->setIdTutor($newTutor);
            }

            if (array_key_exists('updated_by', $data)) {
                $s->setUpdatedBy($data['updated_by']);
            }
    
            $this->em->persist($s);
            $updated++;
        }
        $this->em->flush();
    
        return new JsonResponse([
            'count' => $updated,
            'student_id' => $studentId,
            'scheduled_at' => $data['scheduled_at'],
            'tutor_id' => $newTutor?->getId(),
            'multiple' => true
        ], JsonResponse::HTTP_OK);
    }


    #[Route('/manage/{id}', name: 'session_manage', methods: ['PATCH'])]
    public function manageSession(
        int $id,
        Request $request
    ): JsonResponse {
        $data = json_decode($request->getContent(), true);
        if (!\is_array($data)) {
            throw new BadRequestHttpException('Corps invalide, JSON attendu.');
        }
    
        // 1) Récupérer la session ciblée
        $session = $this->sessionRepo->find($id);
        if (!$session) {
            return new JsonResponse(['error' => 'Session introuvable'], JsonResponse::HTTP_NOT_FOUND);
        }
    
        $updateAll = $data['update_all'] ?? false;
        $studentId = $data['student_id'] ?? null;
        if (!$studentId) {
            if ($session->getIdStudent()->count()) {
                $studentId = $session->getIdStudent()->first()->getId();
            } else {
                return new JsonResponse(['error' => 'Aucun étudiant spécifié ou trouvé'], JsonResponse::HTTP_BAD_REQUEST);
            }
        }

        // --------- MODE "TOUTES LES SÉANCES À VENIR" ----------
        if ($updateAll) {
            $oldScheduledAt = $session->getScheduledAt();
            $year = (int)$oldScheduledAt->format('Y');
            $month = (int)$oldScheduledAt->format('n');
            if ($month >= 9) {
                $endPeriod = new \DateTimeImmutable(($year + 1) . '-08-15 23:59:59');
            } else {
                $endPeriod = new \DateTimeImmutable($year . '-08-15 23:59:59');
            }
            $startPeriod = $oldScheduledAt;

            // Récupère toutes les séances futures de l'élève dans ce centre et cette période
            $sessions = $this->sessionRepo->findByStudentAndCenterAndPeriod(
                $studentId,
                $session->getCenter(),
                $startPeriod,
                $endPeriod
            );

            // Filtre : même jour de la semaine et même heure/minute
            $targetDow = (int)$oldScheduledAt->format('w'); // 0=dimanche, 1=lundi...
            $targetHour = (int)$oldScheduledAt->format('H');
            $targetMinute = (int)$oldScheduledAt->format('i');

            $updated = 0;
            foreach ($sessions as $s) {
                $sAt = $s->getScheduledAt();
                if (
                    (int)$sAt->format('w') !== $targetDow ||
                    (int)$sAt->format('H') !== $targetHour ||
                    (int)$sAt->format('i') !== $targetMinute
                ) {
                    continue; // Ignore les séances qui ne sont pas sur le même créneau
                }

                if (array_key_exists('is_canceled', $data)) {
                    $s->setIsCanceled($data['is_canceled']);
                }
                if (array_key_exists('is_absent', $data)) {
                    $s->setIsAbsent($data['is_absent']);
                }
                if (array_key_exists('updated_by', $data)) {
                    $s->setUpdatedBy($data['updated_by']);
                }
                if (array_key_exists('absent_by', $data)) {
                    $s->setAbsentBy($data['absent_by']);
                }
                if (array_key_exists('canceled_by', $data)) {
                    $s->setCanceledBy($data['canceled_by']);
                }
                // Gestion des étudiants sur chaque séance
                if (array_key_exists('student_ids', $data)) {
                    foreach ($s->getIdStudent() as $stu) {
                        $s->removeIdStudent($stu);
                    }
                    foreach ((array)$data['student_ids'] as $stuId) {
                        if ($student = $this->studentRepo->find($stuId)) {
                            $s->addIdStudent($student);
                        }
                    }
                }
                $this->em->persist($s);
                $updated++;
            }
            $this->em->flush();
    
            return new JsonResponse([
                'count'       => $updated,
                'student_id'  => $studentId,
                'is_canceled' => $data['is_canceled'] ?? null,
                'is_absent'   => $data['is_absent'] ?? null,
                'multiple'    => true
            ], JsonResponse::HTTP_OK);
        }
    
        // --------- MODE "UNE SEULE SÉANCE" ----------
        $updated = false;
    
        if (array_key_exists('is_canceled', $data)) {
            $session->setIsCanceled($data['is_canceled']);
            $updated = true;
        }
        if (array_key_exists('is_absent', $data)) {
            $session->setIsAbsent($data['is_absent']);
            $updated = true;
        }

        if (array_key_exists('updated_by', $data)) {
            $session->setUpdatedBy($data['updated_by']);
            $updated = true;
        }

        if (array_key_exists('absent_by', $data)) {
            $session->setAbsentBy($data['absent_by']);
            $updated = true;
        }

        if (array_key_exists('canceled_by', $data)) {
            $session->setCanceledBy($data['canceled_by']);
            $updated = true;
        }
    
        // (optionnel) gestion des étudiants sur la séance si fourni
        if (array_key_exists('student_ids', $data)) {
            foreach ($session->getIdStudent() as $stu) {
                $session->removeIdStudent($stu);
            }
            foreach ((array)$data['student_ids'] as $stuId) {
                if ($student = $this->studentRepo->find($stuId)) {
                    $session->addIdStudent($student);
                }
            }
            $updated = true;
        }
    
        if ($updated) {
            $this->em->persist($session);
            $this->em->flush();
        }
    
        return new JsonResponse([
            'id'          => $session->getId(),
            'is_canceled' => $session->isIsCanceled(),
            'is_absent'   => $session->isIsAbsent(),
            'student_ids' => array_map(fn($s) => $s->getId(), $session->getIdStudent()->toArray()),
            'multiple'    => false
        ], JsonResponse::HTTP_OK);
    }
    


    // #[Route('/{id}/test-sms', name: 'test_sms', methods: ['POST'])]
    // public function testSms(Session $session): JsonResponse
    // {
    //     // On prend le premier étudiant lié
    //     $student = $session->getIdStudent()->first();
    //     if (!$student) {
    //         return new JsonResponse(['error' => 'Aucun étudiant associé'], JsonResponse::HTTP_BAD_REQUEST);
    //     }

    //     // On prend le premier parent
    //     $parent = $student->getIdParent()->first();
    //     if (!$parent) {
    //         return new JsonResponse(['error' => 'Aucun parent associé'], JsonResponse::HTTP_BAD_REQUEST);
    //     }

    //     // Préparez des données de test ou réutilisez les vraies valeurs
    //     $phone       = $parent->getPhone();
    //     $centre      = $student->getIdCenter()?->getCity() ?? 'Ville inconnue';
    //     $dateCours   = $session->getDateSlot();
    //     $heureDebut  = $session->getScheduledAt()
    //                        ? $session->getScheduledAt()->format('H:i')
    //                        : $session->getDateSlot()->format('H:i');
    //     $ville       = $student->getIdCenter()?->getCity() ?? '';
    //     $adresse     = $student->getIdCenter()?->getAddress() ?? '';
    //     $prenom      = $student->getFirstname();
    //     $link        = 'https://votre-testeur-de-lien.exemple/test';  // lien de test

    //     try {
    //         $ok = $this->smsSender->sendSessionPaymentLink(
    //             $phone,
    //             $centre,
    //             $dateCours,
    //             $heureDebut,
    //             $ville,
    //             $adresse,
    //             $prenom,
    //             $link
    //         );

    //         if (!$ok) {
    //             throw new \RuntimeException('Envoi à Zapier signalé comme échoué');
    //         }

    //         return new JsonResponse([
    //             'status'  => 'SMS envoyé en test',
    //             'to'      => $phone,
    //             'payload' => compact('centre','dateCours','heureDebut','ville','adresse','prenom','link'),
    //         ], JsonResponse::HTTP_OK);
    //     } catch (\Throwable $e) {
    //         return new JsonResponse([
    //             'error' => 'Erreur envoi SMS de test: '.$e->getMessage(),
    //         ], JsonResponse::HTTP_INTERNAL_SERVER_ERROR);
    //     }
    // }
    

    #[Route('/test-sms', name: 'test_sms', methods: ['POST'])]
    public function __invoke(Request $request): JsonResponse
    {
        $data = json_decode($request->getContent(), true);
        if (!\is_array($data)) {
            throw new BadRequestHttpException('Corps invalide, JSON attendu.');
        }

        // Vérification des champs obligatoires
        foreach (['to','centre','dateCours','heureDebut','ville','adresse','prenom','link'] as $field) {
            if (empty($data[$field])) {
                throw new BadRequestHttpException("Le champ « $field » est requis.");
            }
        }

        try {
            $ok = $this->smsSender->sendSessionPaymentLink(
                $data['to'],
                $data['centre'],
                new \DateTimeImmutable($data['dateCours']),
                $data['heureDebut'],
                $data['ville'],
                $data['adresse'],
                $data['prenom'],
                $data['link']
            );

            if (!$ok) {
                return new JsonResponse(
                    ['status'=>'Erreur lors de l’envoi du SMS'],
                    JsonResponse::HTTP_INTERNAL_SERVER_ERROR
                );
            }

            return new JsonResponse(
                ['status'=>'SMS envoyé en test', 'to'=>$data['to'], 'payload'=>$data],
                JsonResponse::HTTP_OK
            );
        } catch (\Exception $e) {
            return new JsonResponse(
                ['error'=>$e->getMessage()],
                JsonResponse::HTTP_BAD_REQUEST
            );
        }
    }

    #[Route('/subscription/{subscriptionId}', name: 'sessions_by_subscription', methods: ['GET'])]
    public function getSessionsBySubscription(int $subscriptionId): JsonResponse
    {
        $subscription = $this->subRepo->find($subscriptionId);
        if (!$subscription) {
            return new JsonResponse(['error' => 'Subscription not found'], JsonResponse::HTTP_NOT_FOUND);
        }

        $sessions = $subscription->getSessions();
        
        // Filtrer les séances : exclure toutes les séances dont l'abonnement est suspendu
        $filteredSessions = $sessions->filter(function($session) use ($subscription) {
            return !$subscription->isIsSuspended();
        });
        
        $data = array_map(function($session) {
            return [
                'id' => $session->getId(),
                'date_slot' => $session->getDateSlot()?->format('Y-m-d'),
                'scheduled_at' => $session->getScheduledAt()?->format('Y-m-d H:i:s'),
                'payment_date' => $session->getPaymentDate()?->format('Y-m-d'),
                'is_paid' => $session->isIsPaid(),
                'is_absent' => $session->isIsAbsent(),
                'is_canceled' => $session->isIsCanceled(),
                'session_type' => $session->getSessionType(),
            ];
        }, $filteredSessions->toArray());

        return new JsonResponse($data, JsonResponse::HTTP_OK);
    }

    #[Route('/check-conflict/{tutorId}', name: 'session_check_conflict', methods: ['GET'])]
    public function checkTutorConflict(int $tutorId, Request $request): JsonResponse
    {
        $date = $request->query->get('date');
        $currentSessionId = $request->query->get('session_id');
        
        if (!$date) {
            return new JsonResponse(['error' => 'Date manquante'], JsonResponse::HTTP_BAD_REQUEST);
        }

        // Vérifier s'il y a des sessions pour ce tuteur à cette date/heure
        $conflictingSessions = $this->sessionRepo->createQueryBuilder('s')
            ->leftJoin('s.id_student', 'students')
            ->where('s.idTutor = :tutorId')
            ->andWhere('s.scheduled_at = :scheduledAt')
            ->andWhere('s.is_canceled = false')
            ->andWhere('s.id != :currentSessionId')
            ->setParameter('tutorId', $tutorId)
            ->setParameter('scheduledAt', new \DateTimeImmutable($date))
            ->setParameter('currentSessionId', $currentSessionId)
            ->getQuery()
            ->getResult();

        $hasConflict = count($conflictingSessions) > 0;
        
        $conflictData = [];
        foreach ($conflictingSessions as $session) {
            $students = $session->getIdStudent();
            foreach ($students as $student) {
                $conflictData[] = [
                    'session_id' => $session->getId(),
                    'student_name' => $student->getFirstname() . ' ' . $student->getLastname(),
                    'time' => $session->getScheduledAt()->format('H:i')
                ];
            }
        }

        return new JsonResponse([
            'hasConflict' => $hasConflict,
            'conflictingSessions' => $conflictData
        ]);
    }

    #[Route('/exceptional-change/{sessionId}', name: 'session_exceptional_change', methods: ['PATCH'])]
    public function exceptionalChange(int $sessionId, Request $request): JsonResponse
    {
        $data = json_decode($request->getContent(), true);
        if (!\is_array($data)) {
            return new JsonResponse(['error' => 'Corps invalide, JSON attendu'], JsonResponse::HTTP_BAD_REQUEST);
        }

        $session = $this->sessionRepo->find($sessionId);
        if (!$session) {
            return new JsonResponse(['error' => 'Session introuvable'], JsonResponse::HTTP_NOT_FOUND);
        }

        $newTutorId = $data['new_tutor_id'] ?? null;
        $newCenterId = $data['new_center_id'] ?? null;
        $studentIds = $data['student_ids'] ?? [];
        $reason = $data['reason'] ?? 'Changement exceptionnel';
        $changedBy = $data['changed_by'] ?? 'Système';

        if (!$newTutorId) {
            return new JsonResponse(['error' => 'ID du nouveau tuteur manquant'], JsonResponse::HTTP_BAD_REQUEST);
        }

        if (!$newCenterId) {
            return new JsonResponse(['error' => 'ID du nouveau centre manquant'], JsonResponse::HTTP_BAD_REQUEST);
        }

        $newTutor = $this->userRepo->find($newTutorId);
        if (!$newTutor) {
            return new JsonResponse(['error' => 'Nouveau tuteur introuvable'], JsonResponse::HTTP_NOT_FOUND);
        }

        $newCenter = $this->em->getRepository(Center::class)->find($newCenterId);
        if (!$newCenter) {
            return new JsonResponse(['error' => 'Nouveau centre introuvable'], JsonResponse::HTTP_NOT_FOUND);
        }

        // Vérifier qu'il n'y a pas de conflit
        $conflictingSessions = $this->sessionRepo->createQueryBuilder('s')
            ->where('s.idTutor = :tutorId')
            ->andWhere('s.scheduled_at = :scheduledAt')
            ->andWhere('s.is_canceled = false')
            ->andWhere('s.id != :sessionId')
            ->setParameter('tutorId', $newTutorId)
            ->setParameter('scheduledAt', $session->getScheduledAt())
            ->setParameter('sessionId', $sessionId)
            ->getQuery()
            ->getResult();

        if (count($conflictingSessions) > 0) {
            return new JsonResponse([
                'error' => 'Le tuteur sélectionné a déjà une séance à cette heure'
            ], JsonResponse::HTTP_CONFLICT);
        }

        // Effectuer le changement
        $oldTutor = $session->getIdTutor();
        $oldCenter = $session->getCenter();
        $session->setIdTutor($newTutor);
        $session->setCenter($newCenter);
        $session->setUpdatedBy($changedBy);

        // Ajouter une note courte dans la session pour tracer le changement
        $changeNote = sprintf(
            "T:%s→%s C:%s→%s %s",
            $oldTutor->getFirstname()[0] . $oldTutor->getLastname()[0],
            $newTutor->getFirstname()[0] . $newTutor->getLastname()[0],
            $oldCenter ? $oldCenter->getName()[0] : '?',
            $newCenter->getName()[0],
            date('d/m H:i')
        );

        // S'assurer que la note ne dépasse pas 255 caractères
        if (strlen($changeNote) <= 255) {
            $session->setResume($changeNote);
        }

        $this->em->flush();

        return new JsonResponse([
            'message' => 'Tuteur changé avec succès',
            'session_id' => $sessionId,
            'old_tutor' => [
                'id' => $oldTutor->getId(),
                'name' => $oldTutor->getFirstname() . ' ' . $oldTutor->getLastname()
            ],
            'new_tutor' => [
                'id' => $newTutor->getId(),
                'name' => $newTutor->getFirstname() . ' ' . $newTutor->getLastname()
            ],
            'new_center' => [
                'id' => $newCenter->getId(),
                'name' => $newCenter->getName()
            ]
        ]);
    }

    /**
     * Récupère toutes les séances d'essai avec filtres optionnels
     */
    #[Route('/trial-sessions', name: 'get_trial_sessions', methods: ['GET'])]
    public function getAllTrialSessions(Request $request): JsonResponse
    {
        // Récupération des paramètres de filtre
        $centerId = $request->query->get('center_id');
        $isPaid = $request->query->get('is_paid');
        $isCanceled = $request->query->get('is_canceled');
        $startDate = $request->query->get('start_date');
        $endDate = $request->query->get('end_date');

        // Construction de la requête
        $qb = $this->sessionRepo->createQueryBuilder('s')
            ->leftJoin('s.id_student', 'student')
            ->leftJoin('s.idTutor', 'tutor')
            ->leftJoin('s.center', 'center')
            ->addSelect('student', 'tutor', 'center')
            ->where('s.session_type = :sessionType')
            ->setParameter('sessionType', 'trial_session')
            ->orderBy('s.created_at', 'DESC');

        // Application des filtres
        if ($centerId && $centerId !== 'all') {
            $qb->andWhere('center.id = :centerId')
               ->setParameter('centerId', $centerId);
        }

        if ($isPaid !== null && $isPaid !== '' && $isPaid !== 'all') {
            $qb->andWhere('s.is_paid = :isPaid')
               ->setParameter('isPaid', filter_var($isPaid, FILTER_VALIDATE_BOOLEAN));
        }

        if ($isCanceled !== null && $isCanceled !== '' && $isCanceled !== 'all') {
            $qb->andWhere('s.is_canceled = :isCanceled')
               ->setParameter('isCanceled', filter_var($isCanceled, FILTER_VALIDATE_BOOLEAN));
        }

        if ($startDate) {
            $qb->andWhere('s.scheduled_at >= :startDate')
               ->setParameter('startDate', new \DateTimeImmutable($startDate));
        }

        if ($endDate) {
            $qb->andWhere('s.scheduled_at <= :endDate')
               ->setParameter('endDate', new \DateTimeImmutable($endDate . ' 23:59:59'));
        }

        $sessions = $qb->getQuery()->getResult();

        // Formater les données pour la réponse
        $data = array_map(function($session) {
            $students = $session->getIdStudent();
            $tutor = $session->getIdTutor();
            $center = $session->getCenter();

            return [
                'id' => $session->getId(),
                'scheduled_at' => $session->getScheduledAt()?->format('Y-m-d H:i:s'),
                'date_slot' => $session->getDateSlot()?->format('Y-m-d'),
                'school_subjects' => $session->getSchoolSubjects(),
                'is_paid' => $session->isIsPaid(),
                'is_canceled' => $session->isIsCanceled(),
                'is_absent' => $session->isIsAbsent(),
                'stripe_number' => $session->getStripeNumber(),
                'resume' => $session->getResume(),
                'created_at' => $session->getCreatedAt()?->format('Y-m-d H:i:s'),
                'created_by' => $session->getCreatedBy(),
                'students' => array_map(fn($s) => [
                    'id' => $s->getId(),
                    'firstname' => $s->getFirstname(),
                    'lastname' => $s->getLastname(),
                    'email' => $s->getEmail(),
                    'class' => $s->getClass(),
                    'phone' => $s->getPhone(),
                ], $students->toArray()),
                'tutor' => $tutor ? [
                    'id' => $tutor->getId(),
                    'firstname' => $tutor->getFirstname(),
                    'lastname' => $tutor->getLastname(),
                    'email' => $tutor->getEmail(),
                ] : null,
                'center' => $center ? [
                    'id' => $center->getId(),
                    'name' => $center->getName(),
                    'city' => $center->getCity(),
                    'address' => $center->getAddress(),
                ] : null,
            ];
        }, $sessions);

        return new JsonResponse([
            'total' => count($data),
            'sessions' => $data
        ], JsonResponse::HTTP_OK);
    }

}
