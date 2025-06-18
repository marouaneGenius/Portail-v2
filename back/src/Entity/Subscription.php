<?php

namespace App\Entity;

use App\Repository\SubscriptionRepository;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\DBAL\Types\Types;
use Doctrine\ORM\Mapping as ORM;

#[ORM\Entity(repositoryClass: SubscriptionRepository::class)]
class Subscription
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    private ?int $id = null;

    #[ORM\ManyToOne(inversedBy: 'subscriptions')]
    private ?Student $id_student = null;

    #[ORM\Column]
    private ?\DateTimeImmutable $created_at = null;

    #[ORM\Column(length: 255, nullable: true)]
    private ?string $created_by = null;

    #[ORM\Column(length: 255, nullable: true)]
    private ?string $updated_by = null;

    #[ORM\Column(nullable: true)]
    private ?\DateTimeImmutable $updated_at = null;

    #[ORM\Column(type: Types::DATETIME_MUTABLE, nullable: true)]
    private ?\DateTimeInterface $subscription_end_date = null;

    #[ORM\Column(type: Types::DATETIME_MUTABLE, nullable: true)]
    private ?\DateTimeInterface $first_debit_date = null;

    #[ORM\Column(length: 255, nullable: true)]
    private ?string $recurrent_debit_date = null;

    #[ORM\Column(nullable: true)]
    private ?int $installment_count = null;

    #[ORM\Column(nullable: true)]
    private ?int $session_per_week = null;

    #[ORM\Column(nullable: true)]
    private ?int $week_count = null;

    #[ORM\Column(nullable: true)]
    private ?array $selected_weeks = null;

    #[ORM\Column(length: 255, nullable: true)]
    private ?string $known_weeks = null;

    #[ORM\Column(nullable: true)]
    private ?array $session_schedule = null;

    #[ORM\Column(nullable: true)]
    private ?int $discount = null;

    #[ORM\Column(nullable: true)]
    private ?array $school_subjects = null;

    #[ORM\Column(length: 255)]
    private ?string $offer_type = null;

    #[ORM\Column(nullable: true)]
    private ?int $offer_amount = null;

    #[ORM\Column(nullable: true)]
    private ?float $membership_fee = null;

    #[ORM\Column(nullable: true)]
    private ?string $combined_id = null;

    #[ORM\Column(length: 255)]
    private ?string $subscription_type = null;

    #[ORM\Column]
    private ?bool $is_valide = false;

    #[ORM\ManyToMany(targetEntity: Session::class, mappedBy: 'id_subscription')]
    private Collection $sessions;

    #[ORM\Column(type: Types::DATETIME_MUTABLE, nullable: true)]
    private ?\DateTimeInterface $subscription_start_date = null;

    #[ORM\Column(length: 255, nullable: true)]
    private ?string $payment_mode = null;

    #[ORM\Column(type: Types::DATE_MUTABLE, nullable: true)]
    private ?\DateTimeInterface $date_caution = null;

    #[ORM\Column(nullable: true)]
    private ?bool $caution = null;

    #[ORM\Column(nullable: true)]
    private ?array $favorite_slots = null;

    #[ORM\OneToMany(mappedBy: 'subscription', targetEntity: SubscriptionURL::class)]
    private Collection $subscriptionURLs;

    public function __construct()
    {
        $this->sessions = new ArrayCollection();
        $this->subscriptionURLs = new ArrayCollection();
    }



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

    public function getCreatedAt(): ?\DateTimeImmutable
    {
        return $this->created_at;
    }

    public function setCreatedAt(\DateTimeImmutable $created_at): static
    {
        $this->created_at = $created_at;

        return $this;
    }

    public function getCreatedBy(): ?string
    {
        return $this->created_by;
    }

    public function setCreatedBy(?string $created_by): static
    {
        $this->created_by = $created_by;

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

    public function getUpdatedAt(): ?\DateTimeImmutable
    {
        return $this->updated_at;
    }

    public function setUpdatedAt(?\DateTimeImmutable $updated_at): static
    {
        $this->updated_at = $updated_at;

        return $this;
    }

    public function getSubscriptionEndDate(): ?\DateTimeInterface
    {
        return $this->subscription_end_date;
    }

    public function setSubscriptionEndDate(?\DateTimeInterface $subscription_end_date): static
    {
        $this->subscription_end_date = $subscription_end_date;

        return $this;
    }

    public function getFirstDebitDate(): ?\DateTimeInterface
    {
        return $this->first_debit_date;
    }

    public function setFirstDebitDate(?\DateTimeInterface $first_debit_date): static
    {
        $this->first_debit_date = $first_debit_date;

        return $this;
    }

    public function getRecurrentDebitDate(): ?string
    {
        return $this->recurrent_debit_date;
    }

    public function setRecurrentDebitDate(?string $recurrent_debit_date): static
    {
        $this->recurrent_debit_date = $recurrent_debit_date;

        return $this;
    }

    public function getInstallmentCount(): ?int
    {
        return $this->installment_count;
    }

    public function setInstallmentCount(?int $installment_count): static
    {
        $this->installment_count = $installment_count;

        return $this;
    }

    public function getSessionPerWeek(): ?int
    {
        return $this->session_per_week;
    }

    public function setSessionPerWeek(?int $session_per_week): static
    {
        $this->session_per_week = $session_per_week;

        return $this;
    }

    public function getWeekCount(): ?int
    {
        return $this->week_count;
    }

    public function setWeekCount(?int $week_count): static
    {
        $this->week_count = $week_count;

        return $this;
    }

    public function getSelectedWeeks(): ?array
    {
        return $this->selected_weeks;
    }

    public function setSelectedWeeks(?array $selected_weeks): static
    {
        $this->selected_weeks = $selected_weeks;

        return $this;
    }

    public function getKnownWeeks(): ?string
    {
        return $this->known_weeks;
    }

    public function setKnownWeeks(?string $known_weeks): static
    {
        $this->known_weeks = $known_weeks;

        return $this;
    }

    public function getSessionSchedule(): ?array
    {
        return $this->session_schedule;
    }

    public function setSessionSchedule(?array $session_schedule): static
    {
        $this->session_schedule = $session_schedule;

        return $this;
    }

    public function getDiscount(): ?int
    {
        return $this->discount;
    }

    public function setDiscount(?int $discount): static
    {
        $this->discount = $discount;

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

    public function getOfferType(): ?string
    {
        return $this->offer_type;
    }

    public function setOfferType(string $offer_type): static
    {
        $this->offer_type = $offer_type;

        return $this;
    }

    public function getOfferAmount(): ?int
    {
        return $this->offer_amount;
    }

    public function setOfferAmount(?int $offer_amount): static
    {
        $this->offer_amount = $offer_amount;

        return $this;
    }

    public function getMembershipFee(): ?float
    {
        return $this->membership_fee;
    }

    public function setMembershipFee(?float $membership_fee): static
    {
        $this->membership_fee = $membership_fee;

        return $this;
    }

    public function getCombinedId(): ?string
    {
        return $this->combined_id;
    }

    public function setCombinedId(?string $combined_id): static
    {
        $this->combined_id = $combined_id;

        return $this;
    }

    public function getSubscriptionType(): ?string
    {
        return $this->subscription_type;
    }

    public function setSubscriptionType(string $subscription_type): static
    {
        $this->subscription_type = $subscription_type;

        return $this;
    }

    public function isIsValide(): ?bool
    {
        return $this->is_valide;
    }

    public function setIsValide(bool $is_valide): static
    {
        $this->is_valide = $is_valide;

        return $this;
    }

    /**
     * @return Collection<int, Session>
     */
    public function getSessions(): Collection
    {
        return $this->sessions;
    }

    public function addSession(Session $session): static
    {
        if (!$this->sessions->contains($session)) {
            $this->sessions->add($session);
            $session->addIdSubscription($this);
        }

        return $this;
    }

    public function removeSession(Session $session): static
    {
        if ($this->sessions->removeElement($session)) {
            $session->removeIdSubscription($this);
        }

        return $this;
    }

    public function getSubscriptionStartDate(): ?\DateTimeInterface
    {
        return $this->subscription_start_date;
    }

    public function setSubscriptionStartDate(?\DateTimeInterface $subscription_start_date): static
    {
        $this->subscription_start_date = $subscription_start_date;

        return $this;
    }

    public function getPaymentMode(): ?string
    {
        return $this->payment_mode;
    }

    public function setPaymentMode(?string $payment_mode): static
    {
        $this->payment_mode = $payment_mode;

        return $this;
    }

    public function getDateCaution(): ?\DateTimeInterface
    {
        return $this->date_caution;
    }

    public function setDateCaution(?\DateTimeInterface $date_caution): static
    {
        $this->date_caution = $date_caution;

        return $this;
    }

    public function isCaution(): ?bool
    {
        return $this->caution;
    }

    public function setCaution(?bool $caution): static
    {
        $this->caution = $caution;

        return $this;
    }

    public function getFavoriteSlots(): ?array
    {
        return $this->favorite_slots;
    }

    public function setFavoriteSlots(?array $favorite_slots): static
    {
        $this->favorite_slots = $favorite_slots;

        return $this;
    }

    /**
     * @return Collection<int, SubscriptionURL>
     */
    public function getSubscriptionURLs(): Collection
    {
        return $this->subscriptionURLs;
    }

    public function addSubscriptionURL(SubscriptionURL $subscriptionURL): static
    {
        if (!$this->subscriptionURLs->contains($subscriptionURL)) {
            $this->subscriptionURLs->add($subscriptionURL);
            $subscriptionURL->setSubscription($this);
        }

        return $this;
    }

    public function removeSubscriptionURL(SubscriptionURL $subscriptionURL): static
    {
        if ($this->subscriptionURLs->removeElement($subscriptionURL)) {
            // set the owning side to null (unless already changed)
            if ($subscriptionURL->getSubscription() === $this) {
                $subscriptionURL->setSubscription(null);
            }
        }

        return $this;
    }

   
}
