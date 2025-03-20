<?php

namespace App\Entity\LacryoPortailGcGonesse;

use Doctrine\ORM\Mapping as ORM;

/**
 * @ORM\Entity
 * @ORM\Table(name="abo_3_mois")
 */
class Abo3Mois
{
    // ... propriétés (inchangées)

    // Getters et setters
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

    public function getTypeAbo(): int
    {
        return $this->typeAbo;
    }

    public function setTypeAbo(int $typeAbo): self
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

    public function getNombrePaiement(): ?int
    {
        return $this->nombrePaiement;
    }

    public function setNombrePaiement(?int $nombrePaiement): self
    {
        $this->nombrePaiement = $nombrePaiement;
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

    public function getEncaisse(): float
    {
        return $this->encaisse;
    }

    public function setEncaisse(float $encaisse): self
    {
        $this->encaisse = $encaisse;
        return $this;
    }

    public function getMoyenPaiement(): string
    {
        return $this->moyenPaiement;
    }

    public function setMoyenPaiement(string $moyenPaiement): self
    {
        $this->moyenPaiement = $moyenPaiement;
        return $this;
    }

    public function getNbSeancesDispo(): int
    {
        return $this->nbSeancesDispo;
    }

    public function setNbSeancesDispo(int $nbSeancesDispo): self
    {
        $this->nbSeancesDispo = $nbSeancesDispo;
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

    public function getCommentaires(): string
    {
        return $this->commentaires;
    }

    public function setCommentaires(string $commentaires): self
    {
        $this->commentaires = $commentaires;
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

    public function getEchelonne(): int
    {
        return $this->echelonne;
    }

    public function setEchelonne(int $echelonne): self
    {
        $this->echelonne = $echelonne;
        return $this;
    }

    public function getDatePaiement1(): ?\DateTimeInterface
    {
        return $this->datePaiement1;
    }

    public function setDatePaiement1(?\DateTimeInterface $datePaiement1): self
    {
        $this->datePaiement1 = $datePaiement1;
        return $this;
    }

    public function getDatePaiement2(): ?\DateTimeInterface
    {
        return $this->datePaiement2;
    }

    public function setDatePaiement2(?\DateTimeInterface $datePaiement2): self
    {
        $this->datePaiement2 = $datePaiement2;
        return $this;
    }

    public function getDatePaiement3(): ?\DateTimeInterface
    {
        return $this->datePaiement3;
    }

    public function setDatePaiement3(?\DateTimeInterface $datePaiement3): self
    {
        $this->datePaiement3 = $datePaiement3;
        return $this;
    }

    public function getTarifPaiement1(): ?float
    {
        return $this->tarifPaiement1;
    }

    public function setTarifPaiement1(?float $tarifPaiement1): self
    {
        $this->tarifPaiement1 = $tarifPaiement1;
        return $this;
    }

    public function getTarifPaiement2(): ?float
    {
        return $this->tarifPaiement2;
    }

    public function setTarifPaiement2(?float $tarifPaiement2): self
    {
        $this->tarifPaiement2 = $tarifPaiement2;
        return $this;
    }

    public function getTarifPaiement3(): ?float
    {
        return $this->tarifPaiement3;
    }

    public function setTarifPaiement3(?float $tarifPaiement3): self
    {
        $this->tarifPaiement3 = $tarifPaiement3;
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
