<?php

namespace App\Entity\LacryoPortailGcAss;

use Doctrine\ORM\Mapping as ORM;

#[ORM\Table(name: "reservations")]
#[ORM\Entity]
class Reservations
{
    #[ORM\Column(name: "id", type: "integer", nullable: false)]
    #[ORM\Id]
    #[ORM\GeneratedValue(strategy: "IDENTITY")]
    private ?int $id = null;
    
    #[ORM\Column(name: "id_eleve", type: "integer", nullable: false)]
    private int $idEleve;
    
    #[ORM\Column(name: "id_team", type: "integer", nullable: false)]
    private int $idTeam;
    
    #[ORM\Column(name: "id_abo", type: "integer", nullable: true)]
    private ?int $idAbo = null;
    
    #[ORM\Column(name: "id_autre_format", type: "integer", nullable: true)]
    private ?int $idAutreFormat = null;
    
    #[ORM\Column(name: "id_abo_3_mois", type: "integer", nullable: true)]
    private ?int $idAbo3Mois = null;
    
    #[ORM\Column(name: "id_abo_annuel", type: "integer", nullable: true)]
    private ?int $idAboAnnuel = null;
    
    #[ORM\Column(name: "date_cours", type: "date", nullable: true)]
    private ?\DateTimeInterface $dateCours = null;
    
    #[ORM\Column(name: "heure_debut", type: "time", nullable: true)]
    private ?\DateTimeInterface $heureDebut = null;
    
    #[ORM\Column(name: "comm", type: "text", length: 65535, nullable: true)]
    private ?string $comm = null;
    
    #[ORM\Column(name: "presence", type: "integer", nullable: false, options: ["default" => 1])]
    private int $presence = 1;
    
    #[ORM\Column(name: "compte_rendu", type: "integer", nullable: false)]
    private int $compteRendu = 0;
    
    #[ORM\Column(name: "matieres", type: "string", length: 255, nullable: true)]
    private ?string $matieres = null;
    
    #[ORM\Column(name: "heure_cr", type: "string", length: 255, nullable: true)]
    private ?string $heureCr = null;

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

    public function getIdTeam(): int
    {
        return $this->idTeam;
    }

    public function setIdTeam(int $idTeam): self
    {
        $this->idTeam = $idTeam;
        return $this;
    }

    public function getIdAbo(): ?int
    {
        return $this->idAbo;
    }

    public function setIdAbo(?int $idAbo): self
    {
        $this->idAbo = $idAbo;
        return $this;
    }

    public function getIdAutreFormat(): ?int
    {
        return $this->idAutreFormat;
    }

    public function setIdAutreFormat(?int $idAutreFormat): self
    {
        $this->idAutreFormat = $idAutreFormat;
        return $this;
    }

    public function getIdAbo3Mois(): ?int
    {
        return $this->idAbo3Mois;
    }

    public function setIdAbo3Mois(?int $idAbo3Mois): self
    {
        $this->idAbo3Mois = $idAbo3Mois;
        return $this;
    }

    public function getIdAboAnnuel(): ?int
    {
        return $this->idAboAnnuel;
    }

    public function setIdAboAnnuel(?int $idAboAnnuel): self
    {
        $this->idAboAnnuel = $idAboAnnuel;
        return $this;
    }

    public function getDateCours(): ?\DateTimeInterface
    {
        return $this->dateCours;
    }

    public function setDateCours(?\DateTimeInterface $dateCours): self
    {
        $this->dateCours = $dateCours;
        return $this;
    }

    public function getHeureDebut(): ?\DateTimeInterface
    {
        return $this->heureDebut;
    }

    public function setHeureDebut(?\DateTimeInterface $heureDebut): self
    {
        $this->heureDebut = $heureDebut;
        return $this;
    }

    public function getComm(): ?string
    {
        return $this->comm;
    }

    public function setComm(?string $comm): self
    {
        $this->comm = $comm;
        return $this;
    }

    public function getPresence(): int
    {
        return $this->presence;
    }

    public function setPresence(int $presence): self
    {
        $this->presence = $presence;
        return $this;
    }

    public function getCompteRendu(): int
    {
        return $this->compteRendu;
    }

    public function setCompteRendu(int $compteRendu): self
    {
        $this->compteRendu = $compteRendu;
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

    public function getHeureCr(): ?string
    {
        return $this->heureCr;
    }

    public function setHeureCr(?string $heureCr): self
    {
        $this->heureCr = $heureCr;
        return $this;
    }
}
