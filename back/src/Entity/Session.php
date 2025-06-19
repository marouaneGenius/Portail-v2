<?php

namespace App\Entity;

use App\Repository\SessionRepository;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\DBAL\Types\Types;
use Doctrine\ORM\Mapping as ORM;

#[ORM\Entity(repositoryClass: SessionRepository::class)]
class Session
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    private ?int $id = null;

    #[ORM\Column(type: Types::DATE_MUTABLE)]
    private ?\DateTimeInterface $payment_date = null;

    #[ORM\Column(length: 255, nullable: true)]
    private ?string $stripe_number = null;

    #[ORM\Column(nullable: true)]
    private ?array $school_subjects = null;

    #[ORM\Column(type: Types::DATE_MUTABLE)]
    private ?\DateTimeInterface $date_slot = null;

    #[ORM\Column(length: 255, nullable: true)]
    private ?string $resume = null;

    #[ORM\ManyToOne(inversedBy: 'sessions')]
    private ?User $id_tutor = null;

    #[ORM\ManyToMany(targetEntity: Student::class, inversedBy: 'sessions')]
    private Collection $id_student;

    #[ORM\ManyToMany(targetEntity: Subscription::class, inversedBy: 'sessions')]
    private Collection $id_subscription;

    #[ORM\Column(nullable: true)]
    private ?\DateTimeImmutable $Scheduled_at = null;

    #[ORM\Column(length: 255, nullable: true)]
    private ?string $scheduled_by = null;

    #[ORM\Column(length: 255, nullable: true)]
    private ?string $session_type = null;

    #[ORM\Column]
    private ?bool $is_canceled = null;

    #[ORM\Column(nullable: true)]
    private ?int $canceled_by = null;

    #[ORM\OneToMany(mappedBy: 'id_session', targetEntity: Report::class)]
    private Collection $reports;

    #[ORM\Column(nullable: true)]
    private ?bool $is_paid = null;

    public function __construct()
    {
        $this->id_student = new ArrayCollection();
        $this->id_subscription = new ArrayCollection();
        $this->reports = new ArrayCollection();
    }

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getPaymentDate(): ?\DateTimeInterface
    {
        return $this->payment_date;
    }

    public function setPaymentDate(\DateTimeInterface $payment_date): static
    {
        $this->payment_date = $payment_date;

        return $this;
    }

    public function getStripeNumber(): ?string
    {
        return $this->stripe_number;
    }

    public function setStripeNumber(?string $stripe_number): static
    {
        $this->stripe_number = $stripe_number;

        return $this;
    }

    public function getSchoolSubjects(): ?array
    {
        return $this->school_subjects;
    }

    public function setSchoolSubjects(?array $school_subjects): static
    {
        $this->school_subjects = $school_subjects;

        return $this;
    }

    public function getDateSlot(): ?\DateTimeInterface
    {
        return $this->date_slot;
    }

    public function setDateSlot(\DateTimeInterface $date_slot): static
    {
        $this->date_slot = $date_slot;

        return $this;
    }

    public function getResume(): ?string
    {
        return $this->resume;
    }

    public function setResume(?string $resume): static
    {
        $this->resume = $resume;

        return $this;
    }

    public function getIdTutor(): ?User
    {
        return $this->id_tutor;
    }

    public function setIdTutor(?User $id_tutor): static
    {
        $this->id_tutor = $id_tutor;

        return $this;
    }

    /**
     * @return Collection<int, Student>
     */
    public function getIdStudent(): Collection
    {
        return $this->id_student;
    }

    public function addIdStudent(Student $idStudent): static
    {
        if (!$this->id_student->contains($idStudent)) {
            $this->id_student->add($idStudent);
        }

        return $this;
    }

    public function removeIdStudent(Student $idStudent): static
    {
        $this->id_student->removeElement($idStudent);

        return $this;
    }

    /**
     * @return Collection<int, Subscription>
     */
    public function getIdSubscription(): Collection
    {
        return $this->id_subscription;
    }

    public function addIdSubscription(Subscription $idSubscription): static
    {
        if (!$this->id_subscription->contains($idSubscription)) {
            $this->id_subscription->add($idSubscription);
        }

        return $this;
    }

    public function removeIdSubscription(Subscription $idSubscription): static
    {
        $this->id_subscription->removeElement($idSubscription);

        return $this;
    }

    public function getScheduledAt(): ?\DateTimeImmutable
    {
        return $this->Scheduled_at;
    }

    public function setScheduledAt(?\DateTimeImmutable $Scheduled_at): static
    {
        $this->Scheduled_at = $Scheduled_at;

        return $this;
    }

    public function getScheduledBy(): ?string
    {
        return $this->scheduled_by;
    }

    public function setScheduledBy(?string $scheduled_by): static
    {
        $this->scheduled_by = $scheduled_by;

        return $this;
    }

    public function getSessionType(): ?string
    {
        return $this->session_type;
    }

    public function setSessionType(?string $session_type): static
    {
        $this->session_type = $session_type;

        return $this;
    }

    public function isIsCanceled(): ?bool
    {
        return $this->is_canceled;
    }

    public function setIsCanceled(bool $is_canceled): static
    {
        $this->is_canceled = $is_canceled;

        return $this;
    }

    public function getCanceledBy(): ?int
    {
        return $this->canceled_by;
    }

    public function setCanceledBy(?int $canceled_by): static
    {
        $this->canceled_by = $canceled_by;

        return $this;
    }

    /**
     * @return Collection<int, Report>
     */
    public function getReports(): Collection
    {
        return $this->reports;
    }

    public function addReport(Report $report): static
    {
        if (!$this->reports->contains($report)) {
            $this->reports->add($report);
            $report->setIdSession($this);
        }

        return $this;
    }

    public function removeReport(Report $report): static
    {
        if ($this->reports->removeElement($report)) {
            // set the owning side to null (unless already changed)
            if ($report->getIdSession() === $this) {
                $report->setIdSession(null);
            }
        }

        return $this;
    }

    public function isIsPaid(): ?bool
    {
        return $this->is_paid;
    }

    public function setIsPaid(?bool $is_paid): static
    {
        $this->is_paid = $is_paid;

        return $this;
    }
}
