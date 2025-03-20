<?php

namespace App\Entity\LacryoGeniusHome;

use Doctrine\ORM\Mapping as ORM;

#[ORM\Table(name: "inscription")]
#[ORM\Entity]
class Inscription
{
    #[ORM\Column(name: "id", type: "integer", nullable: false)]
    #[ORM\Id]
    #[ORM\GeneratedValue(strategy: "IDENTITY")]
    private ?int $id = null;

    #[ORM\Column(name: "date_in", type: "string", length: 255, nullable: false)]
    private string $dateIn;

    #[ORM\Column(name: "prenom", type: "string", length: 255, nullable: false)]
    private string $prenom;

    #[ORM\Column(name: "nom", type: "string", length: 255, nullable: false)]
    private string $nom;

    #[ORM\Column(name: "num_tel", type: "string", length: 255, nullable: false)]
    private string $numTel;

    #[ORM\Column(name: "classe", type: "string", length: 255, nullable: false)]
    private string $classe;

    #[ORM\Column(name: "matieres", type: "string", length: 255, nullable: false)]
    private string $matieres;

    // Getters et Setters

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getDateIn(): string
    {
        return $this->dateIn;
    }

    public function setDateIn(string $dateIn): self
    {
        $this->dateIn = $dateIn;
        return $this;
    }

    public function getPrenom(): string
    {
        return $this->prenom;
    }

    public function setPrenom(string $prenom): self
    {
        $this->prenom = $prenom;
        return $this;
    }

    public function getNom(): string
    {
        return $this->nom;
    }

    public function setNom(string $nom): self
    {
        $this->nom = $nom;
        return $this;
    }

    public function getNumTel(): string
    {
        return $this->numTel;
    }

    public function setNumTel(string $numTel): self
    {
        $this->numTel = $numTel;
        return $this;
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
}
