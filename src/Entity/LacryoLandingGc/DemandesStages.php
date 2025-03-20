<?php

namespace App\Entity\LacryoLandingGc;

use Doctrine\ORM\Mapping as ORM;

#[ORM\Table(name: "demandes_stages")]
#[ORM\Entity]
class DemandesStages
{
    #[ORM\Column(name: "id", type: "integer", nullable: false)]
    #[ORM\Id]
    #[ORM\GeneratedValue(strategy: "IDENTITY")]
    private ?int $id = null;

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

    #[ORM\Column(name: "date_list_cours", type: "text", length: 65535, nullable: false)]
    private string $dateListCours;

    #[ORM\Column(name: "traitement", type: "integer", nullable: false)]
    private int $traitement = 0;

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

    public function getDateListCours(): string
    {
        return $this->dateListCours;
    }

    public function setDateListCours(string $dateListCours): self
    {
        $this->dateListCours = $dateListCours;
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
