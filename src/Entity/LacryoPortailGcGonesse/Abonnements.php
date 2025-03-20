<?php

namespace App\Entity\LacryoPortailGcGonesse;

use Doctrine\ORM\Mapping as ORM;

/**
 * @ORM\Entity
 * @ORM\Table(name="abonnements")
 */
class Abonnements
{
    // Propriétés...

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

    public function getTypeAbo(): ?int
    {
        return $this->typeAbo;
    }

    public function setTypeAbo(?int $typeAbo): self
    {
        $this->typeAbo = $typeAbo;
        return $this;
    }

    public function getDateSouscription(): ?\DateTimeInterface
    {
        return $this->dateSouscription;
    }

    public function setDateSouscription(?\DateTimeInterface $dateSouscription): self
    {
        $this->dateSouscription = $dateSouscription;
        return $this;
    }

    public function getDateFin(): ?\DateTimeInterface
    {
        return $this->dateFin;
    }

    public function setDateFin(?\DateTimeInterface $dateFin): self
    {
        $this->dateFin = $dateFin;
        return $this;
    }

    public function getStatutPaiement(): int
    {
        return $this->statutPaiement;
    }

    public function setStatutPaiement(int $statutPaiement): self
    {
        $this->statutPaiement = $statutPaiement;
        return $this;
    }

    public function getPrix(): int
    {
        return $this->prix;
    }

    public function setPrix(int $prix): self
    {
        $this->prix = $prix;
        return $this;
    }

    public function getEncaisse(): int
    {
        return $this->encaisse;
    }

    public function setEncaisse(int $encaisse): self
    {
        $this->encaisse = $encaisse;
        return $this;
    }

    public function getMoyenPaiement(): ?string
    {
        return $this->moyenPaiement;
    }

    public function setMoyenPaiement(?string $moyenPaiement): self
    {
        $this->moyenPaiement = $moyenPaiement;
        return $this;
    }

    public function getNbSeancesTotal(): int
    {
        return $this->nbSeancesTotal;
    }

    public function setNbSeancesTotal(int $nbSeancesTotal): self
    {
        $this->nbSeancesTotal = $nbSeancesTotal;
        return $this;
    }

    public function getNbSeancesReglees(): int
    {
        return $this->nbSeancesReglees;
    }

    public function setNbSeancesReglees(int $nbSeancesReglees): self
    {
        $this->nbSeancesReglees = $nbSeancesReglees;
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

    public function getNumStripe(): ?string
    {
        return $this->numStripe;
    }

    public function setNumStripe(?string $numStripe): self
    {
        $this->numStripe = $numStripe;
        return $this;
    }

    public function getIdSub(): ?string
    {
        return $this->idSub;
    }

    public function setIdSub(?string $idSub): self
    {
        $this->idSub = $idSub;
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
