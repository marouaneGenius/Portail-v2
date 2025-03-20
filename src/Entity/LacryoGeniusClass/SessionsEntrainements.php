<?php

namespace App\Entity\LacryoGeniusClass;

use Doctrine\ORM\Mapping as ORM;

#[ORM\Table(name: "sessions_entrainements")]
#[ORM\Entity]
class SessionsEntrainements
{
    #[ORM\Column(name: "id", type: "integer", nullable: false)]
    #[ORM\Id]
    #[ORM\GeneratedValue(strategy: "IDENTITY")]
    private ?int $id = null;

    #[ORM\Column(name: "id_eleve", type: "integer", nullable: false)]
    private int $idEleve;

    #[ORM\Column(name: "categorie", type: "integer", nullable: false)]
    private int $categorie;

    #[ORM\Column(name: "niveau", type: "integer", nullable: false, options: ["default" => 1])]
    private int $niveau = 1;

    #[ORM\Column(name: "progression", type: "float", precision: 10, scale: 0, nullable: false)]
    private float $progression = 0;

    // Getters et Setters

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getIdEleve(): int
    {
        return $this->idEleve;
    }

    public function setIdEleve(int $idEleve): self
    {
        $this->idEleve = $idEleve;
        return $this;
    }

    public function getCategorie(): int
    {
        return $this->categorie;
    }

    public function setCategorie(int $categorie): self
    {
        $this->categorie = $categorie;
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

    public function getProgression(): float
    {
        return $this->progression;
    }

    public function setProgression(float $progression): self
    {
        $this->progression = $progression;
        return $this;
    }
}
