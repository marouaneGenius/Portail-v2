<?php

namespace App\Entity\LacryoLandingGc;

use Doctrine\ORM\Mapping as ORM;

#[ORM\Table(name: "demandes_online")]
#[ORM\Entity]
class DemandesOnline
{
    #[ORM\Column(name: "id", type: "integer", nullable: false)]
    #[ORM\Id]
    #[ORM\GeneratedValue(strategy: "IDENTITY")]
    private ?int $id = null;

    #[ORM\Column(name: "date_inscription", type: "datetime", nullable: true)]
    private ?\DateTimeInterface $dateInscription = null;

    #[ORM\Column(name: "prenom", type: "string", length: 255, nullable: false)]
    private string $prenom;

    #[ORM\Column(name: "nom", type: "string", length: 255, nullable: false)]
    private string $nom;

    #[ORM\Column(name: "classe", type: "string", length: 255, nullable: false)]
    private string $classe;

    #[ORM\Column(name: "civilite_parent", type: "string", length: 255, nullable: false)]
    private string $civiliteParent;

    #[ORM\Column(name: "mail_parent", type: "string", length: 255, nullable: false)]
    private string $mailParent;

    #[ORM\Column(name: "tel_parent", type: "string", length: 255, nullable: false)]
    private string $telParent;

    #[ORM\Column(name: "matiere", type: "string", length: 255, nullable: false)]
    private string $matiere;

    #[ORM\Column(name: "centre", type: "string", length: 255, nullable: false)]
    private string $centre;

    #[ORM\Column(name: "date_cours", type: "date", nullable: false)]
    private \DateTimeInterface $dateCours;

    #[ORM\Column(name: "heure_debut", type: "time", nullable: false)]
    private \DateTimeInterface $heureDebut;

    #[ORM\Column(name: "heure_fin", type: "time", nullable: false)]
    private \DateTimeInterface $heureFin;

    #[ORM\Column(name: "utm_source", type: "string", length: 255, nullable: true)]
    private ?string $utmSource = null;

    #[ORM\Column(name: "utm_campaign", type: "string", length: 255, nullable: true)]
    private ?string $utmCampaign = null;

    #[ORM\Column(name: "utm_term", type: "string", length: 255, nullable: true)]
    private ?string $utmTerm = null;

    #[ORM\Column(name: "utm_adset", type: "string", length: 255, nullable: true)]
    private ?string $utmAdset = null;

    #[ORM\Column(name: "traitement", type: "integer", nullable: false)]
    private int $traitement = 0;

    // Getters et Setters

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getDateInscription(): ?\DateTimeInterface
    {
        return $this->dateInscription;
    }

    public function setDateInscription(?\DateTimeInterface $dateInscription): self
    {
        $this->dateInscription = $dateInscription;
        return $this;
    }

    public function getPrenom(): string
    {
        return $this->prenom;
    }

    public function setPrenom(string $prenom): self
    {
        $this->prenom = $prenom;
        return $this;
    }

    public function getNom(): string
    {
        return $this->nom;
    }

    public function setNom(string $nom): self
    {
        $this->nom = $nom;
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

    public function getCiviliteParent(): string
    {
        return $this->civiliteParent;
    }

    public function setCiviliteParent(string $civiliteParent): self
    {
        $this->civiliteParent = $civiliteParent;
        return $this;
    }

    public function getMailParent(): string
    {
        return $this->mailParent;
    }

    public function setMailParent(string $mailParent): self
    {
        $this->mailParent = $mailParent;
        return $this;
    }

    public function getTelParent(): string
    {
        return $this->telParent;
    }

    public function setTelParent(string $telParent): self
    {
        $this->telParent = $telParent;
        return $this;
    }

    public function getMatiere(): string
    {
        return $this->matiere;
    }

    public function setMatiere(string $matiere): self
    {
        $this->matiere = $matiere;
        return $this;
    }

    public function getCentre(): string
    {
        return $this->centre;
    }

    public function setCentre(string $centre): self
    {
        $this->centre = $centre;
        return $this;
    }

    public function getDateCours(): \DateTimeInterface
    {
        return $this->dateCours;
    }

    public function setDateCours(\DateTimeInterface $dateCours): self
    {
        $this->dateCours = $dateCours;
        return $this;
    }

    public function getHeureDebut(): \DateTimeInterface
    {
        return $this->heureDebut;
    }

    public function setHeureDebut(\DateTimeInterface $heureDebut): self
    {
        $this->heureDebut = $heureDebut;
        return $this;
    }

    public function getHeureFin(): \DateTimeInterface
    {
        return $this->heureFin;
    }

    public function setHeureFin(\DateTimeInterface $heureFin): self
    {
        $this->heureFin = $heureFin;
        return $this;
    }

    public function getUtmSource(): ?string
    {
        return $this->utmSource;
    }

    public function setUtmSource(?string $utmSource): self
    {
        $this->utmSource = $utmSource;
        return $this;
    }

    public function getUtmCampaign(): ?string
    {
        return $this->utmCampaign;
    }

    public function setUtmCampaign(?string $utmCampaign): self
    {
        $this->utmCampaign = $utmCampaign;
        return $this;
    }

    public function getUtmTerm(): ?string
    {
        return $this->utmTerm;
    }

    public function setUtmTerm(?string $utmTerm): self
    {
        $this->utmTerm = $utmTerm;
        return $this;
    }

    public function getUtmAdset(): ?string
    {
        return $this->utmAdset;
    }

    public function setUtmAdset(?string $utmAdset): self
    {
        $this->utmAdset = $utmAdset;
        return $this;
    }

    public function getTraitement(): int
    {
        return $this->traitement;
    }

    public function setTraitement(int $traitement): self
    {
        $this->traitement = $traitement;
        return $this;
    }
}
