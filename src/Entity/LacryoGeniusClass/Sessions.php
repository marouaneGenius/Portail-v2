<?php

namespace App\Entity\LacryoGeniusClass;

use Doctrine\ORM\Mapping as ORM;

#[ORM\Table(name: "sessions")]
#[ORM\Entity]
class Sessions
{
    #[ORM\Column(name: "id", type: "integer", nullable: false)]
    #[ORM\Id]
    #[ORM\GeneratedValue(strategy: "IDENTITY")]
    private ?int $id = null;

    #[ORM\Column(name: "date_cours", type: "date", nullable: false)]
    private \DateTimeInterface $dateCours;

    #[ORM\Column(name: "matiere", type: "string", length: 255, nullable: false)]
    private string $matiere;

    #[ORM\Column(name: "etablissement", type: "string", length: 255, nullable: false)]
    private string $etablissement;

    // Getters et Setters

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getDateCours(): \DateTimeInterface
    {
        return $this->dateCours;
    }

    public function setDateCours(\DateTimeInterface $dateCours): self
    {
        $this->dateCours = $dateCours;
        return $this;
    }

    public function getMatiere(): string
    {
        return $this->matiere;
    }

    public function setMatiere(string $matiere): self
    {
        $this->matiere = $matiere;
        return $this;
    }

    public function getEtablissement(): string
    {
        return $this->etablissement;
    }

    public function setEtablissement(string $etablissement): self
    {
        $this->etablissement = $etablissement;
        return $this;
    }
}
