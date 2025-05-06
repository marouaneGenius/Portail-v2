<?php


namespace App\Controller\DashboardController;

use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;
use App\Entity\LacryoPortailGc\TeamMembres;

class DashboardController extends AbstractController
{
    #[Route('/', name: 'welcom')]
    public function index(): Response
    {
        return new Response('welcom');
    }

    #[Route('/team', name: 'team_members_index')]
    public function loadAllUsers(ManagerRegistry $doctrine): Response
    {
        $em = $doctrine->getManager('lacryo_portail_gc');
        
        $repository = $em->getRepository(TeamMembres::class);

        $teamMembers = $repository->findAll();

        dd($teamMembers);

        return $this->render('dashboard/index.html.twig', [
            'teamMembers' => $teamMembers,
        ]);
    }
}


