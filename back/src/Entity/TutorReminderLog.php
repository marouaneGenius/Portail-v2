<?php

namespace App\Entity;

use App\Repository\TutorReminderLogRepository;
use Doctrine\ORM\Mapping as ORM;

#[ORM\Entity(repositoryClass: TutorReminderLogRepository::class)]
class TutorReminderLog
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    private ?int $id = null;

    #[ORM\ManyToOne(targetEntity: User::class)]
    #[ORM\JoinColumn(nullable: false)]
    private ?User $tutor = null;

    #[ORM\Column(type: 'date')]
    private ?\DateTimeInterface $reminderDate = null;

    #[ORM\Column(type: 'date')]
    private ?\DateTimeInterface $sessionDate = null;

    #[ORM\Column(length: 20)]
    private ?string $phone = null;

    #[ORM\Column(type: 'text')]
    private ?string $message = null;

    #[ORM\Column(type: 'boolean')]
    private ?bool $successful = null;

    #[ORM\Column(type: 'text', nullable: true)]
    private ?string $errorMessage = null;

    #[ORM\Column]
    private ?\DateTimeImmutable $createdAt = null;

    public function __construct()
    {
        $this->createdAt = new \DateTimeImmutable();
        $this->reminderDate = new \DateTime();
    }

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getTutor(): ?User
    {
        return $this->tutor;
    }

    public function setTutor(?User $tutor): static
    {
        $this->tutor = $tutor;
        return $this;
    }

    public function getReminderDate(): ?\DateTimeInterface
    {
        return $this->reminderDate;
    }

    public function setReminderDate(\DateTimeInterface $reminderDate): static
    {
        $this->reminderDate = $reminderDate;
        return $this;
    }

    public function getSessionDate(): ?\DateTimeInterface
    {
        return $this->sessionDate;
    }

    public function setSessionDate(\DateTimeInterface $sessionDate): static
    {
        $this->sessionDate = $sessionDate;
        return $this;
    }

    public function getPhone(): ?string
    {
        return $this->phone;
    }

    public function setPhone(string $phone): static
    {
        $this->phone = $phone;
        return $this;
    }

    public function getMessage(): ?string
    {
        return $this->message;
    }

    public function setMessage(string $message): static
    {
        $this->message = $message;
        return $this;
    }

    public function isSuccessful(): ?bool
    {
        return $this->successful;
    }

    public function setSuccessful(bool $successful): static
    {
        $this->successful = $successful;
        return $this;
    }

    public function getErrorMessage(): ?string
    {
        return $this->errorMessage;
    }

    public function setErrorMessage(?string $errorMessage): static
    {
        $this->errorMessage = $errorMessage;
        return $this;
    }

    public function getCreatedAt(): ?\DateTimeImmutable
    {
        return $this->createdAt;
    }

    public function setCreatedAt(\DateTimeImmutable $createdAt): static
    {
        $this->createdAt = $createdAt;
        return $this;
    }
}