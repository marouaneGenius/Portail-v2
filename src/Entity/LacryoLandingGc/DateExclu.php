<?php

namespace App\Entity\LacryoLandingGc;

use Doctrine\ORM\Mapping as ORM;

#[ORM\Table(name: "date_exclu")]
#[ORM\Entity]
class DateExclu
{
    #[ORM\Column(name: "id", type: "integer", nullable: false)]
    #[ORM\Id]
    #[ORM\GeneratedValue(strategy: "IDENTITY")]
    private ?int $id = null;

    #[ORM\Column(name: "date_exclu_in", type: "date", nullable: false)]
    private \DateTimeInterface $dateExcluIn;

    #[ORM\Column(name: "date_exclu_out", type: "date", nullable: false)]
    private \DateTimeInterface $dateExcluOut;

    // Getters et Setters

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getDateExcluIn(): \DateTimeInterface
    {
        return $this->dateExcluIn;
    }

    public function setDateExcluIn(\DateTimeInterface $dateExcluIn): self
    {
        $this->dateExcluIn = $dateExcluIn;
        return $this;
    }

    public function getDateExcluOut(): \DateTimeInterface
    {
        return $this->dateExcluOut;
    }

    public function setDateExcluOut(\DateTimeInterface $dateExcluOut): self
    {
        $this->dateExcluOut = $dateExcluOut;
        return $this;
    }
}
