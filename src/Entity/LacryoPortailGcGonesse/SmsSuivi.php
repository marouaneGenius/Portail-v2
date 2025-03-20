<?php

namespace App\Entity\LacryoPortailGcGonesse;

use Doctrine\ORM\Mapping as ORM;

#[ORM\Entity]
#[ORM\Table(name: 'sms_suivi')]
class SmsSuivi
{
    #[ORM\Id]
    #[ORM\GeneratedValue(strategy: 'IDENTITY')]
    #[ORM\Column(name: 'id', type: 'integer', nullable: false)]
    private ?int $id = null;

    #[ORM\Column(name: 'id_eleve', type: 'integer', nullable: false)]
    private int $idEleve;

    #[ORM\Column(name: 'date_suivi', type: 'date', nullable: false)]
    private \DateTimeInterface $dateSuivi;

    #[ORM\Column(name: 'num_parent', type: 'string', length: 255, nullable: false)]
    private string $numParent;

    // Getters & Setters

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
