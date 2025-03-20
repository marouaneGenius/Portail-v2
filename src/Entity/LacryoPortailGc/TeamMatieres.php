<?php

namespace App\Entity\LacryoPortailGc;

use Doctrine\ORM\Mapping as ORM;

#[ORM\Table(name: "team_matieres")]
#[ORM\Entity]
class TeamMatieres
{
    #[ORM\Column(name: "id", type: "integer", nullable: false)]
    #[ORM\Id]
    #[ORM\GeneratedValue(strategy: "IDENTITY")]
    private ?int $id = null;

    #[ORM\Column(name: "id_tuteur", type: "integer", nullable: false)]
    private int $idTuteur;

    #[ORM\Column(name: "matiere", type: "string", length: 255, nullable: false)]
    private string $matiere;

    #[ORM\Column(name: "niveau", type: "integer", nullable: false)]
    private int $niveau;

    // Getters et Setters

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getIdTuteur(): int
    {
        return $this->idTuteur;
    }

    public function setIdTuteur(int $idTuteur): self
    {
        $this->idTuteur = $idTuteur;
        return $this;
    }

    public function getMatiere(): string
    {
        return $this->matiere;
    }

    public function setMatiere(string $matiere): self
    {
        $this->matiere = $matiere;
        return $this;
    }

    public function getNiveau(): int
    {
        return $this->niveau;
    }

    public function setNiveau(int $niveau): self
    {
        $this->niveau = $niveau;
        return $this;
    }
}
