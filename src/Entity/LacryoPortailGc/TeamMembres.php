<?php

namespace App\Entity\LacryoPortailGc;

use Doctrine\ORM\Mapping as ORM;

#[ORM\Table(name: "team_membres")]
#[ORM\Entity]
class TeamMembres
{
    #[ORM\Column(name: "id", type: "integer", nullable: false)]
    #[ORM\Id]
    #[ORM\GeneratedValue(strategy: "IDENTITY")]
    private ?int $id = null;

    #[ORM\Column(name: "nom", type: "string", length: 255, nullable: false)]
    private string $nom;

    #[ORM\Column(name: "prenom", type: "string", length: 255, nullable: false)]
    private string $prenom;

    #[ORM\Column(name: "email", type: "string", length: 255, nullable: false)]
    private string $email;

    #[ORM\Column(name: "mdp", type: "string", length: 255, nullable: false)]
    private string $mdp;

    #[ORM\Column(name: "num_tel", type: "string", length: 13, nullable: false)]
    private string $numTel;

    #[ORM\Column(name: "image", type: "string", length: 255, nullable: true)]
    private ?string $image = null;

    #[ORM\Column(name: "rang", type: "integer", nullable: false)]
    private int $rang;

    #[ORM\Column(name: "sarcelles", type: "integer", nullable: true)]
    private ?int $sarcelles = null;

    #[ORM\Column(name: "enghien", type: "integer", nullable: true)]
    private ?int $enghien = null;

    #[ORM\Column(name: "asnieres", type: "integer", nullable: true)]
    private ?int $asnieres = null;

    #[ORM\Column(name: "pontoise", type: "integer", nullable: true)]
    private ?int $pontoise = null;

    #[ORM\Column(name: "gonesse", type: "integer", nullable: true)]
    private ?int $gonesse = null;

    #[ORM\Column(name: "siret", type: "string", length: 255, nullable: true)]
    private ?string $siret = null;

    #[ORM\Column(name: "actif", type: "integer", nullable: false, options: ["default" => 1])]
    private int $actif = 1;

    #[ORM\Column(name: "nombre_seances_max", type: "integer", nullable: true)]
    private ?int $nombreSeancesMax = null;

    #[ORM\Column(name: "taux_horraire", type: "integer", nullable: true, options: ["default" => 17])]
    private ?int $tauxHorraire = 17;

    // Getters et Setters

    public function getId(): ?int
    {
        return $this->id;
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

    public function getEmail(): string
    {
        return $this->email;
    }

    public function setEmail(string $email): self
    {
        $this->email = $email;
        return $this;
    }

    public function getMdp(): string
    {
        return $this->mdp;
    }

    public function setMdp(string $mdp): self
    {
        $this->mdp = $mdp;
        return $this;
    }

    public function getNumTel(): string
    {
        return $this->numTel;
    }

    public function setNumTel(string $numTel): self
    {
        $this->numTel = $numTel;
        return $this;
    }

    public function getImage(): ?string
    {
        return $this->image;
    }

    public function setImage(?string $image): self
    {
        $this->image = $image;
        return $this;
    }

    public function getRang(): int
    {
        return $this->rang;
    }

    public function setRang(int $rang): self
    {
        $this->rang = $rang;
        return $this;
    }

    public function getSarcelles(): ?int
    {
        return $this->sarcelles;
    }

    public function setSarcelles(?int $sarcelles): self
    {
        $this->sarcelles = $sarcelles;
        return $this;
    }

    public function getEnghien(): ?int
    {
        return $this->enghien;
    }

    public function setEnghien(?int $enghien): self
    {
        $this->enghien = $enghien;
        return $this;
    }

    public function getAsnieres(): ?int
    {
        return $this->asnieres;
    }

    public function setAsnieres(?int $asnieres): self
    {
        $this->asnieres = $asnieres;
        return $this;
    }

    public function getPontoise(): ?int
    {
        return $this->pontoise;
    }

    public function setPontoise(?int $pontoise): self
    {
        $this->pontoise = $pontoise;
        return $this;
    }

    public function getGonesse(): ?int
    {
        return $this->gonesse;
    }

    public function setGonesse(?int $gonesse): self
    {
        $this->gonesse = $gonesse;
        return $this;
    }

    public function getSiret(): ?string
    {
        return $this->siret;
    }

    public function setSiret(?string $siret): self
    {
        $this->siret = $siret;
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

    public function getNombreSeancesMax(): ?int
    {
        return $this->nombreSeancesMax;
    }

    public function setNombreSeancesMax(?int $nombreSeancesMax): self
    {
        $this->nombreSeancesMax = $nombreSeancesMax;
        return $this;
    }

    public function getTauxHorraire(): ?int
    {
        return $this->tauxHorraire;
    }

    public function setTauxHorraire(?int $tauxHorraire): self
    {
        $this->tauxHorraire = $tauxHorraire;
        return $this;
    }
}
