<?php

namespace App\Entity\LacryoGeniusAlm;

use Doctrine\ORM\Mapping as ORM;

#[ORM\Table(name: "duration_cache")]
#[ORM\Entity]
class DurationCache
{
    #[ORM\Column(name: "id", type: "integer", nullable: false)]
    #[ORM\Id]
    #[ORM\GeneratedValue(strategy: "IDENTITY")]
    private ?int $id = null;

    #[ORM\Column(name: "adresse1", type: "string", length: 255, nullable: false)]
    private string $adresse1;

    #[ORM\Column(name: "adresse2", type: "string", length: 255, nullable: false)]
    private string $adresse2;

    #[ORM\Column(name: "mobilite", type: "string", length: 255, nullable: false)]
    private string $mobilite;

    #[ORM\Column(name: "temps", type: "integer", nullable: false)]
    private int $temps;

    // Getters et Setters

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getAdresse1(): string
    {
        return $this->adresse1;
    }

    public function setAdresse1(string $adresse1): self
    {
        $this->adresse1 = $adresse1;
        return $this;
    }

    public function getAdresse2(): string
    {
        return $this->adresse2;
    }

    public function setAdresse2(string $adresse2): self
    {
        $this->adresse2 = $adresse2;
        return $this;
    }

    public function getMobilite(): string
    {
        return $this->mobilite;
    }

    public function setMobilite(string $mobilite): self
    {
        $this->mobilite = $mobilite;
        return $this;
    }

    public function getTemps(): int
    {
        return $this->temps;
    }

    public function setTemps(int $temps): self
    {
        $this->temps = $temps;
        return $this;
    }
}
