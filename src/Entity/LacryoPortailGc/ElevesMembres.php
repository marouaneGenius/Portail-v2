<?php

namespace App\Entity\LacryoPortailGc;

use Doctrine\ORM\Mapping as ORM;

#[ORM\Table(name: "eleves_membres")]
#[ORM\Entity]
class ElevesMembres
{
    #[ORM\Column(name: "id", type: "integer", nullable: false)]
    #[ORM\Id]
    #[ORM\GeneratedValue(strategy: "IDENTITY")]
    private ?int $id = null;

    #[ORM\Column(name: "genre", type: "string", length: 11, nullable: true)]
    private ?string $genre = null;

    #[ORM\Column(name: "prenom", type: "string", length: 255, nullable: false)]
    private string $prenom;

    #[ORM\Column(name: "nom", type: "string", length: 255, nullable: false)]
    private string $nom;

    #[ORM\Column(name: "classe", type: "string", length: 255, nullable: false)]
    private string $classe;

    #[ORM\Column(name: "numero_parent", type: "string", length: 255, nullable: false)]
    private string $numeroParent;

    #[ORM\Column(name: "num_eleve", type: "integer", nullable: true)]
    private ?int $numEleve = null;

    #[ORM\Column(name: "mail_parent", type: "string", length: 255, nullable: true)]
    private ?string $mailParent = null;

    #[ORM\Column(name: "id_manage", type: "string", length: 255, nullable: true)]
    private ?string $idManage = null;

    #[ORM\Column(name: "mdp_manage", type: "string", length: 255, nullable: true)]
    private ?string $mdpManage = null;

    #[ORM\Column(name: "provenance", type: "string", length: 255, nullable: true)]
    private ?string $provenance = null;

    #[ORM\Column(name: "date_inscription", type: "date", nullable: false)]
    private \DateTimeInterface $dateInscription;

    #[ORM\Column(name: "PC", type: "integer", nullable: false, options: ["default" => 1])]
    private int $pc = 1;

    #[ORM\Column(name: "ville", type: "string", length: 255, nullable: true)]
    private ?string $ville = null;

    #[ORM\Column(name: "key_stripe", type: "string", length: 255, nullable: false)]
    private string $keyStripe;

    #[ORM\Column(name: "commentaire", type: "text", length: 65535, nullable: true)]
    private ?string $commentaire = null;

    #[ORM\Column(name: "disp_caution", type: "integer", nullable: false)]
    private int $dispCaution = 0;

    #[ORM\Column(name: "url_notion", type: "string", length: 255, nullable: true)]
    private ?string $urlNotion = null;

    #[ORM\Column(name: "url_notion_public", type: "string", length: 255, nullable: true)]
    private ?string $urlNotionPublic = null;

    #[ORM\Column(name: "id_pipedrive", type: "string", length: 255, nullable: true)]
    private ?string $idPipedrive = null;

    #[ORM\Column(name: "id_sinao", type: "string", length: 255, nullable: true)]
    private ?string $idSinao = null;

    // Getters et Setters

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getGenre(): ?string
    {
        return $this->genre;
    }

    public function setGenre(?string $genre): self
    {
        $this->genre = $genre;
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

    public function getClasse(): string
    {
        return $this->classe;
    }

    public function setClasse(string $classe): self
    {
        $this->classe = $classe;
        return $this;
    }

    public function getNumeroParent(): string
    {
        return $this->numeroParent;
    }

    public function setNumeroParent(string $numeroParent): self
    {
        $this->numeroParent = $numeroParent;
        return $this;
    }

    public function getNumEleve(): ?int
    {
        return $this->numEleve;
    }

    public function setNumEleve(?int $numEleve): self
    {
        $this->numEleve = $numEleve;
        return $this;
    }

    public function getMailParent(): ?string
    {
        return $this->mailParent;
    }

    public function setMailParent(?string $mailParent): self
    {
        $this->mailParent = $mailParent;
        return $this;
    }

    public function getIdManage(): ?string
    {
        return $this->idManage;
    }

    public function setIdManage(?string $idManage): self
    {
        $this->idManage = $idManage;
        return $this;
    }

    public function getMdpManage(): ?string
    {
        return $this->mdpManage;
    }

    public function setMdpManage(?string $mdpManage): self
    {
        $this->mdpManage = $mdpManage;
        return $this;
    }

    public function getProvenance(): ?string
    {
        return $this->provenance;
    }

    public function setProvenance(?string $provenance): self
    {
        $this->provenance = $provenance;
        return $this;
    }

    public function getDateInscription(): \DateTimeInterface
    {
        return $this->dateInscription;
    }

    public function setDateInscription(\DateTimeInterface $dateInscription): self
    {
        $this->dateInscription = $dateInscription;
        return $this;
    }

    public function getPc(): int
    {
        return $this->pc;
    }

    public function setPc(int $pc): self
    {
        $this->pc = $pc;
        return $this;
    }

    public function getVille(): ?string
    {
        return $this->ville;
    }

    public function setVille(?string $ville): self
    {
        $this->ville = $ville;
        return $this;
    }

    public function getKeyStripe(): string
    {
        return $this->keyStripe;
    }

    public function setKeyStripe(string $keyStripe): self
    {
        $this->keyStripe = $keyStripe;
        return $this;
    }

    public function getCommentaire(): ?string
    {
        return $this->commentaire;
    }

    public function setCommentaire(?string $commentaire): self
    {
        $this->commentaire = $commentaire;
        return $this;
    }

    public function getDispCaution(): int
    {
        return $this->dispCaution;
    }

    public function setDispCaution(int $dispCaution): self
    {
        $this->dispCaution = $dispCaution;
        return $this;
    }

    public function getUrlNotion(): ?string
    {
        return $this->urlNotion;
    }

    public function setUrlNotion(?string $urlNotion): self
    {
        $this->urlNotion = $urlNotion;
        return $this;
    }

    public function getUrlNotionPublic(): ?string
    {
        return $this->urlNotionPublic;
    }

    public function setUrlNotionPublic(?string $urlNotionPublic): self
    {
        $this->urlNotionPublic = $urlNotionPublic;
        return $this;
    }

    public function getIdPipedrive(): ?string
    {
        return $this->idPipedrive;
    }

    public function setIdPipedrive(?string $idPipedrive): self
    {
        $this->idPipedrive = $idPipedrive;
        return $this;
    }

    public function getIdSinao(): ?string
    {
        return $this->idSinao;
    }

    public function setIdSinao(?string $idSinao): self
    {
        $this->idSinao = $idSinao;
        return $this;
    }
}
