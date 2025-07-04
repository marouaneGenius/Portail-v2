<?php
// src/Controller/SessionController.php
namespace App\Controller;

use App\Entity\Session;
use App\Repository\CenterRepository;
use App\Repository\SessionRepository;
use App\Repository\UserRepository;
use App\Repository\StudentRepository;
use App\Repository\SubscriptionRepository;
use App\Service\ZapierSmsSender;
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
        private readonly StripeClient $stripe ,
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

        if($data['session_type'] === 'trial_session') {
            return $this->createPaymentLink($session, $request);

        } else {
        // 5) réponse
        return new JsonResponse([
            'id'            => $session->getId(),
            'payment_date'  => $session->getPaymentDate()->format('Y-m-d'),
            'date_slot'     => $session->getDateSlot()->format('Y-m-d'),
            'tutor_id'      => $tutor->getId(),
            'center_id'         => $center->getId(),
            'student_ids'   => array_map(fn($s)=> $s->getId(), $students),
            'subscription_ids' => array_map(fn($s)=> $s->getId(), $subs),
        ], JsonResponse::HTTP_CREATED);
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
    public function sessionsByCenterAndScheduledDate( int     $id, Request $request,  CenterRepository $centerRepo): JsonResponse {

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
    
        $data = $this->sessionRepo->getTutorsAndSessionsWithStudentsByCenterAndDate($center, $date);
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

        $updated = 0;
        foreach ($sessions as $s) {
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
            $stripe = new \Stripe\StripeClient($_ENV['TEST_STRIPE_PRIVATE_KEY']);
            $price = $stripe->prices->create([
                'unit_amount'   => 3000,
                'currency'      => 'eur',
                'product_data'  => [
                    'name'        => 'Session de cours – ' . $session->getSessionType(),
                ],
            ]);
    
            // 4. Créer le lien de paiement Stripe
            $paymentLink = $stripe->paymentLinks->create([
                'line_items' => [
                    [
                        'price'    => $price->id,  
                        'quantity' => 1,
                    ],
                ],
                'metadata' => [
                    'session_id' => $session->getId(),
                    'student_id' => $student->getId()
                ],
            ]);
    
            // 5. Mettre à jour la session
            $session->setStripeNumber($paymentLink->id);
            $session->setIsPaid(false); // Explicitement marqué comme non payé
            $this->em->flush();
    
            // 6. Envoyer le SMS
            $student = $session->getIdStudent()->first();

            $parents = $student->getIdParent();

            // On récupère le premier parent (ou null s’il n’y en a pas)
            /** @var \App\Entity\StudentParent|null $parent */
            $parent = $parents->first();

            if (!$parent) {
                // pas de parent enregistré : on gère l’erreur comme bon vous semble
                throw new \LogicException('Aucun parent trouvé pour cet étudiant');
            }

            // on peut maintenant appeler getPhone() sur l’entité StudentParent
            $phone = $parent->getPhone();

            $centre      = $student->getIdCenter()->getCity();
            $dateCours   = $session->getDateSlot();
            // supposons que vous avez enregistré l'heure de début dans ScheduledAt
            $heureDebut  = $session->getScheduledAt() instanceof \DateTimeImmutable
                ? $session->getScheduledAt()->format('H:i')
                : $session->getDateSlot()->format('H:i');
            $ville       = $student->getIdCenter()->getCity();
            $adresse     = $student->getIdCenter()->getAddress() ?? '';
            $prenom      = $student->getFirstname();
            $link        = $paymentLink->url;

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
                'payment_link' => $paymentLink->url,
                'session_id' => $session->getId(),
                'expires_at' => date('c', time() + 7 * 24 * 60 * 60), // ISO 8601
                'is_paid' => false,
                'message' => 'Lien de paiement envoyé par SMS'
            ]);
    
        } catch (\Exception $e) {
            return new JsonResponse(
                ['error' => 'Erreur lors de la création du paiement: ' . $e->getMessage()], 
                JsonResponse::HTTP_INTERNAL_SERVER_ERROR
            );
        }
    }

    #[Route('/move-future-slots/{id}', name: 'session_move_future_slots', methods: ['PATCH'])]
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


    
        // Modifier seulement UNE séance
        if (!$updateAll) {
            $session->setScheduledAt(new \DateTimeImmutable($data['scheduled_at']));
            if ($newTutor) {
                $session->setIdTutor($newTutor);
            }
            if (array_key_exists('updated_by', $data)) {
                $session->setUpdatedBy($data['updated_by']);
            }

            $this->em->persist($session);
            $this->em->flush();
    
            return new JsonResponse([
                'id' => $session->getId(),
                'scheduled_at' => $session->getScheduledAt()?->format(\DateTime::ATOM),
                'tutor_id' => $session->getIdTutor()?->getId(),
                'multiple' => false
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
    
        $sessions = $this->sessionRepo->findByStudentAndCenterAndPeriod(
            $studentId,
            $session->getCenter(),
            $startPeriod,
            $endPeriod
        );
    
        $updated = 0;
        $newDatetime = new \DateTimeImmutable($data['scheduled_at']);
        $targetDow = (int)$newDatetime->format('w');
        $targetHour = (int)$newDatetime->format('H');
        $targetMinute = (int)$newDatetime->format('i');
    
        foreach ($sessions as $s) {
            // On ne touche qu’aux séances à venir
            if ($s->getScheduledAt() < new \DateTimeImmutable('today')) continue;
    
            // Calcul dynamique du jour et heure
            $currentDate = $s->getScheduledAt();
            $currentDow = (int)$currentDate->format('w');
            $delta = ($targetDow - $currentDow + 7) % 7;
            // Pour éviter de garder le même créneau si même jour
            if ($delta === 0) $delta = 7;
    
            $newSessionDate = $currentDate->modify("+$delta days")->setTime($targetHour, $targetMinute);
            $s->setScheduledAt($newSessionDate);
    
            if ($newTutor) {
                $s->setIdTutor($newTutor);
            }

            if (array_key_exists('updated_by', $data)) {
                $session->setUpdatedBy($data['updated_by']);
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
            // ⚠️ Prend toutes les séances à partir d'aujourd'hui (pas la date de la session courante)
            $startPeriod = new \DateTimeImmutable('today');
    
            $sessions = $this->sessionRepo->findByStudentAndCenterAndPeriod(
                $studentId,
                $session->getCenter(),
                $startPeriod,
                $endPeriod
            );

            // dd($sessions);
    
            $updated = 0;
            foreach ($sessions as $s) {
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
    

    // #[Route('/test-sms', name: 'test_sms', methods: ['POST'])]
    // public function __invoke(Request $request): JsonResponse
    // {
    //     $data = json_decode($request->getContent(), true);
    //     if (!\is_array($data)) {
    //         throw new BadRequestHttpException('Corps invalide, JSON attendu.');
    //     }

    //     // Vérification des champs obligatoires
    //     foreach (['to','centre','dateCours','heureDebut','ville','adresse','prenom','link'] as $field) {
    //         if (empty($data[$field])) {
    //             throw new BadRequestHttpException("Le champ « $field » est requis.");
    //         }
    //     }

    //     try {
    //         $ok = $this->smsSender->sendSessionPaymentLink(
    //             $data['to'],
    //             $data['centre'],
    //             new \DateTimeImmutable($data['dateCours']),
    //             $data['heureDebut'],
    //             $data['ville'],
    //             $data['adresse'],
    //             $data['prenom'],
    //             $data['link']
    //         );

    //         if (!$ok) {
    //             return new JsonResponse(
    //                 ['status'=>'Erreur lors de l’envoi du SMS'],
    //                 JsonResponse::HTTP_INTERNAL_SERVER_ERROR
    //             );
    //         }

    //         return new JsonResponse(
    //             ['status'=>'SMS envoyé en test', 'to'=>$data['to'], 'payload'=>$data],
    //             JsonResponse::HTTP_OK
    //         );
    //     } catch (\Exception $e) {
    //         return new JsonResponse(
    //             ['error'=>$e->getMessage()],
    //             JsonResponse::HTTP_BAD_REQUEST
    //         );
    //     }
    // }

}
