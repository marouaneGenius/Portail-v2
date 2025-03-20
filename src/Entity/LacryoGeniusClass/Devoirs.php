<?php

namespace App\Entity\LacryoGeniusClass;

use Doctrine\ORM\Mapping as ORM;

#[ORM\Table(name: "devoirs")]
#[ORM\Entity]
class Devoirs
{
    #[ORM\Column(name: "id", type: "integer", nullable: false)]
    #[ORM\Id]
    #[ORM\GeneratedValue(strategy: "IDENTITY")]
    private ?int $id = null;

    #[ORM\Column(name: "id_unique", type: "integer", nullable: false)]
    private int $idUnique;

    #[ORM\Column(name: "titre", type: "string", length: 255, nullable: false)]
    private string $titre;

    #[ORM\Column(name: "description", type: "text", length: 65535, nullable: false)]
    private string $description;

    #[ORM\Column(name: "classe", type: "string", length: 255, nullable: false)]
    private string $classe;

    #[ORM\Column(name: "date_post", type: "date", nullable: false)]
    private \DateTimeInterface $datePost;

    #[ORM\Column(name: "id_eleves", type: "integer", nullable: false)]
    private int $idEleves;

    #[ORM\Column(name: "id_createur", type: "integer", nullable: false)]
    private int $idCreateur;

    #[ORM\Column(name: "envoye", type: "integer", nullable: false)]
    private int $envoye = 0;

    #[ORM\Column(name: "date_remis", type: "date", nullable: true)]
    private ?\DateTimeInterface $dateRemis = null;

    // Getters et Setters

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getIdUnique(): int
    {
        return $this->idUnique;
    }

    public function setIdUnique(int $idUnique): self
    {
        $this->idUnique = $idUnique;
        return $this;
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

    public function getClasse(): string
    {
        return $this->classe;
    }

    public function setClasse(string $classe): self
    {
        $this->classe = $classe;
        return $this;
    }

    public function getDatePost(): \DateTimeInterface
    {
        return $this->datePost;
    }

    public function setDatePost(\DateTimeInterface $datePost): self
    {
        $this->datePost = $datePost;
        return $this;
    }

    public function getIdEleves(): int
    {
        return $this->idEleves;
    }

    public function setIdEleves(int $idEleves): self
    {
        $this->idEleves = $idEleves;
        return $this;
    }

    public function getIdCreateur(): int
    {
        return $this->idCreateur;
    }

    public function setIdCreateur(int $idCreateur): self
    {
        $this->idCreateur = $idCreateur;
        return $this;
    }

    public function getEnvoye(): int
    {
        return $this->envoye;
    }

    public function setEnvoye(int $envoye): self
    {
        $this->envoye = $envoye;
        return $this;
    }

    public function getDateRemis(): ?\DateTimeInterface
    {
        return $this->dateRemis;
    }

    public function setDateRemis(?\DateTimeInterface $dateRemis): self
    {
        $this->dateRemis = $dateRemis;
        return $this;
    }
}
