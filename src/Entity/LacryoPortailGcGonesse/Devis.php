<?php

namespace App\Entity\LacryoPortailGcGonesse;

use Doctrine\ORM\Mapping as ORM;

#[ORM\Entity]
#[ORM\Table(name: 'devis')]
class Devis
{
    #[ORM\Id]
    #[ORM\GeneratedValue(strategy: 'IDENTITY')]
    #[ORM\Column(type: 'integer')]
    private ?int $id = null;

    #[ORM\Column(type: 'integer')]
    private int $idRand;

    #[ORM\Column(type: 'integer')]
    private int $idEleve;

    #[ORM\Column(type: 'date')]
    private \DateTimeInterface $dateEdition;

    #[ORM\Column(type: 'time')]
    private \DateTimeInterface $heureEdition;

    #[ORM\Column(type: 'date')]
    private \DateTimeInterface $dateDebutAbo;

    #[ORM\Column(type: 'date')]
    private \DateTimeInterface $dateFinAbo;

    #[ORM\Column(type: 'date')]
    private \DateTimeInterface $datePrelevement;

    #[ORM\Column(type: 'integer')]
    private int $remise = 0;

    #[ORM\Column(type: 'string', length: 255)]
    private string $listeSeances;

    #[ORM\Column(type: 'string', length: 255, nullable: true)]
    private ?string $matieres = null;

    #[ORM\Column(type: 'date', nullable: true)]
    private ?\DateTimeInterface $dateCaution = null;

    #[ORM\Column(type: 'float', nullable: true)]
    private ?float $montantCaution = null;

    #[ORM\Column(type: 'date', nullable: true)]
    private ?\DateTimeInterface $dateAcompte = null;

    #[ORM\Column(type: 'float', nullable: true)]
    private ?float $montantAcompte = null;

    #[ORM\Column(type: 'string', length: 255, nullable: true)]
    private ?string $moyenPaiementAcompte = null;

    #[ORM\Column(type: 'string', length: 255, nullable: true)]
    private ?string $offreDetail = null;

    #[ORM\Column(type: 'float', nullable: true)]
    private ?float $montantOffre = null;

    #[ORM\Column(type: 'integer')]
    private int $fraisInscription = 0;

    #[ORM\Column(type: 'string', length: 255, nullable: true)]
    private ?string $moyenPaiementFraisInscription = null;

    #[ORM\Column(type: 'float', nullable: true)]
    private ?float $montantFraisInscription = null;

    #[ORM\Column(type: 'date', nullable: true)]
    private ?\DateTimeInterface $dateFraisInscritpion = null;

    #[ORM\Column(type: 'integer')]
    private int $typeSouscription = 0;

    #[ORM\Column(type: 'integer', nullable: true)]
    private ?int $typeAbo = null;

    // Getters & Setters

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getIdRand(): int
    {
        return $this->idRand;
    }

    public function setIdRand(int $idRand): self
    {
        $this->idRand = $idRand;
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

    public function getDateEdition(): \DateTimeInterface
    {
        return $this->dateEdition;
    }

    public function setDateEdition(\DateTimeInterface $dateEdition): self
    {
        $this->dateEdition = $dateEdition;
        return $this;
    }

    public function getHeureEdition(): \DateTimeInterface
    {
        return $this->heureEdition;
    }

    public function setHeureEdition(\DateTimeInterface $heureEdition): self
    {
        $this->heureEdition = $heureEdition;
        return $this;
    }

    public function getDateDebutAbo(): \DateTimeInterface
    {
        return $this->dateDebutAbo;
    }

    public function setDateDebutAbo(\DateTimeInterface $dateDebutAbo): self
    {
        $this->dateDebutAbo = $dateDebutAbo;
        return $this;
    }

    public function getDateFinAbo(): \DateTimeInterface
    {
        return $this->dateFinAbo;
    }

    public function setDateFinAbo(\DateTimeInterface $dateFinAbo): self
    {
        $this->dateFinAbo = $dateFinAbo;
        return $this;
    }

    public function getDatePrelevement(): \DateTimeInterface
    {
        return $this->datePrelevement;
    }

    public function setDatePrelevement(\DateTimeInterface $datePrelevement): self
    {
        $this->datePrelevement = $datePrelevement;
        return $this;
    }

    public function getRemise(): int
    {
        return $this->remise;
    }

    public function setRemise(int $remise): self
    {
        $this->remise = $remise;
        return $this;
    }

    public function getListeSeances(): string
    {
        return $this->listeSeances;
    }

    public function setListeSeances(string $listeSeances): self
    {
        $this->listeSeances = $listeSeances;
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

    public function getDateCaution(): ?\DateTimeInterface
    {
        return $this->dateCaution;
    }

    public function setDateCaution(?\DateTimeInterface $dateCaution): self
    {
        $this->dateCaution = $dateCaution;
        return $this;
    }

    public function getMontantCaution(): ?float
    {
        return $this->montantCaution;
    }

    public function setMontantCaution(?float $montantCaution): self
    {
        $this->montantCaution = $montantCaution;
        return $this;
    }

    public function getDateAcompte(): ?\DateTimeInterface
    {
        return $this->dateAcompte;
    }

    public function setDateAcompte(?\DateTimeInterface $dateAcompte): self
    {
        $this->dateAcompte = $dateAcompte;
        return $this;
    }

    public function getMontantAcompte(): ?float
    {
        return $this->montantAcompte;
    }

    public function setMontantAcompte(?float $montantAcompte): self
    {
        $this->montantAcompte = $montantAcompte;
        return $this;
    }

    public function getMoyenPaiementAcompte(): ?string
    {
        return $this->moyenPaiementAcompte;
    }

    public function setMoyenPaiementAcompte(?string $moyenPaiementAcompte): self
    {
        $this->moyenPaiementAcompte = $moyenPaiementAcompte;
        return $this;
    }

    public function getOffreDetail(): ?string
    {
        return $this->offreDetail;
    }

    public function setOffreDetail(?string $offreDetail): self
    {
        $this->offreDetail = $offreDetail;
        return $this;
    }

    public function getMontantOffre(): ?float
    {
        return $this->montantOffre;
    }

    public function setMontantOffre(?float $montantOffre): self
    {
        $this->montantOffre = $montantOffre;
        return $this;
    }

    public function getFraisInscription(): int
    {
        return $this->fraisInscription;
    }

    public function setFraisInscription(int $fraisInscription): self
    {
        $this->fraisInscription = $fraisInscription;
        return $this;
    }

    public function getMoyenPaiementFraisInscription(): ?string
    {
        return $this->moyenPaiementFraisInscription;
    }

    public function setMoyenPaiementFraisInscription(?string $moyenPaiementFraisInscription): self
    {
        $this->moyenPaiementFraisInscription = $moyenPaiementFraisInscription;
        return $this;
    }

    public function getMontantFraisInscription(): ?float
    {
        return $this->montantFraisInscription;
    }

    public function setMontantFraisInscription(?float $montantFraisInscription): self
    {
        $this->montantFraisInscription = $montantFraisInscription;
        return $this;
    }

    public function getDateFraisInscritpion(): ?\DateTimeInterface
    {
        return $this->dateFraisInscritpion;
    }

    public function setDateFraisInscritpion(?\DateTimeInterface $dateFraisInscritpion): self
    {
        $this->dateFraisInscritpion = $dateFraisInscritpion;
        return $this;
    }

    public function getTypeSouscription(): int
    {
        return $this->typeSouscription;
    }

    public function setTypeSouscription(int $typeSouscription): self
    {
        $this->typeSouscription = $typeSouscription;
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
}
