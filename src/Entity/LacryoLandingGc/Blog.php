<?php

namespace App\Entity\LacryoLandingGc;

use Doctrine\ORM\Mapping as ORM;

#[ORM\Table(name: "blog")]
#[ORM\Entity]
class Blog
{
    #[ORM\Column(name: "id", type: "integer", nullable: false)]
    #[ORM\Id]
    #[ORM\GeneratedValue(strategy: "IDENTITY")]
    private ?int $id = null;

    #[ORM\Column(name: "titre", type: "string", length: 255, nullable: false)]
    private string $titre;

    #[ORM\Column(name: "description", type: "text", length: 65535, nullable: false)]
    private string $description;

    #[ORM\Column(name: "auteur", type: "string", length: 255, nullable: false)]
    private string $auteur;

    #[ORM\Column(name: "date_creation", type: "string", length: 255, nullable: false)]
    private string $dateCreation;

    #[ORM\Column(name: "lien_acces", type: "string", length: 255, nullable: false)]
    private string $lienAcces;

    #[ORM\Column(name: "lien_image", type: "string", length: 255, nullable: false)]
    private string $lienImage;

    #[ORM\Column(name: "popularite", type: "integer", nullable: false)]
    private int $popularite;

    // Getters et Setters

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getTitre(): string
    {
        return $this->titre;
    }

    public function setTitre(string $titre): self
    {
        $this->titre = $titre;
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

    public function getAuteur(): string
    {
        return $this->auteur;
    }

    public function setAuteur(string $auteur): self
    {
        $this->auteur = $auteur;
        return $this;
    }

    public function getDateCreation(): string
    {
        return $this->dateCreation;
    }

    public function setDateCreation(string $dateCreation): self
    {
        $this->dateCreation = $dateCreation;
        return $this;
    }

    public function getLienAcces(): string
    {
        return $this->lienAcces;
    }

    public function setLienAcces(string $lienAcces): self
    {
        $this->lienAcces = $lienAcces;
        return $this;
    }

    public function getLienImage(): string
    {
        return $this->lienImage;
    }

    public function setLienImage(string $lienImage): self
    {
        $this->lienImage = $lienImage;
        return $this;
    }

    public function getPopularite(): int
    {
        return $this->popularite;
    }

    public function setPopularite(int $popularite): self
    {
        $this->popularite = $popularite;
        return $this;
    }
}
