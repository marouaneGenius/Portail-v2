<?php

namespace App\Entity\LacryoPortailGc;

use Doctrine\ORM\Mapping as ORM;

#[ORM\Table(name: "suivi_ent")]
#[ORM\Entity]
class SuiviEnt
{
    #[ORM\Column(name: "id", type: "integer", nullable: false)]
    #[ORM\Id]
    #[ORM\GeneratedValue(strategy: "IDENTITY")]
    private ?int $id = null;

    #[ORM\Column(name: "id_eleve", type: "integer", nullable: false)]
    private int $idEleve;

    #[ORM\Column(name: "matiere", type: "string", length: 255, nullable: false)]
    private string $matiere;

    #[ORM\Column(name: "titre", type: "text", length: 65535, nullable: false)]
    private string $titre;

    #[ORM\Column(name: "note", type: "float", precision: 10, scale: 0, nullable: false)]
    private float $note;

    #[ORM\Column(name: "note_sur", type: "integer", nullable: false)]
    private int $noteSur;

    #[ORM\Column(name: "coef", type: "float", precision: 10, scale: 0, nullable: false)]
    private float $coef;

    #[ORM\Column(name: "date_controle", type: "date", nullable: false)]
    private \DateTimeInterface $dateControle;

    // Getters et Setters

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
