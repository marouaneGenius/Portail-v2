<?php

namespace App\Entity\LacryoGeniusHome;

use Doctrine\ORM\Mapping as ORM;

#[ORM\Table(name: "conv")]
#[ORM\Entity]
class Conv
{
    #[ORM\Column(name: "id", type: "integer", nullable: false)]
    #[ORM\Id]
    #[ORM\GeneratedValue(strategy: "IDENTITY")]
    private ?int $id = null;

    #[ORM\Column(name: "id_edt", type: "integer", nullable: false)]
    private int $idEdt;

    #[ORM\Column(name: "id_sender", type: "integer", nullable: false)]
    private int $idSender;

    #[ORM\Column(name: "message", type: "string", length: 255, nullable: false)]
    private string $message;

    // Getters et Setters

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getIdEdt(): int
    {
        return $this->idEdt;
    }

    public function setIdEdt(int $idEdt): self
    {
        $this->idEdt = $idEdt;
        return $this;
    }

    public function getIdSender(): int
    {
        return $this->idSender;
    }

    public function setIdSender(int $idSender): self
    {
        $this->idSender = $idSender;
        return $this;
    }

    public function getMessage(): string
    {
        return $this->message;
    }

    public function setMessage(string $message): self
    {
        $this->message = $message;
        return $this;
    }
}
