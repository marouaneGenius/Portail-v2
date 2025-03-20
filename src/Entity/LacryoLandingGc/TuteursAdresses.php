<?php

namespace App\Entity\LacryoLandingGc;

use Doctrine\ORM\Mapping as ORM;

#[ORM\Table(name: "tuteurs_adresses")]
#[ORM\Entity]
class TuteursAdresses
{
    #[ORM\Column(name: "id", type: "integer", nullable: false)]
    #[ORM\Id]
    #[ORM\GeneratedValue(strategy: "IDENTITY")]
    private ?int $id = null;

    #[ORM\Column(name: "id_tuteur", type: "integer", nullable: false)]
    private int $idTuteur;

    #[ORM\Column(name: "id_centre", type: "integer", nullable: false)]
    private int $idCentre;

    // Getters et Setters

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getIdTuteur(): int
    {
        return $this->idTuteur;
    }

    public function setIdTuteur(int $idTuteur): self
    {
        $this->idTuteur = $idTuteur;
        return $this;
    }

    public function getIdCentre(): int
    {
        return $this->idCentre;
    }

    public function setIdCentre(int $idCentre): self
    {
        $this->idCentre = $idCentre;
        return $this;
    }
}
