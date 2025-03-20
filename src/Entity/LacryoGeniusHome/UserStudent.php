<?php

namespace App\Entity\LacryoGeniusHome;

use Doctrine\ORM\Mapping as ORM;

#[ORM\Table(name: "user_student")]
#[ORM\Entity]
class UserStudent
{
    #[ORM\Column(name: "id", type: "integer", nullable: false)]
    #[ORM\Id]
    #[ORM\GeneratedValue(strategy: "IDENTITY")]
    private ?int $id = null;

    #[ORM\Column(name: "nom", type: "string", length: 255, nullable: false)]
    private string $nom;

    #[ORM\Column(name: "prenom", type: "string", length: 255, nullable: false)]
    private string $prenom;

    #[ORM\Column(name: "classe", type: "string", length: 255, nullable: false)]
    private string $classe;

    #[ORM\Column(name: "mail", type: "string", length: 255, nullable: false)]
    private string $mail;

    #[ORM\Column(name: "mail_parent", type: "string", length: 255, nullable: false)]
    private string $mailParent;

    #[ORM\Column(name: "num", type: "string", length: 255, nullable: false)]
    private string $num;

    #[ORM\Column(name: "mdp", type: "string", length: 255, nullable: false)]
    private string $mdp;

    #[ORM\Column(name: "acces", type: "integer", nullable: false, options: ["default" => 1])]
    private int $acces = 1;

    #[ORM\Column(name: "id_suivi", type: "integer", nullable: false)]
    private int $idSuivi;

    // Getters et Setters

    public function getId(): ?int
    {
        return $this->id;
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

    public function getPrenom(): string
    {
        return $this->prenom;
    }

    public function setPrenom(string $prenom): self
    {
        $this->prenom = $prenom;
        return $this;
    }

    public function getClasse(): string
    {
        return $this->classe;
    }

    public function setClasse(string $classe): self
    {
        $this->classe = $classe;
        return $this;
    }

    public function getMail(): string
    {
        return $this->mail;
    }

    public function setMail(string $mail): self
    {
        $this->mail = $mail;
        return $this;
    }

    public function getMailParent(): string
    {
        return $this->mailParent;
    }

    public function setMailParent(string $mailParent): self
    {
        $this->mailParent = $mailParent;
        return $this;
    }

    public function getNum(): string
    {
        return $this->num;
    }

    public function setNum(string $num): self
    {
        $this->num = $num;
        return $this;
    }

    public function getMdp(): string
    {
        return $this->mdp;
    }

    public function setMdp(string $mdp): self
    {
        $this->mdp = $mdp;
        return $this;
    }

    public function getAcces(): int
    {
        return $this->acces;
    }

    public function setAcces(int $acces): self
    {
        $this->acces = $acces;
        return $this;
    }

    public function getIdSuivi(): int
    {
        return $this->idSuivi;
    }

    public function setIdSuivi(int $idSuivi): self
    {
        $this->idSuivi = $idSuivi;
        return $this;
    }
}
