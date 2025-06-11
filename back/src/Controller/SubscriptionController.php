<?php

namespace App\Controller;

use App\Entity\Subscription;
use App\Repository\CenterRepository;
use App\Repository\SubscriptionRepository;
use App\Repository\StudentRepository;
use App\Repository\UserRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\PasswordHasher\Hasher\UserPasswordHasherInterface;
use Symfony\Component\Routing\Annotation\Route;

#[Route('/api/subs', name: 'api_subscription_')]
class SubscriptionController extends AbstractController
{
    private EntityManagerInterface $em;
    private UserPasswordHasherInterface $passwordHasher;
    private CenterRepository $centerRepository;

    public function __construct(
        EntityManagerInterface $em,
        CenterRepository $centerRepository,
        SubscriptionRepository $subscriptionRepository,
        StudentRepository $studentRepository,
        private UserRepository $userRepository
    ) {
        $this->em               = $em;
        $this->centerRepository = $centerRepository;
        $this->subscriptionRepository = $subscriptionRepository;
        $this->studentRepository = $studentRepository;
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
        $subscription->setIsValide($data['is_valide'] ?? true);
        $subscription->setPaymentMode($data['payment_mode'] ?? null);
        $subscription->setCaution($data['caution'] ?? false);
        $subscription->setFavoriteSlots($data['favorite_slots'] ?? null);
        $subscription->setCreatedBy($data['created_by']);

        $subscription->setUpdatedBy(null);
        $subscription->setSessionPerWeek($data['session_per_week'] ?? null);
        $subscription->setWeekCount($data['week_count'] ?? null);
        $subscription->setSelectedWeeks($data['selected_weeks'] ?? null);
        $subscription->setKnownWeeks($data['known_weeks'] ?? null);

        // Sessions (si données comme array d’IDs)
        // if (!empty($data['sessions']) && is_array($data['sessions'])) {
        //     foreach ($data['sessions'] as $sessionId) {
        //         $session = $this->sessionRepository->find($sessionId);
        //         if ($session) {
        //             $subscription->addSession($session);
        //         }
        //     }
        // }
    
    
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

            'student' => $student ? [
                'id'        => $student->getId(),
                'firstname' => $student->getFirstname(),
                'lastname'  => $student->getLastname(),
            ] : null,
            'sessions' => array_map(fn($s) => [
                'id'         => $s->getId(),
                'start_time' => $s->getStartTime()?->format('Y-m-d H:i:s'),
                'end_time'   => $s->getEndTime()?->format('Y-m-d H:i:s'),
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
            'created_at' => $subscription->getCreatedAt()?->format(\DateTimeInterface::ATOM),
            'created_by' => $subscription->getCreatedBy(),
            'updated_at' => $subscription->getUpdatedAt()?->format(\DateTimeInterface::ATOM),
            'updated_by' => $subscription->getUpdatedBy(),
            // ajoute les champs nécessaires…
        ], $subs);

        return new JsonResponse($data, JsonResponse::HTTP_OK);
    }
}
