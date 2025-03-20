<?php

namespace App\Entity\LacryoGeniusAlm;

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

    #[ORM\Column(name: "domicile", type: "float", precision: 10, scale: 0, nullable: true)]
    private ?float $domicile = null;

    #[ORM\Column(name: "ecole", type: "float", precision: 10, scale: 0, nullable: true)]
    private ?float $ecole = null;

    #[ORM\Column(name: "numero", type: "integer", nullable: false)]
    private int $numero;

    #[ORM\Column(name: "rue", type: "string", length: 255, nullable: false)]
    private string $rue;

    #[ORM\Column(name: "ville", type: "string", length: 255, nullable: false)]
    private string $ville;

    #[ORM\Column(name: "code_postale", type: "integer", nullable: false)]
    private int $codePostale;

    #[ORM\Column(name: "distance", type: "integer", nullable: false)]
    private int $distance;

    #[ORM\Column(name: "mobilite", type: "string", length: 255, nullable: false)]
    private string $mobilite;


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

    public function getDomicile(): ?float
    {
        return $this->domicile;
    }

    public function setDomicile(?float $domicile): self
    {
        $this->domicile = $domicile;
        return $this;
    }

    public function getEcole(): ?float
    {
        return $this->ecole;
    }

    public function setEcole(?float $ecole): self
    {
        $this->ecole = $ecole;
        return $this;
    }

    public function getNumero(): int
    {
        return $this->numero;
    }

    public function setNumero(int $numero): self
    {
        $this->numero = $numero;
        return $this;
    }

    public function getRue(): string
    {
        return $this->rue;
    }

    public function setRue(string $rue): self
    {
        $this->rue = $rue;
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

    public function getCodePostale(): int
    {
        return $this->codePostale;
    }

    public function setCodePostale(int $codePostale): self
    {
        $this->codePostale = $codePostale;
        return $this;
    }

    public function getDistance(): int
    {
        return $this->distance;
    }

    public function setDistance(int $distance): self
    {
        $this->codePostale = $codePostale;
        return $this;
    }
    
    public function getMobilite(): int
    {
        return $this->mobilite;
    }

    public function setMobilite(int $mobilite): self
    {
        $this->mobilite = $mobilite;
        return $this;
    }   
}
