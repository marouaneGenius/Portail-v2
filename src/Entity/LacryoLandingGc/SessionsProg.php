<?php

namespace App\Entity\LacryoLandingGc;

use Doctrine\ORM\Mapping as ORM;

#[ORM\Table(name: "sessions_prog")]
#[ORM\Entity]
class SessionsProg
{
    #[ORM\Column(name: "id", type: "integer", nullable: false)]
    #[ORM\Id]
    #[ORM\GeneratedValue(strategy: "IDENTITY")]
    private ?int $id = null;

    #[ORM\Column(name: "jour", type: "string", length: 255, nullable: false)]
    private string $jour;

    #[ORM\Column(name: "heure_debut", type: "time", nullable: false)]
    private \DateTimeInterface $heureDebut;

    #[ORM\Column(name: "heure_fin", type: "time", nullable: false)]
    private \DateTimeInterface $heureFin;

    // Getters et Setters

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getJour(): string
    {
        return $this->jour;
    }

    public function setJour(string $jour): self
    {
        $this->jour = $jour;
        return $this;
    }

    public function getHeureDebut(): \DateTimeInterface
    {
        return $this->heureDebut;
    }

    public function setHeureDebut(\DateTimeInterface $heureDebut): self
    {
        $this->heureDebut = $heureDebut;
        return $this;
    }

    public function getHeureFin(): \DateTimeInterface
    {
        return $this->heureFin;
    }

    public function setHeureFin(\DateTimeInterface $heureFin): self
    {
        $this->heureFin = $heureFin;
        return $this;
    }
}
