<?php

namespace App\Entity\LacryoPortailGc;

use Doctrine\ORM\Mapping as ORM;

#[ORM\Table(name: "stripe_traitement")]
#[ORM\Entity]
class StripeTraitement
{
    #[ORM\Column(name: "id", type: "integer", nullable: false)]
    #[ORM\Id]
    #[ORM\GeneratedValue(strategy: "IDENTITY")]
    private ?int $id = null;

    #[ORM\Column(name: "id_invoice", type: "string", length: 255, nullable: false)]
    private string $idInvoice;

    // Getters et Setters

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getIdInvoice(): string
    {
        return $this->idInvoice;
    }

    public function setIdInvoice(string $idInvoice): self
    {
        $this->idInvoice = $idInvoice;
        return $this;
    }
}
