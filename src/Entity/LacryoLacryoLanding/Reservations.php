<?php

namespace App\Entity\LacryoLacryoLanding;

use Doctrine\ORM\Mapping as ORM;

#[ORM\Table(name: "reservations")]
#[ORM\Entity]
class Reservations
{
    #[ORM\Column(name: "id", type: "integer", nullable: false)]
    #[ORM\Id]
    #[ORM\GeneratedValue(strategy: "IDENTITY")]
    private ?int $id = null;

    #[ORM\Column(name: "periode_resa", type: "datetime", nullable: false)]
    private \DateTimeInterface $periodeResa;

    #[ORM\Column(name: "prenom", type: "string", length: 255, nullable: false)]
    private string $prenom;

    #[ORM\Column(name: "nom", type: "string", length: 255, nullable: false)]
    private string $nom;

    #[ORM\Column(name: "email", type: "string", length: 255, nullable: false)]
    private string $email;

    #[ORM\Column(name: "tel", type: "string", length: 255, nullable: false)]
    private string $tel;

    #[ORM\Column(name: "date_rv", type: "string", length: 255, nullable: false)]
    private string $dateRv;

    #[ORM\Column(name: "heure_rv", type: "string", length: 255, nullable: false)]
    private string $heureRv;

    #[ORM\Column(name: "type", type: "integer", nullable: false)]
    private int $type;

    // Getters et Setters

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getPeriodeResa(): \DateTimeInterface
    {
        return $this->periodeResa;
    }

    public function setPeriodeResa(\DateTimeInterface $periodeResa): self
    {
        $this->periodeResa = $periodeResa;
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

    public function getEmail(): string
    {
        return $this->email;
    }

    public function setEmail(string $email): self
    {
        $this->email = $email;
        return $this;
    }

    public function getTel(): string
    {
        return $this->tel;
    }

    public function setTel(string $tel): self
    {
        $this->tel = $tel;
        return $this;
    }

    public function getDateRv(): string
    {
        return $this->dateRv;
    }

    public function setDateRv(string $dateRv): self
    {
        $this->dateRv = $dateRv;
        return $this;
    }

    public function getHeureRv(): string
    {
        return $this->heureRv;
    }

    public function setHeureRv(string $heureRv): self
    {
        $this->heureRv = $heureRv;
        return $this;
    }

    public function getType(): int
    {
        return $this->type;
    }

    public function setType(int $type): self
    {
        $this->type = $type;
        return $this;
    }
}
