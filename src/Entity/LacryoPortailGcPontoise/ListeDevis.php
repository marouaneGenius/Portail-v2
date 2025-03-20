<?php

namespace App\Entity\LacryoPortailGcPontoise;

use Doctrine\ORM\Mapping as ORM;

#[ORM\Entity]
#[ORM\Table(name: 'liste_devis')]
class ListeDevis
{
    #[ORM\Id]
    #[ORM\GeneratedValue(strategy: 'IDENTITY')]
    #[ORM\Column(name: 'id', type: 'integer', nullable: false)]
    private ?int $id = null;

    #[ORM\Column(name: 'identifiant', type: 'string', length: 255, nullable: false)]
    private string $identifiant;

    // Getters & Setters

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getIdentifiant(): string
    {
        return $this->identifiant;
    }

    public function setIdentifiant(string $identifiant): self
    {
        $this->identifiant = $identifiant;
        return $this;
    }
}
