<?php

namespace App\Entity\LacryoGeniusHome;

use Doctrine\ORM\Mapping as ORM;

#[ORM\Table(name: "stat")]
#[ORM\Entity]
class Stat
{
    #[ORM\Column(name: "id", type: "integer", nullable: false)]
    #[ORM\Id]
    #[ORM\GeneratedValue(strategy: "IDENTITY")]
    private ?int $id = null;

    #[ORM\Column(name: "id_student", type: "integer", nullable: false)]
    private int $idStudent;

    #[ORM\Column(name: "prenom", type: "string", length: 255, nullable: false)]
    private string $prenom;

    #[ORM\Column(name: "nom", type: "string", length: 255, nullable: false)]
    private string $nom;

    #[ORM\Column(name: "date_login", type: "date", nullable: false)]
    private \DateTimeInterface $dateLogin;

    #[ORM\Column(name: "hour_login", type: "time", nullable: false)]
    private \DateTimeInterface $hourLogin;

    // Getters et Setters

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getIdStudent(): int
    {
        return $this->idStudent;
    }

    public function setIdStudent(int $idStudent): self
    {
        $this->idStudent = $idStudent;
        return $this;
    }

    public function getPrenom(): string
    {
        return $this->prenom;
    }

    public function setPrenom(string $prenom): self
    {
        $this->prenom = $prenom;
        return $this;
    }

    public function getNom(): string
    {
        return $this->nom;
    }

    public function setNom(string $nom): self
    {
        $this->nom = $nom;
        return $this;
    }

    public function getDateLogin(): \DateTimeInterface
    {
        return $this->dateLogin;
    }

    public function setDateLogin(\DateTimeInterface $dateLogin): self
    {
        $this->dateLogin = $dateLogin;
        return $this;
    }

    public function getHourLogin(): \DateTimeInterface
    {
        return $this->hourLogin;
    }

    public function setHourLogin(\DateTimeInterface $hourLogin): self
    {
        $this->hourLogin = $hourLogin;
        return $this;
    }
}
