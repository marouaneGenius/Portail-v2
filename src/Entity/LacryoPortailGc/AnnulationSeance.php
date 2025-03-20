<?php

namespace App\Entity\LacryoPortailGc;

use Doctrine\ORM\Mapping as ORM;

#[ORM\Table(name: "annulation_seance")]
#[ORM\Entity]
class AnnulationSeance
{
    #[ORM\Column(name: "id", type: "integer", nullable: false)]
    #[ORM\Id]
    #[ORM\GeneratedValue(strategy: "IDENTITY")]
    private ?int $id = null;

    #[ORM\Column(name: "id_eleve", type: "integer", nullable: false)]
    private int $idEleve;

    #[ORM\Column(name: "id_abo_annuel", type: "integer", nullable: false)]
    private int $idAboAnnuel;

    #[ORM\Column(name: "id_seance", type: "integer", nullable: false)]
    private int $idSeance;

    #[ORM\Column(name: "demande_par", type: "integer", nullable: true)]
    private ?int $demandePar = null;

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

    public function getIdAboAnnuel(): int
    {
        return $this->idAboAnnuel;
    }

    public function setIdAboAnnuel(int $idAboAnnuel): self
    {
        $this->idAboAnnuel = $idAboAnnuel;
        return $this;
    }

    public function getIdSeance(): int
    {
        return $this->idSeance;
    }

    public function setIdSeance(int $idSeance): self
    {
        $this->idSeance = $idSeance;
        return $this;
    }

    public function getDemandePar(): ?int
    {
        return $this->demandePar;
    }

    public function setDemandePar(?int $demandePar): self
    {
        $this->demandePar = $demandePar;
        return $this;
    }
}
