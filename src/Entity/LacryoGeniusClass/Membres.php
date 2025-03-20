<?php

namespace App\Entity\LacryoGeniusClass;

use Doctrine\ORM\Mapping as ORM;

#[ORM\Table(name: "membres")]
#[ORM\Entity]
class Membres
{
    #[ORM\Column(name: "id", type: "integer", nullable: false)]
    #[ORM\Id]
    #[ORM\GeneratedValue(strategy: "IDENTITY")]
    private ?int $id = null;

    #[ORM\Column(name: "nom", type: "string", length: 255, nullable: false)]
    private string $nom;

    #[ORM\Column(name: "prenom", type: "string", length: 255, nullable: false)]
    private string $prenom;

    #[ORM\Column(name: "mail", type: "string", length: 255, nullable: false)]
    private string $mail;

    #[ORM\Column(name: "motdepasse", type: "text", length: 65535, nullable: false)]
    private string $motdepasse;

    #[ORM\Column(name: "classe", type: "string", length: 20, nullable: false)]
    private string $classe;

    #[ORM\Column(name: "etablissement", type: "string", length: 255, nullable: false)]
    private string $etablissement;

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

    public function getMail(): string
    {
        return $this->mail;
    }

    public function setMail(string $mail): self
    {
        $this->mail = $mail;
        return $this;
    }

    public function getMotdepasse(): string
    {
        return $this->motdepasse;
    }

    public function setMotdepasse(string $motdepasse): self
    {
        $this->motdepasse = $motdepasse;
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

    public function getEtablissement(): string
    {
        return $this->etablissement;
    }

    public function setEtablissement(string $etablissement): self
    {
        $this->etablissement = $etablissement;
        return $this;
    }
}
