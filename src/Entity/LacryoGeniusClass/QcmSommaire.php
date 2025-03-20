<?php

namespace App\Entity\LacryoGeniusClass;

use Doctrine\ORM\Mapping as ORM;

#[ORM\Table(name: "QCM_sommaire")]
#[ORM\Entity]
class QcmSommaire
{
    #[ORM\Column(name: "id", type: "integer", nullable: false)]
    #[ORM\Id]
    #[ORM\GeneratedValue(strategy: "IDENTITY")]
    private ?int $id = null;

    #[ORM\Column(name: "nom_chapitre", type: "string", length: 255, nullable: false)]
    private string $nomChapitre;

    #[ORM\Column(name: "num_min", type: "integer", nullable: false)]
    private int $numMin;

    #[ORM\Column(name: "num_max", type: "integer", nullable: false)]
    private int $numMax;

    #[ORM\Column(name: "classe", type: "string", length: 255, nullable: false)]
    private string $classe;

    // Getters et Setters

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getNomChapitre(): string
    {
        return $this->nomChapitre;
    }

    public function setNomChapitre(string $nomChapitre): self
    {
        $this->nomChapitre = $nomChapitre;
        return $this;
    }

    public function getNumMin(): int
    {
        return $this->numMin;
    }

    public function setNumMin(int $numMin): self
    {
        $this->numMin = $numMin;
        return $this;
    }

    public function getNumMax(): int
    {
        return $this->numMax;
    }

    public function setNumMax(int $numMax): self
    {
        $this->numMax = $numMax;
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
}
