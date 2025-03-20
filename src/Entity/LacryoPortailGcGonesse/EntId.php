<?php

namespace App\Entity\LacryoPortailGcGonesse;

use Doctrine\ORM\Mapping as ORM;

#[ORM\Entity]
#[ORM\Table(name: 'ent_id')]
#[ORM\Index(name: 'id_eleve', columns: ['id_eleve'])]
class EntId
{
    #[ORM\Id]
    #[ORM\GeneratedValue(strategy: 'IDENTITY')]
    #[ORM\Column(name: 'id', type: 'integer', nullable: false)]
    private ?int $id = null;

    #[ORM\Column(name: 'prenom', type: 'string', length: 255, nullable: false)]
    private string $prenom;

    #[ORM\Column(name: 'id_eleve', type: 'integer', nullable: false)]
    private int $idEleve = 0;

    #[ORM\Column(name: 'nom', type: 'string', length: 255, nullable: false)]
    private string $nom;

    #[ORM\Column(name: 'plateforme', type: 'string', length: 255, nullable: false)]
    private string $plateforme;

    #[ORM\Column(name: 'identifiant', type: 'string', length: 255, nullable: false)]
    private string $identifiant;

    #[ORM\Column(name: 'mdp', type: 'string', length: 255, nullable: false)]
    private string $mdp;

    #[ORM\Column(name: 'type_compte', type: 'string', length: 255, nullable: true)]
    private ?string $typeCompte = null;

    #[ORM\Column(name: 'url', type: 'string', length: 255, nullable: true)]
    private ?string $url = null;

    #[ORM\Column(name: 'cas', type: 'string', length: 255, nullable: true)]
    private ?string $cas = null;

    #[ORM\Column(name: 'validation', type: 'integer', nullable: false)]
    private int $validation = 0;

    // Getters & Setters

    public function getId(): ?int
    {
        return $this->id;
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

    public function getIdEleve(): int
    {
        return $this->idEleve;
    }

    public function setIdEleve(int $idEleve): self
    {
        $this->idEleve = $idEleve;
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

    public function getPlateforme(): string
    {
        return $this->plateforme;
    }

    public function setPlateforme(string $plateforme): self
    {
        $this->plateforme = $plateforme;
        return $this;
    }

    public function getIdentifiant(): string
    {
        return $this->identifiant;
    }

    public function setIdentifiant(string $identifiant): self
    {
        $this->identifiant = $identifiant;
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

    public function getTypeCompte(): ?string
    {
        return $this->typeCompte;
    }

    public function setTypeCompte(?string $typeCompte): self
    {
        $this->typeCompte = $typeCompte;
        return $this;
    }

    public function getUrl(): ?string
    {
        return $this->url;
    }

    public function setUrl(?string $url): self
    {
        $this->url = $url;
        return $this;
    }

    public function getCas(): ?string
    {
        return $this->cas;
    }

    public function setCas(?string $cas): self
    {
        $this->cas = $cas;
        return $this;
    }

    public function getValidation(): int
    {
        return $this->validation;
    }

    public function setValidation(int $validation): self
    {
        $this->validation = $validation;
        return $this;
    }
}
