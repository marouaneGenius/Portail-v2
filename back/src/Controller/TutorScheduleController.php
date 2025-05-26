<?php
namespace App\Controller;

use App\Entity\Center;
use App\Entity\TutorSchedule;
use App\Repository\CenterRepository;
use App\Repository\TutorScheduleRepository;
use App\Repository\UserRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Annotation\Route;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\IsGranted;

#[Route('/api/tutorschedule')]
class TutorScheduleController extends AbstractController
{

    public function __construct(
        private EntityManagerInterface $em,
        private CenterRepository       $centerRepo,
        private TutorScheduleRepository $tutorScheduleRepository,
        private UserRepository $userRepository,
        private CenterRepository $centerRepository


    ) {}

    #[Route('', name: 'api_tutorschedule_create', methods: ['POST'])]
    // #[IsGranted('ROLE_USER')]
    public function create(Request $request): JsonResponse
    {
        $data = json_decode($request->getContent(), true);
        if (!is_array($data)) {
            return $this->json(['error' => 'Invalid JSON'], 400);
        }
    
        if (empty($data['schedules']) || !is_array($data['schedules'])) {
            return $this->json(['error' => 'Le champ "schedules" est requis et doit être un tableau'], 422);
        }
    
        $created = [];
        foreach ($data['schedules'] as $slot) {
            if (empty($slot['day']) || empty($slot['start_hour']) || empty($slot['end_hour']) || empty($slot['id']) || empty($slot['center'])) {
                return $this->json(['error' => 'Chaque créneau doit contenir day, start_hour, end_hour, id_user et center_ids (tableau)'], 422);
            }
    
            $startHour = \DateTimeImmutable::createFromFormat('H:i', $slot['start_hour']);
            $endHour = \DateTimeImmutable::createFromFormat('H:i', $slot['end_hour']);
            if (!$startHour || !$endHour) {
                return $this->json(['error' => 'Format horaire invalide dans un créneau'], 422);
            }
    
            $user = $this->userRepository->find($slot['id']);
            if (!$user) {
                return $this->json(['error' => 'Utilisateur non trouvé'], 404);
            }
    
            $tutorSchedule = new TutorSchedule();
            $tutorSchedule
                ->setDay($slot['day'])
                ->setStartHour($startHour)
                ->setEndHour($endHour)
                ->setIdUser($user);
    
            // foreach ($slot['center'] as $centerId) {
                $center = $this->centerRepository->find($slot['center'] );
                if ($center) {
                    $tutorSchedule->addCenter($center);
                } else {
                    return $this->json(['error' => 'Centre avec ID ' . $slot['center']. ' non trouvé'], 404);
                }
            // }
    
            $this->em->persist($tutorSchedule);
    
            $created[] = [
                'day'        => $slot['day'],
                'start_hour' => $startHour->format('H:i'),
                'end_hour'   => $endHour->format('H:i'),
                'id'    => $user->getId(),
                'center' => $slot['center'],
            ];
        }
    
        $this->em->flush();
    
        return $this->json([
            'message'   => 'Création des créneaux réussie',
            'schedules' => $created,
        ], 201);
    }
}