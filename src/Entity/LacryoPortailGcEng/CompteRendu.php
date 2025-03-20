<?php

namespace App\Entity\LacryoPortailGcEng;

use Doctrine\ORM\Mapping as ORM;

#[ORM\Table(name: "compte_rendu")]
#[ORM\Entity]
class CompteRendu
{
    #[ORM\Column(name: "id", type: "integer", nullable: false)]
    #[ORM\Id]
    #[ORM\GeneratedValue(strategy: "IDENTITY")]
    private ?int $id = null;
    
    #[ORM\Column(name: "id_eleve", type: "integer", nullable: false)]
    private int $idEleve;
    
    #[ORM\Column(name: "id_prof", type: "integer", nullable: false)]
    private int $idProf;
    
    #[ORM\Column(name: "date_cours", type: "date", nullable: false)]
    private \DateTimeInterface $dateCours;
    
    #[ORM\Column(name: "titre", type: "string", length: 255, nullable: false)]
    private string $titre;
    
    #[ORM\Column(name: "matiere", type: "string", length: 255, nullable: false)]
    private string $matiere;
    
    #[ORM\Column(name: "description", type: "text", length: 65535, nullable: false)]
    private string $description;
    
    #[ORM\Column(name: "maitrise", type: "integer", nullable: false)]
    private int $maitrise;
    
    #[ORM\Column(name: "date_post", type: "date", nullable: false)]
    private \DateTimeInterface $datePost;
    
    #[ORM\Column(name: "devoirs", type: "text", length: 65535, nullable: false)]
    private string $devoirs;
    
    // Getters and Setters

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

    public function getIdProf(): int
    {
        return $this->idProf;
    }

    public function setIdProf(int $idProf): self
    {
        $this->idProf = $idProf;
        return $this;
    }

    public function getDateCours(): \DateTimeInterface
    {
        return $this->dateCours;
    }

    public function setDateCours(\DateTimeInterface $dateCours): self
    {
        $this->dateCours = $dateCours;
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

    public function getMatiere(): string
    {
        return $this->matiere;
    }

    public function setMatiere(string $matiere): self
    {
        $this->matiere = $matiere;
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

    public function getMaitrise(): int
    {
        return $this->maitrise;
    }

    public function setMaitrise(int $maitrise): self
    {
        $this->maitrise = $maitrise;
        return $this;
    }

    public function getDatePost(): \DateTimeInterface
    {
        return $this->datePost;
    }

    public function setDatePost(\DateTimeInterface $datePost): self
    {
        $this->datePost = $datePost;
        return $this;
    }

    public function getDevoirs(): string
    {
        return $this->devoirs;
    }

    public function setDevoirs(string $devoirs): self
    {
        $this->devoirs = $devoirs;
        return $this;
    }
}
