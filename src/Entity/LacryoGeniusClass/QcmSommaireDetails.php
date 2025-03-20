<?php

namespace App\Entity\LacryoGeniusClass;

use Doctrine\ORM\Mapping as ORM;

#[ORM\Table(name: "QCM_sommaire_details")]
#[ORM\Entity]
class QcmSommaireDetails
{
    #[ORM\Column(name: "id", type: "integer", nullable: false)]
    #[ORM\Id]
    #[ORM\GeneratedValue(strategy: "IDENTITY")]
    private ?int $id = null;

    #[ORM\Column(name: "id_categorie", type: "string", length: 255, nullable: false)]
    private string $idCategorie;

    #[ORM\Column(name: "sous_categorie", type: "string", length: 255, nullable: false)]
    private string $sousCategorie;

    #[ORM\Column(name: "num_min", type: "integer", nullable: false)]
    private int $numMin;

    #[ORM\Column(name: "num_max", type: "integer", nullable: false)]
    private int $numMax;

    // Getters et Setters

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getIdCategorie(): string
    {
        return $this->idCategorie;
    }

    public function setIdCategorie(string $idCategorie): self
    {
        $this->idCategorie = $idCategorie;
        return $this;
    }

    public function getSousCategorie(): string
    {
        return $this->sousCategorie;
    }

    public function setSousCategorie(string $sousCategorie): self
    {
        $this->sousCategorie = $sousCategorie;
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
}
