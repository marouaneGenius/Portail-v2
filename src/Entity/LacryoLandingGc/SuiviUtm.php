<?php

namespace App\Entity\LacryoLandingGc;

use Doctrine\ORM\Mapping as ORM;

#[ORM\Table(name: "suivi_utm")]
#[ORM\Entity]
class SuiviUtm
{
    #[ORM\Column(name: "id", type: "integer", nullable: false)]
    #[ORM\Id]
    #[ORM\GeneratedValue(strategy: "IDENTITY")]
    private ?int $id = null;

    #[ORM\Column(name: "date_visite", type: "datetime", nullable: false)]
    private \DateTimeInterface $dateVisite;

    #[ORM\Column(name: "adress_ip", type: "string", length: 255, nullable: true)]
    private ?string $adressIp = null;

    #[ORM\Column(name: "utm_campaign", type: "string", length: 255, nullable: false)]
    private string $utmCampaign;

    #[ORM\Column(name: "utm_source", type: "string", length: 255, nullable: false)]
    private string $utmSource;

    #[ORM\Column(name: "utm_term", type: "string", length: 255, nullable: false)]
    private string $utmTerm;

    #[ORM\Column(name: "utm_adset", type: "string", length: 255, nullable: false)]
    private string $utmAdset;

    // Getters et Setters

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getDateVisite(): \DateTimeInterface
    {
        return $this->dateVisite;
    }

    public function setDateVisite(\DateTimeInterface $dateVisite): self
    {
        $this->dateVisite = $dateVisite;
        return $this;
    }

    public function getAdressIp(): ?string
    {
        return $this->adressIp;
    }

    public function setAdressIp(?string $adressIp): self
    {
        $this->adressIp = $adressIp;
        return $this;
    }

    public function getUtmCampaign(): string
    {
        return $this->utmCampaign;
    }

    public function setUtmCampaign(string $utmCampaign): self
    {
        $this->utmCampaign = $utmCampaign;
        return $this;
    }

    public function getUtmSource(): string
    {
        return $this->utmSource;
    }

    public function setUtmSource(string $utmSource): self
    {
        $this->utmSource = $utmSource;
        return $this;
    }

    public function getUtmTerm(): string
    {
        return $this->utmTerm;
    }

    public function setUtmTerm(string $utmTerm): self
    {
        $this->utmTerm = $utmTerm;
        return $this;
    }

    public function getUtmAdset(): string
    {
        return $this->utmAdset;
    }

    public function setUtmAdset(string $utmAdset): self
    {
        $this->utmAdset = $utmAdset;
        return $this;
    }
}
