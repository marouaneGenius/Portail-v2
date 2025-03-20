<?php

namespace App\Entity\LacryoPortailGc;

use Doctrine\ORM\Mapping as ORM;

#[ORM\Table(name: "devoirs_compte_rendu")]
#[ORM\Entity]
class DevoirsCompteRendu
{
    #[ORM\Column(name: "id", type: "integer", nullable: false)]
    #[ORM\Id]
    #[ORM\GeneratedValue(strategy: "IDENTITY")]
    private ?int $id = null;

    #[ORM\Column(name: "id_compte_rendu", type: "integer", nullable: true)]
    private ?int $idCompteRendu = null;

    #[ORM\Column(name: "consigne", type: "text", length: 65535, nullable: true)]
    private ?string $consigne = null;

    #[ORM\Column(name: "date_rendu", type: "datetime", nullable: true)]
    private ?\DateTimeInterface $dateRendu = null;

    #[ORM\Column(name: "chemin_media", type: "string", length: 255, nullable: true)]
    private ?string $cheminMedia = null;

    #[ORM\Column(name: "temps_requis", type: "integer", nullable: true)]
    private ?int $tempsRequis = null;

    #[ORM\Column(name: "statut", type: "integer", nullable: false)]
    private int $statut = 0;

    // Getters et Setters

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getIdCompteRendu(): ?int
    {
        return $this->idCompteRendu;
    }

    public function setIdCompteRendu(?int $idCompteRendu): self
    {
        $this->idCompteRendu = $idCompteRendu;
        return $this;
    }

    public function getConsigne(): ?string
    {
        return $this->consigne;
    }

    public function setConsigne(?string $consigne): self
    {
        $this->consigne = $consigne;
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

    public function getCheminMedia(): ?string
    {
        return $this->cheminMedia;
    }

    public function setCheminMedia(?string $cheminMedia): self
    {
        $this->cheminMedia = $cheminMedia;
        return $this;
    }

    public function getTempsRequis(): ?int
    {
        return $this->tempsRequis;
    }

    public function setTempsRequis(?int $tempsRequis): self
    {
        $this->tempsRequis = $tempsRequis;
        return $this;
    }

    public function getStatut(): int
    {
        return $this->statut;
    }

    public function setStatut(int $statut): self
    {
        $this->statut = $statut;
        return $this;
    }
}
