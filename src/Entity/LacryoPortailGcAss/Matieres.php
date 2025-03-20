<?php

namespace App\Entity\LacryoPortailGcAss;

use Doctrine\ORM\Mapping as ORM;

#[ORM\Table(name: "matieres")]
#[ORM\Entity]
class Matieres
{
    #[ORM\Column(name: "id", type: "integer", nullable: false)]
    #[ORM\Id]
    #[ORM\GeneratedValue(strategy: "IDENTITY")]
    private ?int $id = null;
    
    #[ORM\Column(name: "titre", type: "string", length: 255, nullable: false)]
    private string $titre;
    
    #[ORM\Column(name: "logo", type: "string", length: 255, nullable: false)]
    private string $logo;
    
    #[ORM\Column(name: "actif", type: "integer", nullable: false, options: ["default" => 1])]
    private int $actif = 1;

    // Getters et Setters

    public function getId(): ?int
    {
        return $this->id;
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

    public function getLogo(): string
    {
        return $this->logo;
    }

    public function setLogo(string $logo): self
    {
        $this->logo = $logo;
        return $this;
    }

    public function getActif(): int
    {
        return $this->actif;
    }

    public function setActif(int $actif): self
    {
        $this->actif = $actif;
        return $this;
    }
}
