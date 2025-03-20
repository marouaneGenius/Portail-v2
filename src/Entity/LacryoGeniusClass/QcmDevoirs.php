<?php

namespace App\Entity\LacryoGeniusClass;

use Doctrine\ORM\Mapping as ORM;

#[ORM\Table(name: "QCM_devoirs")]
#[ORM\Entity]
class QcmDevoirs
{
    #[ORM\Column(name: "id", type: "integer", nullable: false)]
    #[ORM\Id]
    #[ORM\GeneratedValue(strategy: "IDENTITY")]
    private ?int $id = null;

    #[ORM\Column(name: "id_categorie", type: "integer", nullable: false)]
    private int $idCategorie;

    #[ORM\Column(name: "categorie", type: "string", length: 255, nullable: false)]
    private string $categorie;

    #[ORM\Column(name: "id_eleve", type: "integer", nullable: false)]
    private int $idEleve;

    #[ORM\Column(name: "id_createur", type: "integer", nullable: false)]
    private int $idCreateur;

    #[ORM\Column(name: "date_post", type: "date", nullable: false)]
    private \DateTimeInterface $datePost;

    #[ORM\Column(name: "valide", type: "integer", nullable: false, options: ["default" => 1])]
    private int $valide = 1;

    #[ORM\Column(name: "mail_eleve", type: "integer", nullable: false)]
    private int $mailEleve = 0;

    #[ORM\Column(name: "mail_parent", type: "integer", nullable: false)]
    private int $mailParent = 0;

    // Getters et Setters

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getIdCategorie(): int
    {
        return $this->idCategorie;
    }

    public function setIdCategorie(int $idCategorie): self
    {
        $this->idCategorie = $idCategorie;
        return $this;
    }

    public function getCategorie(): string
    {
        return $this->categorie;
    }

    public function setCategorie(string $categorie): self
    {
        $this->categorie = $categorie;
        return $this;
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

    public function getIdCreateur(): int
    {
        return $this->idCreateur;
    }

    public function setIdCreateur(int $idCreateur): self
    {
        $this->idCreateur = $idCreateur;
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

    public function getValide(): int
    {
        return $this->valide;
    }

    public function setValide(int $valide): self
    {
        $this->valide = $valide;
        return $this;
    }

    public function getMailEleve(): int
    {
        return $this->mailEleve;
    }

    public function setMailEleve(int $mailEleve): self
    {
        $this->mailEleve = $mailEleve;
        return $this;
    }

    public function getMailParent(): int
    {
        return $this->mailParent;
    }

    public function setMailParent(int $mailParent): self
    {
        $this->mailParent = $mailParent;
        return $this;
    }
}
