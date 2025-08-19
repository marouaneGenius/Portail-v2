<?php

namespace App\Entity;

use App\Repository\SubscriptionURLRepository;
use Doctrine\ORM\Mapping as ORM;

#[ORM\Entity(repositoryClass: SubscriptionURLRepository::class)]
class SubscriptionURL
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    private ?int $id = null;

    #[ORM\ManyToOne(inversedBy: 'subscriptionURLs')]
    private ?Subscription $subscription = null;

    #[ORM\Column(length: 255)]
    private ?string $url = null;

    #[ORM\ManyToOne(inversedBy: 'subscriptionURLs')]
    private ?Student $student = null;

    #[ORM\Column(nullable: true)]
    private ?bool $is_combined = null;

    #[ORM\ManyToOne(inversedBy: 'subscriptionURLs')]
    #[ORM\JoinColumn(name: 'id_user', referencedColumnName: 'id')]
    private ?User $user = null;

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getSubscription(): ?Subscription
    {
        return $this->subscription;
    }

    public function setSubscription(?Subscription $subscription): static
    {
        $this->subscription = $subscription;

        return $this;
    }

    public function getUrl(): ?string
    {
        return $this->url;
    }

    public function setUrl(string $url): static
    {
        $this->url = $url;

        return $this;
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

    public function isIsCombined(): ?bool
    {
        return $this->is_combined;
    }

    public function setIsCombined(?bool $is_combined): static
    {
        $this->is_combined = $is_combined;

        return $this;
    }

    public function getUser(): ?User
    {
        return $this->user;
    }

    public function setUser(?User $user): static
    {
        $this->user = $user;

        return $this;
    }
}
