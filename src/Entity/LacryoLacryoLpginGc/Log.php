<?php

namespace App\Entity\LacryoLacryoLpginGc;

use Doctrine\ORM\Mapping as ORM;

#[ORM\Table(name: "log")]
#[ORM\Entity]
class Log
{
    #[ORM\Column(name: "id", type: "integer", nullable: false)]
    #[ORM\Id]
    #[ORM\GeneratedValue(strategy: "IDENTITY")]
    private ?int $id = null;

    #[ORM\Column(name: "data", type: "text", length: 65535, nullable: false)]
    private string $data;

    // Getters et Setters

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getData(): string
    {
        return $this->data;
    }

    public function setData(string $data): self
    {
        $this->data = $data;
        return $this;
    }
}
