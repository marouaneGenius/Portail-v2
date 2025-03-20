<?php

namespace App\Entity\LacryoLandingGc;

use Doctrine\ORM\Mapping as ORM;

#[ORM\Table(name: "errors_inscription")]
#[ORM\Entity]
class ErrorsInscription
{
    #[ORM\Column(name: "id", type: "integer", nullable: false)]
    #[ORM\Id]
    #[ORM\GeneratedValue(strategy: "IDENTITY")]
    private ?int $id = null;

    #[ORM\Column(name: "date_error", type: "datetime", nullable: false)]
    private \DateTimeInterface $dateError;

    #[ORM\Column(name: "error", type: "text", length: 65535, nullable: false)]
    private string $error;

    // Getters et Setters

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getDateError(): \DateTimeInterface
    {
        return $this->dateError;
    }

    public function setDateError(\DateTimeInterface $dateError): self
    {
        $this->dateError = $dateError;
        return $this;
    }

    public function getError(): string
    {
        return $this->error;
    }

    public function setError(string $error): self
    {
        $this->error = $error;
        return $this;
    }
}
