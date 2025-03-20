<?php

namespace App\Entity\LacryoPortailGc;

use Doctrine\ORM\Mapping as ORM;

#[ORM\Table(name: "depenses")]
#[ORM\Entity]
class Depenses
{
    #[ORM\Column(name: "id", type: "integer", nullable: false)]
    #[ORM\Id]
    #[ORM\GeneratedValue(strategy: "IDENTITY")]
    private ?int $id = null;

    #[ORM\Column(name: "date_paiement", type: "date", nullable: false)]
    private \DateTimeInterface $datePaiement;

    #[ORM\Column(name: "intitule", type: "string", length: 255, nullable: false)]
    private string $intitule;

    #[ORM\Column(name: "tarif", type: "float", precision: 10, scale: 0, nullable: false)]
    private float $tarif;

    #[ORM\Column(name: "commentaires", type: "string", length: 255, nullable: true)]
    private ?string $commentaires = null;

    // Getters et Setters

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getDatePaiement(): \DateTimeInterface
    {
        return $this->datePaiement;
    }

    public function setDatePaiement(\DateTimeInterface $datePaiement): self
    {
        $this->datePaiement = $datePaiement;
        return $this;
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

    public function getTarif(): float
    {
        return $this->tarif;
    }

    public function setTarif(float $tarif): self
    {
        $this->tarif = $tarif;
        return $this;
    }

    public function getCommentaires(): ?string
    {
        return $this->commentaires;
    }

    public function setCommentaires(?string $commentaires): self
    {
        $this->commentaires = $commentaires;
        return $this;
    }
}
