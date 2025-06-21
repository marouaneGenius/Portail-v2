<?php
// src/Controller/SessionController.php
namespace App\Controller;

use App\Entity\Session;
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

        return $this->createPaymentLink($session, $request);

        // 5) réponse
        // return new JsonResponse([
        //     'id'            => $session->getId(),
        //     'payment_date'  => $session->getPaymentDate()->format('Y-m-d'),
        //     'date_slot'     => $session->getDateSlot()->format('Y-m-d'),
        //     'tutor_id'      => $tutor->getId(),
        //     'student_ids'   => array_map(fn($s)=> $s->getId(), $students),
        //     'subscription_ids' => array_map(fn($s)=> $s->getId(), $subs),
        // ], JsonResponse::HTTP_CREATED);
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
