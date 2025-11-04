<?php
// src/Controller/StudentApiController.php
namespace App\Controller;

use App\Entity\Student;
use App\Entity\StudentParent;
use App\Repository\CenterRepository;
use App\Repository\StudentParentRepository;
use App\Repository\StudentRepository;
use App\Repository\SubscriptionRepository;
use App\Service\NameNormalizerService;
use App\Service\PhoneValidatorService;
use App\Service\StripeCustomerService;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\PasswordHasher\Hasher\UserPasswordHasherInterface;
use App\Security\StudentParentUser;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\IsGranted;
use App\Security\Voter\StudentVoter;
use Symfony\Contracts\HttpClient\HttpClientInterface;


#[Route('/api/student')]
class StudentController extends AbstractController
{
    public function __construct(
        private EntityManagerInterface $em,
        private StudentRepository      $studentRepo,
        private CenterRepository $centerRepository,
        private StudentParentRepository $studentParentRepository,
        private NameNormalizerService $nameNormalizer,
        private PhoneValidatorService $phoneValidator,
        private UserPasswordHasherInterface $passwordHasher,
        private HttpClientInterface $httpClient,
        private StripeCustomerService $stripeCustomerService,


    ) {}

    /**
     * Crée un nouvel étudiant.
     *
     * @param Request $request JSON { firstname, lastname, gender, class, email, phone?, id_center }
     * @return JsonResponse
     */
    #[Route('', name: 'api_students_create', methods: ['POST'])]
    public function create(Request $request): JsonResponse
    {
        // Vérifier les permissions
        $this->denyAccessUnlessGranted(StudentVoter::CREATE);

        $data = json_decode($request->getContent(), true);

        // Champs requis
        $required = ['firstname', 'lastname', 'gender', 'class',  'id_center'];
        foreach ($required as $f) {
            if (empty($data[$f] ?? null)) {
                return $this->json(
                    ['error' => sprintf('Le champ "%s" est requis.', $f)],
                    JsonResponse::HTTP_BAD_REQUEST
                );
            }
        }

        // Validation et normalisation des noms
        if (!$this->nameNormalizer->isValidName($data['firstname'])) {
            $suggestions = $this->nameNormalizer->getSuggestions($data['firstname']);
            return $this->json([
                'error' => 'Le prénom contient des caractères non valides.',
                'suggestions' => $suggestions
            ], JsonResponse::HTTP_BAD_REQUEST);
        }

        if (!$this->nameNormalizer->isValidName($data['lastname'])) {
            $suggestions = $this->nameNormalizer->getSuggestions($data['lastname']);
            return $this->json([
                'error' => 'Le nom contient des caractères non valides.',
                'suggestions' => $suggestions
            ], JsonResponse::HTTP_BAD_REQUEST);
        }

        // Validation du téléphone si fourni (optionnel pour les étudiants)
        if (!empty($data['phone']) && !$this->phoneValidator->isValidPhone($data['phone'])) {
            $suggestions = $this->phoneValidator->getSuggestions($data['phone']);
            return new JsonResponse([
                'error' => 'Numéro de téléphone invalide.',
                'phone_provided' => $data['phone'],
                'suggestions' => $suggestions,
                'example' => '06 12 34 56 78'
            ], JsonResponse::HTTP_BAD_REQUEST);
        }

        $student = new Student();
        $student
            ->setFirstname($data['firstname'])
            ->setLastname($data['lastname'])
            ->setGender($data['gender'])
            ->setClass($data['class'])
            // ->setEmail($data['email'])
            ->setPhone($data['phone'] ?? null)
            ->setIsActive(true)
            ->setIsDeleted(false)
            ->setCreatedAt(new \DateTimeImmutable())
            ->setCreatedBy($this->getUser()->getUserIdentifier())
        ;

        // Lier le centre
        $center = $this->em->getRepository(\App\Entity\Center::class)
            ->find($data['id_center']);
        if (!$center) {
            return $this->json(
                ['error' => 'Centre introuvable.'],
                JsonResponse::HTTP_BAD_REQUEST
            );
        }
        $student->setIdCenter($center);

        if (!empty($data['parent'])) {

            $pData = $data['parent'];

            /** ----- 3.a  Parent EXISTANT (parent.id fourni) ----------------- */
            if (!empty($pData['id'])) {
                $parent = $this->studentParentRepository->find($pData['id']);

                if (!$parent) {
                    return $this->json(
                        ['error' => 'Parent introuvable.'],
                        JsonResponse::HTTP_BAD_REQUEST
                    );
                }
            } else {
                $parentRequired = ['firstname', 'lastname', 'gender', 'email'];
                foreach ($parentRequired as $f) {
                    if (empty($pData[$f] ?? null)) {
                        return $this->json(
                            ['error' => sprintf('Le champ parent.%s est requis.', $f)],
                            JsonResponse::HTTP_BAD_REQUEST
                        );
                    }
                }

                // (Optionnel) – éviter les doublons : regarder si un parent avec même email existe
                $parent = $this->studentParentRepository->findOneBy(['email' => $pData['email']]);
                if (!$parent) {                               // pas trouvé, donc on le crée
                    $parent = (new StudentParent())
                        ->setFirstname($pData['firstname'])
                        ->setLastname($pData['lastname'])
                        ->setGender($pData['gender'])
                        ->setEmail($pData['email'])
                        ->setPhone($pData['phone'] ?? null)
                        ->setAddress($pData['address'] ?? '')
                        ->setZipCode($pData['zip_code'] ?? null)
                        ->setCity($pData['city'] ?? null)
                        ->setCreatedAt(new \DateTimeImmutable())
                        ->setCreatedBy($this->getUser()->getUserIdentifier());

                    // Générer un mot de passe automatique : prenomnom2025
                    $firstname = strtolower($pData['firstname']);
                    $lastname = strtolower($pData['lastname']);
                    $rawPassword = $firstname . $lastname . '2025';

                    // Hasher le mot de passe avec le système unifié
                    $studentParentUser = new StudentParentUser($parent);
                    $hashedPassword = $this->passwordHasher->hashPassword($studentParentUser, $rawPassword);
                    $parent->setPassword($hashedPassword);


                    $this->em->persist($parent);
                }
            }

            // Dans les deux cas (existant ou créé) on lie le parent à l’élève
            $student->addIdParent($parent);
        }

        $this->em->persist($student);
        $this->em->flush();

        // Créer le customer Stripe et sauvegarder l'ID
        try {
            $stripeCustomerId = $this->stripeCustomerService->createCustomer($student);
            $student->setIdStripe($stripeCustomerId);
            $this->em->flush();
        } catch (\Exception $e) {
            // Log l'erreur mais ne pas empêcher la création de l'étudiant
            error_log('Erreur création Stripe customer: ' . $e->getMessage());
        }

        // if ($this->isProdEnv()) {
            // ✅ Préparation des données à envoyer à Zapier (ajout pipedrive)
            $dataZapier = [
                'mail'      => !empty($parent) ? $parent->getEmail() : null,
                'phone'     => !empty($parent) ? $parent->getPhone() : $student->getPhone(),
                'name'      => $student->getLastname(),
                'prenom'    => $student->getFirstname(),
                'classe'    => $student->getClass(),
                'centre'    => $student->getIdCenter()->getCity(),
                'centre_id' => $student->getIdCenter()->getId(),
                'id'        => $student->getId(),
            ];
            $jsonData = json_encode($dataZapier);
            $url = 'https://hooks.zapier.com/hooks/catch/22004412/utr45fa/';
            $options = [
                'http' => [
                    'method'  => 'POST',
                    'header'  => "Content-Type: application/json\r\n",
                    'content' => $jsonData
                ]
            ];
            $context = stream_context_create($options);
            $result = file_get_contents($url, false, $context);

            // ✅ Préparation des données à envoyer à Zapier (ajout parent dans sinao)
            $dataZapierParent = [
                'mail'      => !empty($parent) ? $parent->getEmail() : null,
                'phone'     => !empty($parent) ? $parent->getPhone() : $student->getPhone(),
                'name'      => $parent->getLastname(),
                'prenom'    => $parent->getFirstname(),
                'ville'     => $parent->getCity(),
                'code_postal' => $parent->getZipCode(),
                'adresse'   => $parent->getAddress(),
                'telephone' => $parent->getPhone(),
                'id'        => $parent->getId()
            ];
            $jsonDataParent = json_encode($dataZapierParent);
            $urlParent = 'https://hooks.zapier.com/hooks/catch/22004412/ut5i5cr/';
            $optionsParent = [
                'http' => [
                    'method'  => 'POST',
                    'header'  => "Content-Type: application/json\r\n",
                    'content' => $jsonDataParent
                ]
            ];
            $contextParent = stream_context_create($optionsParent);
            $result = file_get_contents($urlParent, false, $contextParent);
        // }

        return $this->json(
            [
                'id'        => $student->getId(),
                'firstname' => $student->getFirstname(),
                'lastname'  => $student->getLastname(),
                'gender'    => $student->getGender(),
                'class'     => $student->getClass(),
                // 'email'     => $student->getEmail(),
                'phone'     => $student->getPhone(),
                'is_active' => $student->isIsActive(),
                'is_deleted' => $student->isIsDeleted(),
                'id_center' => $student->getIdCenter()->getId(),
                'created_at' => $student->getCreatedAt()->format(\DateTime::ATOM),
                'created_by' => $student->getCreatedBy(),
                'stripe_key' => $student->getIdStripe()

            ],
            JsonResponse::HTTP_CREATED
        );
    }

    /**
     * Liste tous les étudiants.
     *
     * @return JsonResponse
     */
    #[Route('', name: 'api_students_list', methods: ['GET'])]
    public function list(): JsonResponse
    {
        $students = $this->studentRepo->findAll();

        $data = array_map(fn(Student $s) => [
            'id'         => $s->getId(),
            'firstname'  => $s->getFirstname(),
            'lastname'   => $s->getLastname(),
            'gender'     => $s->getGender(),
            'class'      => $s->getClass(),
            // 'email'      => $s->getEmail(),
            'phone'      => $s->getPhone(),
            'is_active'  => $s->isIsActive(),
            'is_deleted' => $s->isIsDeleted(),
            'id_center'  => $s->getIdCenter()?->getId(),
            'created_at' => $s->getCreatedAt()->format(\DateTime::ATOM),
            'created_by' => $s->getCreatedBy(),
        ], $students);

        return $this->json($data);
    }


    #[Route('/{id}', methods: ['GET'], requirements: ['id' => '\d+'])]
    public function show(int $id): JsonResponse
    {
        $student = $this->studentRepo->find($id);
        if (!$student) {
            return $this->json(['message' => 'Pas trouvé'], 404);
        }

        $parents = $student->getIdParent()->map(function (\App\Entity\StudentParent $p) {
            return [
                'id'        => $p->getId(),
                'firstname' => $p->getFirstname(),
                'lastname'  => $p->getLastname(),
                'email'     => $p->getEmail(),
                'phone'     => $p->getPhone(),
                'address'  => $p->getAddress(),
                'city'     => $p->getCity(),
                'zip_code' => $p->getZipCode()
            ];
        })->toArray();

        $sessions = $student->getSessions()->map(function (\App\Entity\Session $s) {
            $tutor = $s->getIdTutor();
            $center = $s->getCenter();

            // Récupérer la date de résiliation du contrat associé
            $subscriptions = $s->getIdSubscription();
            $resiliationDate = null;
            $isSubscriptionCanceled = false;

            if ($subscriptions && $subscriptions->count() > 0) {
                // Prendre le premier contrat (une session peut avoir plusieurs contrats en théorie)
                $subscription = $subscriptions->first();
                if ($subscription) {
                    $resiliationDate = $subscription->getResiliationDate();
                    $isSubscriptionCanceled = $subscription->isIsCanceled();
                }
            }

            return [
                'id'             => $s->getId(),
                'date_slot'      => $s->getDateSlot()->format('Y-m-d'),
                'session_type'   => $s->getSessionType(),
                'is_canceled'    => $s->isIsCanceled(),
                'scheduled_at'   => $s->getScheduledAt(),
                'tutor_id'       => $tutor?->getId(),
                'tutor_name'     => $tutor ? $tutor->getFirstname() . ' ' . $tutor->getLastname() : null,
                'center_name'    => $center?->getName(),
                'school_subjects' => $s->getSchoolSubjects(),
                'is_paid'        => $s->isIsPaid(),
                'is_absent'      => $s->isIsAbsent(),
                'absent_by'      => $s->getAbsentBy(),
                'canceled_by'    => $s->getCanceledBy(),
                'payment_link'   => $s->getPaymentLink(),
                'resiliation_date' => $resiliationDate?->format('Y-m-d'),
                'is_subscription_canceled' => $isSubscriptionCanceled,
            ];
        })->toArray();

        // Récupérer les contrats/subscriptions de l'étudiant avec informations de sessions suspendues
        $subscriptions = $this->em->getRepository(\App\Entity\Subscription::class)->findBy(['id_student' => $student]);
        $subscriptionsData = array_map(function($subscription) {
            // Compter les sessions suspendues pour cette subscription
            $suspendedSessions = $this->em->createQuery('
                SELECT s FROM App\Entity\Session s 
                JOIN s.id_subscription sub 
                WHERE sub.id = :subId 
                AND s.is_canceled = true
            ')
            ->setParameter('subId', $subscription->getId())
            ->getResult();
            
            $totalSuspendedCount = count($suspendedSessions);
            
            return [
                'id' => $subscription->getId(),
                'subscription_type' => $subscription->getSubscriptionType(),
                'offer_type' => $subscription->getOfferType(),
                'is_canceled' => $subscription->isIsCanceled(),
                'canceled_by' => $subscription->getCanceledBy(),
                'subscription_start_date' => $subscription->getSubscriptionStartDate()?->format('Y-m-d'),
                'subscription_end_date' => $subscription->getSubscriptionEndDate()?->format('Y-m-d'),
                'school_subjects' => $subscription->getSchoolSubjects(),
                'session_per_week' => $subscription->getSessionPerWeek(),
                'suspended_sessions_count' => $totalSuspendedCount,
                'has_suspended_sessions' => $totalSuspendedCount > 0,
                'created_at' => $subscription->getCreatedAt()?->format('Y-m-d H:i:s')
            ];
        }, $subscriptions);

        $user = $this->studentRepo->find($id);
        if (!$user) {
            return $this->json(['message' => 'Pas trouvé'], 404);
        }
        return $this->json([
            'id'                => $user->getId(),
            'email'             => $user->getEmail(),
            'firstname'         => $user->getFirstname(),
            'lastname'          => $user->getLastname(),
            'phone'             => $user->getPhone(),
            'gender'           => $user->getGender(),
            'is_active'         => $user->isIsActive(),
            'is_deleted'        => $user->isIsDeleted(),
            'created_at'        => $user->getCreatedAt(),
            'class'             => $user->getClass(),
            'created_by'        => $user->getCreatedBy(),
            'updated_at'        => $user->getUpdatedAt(),
            'updated_by'        => $user->getUpdatedBy(),
            'deposit_amount'    => $user->getDepositAmount(),
            'deposit_status'    => $user->getDepositStatus(),
            'has_deposit'       => $user->hasDeposit(),
            'school_app'        => $user->getSchoolApp(),
            'school_app_url'    => $user->getSchoolAppUrl(),
            'school_app_username' => $user->getSchoolAppUsername(),
            'reports' => array_map(fn($r) => [
                'id'          => $r->getId(),
                'created_at'  => $r->getCreatedAt()->format(\DateTime::ATOM),
            ], $user->getReports()->toArray()),
            'centers' => $user->getIdCenter()
                ? [
                    'id'      => $user->getIdCenter()->getId(),
                    'name'    => $user->getIdCenter()->getName(),
                    'address' => $user->getIdCenter()->getAddress(),
                    'city'    => $user->getIdCenter()->getCity(),
                    'phone'    => $user->getIdCenter()->getPhone(),
                    'email'    => $user->getIdCenter()->getEmail(),
                    'zip_code' => $user->getIdCenter()->getZipCode(),

                ]
                : null,
            'parents'   => $parents,
            'sessions'  => $sessions,
            'contracts' => $subscriptionsData,
            'stripe_key' => $student->getIdStripe()

        ]);
    }

    #[Route('/{id}', name: 'api_students_update', methods: ['PUT'])]
    #[IsGranted('ROLE_USER')]
    public function update(int $id, Request $request): JsonResponse
    {
        // 1. Charger l'élève
        $student = $this->studentRepo->find($id);
        if (!$student) {
            return $this->json(['error' => 'Élève non trouvé'], JsonResponse::HTTP_NOT_FOUND);
        }

        // 2. Décoder le JSON
        $data = json_decode($request->getContent(), true);
        if (!\is_array($data)) {
            return $this->json(['error' => 'JSON invalide'], JsonResponse::HTTP_BAD_REQUEST);
        }

        // 3. Hydrater les champs simples
        foreach (['firstname', 'lastname', 'gender', 'class',  'phone'] as $field) {
            if (array_key_exists($field, $data)) {
                $setter = 'set' . ucfirst($field);
                $student->$setter($data[$field]);
            }
        }

        // 3.1 Gérer les champs de caution
        if (array_key_exists('deposit_amount', $data)) {
            $student->setDepositAmount($data['deposit_amount']);
        }
        if (array_key_exists('deposit_status', $data)) {
            try {
                $student->setDepositStatus($data['deposit_status']);
            } catch (\InvalidArgumentException $e) {
                return $this->json(['error' => $e->getMessage()], JsonResponse::HTTP_BAD_REQUEST);
            }
        }

        // 3.2 Gérer les champs d'accès vie scolaire
        if (array_key_exists('school_app', $data)) {
            try {
                $student->setSchoolApp($data['school_app']);
            } catch (\InvalidArgumentException $e) {
                return $this->json(['error' => $e->getMessage()], JsonResponse::HTTP_BAD_REQUEST);
            }
        }
        if (array_key_exists('school_app_url', $data)) {
            $student->setSchoolAppUrl($data['school_app_url']);
        }
        if (array_key_exists('school_app_username', $data)) {
            $student->setSchoolAppUsername($data['school_app_username']);
        }
        if (array_key_exists('school_app_password', $data)) {
            $student->setSchoolAppPassword($data['school_app_password']);
        }

        // 4. Mettre à jour le center si fourni
        if (array_key_exists('id_center', $data)) {
            if ($data['id_center'] === null) {
                $student->setIdCenter(null);
            } else {
                // Récupération dans une variable explicite
                $centerEntity = $this->centerRepository->find($data['id_center']);
                if (!$centerEntity) {
                    return $this->json(['error' => 'Centre non trouvé'], JsonResponse::HTTP_BAD_REQUEST);
                }
                // NE PAS passer $student mais bien l'entité Center
                $student->setIdCenter($centerEntity);
            }
        }

        // 5. Champs booléens
        if (array_key_exists('is_active', $data)) {
            $student->setIsActive((bool)$data['is_active']);
        }
        if (array_key_exists('is_deleted', $data)) {
            $student->setIsDeleted((bool)$data['is_deleted']);
        }

        // 6. Mettre à jour les métadonnées
        $student->setUpdatedAt(new \DateTimeImmutable());
        $student->setUpdatedBy($this->getUser()->getUserIdentifier());

        // 7. Persister
        $this->em->flush();

        // if ($this->isProdEnv()) {
            $dataZapier = [
                'mail_parent'      => $student->getIdParent()->count() > 0 ? $student->getIdParent()->first()->getEmail() : null,
                'numero_parent'     => $student->getIdParent()->count() > 0 ? $student->getIdParent()->first()->getPhone() : $student->getPhone(),
                'nom'      => $student->getLastname(),
                'prenom'    => $student->getFirstname(),
                'classe'    => $student->getClass(),
                'ville'    => $student->getIdCenter()->getCity(),
                'centre_id' => $student->getIdCenter()->getId(),
                'id'        => $student->getId(),
            ];
            $jsonData = json_encode($dataZapier);
            $url = 'https://hooks.zapier.com/hooks/catch/22004412/utrhn6z/';
            $options = [
                'http' => [
                    'method'  => 'POST',
                    'header'  => "Content-Type: application/json\r\n",
                    'content' => $jsonData
                ]
            ];
            $context = stream_context_create($options);
            $result = file_get_contents($url, false, $context);
        // }

        // 8. Réponse JSON
        return $this->json([
            'id'         => $student->getId(),
            'firstname'  => $student->getFirstname(),
            'lastname'   => $student->getLastname(),
            'gender'     => $student->getGender(),
            'class'      => $student->getClass(),
            // 'email'      => $student->getEmail(),
            'phone'      => $student->getPhone(),
            'is_active'  => $student->isIsActive(),
            'is_deleted' => $student->isIsDeleted(),
            'id_center'  => $student->getIdCenter()?->getId(),
        ]);
    }

    #[Route('/{id}', name: 'api_students_delete', methods: ['DELETE'])]
    #[IsGranted('ROLE_USER')]
    public function delete(int $id): JsonResponse
    {
        $student = $this->studentRepo->find($id);
        if (!$student) {
            return $this->json(['error' => 'Élève non trouvé'], JsonResponse::HTTP_NOT_FOUND);
        }

        $this->em->remove($student);
        $this->em->flush();

        return new JsonResponse(null, JsonResponse::HTTP_NO_CONTENT);
    }


    #[Route('/{studentId}/parents', name: 'student_add_parent', methods: ['POST'])]
    public function addParent(int $studentId, Request $request): JsonResponse
    {
        $data = json_decode($request->getContent(), true);
        $parentId = $data['parentId'] ?? null;

        if (!$parentId) {
            return $this->json(['error' => 'parentId manquant'], 400);
        }

        $student = $this->studentRepo->find($studentId);
        $parent  = $this->studentParentRepository->find($parentId);

        if (!$student || !$parent) {
            return $this->json(['error' => 'Étudiant ou parent introuvable'], 404);
        }

        // Associer
        $student->addIdParent($parent);
        $this->em->flush();

        return $this->json([
            'studentId' => $student->getId(),
            'parentId'  => $parent->getId(),
            'message'   => 'Parent associé à l’élève avec succès'
        ], 201);
    }

    #[Route('/{id}/siblings', name: 'api_students_siblings', methods: ['GET'])]
    public function siblings(int $id): JsonResponse
    {
        $student = $this->studentRepo->find($id);

        if (!$student) {
            return $this->json(['error' => 'Élève non trouvé'], Response::HTTP_NOT_FOUND);
        }

        /** @var \\App\\Entity\\StudentParent[] $parents */
        $parents = $student->getIdParent()->toArray();

        if (!$parents) {
            // L'élève n'a aucun parent enregistré → donc pas de frère/sœur
            return $this->json([], Response::HTTP_OK);
        }

        // (on peut tout faire en RAM vu les volumes habituels)
        $siblings = [];
        foreach ($parents as $parent) {
            foreach ($parent->getStudents() as $child) {
                if ($child->getId() === $id) {
                    continue; // on exclut l’élève lui-même
                }
                // On indexe par id pour dé-dupliquer si deux parents communs
                $siblings[$child->getId()] = [
                    'id'        => $child->getId(),
                    'firstname' => $child->getFirstname(),
                    'lastname'  => $child->getLastname(),
                    'class'     => $child->getClass(),
                    // 'email'     => $child->getEmail(),
                ];
            }
        }

        return $this->json(array_values($siblings), Response::HTTP_OK);
    }


    #[Route('/has-sibling/{studentId}', name: 'student_has_sibling', methods: ['GET'])]
    public function hasSibling(int $studentId, StudentRepository $studentRepo, StudentParentRepository $parentRepo): JsonResponse
    {
        // Récupère l’élève
        $student = $studentRepo->find($studentId);
        if (!$student) {
            return new JsonResponse(['error' => 'Élève non trouvé'], 404);
        }

        // Récupère tous les parents de l’élève
        $parents = $student->getIdParent();
        foreach ($parents as $parent) {
            // Pour chaque parent, check combien d’enfants il a
            if ($parent->getStudents()->count() > 1) {
                // Il a au moins un frère/sœur
                return new JsonResponse(['has_sibling' => true]);
            }
        }
        return new JsonResponse(['has_sibling' => false]);
    }

    #[Route('/is-member/{studentId}', name: 'student_is_member', methods: ['GET'])]

    public function isMember(
        int $studentId,
        SubscriptionRepository $subscriptionRepository
    ): JsonResponse {
        // 1) Récupérer toutes les subscriptions du student
        $subscriptions = $subscriptionRepository->findBy(['id_student' => $studentId]);

        // 2) Pour chaque subscription, checker sur le combined_id
        foreach ($subscriptions as $subscription) {
            $combinedId = $subscription->getCombinedId();
            if (!$combinedId) continue; // Ignore si pas de contrat combiné

            // Récupère toutes les subscriptions ayant ce combined_id
            $groupedSubscriptions = $subscriptionRepository->findBy(['combined_id' => $combinedId]);

            // Est-ce qu'il y en a AU MOINS UNE avec is_valide=true ?
            foreach ($groupedSubscriptions as $sub) {
                if ($sub->isIsValide()) {
                    return new JsonResponse(['is_member' => true]);
                }
            }
        }

        // Si aucune contract groupé ou aucune n'est valide
        return new JsonResponse(['is_member' => false]);
    }

    /**
     * Exporte la liste des étudiants avec les informations des parents et centres en CSV.
     */
    #[Route('/export-csv', name: 'api_students_export_csv', methods: ['GET'])]
    public function exportCsv(): Response
    {
        $students = $this->studentRepo->findAll();

        $csvData = [];
        $csvData[] = [
            'ID',
            'Prénom',
            'Nom',
            'Genre',
            'Classe',
            'Téléphone Élève',
            'Email Élève',
            'Actif',
            'Centre',
            'Parent - Prénom',
            'Parent - Nom',
            'Parent - Genre',
            'Parent - Email',
            'Parent - Téléphone',
            'Date de création',
            'Créé par',
            'Date du premier cours planifié'
        ];

        foreach ($students as $student) {
            $center = $student->getIdCenter();
            $centerName = $center ? $center->getName() : '';

            // Récupérer le premier parent
            $parents = $student->getIdParent();
            $firstParent = $parents->count() > 0 ? $parents->first() : null;

            // Récupérer la date du premier cours planifié (hors séance découverte)
            $firstCourseDate = $this->getFirstScheduledCourseDate($student);

            $csvData[] = [
                $student->getId(),
                $student->getFirstname(),
                $student->getLastname(),
                $student->getGender(),
                $student->getClass(),
                $student->getPhone() ?: '',
                $student->getEmail() ?: '',
                $student->isIsActive() ? 'Oui' : 'Non',
                $centerName,
                $firstParent ? $firstParent->getFirstname() : '',
                $firstParent ? $firstParent->getLastname() : '',
                $firstParent ? $firstParent->getGender() : '',
                $firstParent ? $firstParent->getEmail() : '',
                $firstParent ? $firstParent->getPhone() : '',
                $student->getCreatedAt() ? $student->getCreatedAt()->format('Y-m-d H:i:s') : '',
                $student->getCreatedBy() ?: '',
                $firstCourseDate ? $firstCourseDate->format('d/m/Y') : ''
            ];
        }

        // Créer le contenu CSV
        $csvContent = '';
        foreach ($csvData as $row) {
            $csvContent .= implode(';', array_map(function($field) {
                return '"' . str_replace('"', '""', $field) . '"';
            }, $row)) . "\n";
        }

        $response = new Response($csvContent);
        $response->headers->set('Content-Type', 'text/csv; charset=utf-8');
        $response->headers->set('Content-Disposition', 'attachment; filename="export_eleves_' . date('Y-m-d_H-i-s') . '.csv"');

        return $response;
    }

    /**
     * Met à jour les informations de caution d'un étudiant
     */
    #[Route('/{id}/deposit', name: 'api_student_update_deposit', methods: ['PATCH'])]
    #[IsGranted('ROLE_USER')]
    public function updateDeposit(int $id, Request $request): JsonResponse
    {
        $student = $this->studentRepo->find($id);
        if (!$student) {
            return $this->json(['error' => 'Élève non trouvé'], JsonResponse::HTTP_NOT_FOUND);
        }

        $data = json_decode($request->getContent(), true);
        if (!\is_array($data)) {
            return $this->json(['error' => 'JSON invalide'], JsonResponse::HTTP_BAD_REQUEST);
        }

        // Mettre à jour le montant de la caution
        if (array_key_exists('deposit_amount', $data)) {
            $student->setDepositAmount($data['deposit_amount']);
        }

        // Mettre à jour le statut de la caution
        if (array_key_exists('deposit_status', $data)) {
            try {
                $student->setDepositStatus($data['deposit_status']);
            } catch (\InvalidArgumentException $e) {
                return $this->json([
                    'error' => $e->getMessage(),
                    'allowed_statuses' => [
                        'en_attente_reception' => 'En attente de réception de la caution',
                        'reception_centre' => 'Caution réceptionnée en centre',
                        'reception_siege' => 'Caution réceptionnée au siège',
                        'rendu_parent' => 'Caution rendue au parent'
                    ]
                ], JsonResponse::HTTP_BAD_REQUEST);
            }
        }

        // Mettre à jour les métadonnées
        $student->setUpdatedAt(new \DateTimeImmutable());
        $student->setUpdatedBy($this->getUser()->getUserIdentifier());

        $this->em->flush();

        return $this->json([
            'id' => $student->getId(),
            'deposit_amount' => $student->getDepositAmount(),
            'deposit_status' => $student->getDepositStatus(),
            'has_deposit' => $student->hasDeposit(),
            'message' => 'Informations de caution mises à jour avec succès'
        ]);
    }

    /**
     * Retourne les statuts de caution disponibles
     */
    #[Route('/deposit/statuses', name: 'api_deposit_statuses', methods: ['GET'])]
    public function getDepositStatuses(): JsonResponse
    {
        return $this->json([
            'statuses' => [
                [
                    'value' => 'en_attente_reception',
                    'label' => 'En attente de réception de la caution',
                    'color' => 'warning'
                ],
                [
                    'value' => 'reception_centre',
                    'label' => 'Caution réceptionnée en centre',
                    'color' => 'info'
                ],
                [
                    'value' => 'reception_siege',
                    'label' => 'Caution réceptionnée au siège',
                    'color' => 'primary'
                ],
                [
                    'value' => 'rendu_parent',
                    'label' => 'Caution rendue au parent',
                    'color' => 'success'
                ]
            ]
        ]);
    }

    /**
     * Retourne tous les étudiants qui ont une caution avec possibilité de filtrer par centre
     */
    #[Route('/deposits', name: 'api_student_deposits_list', methods: ['GET'])]
    #[IsGranted('ROLE_USER')]
    public function listDeposits(Request $request): JsonResponse
    {
        $centerId = $request->query->get('center_id');

        // Construire la requête DQL
        $qb = $this->em->createQueryBuilder();
        $qb->select('s')
            ->from(\App\Entity\Student::class, 's')
            ->leftJoin('s.id_center', 'c')
            ->where('s.deposit_amount IS NOT NULL')
            ->andWhere('s.deposit_amount != :zero')
            ->setParameter('zero', '0.00')
            ->orderBy('s.lastname', 'ASC')
            ->addOrderBy('s.firstname', 'ASC');

        // Filtrer par centre si spécifié
        if ($centerId) {
            $qb->andWhere('c.id = :centerId')
               ->setParameter('centerId', $centerId);
        }

        $students = $qb->getQuery()->getResult();

        // Formater les données
        $data = array_map(function(\App\Entity\Student $student) {
            $center = $student->getIdCenter();
            $parents = $student->getIdParent();
            $firstParent = $parents->count() > 0 ? $parents->first() : null;

            // Compter le nombre de séances effectuées (non annulées, non absentes, dans le passé)
            $sessions = $student->getSessions();
            $now = new \DateTimeImmutable();
            $completedSessionsCount = 0;
            $nextSession = null;

            foreach ($sessions as $session) {
                $scheduledAt = $session->getScheduledAt();
                if (!$scheduledAt) {
                    continue;
                }

                // Compter les sessions passées non annulées et non absentes
                if ($scheduledAt < $now && !$session->isIsCanceled() && !$session->isIsAbsent()) {
                    $completedSessionsCount++;
                }

                // Trouver la prochaine session (future, non annulée)
                if ($scheduledAt >= $now && !$session->isIsCanceled()) {
                    if (!$nextSession || $scheduledAt < $nextSession->getScheduledAt()) {
                        $nextSession = $session;
                    }
                }
            }

            // Formater les informations de la prochaine séance
            $nextSessionData = null;
            if ($nextSession) {
                $tutor = $nextSession->getIdTutor();
                $nextSessionData = [
                    'scheduled_at' => $nextSession->getScheduledAt()?->format('Y-m-d H:i:s'),
                    'tutor' => $tutor ? [
                        'firstname' => $tutor->getFirstname(),
                        'lastname' => $tutor->getLastname()
                    ] : null,
                    'subjects' => $nextSession->getSchoolSubjects()
                ];
            }

            return [
                'id' => $student->getId(),
                'firstname' => $student->getFirstname(),
                'lastname' => $student->getLastname(),
                'class' => $student->getClass(),
                'phone' => $student->getPhone(),
                'deposit_amount' => $student->getDepositAmount(),
                'deposit_status' => $student->getDepositStatus(),
                'center' => $center ? [
                    'id' => $center->getId(),
                    'name' => $center->getName(),
                    'city' => $center->getCity()
                ] : null,
                'parent' => $firstParent ? [
                    'id' => $firstParent->getId(),
                    'firstname' => $firstParent->getFirstname(),
                    'lastname' => $firstParent->getLastname(),
                    'phone' => $firstParent->getPhone(),
                    'email' => $firstParent->getEmail()
                ] : null,
                'created_at' => $student->getCreatedAt()?->format('Y-m-d H:i:s'),
                'completed_sessions_count' => $completedSessionsCount,
                'next_session' => $nextSessionData
            ];
        }, $students);

        return $this->json([
            'deposits' => $data,
            'total' => count($data)
        ]);
    }

    // private function isProdEnv(): bool
    // {
    //     return ($_ENV['APP_ENV'] ?? $_SERVER['APP_ENV'] ?? 'dev') === 'prod';
    // }

    /**
     * Récupère la date du premier cours planifié pour un élève (hors séance découverte)
     *
     * @param Student $student L'élève
     * @return \DateTimeInterface|null La date du premier cours ou null si aucun cours trouvé
     */
    private function getFirstScheduledCourseDate(Student $student): ?\DateTimeInterface
    {
        $sessions = $student->getSessions();
        $firstCourseDate = null;

        foreach ($sessions as $session) {
            // Exclure les séances découverte (trial_session) et les séances annulées
            if ($session->getSessionType() === 'trial_session' || $session->isIsCanceled()) {
                continue;
            }

            $dateSlot = $session->getDateSlot();
            if ($dateSlot) {
                // Si c'est le premier cours ou si ce cours est antérieur au précédent trouvé
                if ($firstCourseDate === null || $dateSlot < $firstCourseDate) {
                    $firstCourseDate = $dateSlot;
                }
            }
        }

        return $firstCourseDate;
    }
}
