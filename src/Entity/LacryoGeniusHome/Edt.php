<?php

namespace App\Entity\LacryoGeniusHome;

use Doctrine\ORM\Mapping as ORM;

#[ORM\Table(name: "edt")]
#[ORM\Entity]
class Edt
{
    #[ORM\Column(name: "id", type: "integer", nullable: false)]
    #[ORM\Id]
    #[ORM\GeneratedValue(strategy: "IDENTITY")]
    private ?int $id = null;

    #[ORM\Column(name: "date_edt", type: "date", nullable: false)]
    private \DateTimeInterface $dateEdt;

    #[ORM\Column(name: "id_student", type: "string", length: 255, nullable: false)]
    private string $idStudent;

    #[ORM\Column(name: "id_teacher", type: "integer", nullable: false)]
    private int $idTeacher;

    #[ORM\Column(name: "titre", type: "string", length: 255, nullable: false)]
    private string $titre;

    #[ORM\Column(name: "description", type: "text", length: 65535, nullable: false)]
    private string $description;

    #[ORM\Column(name: "temps", type: "string", length: 255, nullable: false)]
    private string $temps;

    #[ORM\Column(name: "upload", type: "integer", nullable: false)]
    private int $upload = 0;

    #[ORM\Column(name: "date_rendu", type: "date", nullable: true)]
    private ?\DateTimeInterface $dateRendu = null;

    #[ORM\Column(name: "resolu", type: "integer", nullable: false)]
    private int $resolu = 0;

    #[ORM\Column(name: "option_depot", type: "integer", nullable: false)]
    private int $optionDepot = 0;

    // Getters et Setters

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getDateEdt(): \DateTimeInterface
    {
        return $this->dateEdt;
    }

    public function setDateEdt(\DateTimeInterface $dateEdt): self
    {
        $this->dateEdt = $dateEdt;
        return $this;
    }

    public function getIdStudent(): string
    {
        return $this->idStudent;
    }

    public function setIdStudent(string $idStudent): self
    {
        $this->idStudent = $idStudent;
        return $this;
    }

    public function getIdTeacher(): int
    {
        return $this->idTeacher;
    }

    public function setIdTeacher(int $idTeacher): self
    {
        $this->idTeacher = $idTeacher;
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

    public function getDescription(): string
    {
        return $this->description;
    }

    public function setDescription(string $description): self
    {
        $this->description = $description;
        return $this;
    }

    public function getTemps(): string
    {
        return $this->temps;
    }

    public function setTemps(string $temps): self
    {
        $this->temps = $temps;
        return $this;
    }

    public function getUpload(): int
    {
        return $this->upload;
    }

    public function setUpload(int $upload): self
    {
        $this->upload = $upload;
        return $this;
    }

    public function getDateRendu(): ?\DateTimeInterface
    {
        return $this->dateRendu;
    }

    public function setDateRendu(?\DateTimeInterface $dateRendu): self
    {
        $this->dateRendu = $dateRendu;
        return $this;
    }

    public function getResolu(): int
    {
        return $this->resolu;
    }

    public function setResolu(int $resolu): self
    {
        $this->resolu = $resolu;
        return $this;
    }

    public function getOptionDepot(): int
    {
        return $this->optionDepot;
    }

    public function setOptionDepot(int $optionDepot): self
    {
        $this->optionDepot = $optionDepot;
        return $this;
    }
}
