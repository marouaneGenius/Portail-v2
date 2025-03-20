<?php

namespace App\Entity\LacryoLandingGc;

use Doctrine\ORM\Mapping as ORM;

#[ORM\Table(name: "ville_SEO")]
#[ORM\Entity]
class VilleSeo
{
    #[ORM\Column(name: "id", type: "integer", nullable: false)]
    #[ORM\Id]
    #[ORM\GeneratedValue(strategy: "IDENTITY")]
    private ?int $id = null;

    #[ORM\Column(name: "lien_acces", type: "string", length: 255, nullable: true, options: ["default" => "/cours-particuliers/"])]
    private ?string $lienAcces = '/cours-particuliers/';

    #[ORM\Column(name: "ville", type: "string", length: 255, nullable: false)]
    private string $ville;

    #[ORM\Column(name: "codePostal", type: "integer", nullable: false)]
    private int $codepostal;

    // Getters et Setters

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getLienAcces(): ?string
    {
        return $this->lienAcces;
    }

    public function setLienAcces(?string $lienAcces): self
    {
        $this->lienAcces = $lienAcces;
        return $this;
    }

    public function getVille(): string
    {
        return $this->ville;
    }

    public function setVille(string $ville): self
    {
        $this->ville = $ville;
        return $this;
    }

    public function getCodepostal(): int
    {
        return $this->codepostal;
    }

    public function setCodepostal(int $codepostal): self
    {
        $this->codepostal = $codepostal;
        return $this;
    }
}
