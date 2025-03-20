<?php

namespace App\Entity\LacryoLacryoLanding;

use Doctrine\ORM\Mapping as ORM;

#[ORM\Table(name: "produit")]
#[ORM\Entity]
class Produit
{
    #[ORM\Column(name: "id", type: "integer", nullable: false)]
    #[ORM\Id]
    #[ORM\GeneratedValue(strategy: "IDENTITY")]
    private ?int $id = null;

    #[ORM\Column(name: "intitule", type: "string", length: 255, nullable: false)]
    private string $intitule;

    #[ORM\Column(name: "description", type: "string", length: 255, nullable: false)]
    private string $description;

    #[ORM\Column(name: "prix", type: "integer", nullable: false)]
    private int $prix;

    #[ORM\Column(name: "categorie", type: "integer", nullable: false)]
    private int $categorie;

    // Getters et Setters

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getIntitule(): string
    {
        return $this->intitule;
    }

    public function setIntitule(string $intitule): self
    {
        $this->intitule = $intitule;
        return $this;
    }

    public function getDescription(): string
    {
        return $this->description;
    }

    public function setDescription(string $description): self
    {
        $this->description = $description;
        return $this;
    }

    public function getPrix(): int
    {
        return $this->prix;
    }

    public function setPrix(int $prix): self
    {
        $this->prix = $prix;
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
}
