<?php

namespace App\Entity\LacryoPortailGcAss;

use Doctrine\ORM\Mapping as ORM;

#[ORM\Table(name: "caution")]
#[ORM\Entity]
class Caution
{
    #[ORM\Column(name: "id", type: "integer", nullable: false)]
    #[ORM\Id]
    #[ORM\GeneratedValue(strategy: "IDENTITY")]
    private ?int $id = null;

    #[ORM\Column(name: "id_caution", type: "integer", nullable: false)]
    private int $idCaution;

    #[ORM\Column(name: "montant", type: "float", precision: 10, scale: 0, nullable: false)]
    private float $montant;

    #[ORM\Column(name: "moyen_paiement", type: "string", length: 255, nullable: false)]
    private string $moyenPaiement;

    #[ORM\Column(name: "id_eleve", type: "integer", nullable: false)]
    private int $idEleve;

    #[ORM\Column(name: "actif", type: "integer", nullable: false, options: ["default" => 1])]
    private int $actif = 1;

    #[ORM\Column(name: "date_soumis", type: "date", nullable: true)]
    private ?\DateTimeInterface $dateSoumis = null;

    // Getters et Setters

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getIdCaution(): int
    {
        return $this->idCaution;
    }

    public function setIdCaution(int $idCaution): self
    {
        $this->idCaution = $idCaution;
        return $this;
    }

    public function getMontant(): float
    {
        return $this->montant;
    }

    public function setMontant(float $montant): self
    {
        $this->montant = $montant;
        return $this;
    }

    public function getMoyenPaiement(): string
    {
        return $this->moyenPaiement;
    }

    public function setMoyenPaiement(string $moyenPaiement): self
    {
        $this->moyenPaiement = $moyenPaiement;
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

    public function getActif(): int
    {
        return $this->actif;
    }

    public function setActif(int $actif): self
    {
        $this->actif = $actif;
        return $this;
    }

    public function getDateSoumis(): ?\DateTimeInterface
    {
        return $this->dateSoumis;
    }

    public function setDateSoumis(?\DateTimeInterface $dateSoumis): self
    {
        $this->dateSoumis = $dateSoumis;
        return $this;
    }
}
