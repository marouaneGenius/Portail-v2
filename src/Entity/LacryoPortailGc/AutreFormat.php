<?php

namespace App\Entity\LacryoPortailGc;

use Doctrine\ORM\Mapping as ORM;

#[ORM\Table(name: "autre_format")]
#[ORM\Entity]
class AutreFormat
{
    #[ORM\Column(name: "id", type: "integer", nullable: false)]
    #[ORM\Id]
    #[ORM\GeneratedValue(strategy: "IDENTITY")]
    private ?int $id = null;

    #[ORM\Column(name: "id_eleve", type: "integer", nullable: false)]
    private int $idEleve;

    #[ORM\Column(name: "date_paiement", type: "date", nullable: true)]
    private ?\DateTimeInterface $datePaiement = null;

    #[ORM\Column(name: "intitule", type: "string", length: 255, nullable: false)]
    private string $intitule;

    #[ORM\Column(name: "nombre_seances", type: "integer", nullable: false)]
    private int $nombreSeances;

    #[ORM\Column(name: "nb_seances_reglees", type: "string", length: 255, nullable: false)]
    private string $nbSeancesReglees = '0';

    #[ORM\Column(name: "prix", type: "float", precision: 10, scale: 0, nullable: false)]
    private float $prix;

    #[ORM\Column(name: "encaisse", type: "float", precision: 10, scale: 0, nullable: false)]
    private float $encaisse;

    #[ORM\Column(name: "moyen_paiement", type: "string", length: 255, nullable: true)]
    private ?string $moyenPaiement = null;

    #[ORM\Column(name: "statut_paiement", type: "integer", nullable: false)]
    private int $statutPaiement;

    #[ORM\Column(name: "actif", type: "integer", nullable: false, options: ["default" => 1])]
    private int $actif = 1;

    #[ORM\Column(name: "num_stripe", type: "string", length: 255, nullable: true)]
    private ?string $numStripe = null;

    #[ORM\Column(name: "matieres", type: "string", length: 255, nullable: true)]
    private ?string $matieres = null;

    #[ORM\Column(name: "planification", type: "string", length: 255, nullable: true)]
    private ?string $planification = null;

    #[ORM\Column(name: "resume", type: "text", length: 65535, nullable: true)]
    private ?string $resume = null;

    // Getters et Setters

    public function getId(): ?int
    {
        return $this->id;
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

    public function getDatePaiement(): ?\DateTimeInterface
    {
        return $this->datePaiement;
    }

    public function setDatePaiement(?\DateTimeInterface $datePaiement): self
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

    public function getNombreSeances(): int
    {
        return $this->nombreSeances;
    }

    public function setNombreSeances(int $nombreSeances): self
    {
        $this->nombreSeances = $nombreSeances;
        return $this;
    }

    public function getNbSeancesReglees(): string
    {
        return $this->nbSeancesReglees;
    }

    public function setNbSeancesReglees(string $nbSeancesReglees): self
    {
        $this->nbSeancesReglees = $nbSeancesReglees;
        return $this;
    }

    public function getPrix(): float
    {
        return $this->prix;
    }

    public function setPrix(float $prix): self
    {
        $this->prix = $prix;
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

    public function getMoyenPaiement(): ?string
    {
        return $this->moyenPaiement;
    }

    public function setMoyenPaiement(?string $moyenPaiement): self
    {
        $this->moyenPaiement = $moyenPaiement;
        return $this;
    }

    public function getStatutPaiement(): int
    {
        return $this->statutPaiement;
    }

    public function setStatutPaiement(int $statutPaiement): self
    {
        $this->statutPaiement = $statutPaiement;
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

    public function getNumStripe(): ?string
    {
        return $this->numStripe;
    }

    public function setNumStripe(?string $numStripe): self
    {
        $this->numStripe = $numStripe;
        return $this;
    }

    public function getMatieres(): ?string
    {
        return $this->matieres;
    }

    public function setMatieres(?string $matieres): self
    {
        $this->matieres = $matieres;
        return $this;
    }

    public function getPlanification(): ?string
    {
        return $this->planification;
    }

    public function setPlanification(?string $planification): self
    {
        $this->planification = $planification;
        return $this;
    }

    public function getResume(): ?string
    {
        return $this->resume;
    }

    public function setResume(?string $resume): self
    {
        $this->resume = $resume;
        return $this;
    }
}
