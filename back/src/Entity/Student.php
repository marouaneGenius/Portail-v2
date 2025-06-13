<?php

namespace App\Entity;

use App\Repository\StudentRepository;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\ORM\Mapping as ORM;

#[ORM\Entity(repositoryClass: StudentRepository::class)]
class Student
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    private ?int $id = null;

    #[ORM\Column(length: 255)]
    private ?string $firstname = null;

    #[ORM\Column(length: 255)]
    private ?string $lastname = null;

    #[ORM\Column(length: 255)]
    private ?string $gender = null;

    #[ORM\Column(length: 255)]
    private ?string $class = null;

    #[ORM\Column(length: 255, nullable: true)]
    private ?string $phone = null;

    #[ORM\Column(length: 255)]
    private ?string $email = null;

    #[ORM\Column]
    private ?bool $is_active = null;

    #[ORM\Column]
    private ?bool $is_deleted = null;

    #[ORM\Column(length: 255, nullable: true)]
    private ?string $stripe_key = null;

    #[ORM\Column(length: 255, nullable: true)]
    private ?string $url_notion_public = null;

    #[ORM\Column(length: 255, nullable: true)]
    private ?string $url_notion = null;

    #[ORM\Column(length: 255, nullable: true)]
    private ?string $id_pipedrive = null;

    #[ORM\Column(length: 255, nullable: true)]
    private ?string $id_sinao = null;

    #[ORM\ManyToOne(inversedBy: 'students')]
    private ?Center $id_center = null;

    #[ORM\Column]
    private ?\DateTimeImmutable $created_at = null;

    #[ORM\Column(length: 255, nullable: true)]
    private ?string $created_by = null;

    #[ORM\Column(length: 255, nullable: true)]
    private ?string $updated_by = null;

    #[ORM\Column(nullable: true)]
    private ?\DateTimeImmutable $updated_at = null;

    #[ORM\ManyToMany(targetEntity: StudentParent::class, inversedBy: 'students')]
    private Collection $id_parent;

    #[ORM\OneToMany(mappedBy: 'id_student', targetEntity: Subscription::class)]
    private Collection $subscriptions;

    #[ORM\ManyToMany(targetEntity: Session::class, mappedBy: 'id_student')]
    private Collection $sessions;

    #[ORM\OneToMany(mappedBy: 'id_student', targetEntity: Report::class)]
    private Collection $reports;

    #[ORM\Column(nullable: true)]
    private ?array $school_subjects = null;

    #[ORM\OneToMany(mappedBy: 'student', targetEntity: SubscriptionURL::class)]
    private Collection $subscriptionURLs;

    public function __construct()
    {
        $this->id_parent = new ArrayCollection();
        $this->subscriptions = new ArrayCollection();
        $this->sessions = new ArrayCollection();
        $this->reports = new ArrayCollection();
        $this->subscriptionURLs = new ArrayCollection();
    }

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getFirstname(): ?string
    {
        return $this->firstname;
    }

    public function setFirstname(string $firstname): static
    {
        $this->firstname = $firstname;

        return $this;
    }

    public function getLastname(): ?string
    {
        return $this->lastname;
    }

    public function setLastname(string $lastname): static
    {
        $this->lastname = $lastname;

        return $this;
    }

    public function getGender(): ?string
    {
        return $this->gender;
    }

    public function setGender(string $gender): static
    {
        $this->gender = $gender;

        return $this;
    }

    public function getClass(): ?string
    {
        return $this->class;
    }

    public function setClass(string $class): static
    {
        $this->class = $class;

        return $this;
    }

    public function getPhone(): ?string
    {
        return $this->phone;
    }

    public function setPhone(?string $phone): static
    {
        $this->phone = $phone;

        return $this;
    }

    public function getEmail(): ?string
    {
        return $this->email;
    }

    public function setEmail(string $email): static
    {
        $this->email = $email;

        return $this;
    }

    public function isIsActive(): ?bool
    {
        return $this->is_active;
    }

    public function setIsActive(bool $is_active): static
    {
        $this->is_active = $is_active;

        return $this;
    }

    public function isIsDeleted(): ?bool
    {
        return $this->is_deleted;
    }

    public function setIsDeleted(bool $is_deleted): static
    {
        $this->is_deleted = $is_deleted;

        return $this;
    }

    public function getStripeKey(): ?string
    {
        return $this->stripe_key;
    }

    public function setStripeKey(?string $stripe_key): static
    {
        $this->stripe_key = $stripe_key;

        return $this;
    }

    public function getUrl�notionPublic(): ?string
    {
        return $this->url_�notion_public;
    }

    public function setUrl�notionPublic(?string $url_�notion_public): static
    {
        $this->url_�notion_public = $url_�notion_public;

        return $this;
    }

    public function getUrlNotion(): ?string
    {
        return $this->url_notion;
    }

    public function setUrlNotion(?string $url_notion): static
    {
        $this->url_notion = $url_notion;

        return $this;
    }

    public function getIdPipedrive(): ?string
    {
        return $this->id_pipedrive;
    }

    public function setIdPipedrive(?string $id_pipedrive): static
    {
        $this->id_pipedrive = $id_pipedrive;

        return $this;
    }

    public function getIdSinao(): ?string
    {
        return $this->id_sinao;
    }

    public function setIdSinao(?string $id_sinao): static
    {
        $this->id_sinao = $id_sinao;

        return $this;
    }

    public function getIdCenter(): ?Center
    {
        return $this->id_center;
    }

    public function setIdCenter(?Center $id_center): static
    {
        $this->id_center = $id_center;

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

    /**
     * @return Collection<int, StudentParent>
     */
    public function getIdParent(): Collection
    {
        return $this->id_parent;
    }

    public function addIdParent(StudentParent $idParent): static
    {
        if (!$this->id_parent->contains($idParent)) {
            $this->id_parent->add($idParent);
        }

        return $this;
    }

    public function removeIdParent(StudentParent $idParent): static
    {
        $this->id_parent->removeElement($idParent);

        return $this;
    }

    /**
     * @return Collection<int, Subscription>
     */
    public function getSubscriptions(): Collection
    {
        return $this->subscriptions;
    }

    public function addSubscription(Subscription $subscription): static
    {
        if (!$this->subscriptions->contains($subscription)) {
            $this->subscriptions->add($subscription);
            $subscription->setIdStudent($this);
        }

        return $this;
    }

    public function removeSubscription(Subscription $subscription): static
    {
        if ($this->subscriptions->removeElement($subscription)) {
            // set the owning side to null (unless already changed)
            if ($subscription->getIdStudent() === $this) {
                $subscription->setIdStudent(null);
            }
        }

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
            $session->addIdStudent($this);
        }

        return $this;
    }

    public function removeSession(Session $session): static
    {
        if ($this->sessions->removeElement($session)) {
            $session->removeIdStudent($this);
        }

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
            $report->setIdStudent($this);
        }

        return $this;
    }

    public function removeReport(Report $report): static
    {
        if ($this->reports->removeElement($report)) {
            // set the owning side to null (unless already changed)
            if ($report->getIdStudent() === $this) {
                $report->setIdStudent(null);
            }
        }

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
            $subscriptionURL->setStudent($this);
        }

        return $this;
    }

    public function removeSubscriptionURL(SubscriptionURL $subscriptionURL): static
    {
        if ($this->subscriptionURLs->removeElement($subscriptionURL)) {
            // set the owning side to null (unless already changed)
            if ($subscriptionURL->getStudent() === $this) {
                $subscriptionURL->setStudent(null);
            }
        }

        return $this;
    }
}
