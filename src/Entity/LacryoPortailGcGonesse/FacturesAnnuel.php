<?php

namespace App\Entity\LacryoPortailGcGonesse;

use Doctrine\ORM\Mapping as ORM;

#[ORM\Entity]
#[ORM\Table(name: 'factures_annuel')]
class FacturesAnnuel
{
    #[ORM\Id]
    #[ORM\GeneratedValue(strategy: 'IDENTITY')]
    #[ORM\Column(name: 'id', type: 'integer', nullable: false)]
    private ?int $id = null;

    #[ORM\Column(name: 'intitule', type: 'string', length: 255, nullable: false)]
    private string $intitule;

    #[ORM\Column(name: 'id_abo_annuel', type: 'integer', nullable: false)]
    private int $idAboAnnuel;

    #[ORM\Column(name: 'id_eleve', type: 'integer', nullable: false)]
    private int $idEleve;

    #[ORM\Column(name: 'date_paiement', type: 'date', nullable: false)]
    private \DateTimeInterface $datePaiement;

    #[ORM\Column(name: 'encaisse', type: 'float', precision: 10, scale: 0, nullable: false)]
    private float $encaisse;

    #[ORM\Column(name: 'moyen_paiement', type: 'string', length: 255, nullable: false)]
    private string $moyenPaiement;

    #[ORM\Column(name: 'nombre_seances', type: 'integer', nullable: false)]
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

    public function getMoyenPaiement(): string
    {
        return $this->moyenPaiement;
    }

    public function setMoyenPaiement(string $moyenPaiement): self
    {
        $this->moyenPaiement = $moyenPaiement;
        return $this;
    }

    public function getNombreSeances(): int
    {
        return $this->nombreSeances;
    }

    public function setNombreSeances(int $nombreSeances): self
    {
        $this->nombreSeances = $nombreSeances;
        return $this;
    }

    public function getIdInvoice(): ?string
    {
        return $this->idInvoice;
    }

    public function setIdInvoice(?string $idInvoice): self
    {
        $this->idInvoice = $idInvoice;
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
