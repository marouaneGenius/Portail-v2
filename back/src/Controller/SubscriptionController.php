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
            'school_subjects' => $subscription->getSchoolSubjects(),
            'session_schedule' => $subscription->getSessionSchedule(),
        ], JsonResponse::HTTP_CREATED);
    }

}
