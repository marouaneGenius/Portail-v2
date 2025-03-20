<?php

namespace App\Entity\LacryoPortailGcAss;

use Doctrine\ORM\Mapping as ORM;

#[ORM\Table(name: "eleves_comp")]
#[ORM\Entity]
class ElevesComp
{
    #[ORM\Column(name: "id", type: "integer", nullable: false)]
    #[ORM\Id]
    #[ORM\GeneratedValue(strategy: "IDENTITY")]
    private ?int $id = null;

    #[ORM\Column(name: "id_eleve", type: "integer", nullable: false)]
    private int $idEleve;

    #[ORM\Column(name: "genre", type: "string", length: 11, nullable: false)]
    private string $genre;

    #[ORM\Column(name: "prenom_parent", type: "string", length: 255, nullable: false)]
    private string $prenomParent;

    #[ORM\Column(name: "nom_parent", type: "string", length: 255, nullable: false)]
    private string $nomParent;

    #[ORM\Column(name: "numero_rue", type: "string", length: 255, nullable: false)]
    private string $numeroRue;

    #[ORM\Column(name: "rue", type: "string", length: 255, nullable: false)]
    private string $rue;

    #[ORM\Column(name: "ville", type: "string", length: 255, nullable: false)]
    private string $ville;

    #[ORM\Column(name: "code_postal", type: "integer", nullable: false)]
    private int $codePostal;

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

    public function getGenre(): string
    {
        return $this->genre;
    }

    public function setGenre(string $genre): self
    {
        $this->genre = $genre;
        return $this;
    }

    public function getPrenomParent(): string
    {
        return $this->prenomParent;
    }

    public function setPrenomParent(string $prenomParent): self
    {
        $this->prenomParent = $prenomParent;
        return $this;
    }

    public function getNomParent(): string
    {
        return $this->nomParent;
    }

    public function setNomParent(string $nomParent): self
    {
        $this->nomParent = $nomParent;
        return $this;
    }

    public function getNumeroRue(): string
    {
        return $this->numeroRue;
    }

    public function setNumeroRue(string $numeroRue): self
    {
        $this->numeroRue = $numeroRue;
        return $this;
    }

    public function getRue(): string
    {
        return $this->rue;
    }

    public function setRue(string $rue): self
    {
        $this->rue = $rue;
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

    public function getCodePostal(): int
    {
        return $this->codePostal;
    }

    public function setCodePostal(int $codePostal): self
    {
        $this->codePostal = $codePostal;
        return $this;
    }
}
