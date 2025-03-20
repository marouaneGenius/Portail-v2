<?php

namespace App\Entity\LacryoPortailGc;

use Doctrine\ORM\Mapping as ORM;

#[ORM\Table(name: "historique_sms_annulation_tuteur")]
#[ORM\Entity]
class HistoriqueSmsAnnulationTuteur
{
    #[ORM\Column(name: "id", type: "integer", nullable: false)]
    #[ORM\Id]
    #[ORM\GeneratedValue(strategy: "IDENTITY")]
    private ?int $id = null;

    #[ORM\Column(name: "id_tuteur", type: "integer", nullable: false)]
    private int $idTuteur;

    #[ORM\Column(name: "date_envoi", type: "datetime", nullable: false)]
    private \DateTimeInterface $dateEnvoi;

    #[ORM\Column(name: "id_annulation", type: "integer", nullable: false)]
    private int $idAnnulation;

    // Getters et Setters

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getIdTuteur(): int
    {
        return $this->idTuteur;
    }

    public function setIdTuteur(int $idTuteur): self
    {
        $this->idTuteur = $idTuteur;
        return $this;
    }

    public function getDateEnvoi(): \DateTimeInterface
    {
        return $this->dateEnvoi;
    }

    public function setDateEnvoi(\DateTimeInterface $dateEnvoi): self
    {
        $this->dateEnvoi = $dateEnvoi;
        return $this;
    }

    public function getIdAnnulation(): int
    {
        return $this->idAnnulation;
    }

    public function setIdAnnulation(int $idAnnulation): self
    {
        $this->idAnnulation = $idAnnulation;
        return $this;
    }
}
