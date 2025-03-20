<?php

namespace App\Entity\LacryoGeniusClass;

use Doctrine\ORM\Mapping as ORM;

#[ORM\Table(name: "QCM_historique")]
#[ORM\Entity]
class QcmHistorique
{
    #[ORM\Column(name: "id", type: "integer", nullable: false)]
    #[ORM\Id]
    #[ORM\GeneratedValue(strategy: "IDENTITY")]
    private ?int $id = null;

    #[ORM\Column(name: "num_exo", type: "integer", nullable: false)]
    private int $numExo;

    #[ORM\Column(name: "valide", type: "integer", nullable: false)]
    private int $valide;

    #[ORM\Column(name: "categorie", type: "integer", nullable: false)]
    private int $categorie;

    #[ORM\Column(name: "id_eleve", type: "integer", nullable: false)]
    private int $idEleve;

    // Getters et Setters

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getNumExo(): int
    {
        return $this->numExo;
    }

    public function setNumExo(int $numExo): self
    {
        $this->numExo = $numExo;
        return $this;
    }

    public function getValide(): int
    {
        return $this->valide;
    }

    public function setValide(int $valide): self
    {
        $this->valide = $valide;
        return $this;
    }

    public function getCategorie(): int
    {
        return $this->categorie;
    }

    public function setCategorie(int $categorie): self
    {
        $this->categorie = $categorie;
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
}
