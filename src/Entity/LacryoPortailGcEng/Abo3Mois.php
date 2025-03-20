<?php

namespace App\Entity\LacryoPortailGcEng;

use Doctrine\ORM\Mapping as ORM;

#[ORM\Table(name: "abo_3_mois")]
#[ORM\Entity]
class Abo3Mois
{
    #[ORM\Id]
    #[ORM\GeneratedValue(strategy: "IDENTITY")]
    #[ORM\Column(name: "id", type: "integer", nullable: false)]
    private ?int $id = null;

    #[ORM\Column(name: "id_eleve", type: "integer", nullable: false)]
    private int $idEleve;

    #[ORM\Column(name: "type_abo", type: "integer", nullable: false)]
    private int $typeAbo;

    #[ORM\Column(name: "date_souscription", type: "date", nullable: true)]
    private ?\DateTimeInterface $dateSouscription = null;

    #[ORM\Column(name: "nombre_paiement", type: "integer", nullable: true)]
    private ?int $nombrePaiement = null;

    #[ORM\Column(name: "statut_paiement", type: "integer", nullable: false)]
    private int $statutPaiement;

    #[ORM\Column(name: "prix", type: "integer", nullable: false)]
    private int $prix;

    #[ORM\Column(name: "encaisse", type: "float", precision: 10, scale: 0, nullable: false)]
    private float $encaisse;

    #[ORM\Column(name: "moyen_paiement", type: "string", length: 255, nullable: false)]
    private string $moyenPaiement;

    #[ORM\Column(name: "nb_seances_dispo", type: "integer", nullable: false)]
    private int $nbSeancesDispo;

    #[ORM\Column(name: "nb_seances_reglees", type: "integer", nullable: false)]
    private int $nbSeancesReglees = 0;

    #[ORM\Column(name: "commentaires", type: "text", length: 65535, nullable: false)]
    private string $commentaires;

    #[ORM\Column(name: "actif", type: "integer", nullable: false, options: ["default" => "1"])]
    private int $actif = 1;

    #[ORM\Column(name: "echelonne", type: "integer", nullable: false)]
    private int $echelonne;

    #[ORM\Column(name: "date_paiement1", type: "date", nullable: true)]
    private ?\DateTimeInterface $datePaiement1 = null;

    #[ORM\Column(name: "date_paiement2", type: "date", nullable: true)]
    private ?\DateTimeInterface $datePaiement2 = null;

    #[ORM\Column(name: "date_paiement3", type: "date", nullable: true)]
    private ?\DateTimeInterface $datePaiement3 = null;

    #[ORM\Column(name: "tarif_paiement1", type: "float", precision: 10, scale: 0, nullable: true)]
    private ?float $tarifPaiement1 = null;

    #[ORM\Column(name: "tarif_paiement2", type: "float", precision: 10, scale: 0, nullable: true)]
    private ?float $tarifPaiement2 = null;

    #[ORM\Column(name: "tarif_paiement3", type: "float", precision: 10, scale: 0, nullable: true)]
    private ?float $tarifPaiement3 = null;

    #[ORM\Column(name: "num_stripe", type: "string", length: 255, nullable: true)]
    private ?string $numStripe = null;

    #[ORM\Column(name: "id_sub", type: "string", length: 255, nullable: true)]
    private ?string $idSub = null;

    #[ORM\Column(name: "matieres", type: "string", length: 255, nullable: true)]
    private ?string $matieres = null;

    // Getters and Setters

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

    public function getTypeAbo(): int
    {
        return $this->typeAbo;
    }

    public function setTypeAbo(int $typeAbo): self
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

    public function getNombrePaiement(): ?int
    {
        return $this->nombrePaiement;
    }

    public function setNombrePaiement(?int $nombrePaiement): self
    {
        $this->nombrePaiement = $nombrePaiement;
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

    public function getNbSeancesDispo(): int
    {
        return $this->nbSeancesDispo;
    }

    public function setNbSeancesDispo(int $nbSeancesDispo): self
    {
        $this->nbSeancesDispo = $nbSeancesDispo;
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

    public function getCommentaires(): string
    {
        return $this->commentaires;
    }

    public function setCommentaires(string $commentaires): self
    {
        $this->commentaires = $commentaires;
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
