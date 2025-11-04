<?php

namespace App\Entity;

use App\Repository\PronoteHomeworkRepository;
use Doctrine\ORM\Mapping as ORM;

#[ORM\Entity(repositoryClass: PronoteHomeworkRepository::class)]
#[ORM\Table(name: 'pronote_homework')]
#[ORM\UniqueConstraint(name: 'unique_homework', columns: ['student_id', 'date', 'subject', 'description_hash'])]
class PronoteHomework
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    private ?int $id = null;

    #[ORM\ManyToOne(targetEntity: Student::class)]
    #[ORM\JoinColumn(nullable: false, onDelete: 'CASCADE')]
    private ?Student $student = null;

    #[ORM\Column(length: 100, nullable: true)]
    private ?string $date = null;

    #[ORM\Column(length: 255, nullable: true)]
    private ?string $subject = null;

    #[ORM\Column(length: 100, nullable: true)]
    private ?string $status = null;

    #[ORM\Column(type: 'text', nullable: true)]
    private ?string $description = null;

    #[ORM\Column(length: 64, nullable: true)]
    private ?string $description_hash = null;

    #[ORM\Column]
    private ?\DateTimeImmutable $scraped_at = null;

    #[ORM\Column]
    private ?\DateTimeImmutable $created_at = null;

    public function __construct()
    {
        $this->scraped_at = new \DateTimeImmutable();
        $this->created_at = new \DateTimeImmutable();
    }

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getStudent(): ?Student
    {
        return $this->student;
    }

    public function setStudent(?Student $student): static
    {
        $this->student = $student;
        return $this;
    }

    public function getDate(): ?string
    {
        return $this->date;
    }

    public function setDate(?string $date): static
    {
        $this->date = $date;
        return $this;
    }

    public function getSubject(): ?string
    {
        return $this->subject;
    }

    public function setSubject(?string $subject): static
    {
        $this->subject = $subject;
        return $this;
    }

    public function getStatus(): ?string
    {
        return $this->status;
    }

    public function setStatus(?string $status): static
    {
        $this->status = $status;
        return $this;
    }

    public function getDescription(): ?string
    {
        return $this->description;
    }

    public function setDescription(?string $description): static
    {
        $this->description = $description;
        // Générer automatiquement le hash
        $this->description_hash = $description ? hash('sha256', $description) : null;
        return $this;
    }

    public function getDescriptionHash(): ?string
    {
        return $this->description_hash;
    }

    public function setDescriptionHash(?string $description_hash): static
    {
        $this->description_hash = $description_hash;
        return $this;
    }

    public function getScrapedAt(): ?\DateTimeImmutable
    {
        return $this->scraped_at;
    }

    public function setScrapedAt(\DateTimeImmutable $scraped_at): static
    {
        $this->scraped_at = $scraped_at;
        return $this;
    }

    public function getCreatedAt(): ?\DateTimeImmutable
    {
        return $this->created_at;
    }

    public function setCreatedAt(\DateTimeImmutable $created_at): static
    {
        $this->created_at = $created_at;
        return $this;
    }
}
