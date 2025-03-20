<?php

namespace App\Entity\LacryoPortailGcAss;

use Doctrine\ORM\Mapping as ORM;

#[ORM\Table(name: "abonnements")]
#[ORM\Entity]
class Abonnements
{
    #[ORM\Column(name: "id", type: "integer", nullable: false)]
    #[ORM\Id]
    #[ORM\GeneratedValue(strategy: "IDENTITY")]
    private ?int $id = null;

    #[ORM\Column(name: "id_eleve", type: "integer", nullable: false)]
    private int $idEleve;

    #[ORM\Column(name: "type_abo", type: "integer", nullable: true)]
    private ?int $typeAbo = null;

    #[ORM\Column(name: "date_souscription", type: "date", nullable: true)]
    private ?\DateTimeInterface $dateSouscription = null;

    #[ORM\Column(name: "date_fin", type: "date", nullable: true)]
    private ?\DateTimeInterface $dateFin = null;

    #[ORM\Column(name: "statut_paiement", type: "integer", nullable: false)]
    private int $statutPaiement;

    #[ORM\Column(name: "prix", type: "integer", nullable: false)]
    private int $prix;

    #[ORM\Column(name: "encaisse", type: "integer", nullable: false)]
    private int $encaisse;

    #[ORM\Column(name: "moyen_paiement", type: "string", length: 255, nullable: true)]
    private ?string $moyenPaiement = null;

    #[ORM\Column(name: "nb_seances_total", type: "integer", nullable: false)]
    private int $nbSeancesTotal;

    #[ORM\Column(name: "nb_seances_reglees", type: "integer", nullable: false)]
    private int $nbSeancesReglees = 0;

    #[ORM\Column(name: "actif", type: "integer", nullable: false, options: ["default" => 1])]
    private int $actif = 1;

    #[ORM\Column(name: "num_stripe", type: "string", length: 255, nullable: true)]
    private ?string $numStripe = null;

    #[ORM\Column(name: "id_sub", type: "string", length: 255, nullable: true)]
    private ?string $idSub = null;

    #[ORM\Column(name: "matieres", type: "string", length: 255, nullable: true)]
    private ?string $matieres = null;

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

    public function getTypeAbo(): ?int
    {
        return $this->typeAbo;
    }

    public function setTypeAbo(?int $typeAbo): self
    {
        $this->typeAbo = $typeAbo;
        return $this;
    }

    public function getDateSouscription(): ?\DateTimeInterface
    {
        return $this->dateSouscription;
    }

    public function setDateSouscription(?\DateTimeInterface $dateSouscription): self
    {
        $this->dateSouscription = $dateSouscription;
        return $this;
    }

    public function getDateFin(): ?\DateTimeInterface
    {
        return $this->dateFin;
    }

    public function setDateFin(?\DateTimeInterface $dateFin): self
    {
        $this->dateFin = $dateFin;
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

    public function getPrix(): int
    {
        return $this->prix;
    }

    public function setPrix(int $prix): self
    {
        $this->prix = $prix;
        return $this;
    }

    public function getEncaisse(): int
    {
        return $this->encaisse;
    }

    public function setEncaisse(int $encaisse): self
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

    public function getNbSeancesTotal(): int
    {
        return $this->nbSeancesTotal;
    }

    public function setNbSeancesTotal(int $nbSeancesTotal): self
    {
        $this->nbSeancesTotal = $nbSeancesTotal;
        return $this;
    }

    public function getNbSeancesReglees(): int
    {
        return $this->nbSeancesReglees;
    }

    public function setNbSeancesReglees(int $nbSeancesReglees): self
    {
        $this->nbSeancesReglees = $nbSeancesReglees;
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

    public function getIdSub(): ?string
    {
        return $this->idSub;
    }

    public function setIdSub(?string $idSub): self
    {
        $this->idSub = $idSub;
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
}

