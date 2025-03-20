<?php

namespace App\Entity\LacryoPortailGcEng;

use Doctrine\ORM\Mapping as ORM;

#[ORM\Entity]
#[ORM\Table(name: 'suivi_ent')]
class SuiviEnt
{
    #[ORM\Id]
    #[ORM\GeneratedValue(strategy: 'IDENTITY')]
    #[ORM\Column(type: 'integer')]
    private ?int $id = null;

    #[ORM\Column(type: 'integer')]
    private int $idEleve;

    #[ORM\Column(type: 'string', length: 255)]
    private string $matiere;

    #[ORM\Column(type: 'text')]
    private string $titre;

    #[ORM\Column(type: 'float')]
    private float $note;

    #[ORM\Column(type: 'integer')]
    private int $noteSur;

    #[ORM\Column(type: 'float')]
    private float $coef;

    #[ORM\Column(type: 'date')]
    private \DateTimeInterface $dateControle;

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

    public function getMatiere(): string
    {
        return $this->matiere;
    }

    public function setMatiere(string $matiere): self
    {
        $this->matiere = $matiere;
        return $this;
    }

    public function getTitre(): string
    {
        return $this->titre;
    }

    public function setTitre(string $titre): self
    {
        $this->titre = $titre;
        return $this;
    }

    public function getNote(): float
    {
        return $this->note;
    }

    public function setNote(float $note): self
    {
        $this->note = $note;
        return $this;
    }

    public function getNoteSur(): int
    {
        return $this->noteSur;
    }

    public function setNoteSur(int $noteSur): self
    {
        $this->noteSur = $noteSur;
        return $this;
    }

    public function getCoef(): float
    {
        return $this->coef;
    }

    public function setCoef(float $coef): self
    {
        $this->coef = $coef;
        return $this;
    }

    public function getDateControle(): \DateTimeInterface
    {
        return $this->dateControle;
    }

    public function setDateControle(\DateTimeInterface $dateControle): self
    {
        $this->dateControle = $dateControle;
        return $this;
    }
}
