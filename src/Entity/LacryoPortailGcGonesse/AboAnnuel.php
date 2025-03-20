<?php

namespace App\Entity\LacryoPortailGcGonesse;

use Doctrine\ORM\Mapping as ORM;

/**
 * @ORM\Entity
 * @ORM\Table(name="abo_annuel")
 */
class AboAnnuel
{
    // ... Propriétés (inchangées)

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
