<?php

namespace App\Entity\LacryoPortailGcPontoise;

use Doctrine\ORM\Mapping as ORM;

#[ORM\Entity]
#[ORM\Table(name: 'check_abo_sms')]
class CheckAboSms
{
    #[ORM\Id]
    #[ORM\GeneratedValue(strategy: 'IDENTITY')]
    #[ORM\Column(name: 'id', type: 'integer', nullable: false)]
    private ?int $id = null;

    #[ORM\Column(name: 'date_envoi', type: 'date', nullable: false)]
    private \DateTimeInterface $dateEnvoi;

    #[ORM\Column(name: 'id_abo', type: 'integer', nullable: true)]
    private ?int $idAbo = null;

    #[ORM\Column(name: 'id_abo_3_mois', type: 'integer', nullable: true)]
    private ?int $idAbo3Mois = null;

    // Getters & Setters

    public function getId(): ?int
    {
        return $this->id;
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

    public function getIdAbo(): ?int
    {
        return $this->idAbo;
    }

    public function setIdAbo(?int $idAbo): self
    {
        $this->idAbo = $idAbo;
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
}
