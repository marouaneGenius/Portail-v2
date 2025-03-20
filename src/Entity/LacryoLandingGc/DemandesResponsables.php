<?php

namespace App\Entity\LacryoLandingGc;

use Doctrine\ORM\Mapping as ORM;

#[ORM\Table(name: "demandes_responsables")]
#[ORM\Entity]
class DemandesResponsables
{
    #[ORM\Column(name: "id", type: "integer", nullable: false)]
    #[ORM\Id]
    #[ORM\GeneratedValue(strategy: "IDENTITY")]
    private ?int $id = null;

    #[ORM\Column(name: "date_demande", type: "datetime", nullable: false)]
    private \DateTimeInterface $dateDemande;

    #[ORM\Column(name: "nom", type: "string", length: 255, nullable: false)]
    private string $nom;

    #[ORM\Column(name: "prenom", type: "string", length: 255, nullable: false)]
    private string $prenom;

    #[ORM\Column(name: "mail", type: "string", length: 255, nullable: false)]
    private string $mail;

    #[ORM\Column(name: "tel", type: "string", length: 255, nullable: false)]
    private string $tel;

    #[ORM\Column(name: "age", type: "integer", nullable: false)]
    private int $age;

    #[ORM\Column(name: "ville", type: "string", length: 255, nullable: false)]
    private string $ville;

    #[ORM\Column(name: "ecole", type: "string", length: 255, nullable: false)]
    private string $ecole;

    #[ORM\Column(name: "centre", type: "string", length: 255, nullable: false)]
    private string $centre;

    #[ORM\Column(name: "jour_dispos", type: "string", length: 255, nullable: false)]
    private string $jourDispos;

    #[ORM\Column(name: "nb_de_jours", type: "string", length: 255, nullable: false)]
    private string $nbDeJours;

    #[ORM\Column(name: "passions", type: "text", length: 65535, nullable: false)]
    private string $passions;

    #[ORM\Column(name: "source", type: "string", length: 255, nullable: false)]
    private string $source;

    #[ORM\Column(name: "utm_source", type: "string", length: 255, nullable: true)]
    private ?string $utmSource = null;

    #[ORM\Column(name: "utm_campaign", type: "string", length: 255, nullable: true)]
    private ?string $utmCampaign = null;

    #[ORM\Column(name: "utm_term", type: "string", length: 255, nullable: true)]
    private ?string $utmTerm = null;

    #[ORM\Column(name: "utm_adset", type: "string", length: 255, nullable: true)]
    private ?string $utmAdset = null;

    // Getters et Setters

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getDateDemande(): \DateTimeInterface
    {
        return $this->dateDemande;
    }

    public function setDateDemande(\DateTimeInterface $dateDemande): self
    {
        $this->dateDemande = $dateDemande;
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

    public function getPrenom(): string
    {
        return $this->prenom;
    }

    public function setPrenom(string $prenom): self
    {
        $this->prenom = $prenom;
        return $this;
    }

    public function getMail(): string
    {
        return $this->mail;
    }

    public function setMail(string $mail): self
    {
        $this->mail = $mail;
        return $this;
    }

    public function getTel(): string
    {
        return $this->tel;
    }

    public function setTel(string $tel): self
    {
        $this->tel = $tel;
        return $this;
    }

    public function getAge(): int
    {
        return $this->age;
    }

    public function setAge(int $age): self
    {
        $this->age = $age;
        return $this;
    }

    public function getVille(): string
    {
        return $this->ville;
    }

    public function setVille(string $ville): self
    {
        $this->ville = $ville;
        return $this;
    }

    public function getEcole(): string
    {
        return $this->ecole;
    }

    public function setEcole(string $ecole): self
    {
        $this->ecole = $ecole;
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

    public function getJourDispos(): string
    {
        return $this->jourDispos;
    }

    public function setJourDispos(string $jourDispos): self
    {
        $this->jourDispos = $jourDispos;
        return $this;
    }

    public function getNbDeJours(): string
    {
        return $this->nbDeJours;
    }

    public function setNbDeJours(string $nbDeJours): self
    {
        $this->nbDeJours = $nbDeJours;
        return $this;
    }

    public function getPassions(): string
    {
        return $this->passions;
    }

    public function setPassions(string $passions): self
    {
        $this->passions = $passions;
        return $this;
    }

    public function getSource(): string
    {
        return $this->source;
    }

    public function setSource(string $source): self
    {
        $this->source = $source;
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
}
