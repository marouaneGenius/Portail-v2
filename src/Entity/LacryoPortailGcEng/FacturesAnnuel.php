<?php

namespace App\Entity\LacryoPortailGcEng;

use Doctrine\ORM\Mapping as ORM;

#[ORM\Entity]
#[ORM\Table(name: 'factures_annuel')]
class FacturesAnnuel
{
    #[ORM\Id]
    #[ORM\GeneratedValue(strategy: 'IDENTITY')]
    #[ORM\Column(name: 'id', type: 'integer')]
    private ?int $id = null;

    #[ORM\Column(name: 'intitule', type: 'string', length: 255)]
    private string $intitule;

    #[ORM\Column(name: 'id_abo_annuel', type: 'integer')]
    private int $idAboAnnuel;

    #[ORM\Column(name: 'id_eleve', type: 'integer')]
    private int $idEleve;

    #[ORM\Column(name: 'date_paiement', type: 'date')]
    private \DateTimeInterface $datePaiement;

    #[ORM\Column(name: 'encaisse', type: 'float')]
    private float $encaisse;

    #[ORM\Column(name: 'moyen_paiement', type: 'string', length: 255)]
    private string $moyenPaiement;

    #[ORM\Column(name: 'nombre_seances', type: 'integer')]
    private int $nombreSeances;

    #[ORM\Column(name: 'id_invoice', type: 'string', length: 255, nullable: true)]
    private ?string $idInvoice = null;

    #[ORM\Column(name: 'id_paiement', type: 'string', length: 255, nullable: true)]
    private ?string $idPaiement = null;

    // Getters & Setters

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

    public function getIdAboAnnuel(): int
    {
        return $this->idAboAnnuel;
    }

    public function setIdAboAnnuel(int $idAboAnnuel): self
    {
        $this->idAboAnnuel = $idAboAnnuel;
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

    public function getDatePaiement(): \DateTimeInterface
    {
        return $this->datePaiement;
    }

    public function setDatePaiement(\DateTimeInterface $datePaiement): self
    {
        $this->datePaiement = $datePaiement;
        return $this;
    }

    public function getEncaisse(): float
    {
        return $this->encaisse;
    }

    public function setEncaisse(float $encaisse): self
    {
        $this->encaisse = $encaisse;
        return $this;
    }

    public function getIdPaiement(): ?string
    {
        return $this->idPaiement;
    }

    public function setIdPaiement(?string $idPaiement): self
    {
        $this->idPaiement = $idPaiement;
        return $this;
    }
}
