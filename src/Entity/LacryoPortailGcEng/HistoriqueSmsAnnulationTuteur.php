<?php

namespace App\Entity\LacryoPortailGcEng;

use Doctrine\ORM\Mapping as ORM;

#[ORM\Entity]
#[ORM\Table(name: 'historique_sms_annulation_tuteur')]
class HistoriqueSmsAnnulationTuteur
{
    #[ORM\Id]
    #[ORM\GeneratedValue(strategy: 'IDENTITY')]
    #[ORM\Column(type: 'integer')]
    private ?int $id = null;

    #[ORM\Column(name: 'id_tuteur', type: 'integer')]
    private int $idTuteur;

    #[ORM\Column(name: 'date_envoi', type: 'datetime')]
    private \DateTimeInterface $dateEnvoi;

    #[ORM\Column(name: 'id_annulation', type: 'integer')]
    private int $idAnnulation;

    // Getters & Setters

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
