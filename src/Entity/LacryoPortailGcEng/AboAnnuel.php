<?php

namespace App\Entity\LacryoPortailGcEng;

use Doctrine\ORM\Mapping as ORM;

#[ORM\Table(name: "abo_annuel")]
#[ORM\Entity]
class AboAnnuel
{
    #[ORM\Column(name: "id", type: "integer", nullable: false)]
    #[ORM\Id]
    #[ORM\GeneratedValue(strategy: "IDENTITY")]
    private ?int $id = null;

    #[ORM\Column(name: "id_eleve", type: "integer", nullable: false)]
    private int $idEleve;

    #[ORM\Column(name: "id_rand", type: "integer", nullable: false)]
    private int $idRand;

    #[ORM\Column(name: "type_abo", type: "integer", nullable: false)]
    private int $typeAbo;

    #[ORM\Column(name: "actif", type: "integer", nullable: false, options: ["default" => 1])]
    private int $actif = 1;

    #[ORM\Column(name: "id_abo_stripe", type: "integer", nullable: true)]
    private ?int $idAboStripe = null;

    #[ORM\Column(name: "date_souscription", type: "date", nullable: false)]
    private \DateTimeInterface $dateSouscription;

    #[ORM\Column(name: "matieres", type: "string", length: 255, nullable: true)]
    private ?string $matieres = null;

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

    public function getIdRand(): int
    {
        return $this->idRand;
    }

    public function setIdRand(int $idRand): self
    {
        $this->idRand = $idRand;
        return $this;
    }

    public function getTypeAbo(): int
    {
        return $this->typeAbo;
    }

    public function setTypeAbo(int $typeAbo): self
    {
        $this->typeAbo = $typeAbo;
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

    public function getIdAboStripe(): ?int
    {
        return $this->idAboStripe;
    }

    public function setIdAboStripe(?int $idAboStripe): self
    {
        $this->idAboStripe = $idAboStripe;
        return $this;
    }

    public function getDateSouscription(): \DateTimeInterface
    {
        return $this->dateSouscription;
    }

    public function setDateSouscription(\DateTimeInterface $dateSouscription): self
    {
        $this->dateSouscription = $dateSouscription;
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
}
