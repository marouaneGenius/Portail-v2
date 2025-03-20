<?php

namespace App\Repository\LacryoPortailGc;

use App\Entity\LacryoPortailGc;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

class TeamMembersRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, TeamMembersRepository::class);
    }
    
    // Ajoute ici tes méthodes personnalisées, par exemple :
    // public function findBySomething($value) { ... }
}
