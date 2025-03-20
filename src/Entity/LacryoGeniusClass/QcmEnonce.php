<?php

namespace App\Entity\LacryoGeniusClass;

use Doctrine\ORM\Mapping as ORM;

#[ORM\Table(name: "QCM_enonce")]
#[ORM\Entity]
class QcmEnonce
{
    #[ORM\Column(name: "id", type: "integer", nullable: false)]
    #[ORM\Id]
    #[ORM\GeneratedValue(strategy: "IDENTITY")]
    private ?int $id = null;

    #[ORM\Column(name: "num_exo", type: "integer", nullable: false)]
    private int $numExo;

    #[ORM\Column(name: "consigne", type: "text", length: 65535, nullable: false)]
    private string $consigne;

    #[ORM\Column(name: "niveau", type: "integer", nullable: false)]
    private int $niveau;

    #[ORM\Column(name: "categorie", type: "text", length: 65535, nullable: true)]
    private ?string $categorie = null;

    #[ORM\Column(name: "sous_categorie", type: "text", length: 65535, nullable: true)]
    private ?string $sousCategorie = null;

    #[ORM\Column(name: "type", type: "integer", nullable: false)]
    private int $type;

    // Getters et Setters

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getNumExo(): int
    {
        return $this->numExo;
    }

    public function setNumExo(int $numExo): self
    {
        $this->numExo = $numExo;
        return $this;
    }

    public function getConsigne(): string
    {
        return $this->consigne;
    }

    public function setConsigne(string $consigne): self
    {
        $this->consigne = $consigne;
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

    public function getCategorie(): ?string
    {
        return $this->categorie;
    }

    public function setCategorie(?string $categorie): self
    {
        $this->categorie = $categorie;
        return $this;
    }

    public function getSousCategorie(): ?string
    {
        return $this->sousCategorie;
    }

    public function setSousCategorie(?string $sousCategorie): self
    {
        $this->sousCategorie = $sousCategorie;
        return $this;
    }

    public function getType(): int
    {
        return $this->type;
    }

    public function setType(int $type): self
    {
        $this->type = $type;
        return $this;
    }
}
