<?php

namespace App\Entity\LacryoGeniusClass;

use Doctrine\ORM\Mapping as ORM;

#[ORM\Table(name: "QCM_reponses")]
#[ORM\Entity]
class QcmReponses
{
    #[ORM\Column(name: "id", type: "integer", nullable: false)]
    #[ORM\Id]
    #[ORM\GeneratedValue(strategy: "IDENTITY")]
    private ?int $id = null;

    #[ORM\Column(name: "num_exo", type: "integer", nullable: false)]
    private int $numExo;

    #[ORM\Column(name: "reponse", type: "string", length: 400, nullable: false)]
    private string $reponse;

    #[ORM\Column(name: "valide", type: "integer", nullable: false)]
    private int $valide = 0;

    // Getters et Setters

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getNumExo(): int
    {
        return $this->numExo;
    }

    public function setNumExo(int $numExo): self
    {
        $this->numExo = $numExo;
        return $this;
    }

    public function getReponse(): string
    {
        return $this->reponse;
    }

    public function setReponse(string $reponse): self
    {
        $this->reponse = $reponse;
        return $this;
    }

    public function getValide(): int
    {
        return $this->valide;
    }

    public function setValide(int $valide): self
    {
        $this->valide = $valide;
        return $this;
    }
}
