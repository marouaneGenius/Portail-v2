<?php

namespace App\Entity\LacryoPortailGcEng;

use Doctrine\ORM\Mapping as ORM;

#[ORM\Entity]
#[ORM\Table(name: 'sms_suivi')]
class SmsSuivi
{
    #[ORM\Id]
    #[ORM\GeneratedValue(strategy: 'IDENTITY')]
    #[ORM\Column(type: 'integer')]
    private ?int $id = null;

    #[ORM\Column(type: 'integer')]
    private int $idEleve;

    #[ORM\Column(type: 'date')]
    private \DateTimeInterface $dateSuivi;

    #[ORM\Column(type: 'string', length: 255)]
    private string $numParent;

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getIdEleve(): int
    {
        return $this->idEleve;
    }

    public function setIdEleve(int $idEleve): self
    {
        $this->idEleve = $idEleve;
        return $this;
    }

    public function getDateSuivi(): \DateTimeInterface
    {
        return $this->dateSuivi;
    }

    public function setDateSuivi(\DateTimeInterface $dateSuivi): self
    {
        $this->dateSuivi = $dateSuivi;
        return $this;
    }

    public function getNumParent(): string
    {
        return $this->numParent;
    }

    public function setNumParent(string $numParent): self
    {
        $this->numParent = $numParent;
        return $this;
    }
}
