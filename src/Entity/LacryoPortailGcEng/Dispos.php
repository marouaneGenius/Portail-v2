<?php

namespace App\Entity\LacryoPortailGcEng;

use Doctrine\ORM\Mapping as ORM;

#[ORM\Table(name: "dispos")]
#[ORM\Entity]
class Dispos
{
    #[ORM\Column(name: "id", type: "integer", nullable: false)]
    #[ORM\Id]
    #[ORM\GeneratedValue(strategy: "IDENTITY")]
    private ?int $id = null;

    #[ORM\Column(name: "classe", type: "string", length: 255, nullable: false)]
    private string $classe;

    #[ORM\Column(name: "matieres", type: "string", length: 255, nullable: false)]
    private string $matieres;

    #[ORM\Column(name: "jour", type: "string", length: 255, nullable: false)]
    private string $jour;

    #[ORM\Column(name: "heure", type: "string", length: 255, nullable: false)]
    private string $heure;

    #[ORM\Column(name: "quantite", type: "integer", nullable: false)]
    private int $quantite;

    #[ORM\Column(name: "tuteur", type: "integer", nullable: false)]
    private int $tuteur;

    // Getters et Setters

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getClasse(): string
    {
        return $this->classe;
    }

    public function setClasse(string $classe): self
    {
        $this->classe = $classe;
        return $this;
    }

    public function getMatieres(): string
    {
        return $this->matieres;
    }

    public function setMatieres(string $matieres): self
    {
        $this->matieres = $matieres;
        return $this;
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

    public function getHeure(): string
    {
        return $this->heure;
    }

    public function setHeure(string $heure): self
    {
        $this->heure = $heure;
        return $this;
    }

    public function getQuantite(): int
    {
        return $this->quantite;
    }

    public function setQuantite(int $quantite): self
    {
        $this->quantite = $quantite;
        return $this;
    }

    public function getTuteur(): int
    {
        return $this->tuteur;
    }

    public function setTuteur(int $tuteur): self
    {
        $this->tuteur = $tuteur;
        return $this;
    }
}
