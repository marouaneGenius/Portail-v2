<?php

namespace App\Entity\LacryoPortailGc;

use Doctrine\ORM\Mapping as ORM;

#[ORM\Table(name: "compte_rendu_apres_seance")]
#[ORM\Entity]
class CompteRenduApresSeance
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

    #[ORM\Column(name: "contenu", type: "text", length: 65535, nullable: false)]
    private string $contenu;

    #[ORM\Column(name: "autonomie", type: "integer", nullable: false)]
    private int $autonomie;

    #[ORM\Column(name: "motivation", type: "integer", nullable: false)]
    private int $motivation;

    #[ORM\Column(name: "concentration", type: "integer", nullable: false)]
    private int $concentration;

    #[ORM\Column(name: "initiatives", type: "integer", nullable: false)]
    private int $initiatives;

    #[ORM\Column(name: "organisation", type: "integer", nullable: false)]
    private int $organisation;

    #[ORM\Column(name: "adaptation", type: "integer", nullable: false)]
    private int $adaptation;

    #[ORM\Column(name: "comprehension", type: "integer", nullable: false)]
    private int $comprehension;

    #[ORM\Column(name: "comprehension_exercices", type: "integer", nullable: false)]
    private int $comprehensionExercices;

    #[ORM\Column(name: "devoirs", type: "boolean", nullable: false)]
    private bool $devoirs;

    #[ORM\Column(name: "remarque", type: "text", length: 65535, nullable: true)]
    private ?string $remarque = null;

    #[ORM\Column(name: "signalement", type: "boolean", nullable: false)]
    private bool $signalement;

    #[ORM\Column(name: "remarque_genius", type: "text", length: 65535, nullable: true)]
    private ?string $remarqueGenius = null;

    #[ORM\Column(name: "devoirs_faits", type: "boolean", nullable: true)]
    private ?bool $devoirsFaits = null;

    #[ORM\Column(name: "capacite_organisation", type: "integer", nullable: true)]
    private ?int $capaciteOrganisation = null;

    #[ORM\Column(name: "check_efficacite", type: "boolean", nullable: true)]
    private ?bool $checkEfficacite = null;

    #[ORM\Column(name: "detail_efficacite", type: "text", length: 65535, nullable: true)]
    private ?string $detailEfficacite = null;

    #[ORM\Column(name: "contact_tuteur", type: "boolean", nullable: true)]
    private ?bool $contactTuteur = null;

    // Getters et Setters

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

    public function getContenu(): string
    {
        return $this->contenu;
    }

    public function setContenu(string $contenu): self
    {
        $this->contenu = $contenu;
        return $this;
    }

    public function getAutonomie(): int
    {
        return $this->autonomie;
    }

    public function setAutonomie(int $autonomie): self
    {
        $this->autonomie = $autonomie;
        return $this;
    }

    public function getMotivation(): int
    {
        return $this->motivation;
    }

    public function setMotivation(int $motivation): self
    {
        $this->motivation = $motivation;
        return $this;
    }

    public function getConcentration(): int
    {
        return $this->concentration;
    }

    public function setConcentration(int $concentration): self
    {
        $this->concentration = $concentration;
        return $this;
    }

    public function getInitiatives(): int
    {
        return $this->initiatives;
    }

    public function setInitiatives(int $initiatives): self
    {
        $this->initiatives = $initiatives;
        return $this;
    }

    public function getOrganisation(): int
    {
        return $this->organisation;
    }

    public function setOrganisation(int $organisation): self
    {
        $this->organisation = $organisation;
        return $this;
    }

    public function getAdaptation(): int
    {
        return $this->adaptation;
    }

    public function setAdaptation(int $adaptation): self
    {
        $this->adaptation = $adaptation;
        return $this;
    }

    public function getComprehension(): int
    {
        return $this->comprehension;
    }

    public function setComprehension(int $comprehension): self
    {
        $this->comprehension = $comprehension;
        return $this;
    }

    public function getComprehensionExercices(): int
    {
        return $this->comprehensionExercices;
    }

    public function setComprehensionExercices(int $comprehensionExercices): self
    {
        $this->comprehensionExercices = $comprehensionExercices;
        return $this;
    }

    public function getDevoirs(): bool
    {
        return $this->devoirs;
    }

    public function setDevoirs(bool $devoirs): self
    {
        $this->devoirs = $devoirs;
        return $this;
    }

    public function getRemarque(): ?string
    {
        return $this->remarque;
    }

    public function setRemarque(?string $remarque): self
    {
        $this->remarque = $remarque;
        return $this;
    }

    public function getSignalement(): bool
    {
        return $this->signalement;
    }

    public function setSignalement(bool $signalement): self
    {
        $this->signalement = $signalement;
        return $this;
    }

    public function getRemarqueGenius(): ?string
    {
        return $this->remarqueGenius;
    }

    public function setRemarqueGenius(?string $remarqueGenius): self
    {
        $this->remarqueGenius = $remarqueGenius;
        return $this;
    }

    public function getDevoirsFaits(): ?bool
    {
        return $this->devoirsFaits;
    }

    public function setDevoirsFaits(?bool $devoirsFaits): self
    {
        $this->devoirsFaits = $devoirsFaits;
        return $this;
    }

    public function getCapaciteOrganisation(): ?int
    {
        return $this->capaciteOrganisation;
    }

    public function setCapaciteOrganisation(?int $capaciteOrganisation): self
    {
        $this->capaciteOrganisation = $capaciteOrganisation;
        return $this;
    }

    public function getCheckEfficacite(): ?bool
    {
        return $this->checkEfficacite;
    }

    public function setCheckEfficacite(?bool $checkEfficacite): self
    {
        $this->checkEfficacite = $checkEfficacite;
        return $this;
    }

    public function getDetailEfficacite(): ?string
    {
        return $this->detailEfficacite;
    }

    public function setDetailEfficacite(?string $detailEfficacite): self
    {
        $this->detailEfficacite = $detailEfficacite;
        return $this;
    }

    public function getContactTuteur(): ?bool
    {
        return $this->contactTuteur;
    }

    public function setContactTuteur(?bool $contactTuteur): self
    {
        $this->contactTuteur = $contactTuteur;
        return $this;
    }
}
