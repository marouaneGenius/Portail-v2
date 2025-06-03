<?php
namespace App\Controller;

use App\Entity\TutorSchedule;
use App\Repository\CenterRepository;
use App\Repository\TutorScheduleRepository;
use App\Repository\UserRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Annotation\Route;

#[Route('/api/test', name: 'api_test_')]
class TestController extends AbstractController
{

    public function __construct(
        private EntityManagerInterface $em,
        private CenterRepository       $centerRepo,
        private TutorScheduleRepository $tutorScheduleRepository,
        private UserRepository $userRepository,
        private CenterRepository $centerRepository
    ) {}

    #[Route('', name: 'create', methods: ['POST'])]
    public function create(Request $request): JsonResponse
    {
    
        return $this->json([
            'message'   => 'Création des créneaux réussie',
            'schedules' => 'test',
        ], 201);
    }
}