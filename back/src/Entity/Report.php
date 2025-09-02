<?php

namespace App\Entity;

use App\Repository\ReportRepository;
use Doctrine\ORM\Mapping as ORM;

#[ORM\Entity(repositoryClass: ReportRepository::class)]
class Report
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    private ?int $id = null;

    #[ORM\ManyToOne(inversedBy: 'reports')]
    private ?Student $id_student = null;

    #[ORM\ManyToOne(inversedBy: 'reports')]
    private ?User $id_user = null;

    #[ORM\ManyToOne(inversedBy: 'reports')]
    private ?Session $id_session = null;

    #[ORM\Column]
    private array $skills_assessment = [];

    #[ORM\Column(type: 'text', nullable: true)]
    private ?string $content = null;

    #[ORM\Column(length: 255, nullable: true)]
    private ?string $points_worked = null;

    #[ORM\Column(type: 'text', nullable: true)]
    private ?string $observations = null;

    #[ORM\Column(type: 'text', nullable: true)]
    private ?string $homework_recommendations = null;

    #[ORM\Column(nullable: true)]
    private ?int $session_duration = null;

    #[ORM\Column]
    private ?\DateTimeImmutable $created_at = null;

    #[ORM\Column]
    private ?int $created_by = null;

    #[ORM\Column(nullable: true)]
    private ?\DateTimeImmutable $updated_at = null;

    #[ORM\Column(nullable: true)]
    private ?string $updated_by = null;

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getIdStudent(): ?Student
    {
        return $this->id_student;
    }

    public function setIdStudent(?Student $id_student): static
    {
        $this->id_student = $id_student;

        return $this;
    }

    public function getIdUser(): ?User
    {
        return $this->id_user;
    }

    public function setIdUser(?User $id_user): static
    {
        $this->id_user = $id_user;

        return $this;
    }

    public function getIdSession(): ?Session
    {
        return $this->id_session;
    }

    public function setIdSession(?Session $id_session): static
    {
        $this->id_session = $id_session;

        return $this;
    }

    public function getSkillsAssessment(): array
    {
        return $this->skills_assessment;
    }

    public function setSkillsAssessment(array $skills_assessment): static
    {
        $this->skills_assessment = $skills_assessment;

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

    public function getCreatedBy(): ?int
    {
        return $this->created_by;
    }

    public function setCreatedBy(int $created_by): static
    {
        $this->created_by = $created_by;

        return $this;
    }

    public function getUpdatedAt(): ?\DateTimeImmutable
    {
        return $this->updated_at;
    }

    public function setUpdatedAt(?\DateTimeImmutable $updated_at): static
    {
        $this->updated_at = $updated_at;

        return $this;
    }

    public function getUpdatedBy(): ?string
    {
        return $this->updated_by;
    }

    public function setUpdatedBy(?string $updated_by): static
    {
        $this->updated_by = $updated_by;

        return $this;
    }

    public function getContent(): ?string
    {
        return $this->content;
    }

    public function setContent(?string $content): static
    {
        $this->content = $content;

        return $this;
    }

    public function getPointsWorked(): ?string
    {
        return $this->points_worked;
    }

    public function setPointsWorked(?string $points_worked): static
    {
        $this->points_worked = $points_worked;

        return $this;
    }

    public function getObservations(): ?string
    {
        return $this->observations;
    }

    public function setObservations(?string $observations): static
    {
        $this->observations = $observations;

        return $this;
    }

    public function getHomeworkRecommendations(): ?string
    {
        return $this->homework_recommendations;
    }

    public function setHomeworkRecommendations(?string $homework_recommendations): static
    {
        $this->homework_recommendations = $homework_recommendations;

        return $this;
    }

    public function getSessionDuration(): ?int
    {
        return $this->session_duration;
    }

    public function setSessionDuration(?int $session_duration): static
    {
        $this->session_duration = $session_duration;

        return $this;
    }
}
