<?php

namespace App\Entity\LacryoPortailGcGonesse;

use Doctrine\ORM\Mapping as ORM;

#[ORM\Entity]
#[ORM\Table(name: 'demande_annulation_tuteur')]
class DemandeAnnulationTuteur
{
    #[ORM\Id]
    #[ORM\GeneratedValue(strategy: 'IDENTITY')]
    #[ORM\Column(name: 'id', type: 'integer', nullable: false)]
    private ?int $id = null;

    #[ORM\Column(name: 'date_cours', type: 'date', nullable: false)]
    private \DateTimeInterface $dateCours;

    #[ORM\Column(name: 'heure_debut', type: 'string', length: 255, nullable: false)]
    private string $heureDebut;

    #[ORM\Column(name: 'id_team', type: 'integer', nullable: false)]
    private int $idTeam;

    #[ORM\Column(name: 'statut', type: 'integer', nullable: false)]
    private int $statut = 0;

    #[ORM\Column(name: 'id_switch', type: 'integer', nullable: true)]
    private ?int $idSwitch = null;

    // Getters & Setters

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getDateCours(): \DateTimeInterface
    {
        return $this->dateCours;
    }

    public function setDateCours(\DateTimeInterface $dateCours): self
    {
        $this->dateCours = $dateCours;
        return $this;
    }

    public function getHeureDebut(): string
    {
        return $this->heureDebut;
    }

    public function setHeureDebut(string $heureDebut): self
    {
        $this->heureDebut = $heureDebut;
        return $this;
    }

    public function getIdTeam(): int
    {
        return $this->idTeam;
    }

    public function setIdTeam(int $idTeam): self
    {
        $this->idTeam = $idTeam;
        return $this;
    }

    public function getStatut(): int
    {
        return $this->statut;
    }

    public function setStatut(int $statut): self
    {
        $this->statut = $statut;
        return $this;
    }

    public function getIdSwitch(): ?int
    {
        return $this->idSwitch;
    }

    public function setIdSwitch(?int $idSwitch): self
    {
        $this->idSwitch = $idSwitch;
        return $this;
    }
}
