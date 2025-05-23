<?php

namespace App\Entity;

use App\Repository\UserRepository;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Security\Core\User\PasswordAuthenticatedUserInterface;
use Symfony\Component\Security\Core\User\UserInterface;

#[ORM\Entity(repositoryClass: UserRepository::class)]
#[ORM\Table(name: 'users')]
class User implements UserInterface, PasswordAuthenticatedUserInterface
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    private ?int $id = null;

    #[ORM\Column(length: 255, nullable: true)]
    private ?string $firstname = null;

    #[ORM\Column(length: 255, nullable: true)]
    private ?string $lastname = null;

    #[ORM\Column(length: 255)]
    private ?string $email = null;

    #[ORM\Column(length: 255)]
    private ?string $password = null;

    #[ORM\Column(length: 255)]
    private ?string $phone = null;

    #[ORM\Column(length: 255, nullable: true)]
    private ?string $siret = null;

    #[ORM\Column]
    private ?bool $is_active = true;

    #[ORM\Column]
    private ?bool $is_deleted = false;

    #[ORM\Column(type: 'json')]
    private array $roles = [];

    #[ORM\Column]
    private ?\DateTimeImmutable $created_at = null;

    #[ORM\Column(length: 255, nullable: true)]
    private ?string $created_by = null;

    #[ORM\Column(length: 255, nullable: true)]
    private ?string $updated_by = null;

    #[ORM\Column(nullable: true)]
    private ?\DateTimeImmutable $updated_at = null;

    #[ORM\Column(nullable: true)]
    private ?int $max_session = null;

    #[ORM\Column(length: 255, nullable: true)]
    private ?string $price_per_hour = null;

    #[ORM\ManyToMany(targetEntity: Center::class, inversedBy: 'users')]
    #[ORM\JoinTable(name: 'user_center')]
    private Collection $centres;

    #[ORM\OneToMany(mappedBy: 'id_tutor', targetEntity: Session::class)]
    private Collection $sessions;

    #[ORM\OneToMany(mappedBy: 'id_user', targetEntity: TutorSchedule::class)]
    private Collection $day;

    #[ORM\OneToMany(mappedBy: 'id_user', targetEntity: TutorSchedule::class)]
    private Collection $tutorSchedules;

    #[ORM\OneToMany(mappedBy: 'id_user', targetEntity: Report::class)]
    private Collection $reports;

    #[ORM\Column(length: 255, nullable: true)]
    private ?string $google_id = null;



    public function __construct()
    {
        $this->sessions = new ArrayCollection();
        $this->day = new ArrayCollection();
        $this->tutorSchedules = new ArrayCollection();
        $this->reports = new ArrayCollection();
    }

    public function getUserIdentifier(): string
    {
        // Vous pouvez utiliser l’email comme identifiant unique
        return (string) $this->email;
    }


    public function getRoles(): array
    {
        return $this->roles;
    }
    

    /**
     * Méthode requise par UserInterface
     */
    public function eraseCredentials(): void
    {
        // Si vous stockiez un plainPassword temporaire, vous l’effaceriez ici.
        $this->plainPassword = null;
    }

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getFirstname(): ?string
    {
        return $this->firstname;
    }

    public function setFirstname(?string $firstname): static
    {
        $this->firstname = $firstname;

        return $this;
    }

    public function getLastname(): ?string
    {
        return $this->lastname;
    }

    public function setLastname(?string $lastname): static
    {
        $this->lastname = $lastname;

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

    public function getPassword(): ?string
    {
        return $this->password;
    }

    public function setPassword(string $password): static
    {
        $this->password = $password;

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

    public function getSiret(): ?string
    {
        return $this->siret;
    }

    public function setSiret(?string $siret): static
    {
        $this->siret = $siret;

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

    public function getMaxSession(): ?int
    {
        return $this->max_session;
    }

    public function setMaxSession(?int $max_session): static
    {
        $this->max_session = $max_session;

        return $this;
    }

    public function getPricePerHour(): ?string
    {
        return $this->price_per_hour;
    }

    public function setPricePerHour(?string $price_per_hour): static
    {
        $this->price_per_hour = $price_per_hour;

        return $this;
    }
    /**
     * @return Collection<int, Center>
     */
    public function getCentres(): Collection
    {
        return $this->centres;
    }

    public function addCentre(Center $centre): static
    {
        if (!$this->centres->contains($centre)) {
            $this->centres->add($centre);
        }
        return $this;
    }

    public function removeCentre(Center $centre): static
    {
        $this->centres->removeElement($centre);
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
            $session->setIdTutor($this);
        }

        return $this;
    }

    public function removeSession(Session $session): static
    {
        if ($this->sessions->removeElement($session)) {
            // set the owning side to null (unless already changed)
            if ($session->getIdTutor() === $this) {
                $session->setIdTutor(null);
            }
        }

        return $this;
    }

    /**
     * @return Collection<int, TutorSchedule>
     */
    public function getDay(): Collection
    {
        return $this->day;
    }

    public function addDay(TutorSchedule $day): static
    {
        if (!$this->day->contains($day)) {
            $this->day->add($day);
            $day->setIdUser($this);
        }

        return $this;
    }

    public function removeDay(TutorSchedule $day): static
    {
        if ($this->day->removeElement($day)) {
            // set the owning side to null (unless already changed)
            if ($day->getIdUser() === $this) {
                $day->setIdUser(null);
            }
        }

        return $this;
    }

    /**
     * @return Collection<int, TutorSchedule>
     */
    public function getTutorSchedules(): Collection
    {
        return $this->tutorSchedules;
    }

    public function addTutorSchedule(TutorSchedule $tutorSchedule): static
    {
        if (!$this->tutorSchedules->contains($tutorSchedule)) {
            $this->tutorSchedules->add($tutorSchedule);
            $tutorSchedule->setIdUser($this);
        }

        return $this;
    }

    public function removeTutorSchedule(TutorSchedule $tutorSchedule): static
    {
        if ($this->tutorSchedules->removeElement($tutorSchedule)) {
            // set the owning side to null (unless already changed)
            if ($tutorSchedule->getIdUser() === $this) {
                $tutorSchedule->setIdUser(null);
            }
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
            $report->setIdUser($this);
        }

        return $this;
    }

    public function removeReport(Report $report): static
    {
        if ($this->reports->removeElement($report)) {
            // set the owning side to null (unless already changed)
            if ($report->getIdUser() === $this) {
                $report->setIdUser(null);
            }
        }

        return $this;
    }

    public function setRoles(array $roles): self
    {
        $this->roles = $roles;
        return $this;
    }

    public function getGoogleId(): ?string
    {
        return $this->google_id;
    }

    public function setGoogleId(?string $google_id): static
    {
        $this->google_id = $google_id;

        return $this;
    }
}
