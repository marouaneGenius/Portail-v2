<?php

namespace App\Entity\LacryoPortailGc;

use Doctrine\ORM\Mapping as ORM;

#[ORM\Table(name: "grille_competeneces")]
#[ORM\Entity]
class GrilleCompeteneces
{
    #[ORM\Column(name: "id", type: "integer", nullable: false)]
    #[ORM\Id]
    #[ORM\GeneratedValue(strategy: "IDENTITY")]
    private ?int $id = null;

    #[ORM\Column(name: "classe", type: "string", length: 255, nullable: false)]
    private string $classe;

    #[ORM\Column(name: "matiere", type: "string", length: 255, nullable: false)]
    private string $matiere;

    #[ORM\Column(name: "chapitre", type: "string", length: 255, nullable: false)]
    private string $chapitre;

    #[ORM\Column(name: "competence", type: "string", length: 255, nullable: false)]
    private string $competence;

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

    public function getMatiere(): string
    {
        return $this->matiere;
    }

    public function setMatiere(string $matiere): self
    {
        $this->matiere = $matiere;
        return $this;
    }

    public function getChapitre(): string
    {
        return $this->chapitre;
    }

    public function setChapitre(string $chapitre): self
    {
        $this->chapitre = $chapitre;
        return $this;
    }

    public function getCompetence(): string
    {
        return $this->competence;
    }

    public function setCompetence(string $competence): self
    {
        $this->competence = $competence;
        return $this;
    }
}
