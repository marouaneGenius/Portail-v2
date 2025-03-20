<?php

namespace App\Entity\LacryoGeniusAlm;

use Doctrine\ORM\Mapping as ORM;

#[ORM\Table(name: "tuteurs_profils")]
#[ORM\Entity]
class TuteursProfils
{
    #[ORM\Column(name: "id", type: "integer", nullable: false)]
    #[ORM\Id]
    #[ORM\GeneratedValue(strategy: "IDENTITY")]
    private ?int $id = null;

    #[ORM\Column(name: "prenom", type: "string", length: 255, nullable: false)]
    private string $prenom;

    #[ORM\Column(name: "nom", type: "string", length: 255, nullable: false)]
    private string $nom;

    #[ORM\Column(name: "age", type: "integer", nullable: false)]
    private int $age;

    #[ORM\Column(name: "email", type: "string", length: 255, nullable: false)]
    private string $email;

    #[ORM\Column(name: "phone", type: "string", length: 255, nullable: false)]
    private string $phone;

    #[ORM\Column(name: "ecole", type: "string", length: 255, nullable: false)]
    private string $ecole;

    #[ORM\Column(name: "bacplus", type: "string", length: 255, nullable: false)]
    private string $bacplus;

    #[ORM\Column(name: "date_demande", type: "datetime", nullable: true)]
    private ?\DateTimeInterface $dateDemande = null;

    #[ORM\Column(name: "statut", type: "integer", nullable: false)]
    private int $statut = 0;

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

    public function getAge(): int
    {
        return $this->age;
    }

    public function setAge(int $age): self
    {
        $this->age = $age;
        return $this;
    }

    public function getEmail(): string
    {
        return $this->email;
    }

    public function setEmail(string $email): self
    {
        $this->email = $email;
        return $this;
    }

    public function getPhone(): string
    {
        return $this->phone;
    }

    public function setPhone(string $phone): self
    {
        $this->phone = $phone;
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

    public function getBacplus(): string
    {
        return $this->bacplus;
    }

    public function setBacplus(string $bacplus): self
    {
        $this->bacplus = $bacplus;
        return $this;
    }

    public function getDateDemande(): ?\DateTimeInterface
    {
        return $this->dateDemande;
    }

    public function setDateDemande(?\DateTimeInterface $dateDemande): self
    {
        $this->dateDemande = $dateDemande;
        return $this;
    }

    public function getStatut(): int
    {
        return $this->statut;
    }

    public function setStatut(int $statut): self
    {
        $this->statut = $statut;
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
