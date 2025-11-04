<?php

namespace App\Entity;

use App\Repository\PronoteExamRepository;
use Doctrine\ORM\Mapping as ORM;

#[ORM\Entity(repositoryClass: PronoteExamRepository::class)]
#[ORM\Table(name: 'pronote_exam')]
#[ORM\UniqueConstraint(name: 'unique_exam', columns: ['student_id', 'day', 'month', 'subject', 'date_time'])]
class PronoteExam
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    private ?int $id = null;

    #[ORM\ManyToOne(targetEntity: Student::class)]
    #[ORM\JoinColumn(nullable: false, onDelete: 'CASCADE')]
    private ?Student $student = null;

    #[ORM\Column(length: 10, nullable: true)]
    private ?string $day = null;

    #[ORM\Column(length: 50, nullable: true)]
    private ?string $month = null;

    #[ORM\Column(length: 255, nullable: true)]
    private ?string $subject = null;

    #[ORM\Column(length: 100, nullable: true)]
    private ?string $date_time = null;

    #[ORM\Column(length: 100, nullable: true)]
    private ?string $salle = null;

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

    public function getDay(): ?string
    {
        return $this->day;
    }

    public function setDay(?string $day): static
    {
        $this->day = $day;
        return $this;
    }

    public function getMonth(): ?string
    {
        return $this->month;
    }

    public function setMonth(?string $month): static
    {
        $this->month = $month;
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

    public function getDateTime(): ?string
    {
        return $this->date_time;
    }

    public function setDateTime(?string $date_time): static
    {
        $this->date_time = $date_time;
        return $this;
    }

    public function getSalle(): ?string
    {
        return $this->salle;
    }

    public function setSalle(?string $salle): static
    {
        $this->salle = $salle;
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
