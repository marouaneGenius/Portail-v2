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

    #[ORM\Column(length: 255, nullable: true)]
    private ?string $email = null;

    #[ORM\Column]
    private ?bool $is_active = null;

    #[ORM\Column]
    private ?bool $is_deleted = null;

    #[ORM\Column(length: 255, nullable: true)]
    private ?string $stripe_key = null;

    #[ORM\Column(length: 255, nullable: true)]
    private ?string $stripe_customer_id = null;

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
        // Normalisation directe en attendant que l'EventSubscriber soit actif
        $this->firstname = $this->normalizeFirstname($firstname);

        return $this;
    }

    public function getLastname(): ?string
    {
        return $this->lastname;
    }

    public function setLastname(string $lastname): static
    {
        // Normalisation directe en attendant que l'EventSubscriber soit actif
        $this->lastname = $this->normalizeName($lastname);

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
        $this->phone = $phone ? $this->normalizePhone($phone) : $phone;

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

    public function getUrlnotionPublic(): ?string
    {
        return $this->url_notion_public;
    }

    public function setUrl�notionPublic(?string $url_notion_public): static
    {
        $this->url_notion_public = $url_notion_public;

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

    public function getStripeCustomerId(): ?string
    {
        return $this->stripe_customer_id;
    }

    public function setStripeCustomerId(?string $stripe_customer_id): static
    {
        $this->stripe_customer_id = $stripe_customer_id;

        return $this;
    }

    private function normalizeFirstname(string $firstname): string
    {
        if (empty($firstname)) {
            return '';
        }

        // Nettoyer et normaliser
        $normalized = $this->cleanAndFormat($firstname, true);
        
        // Valider les caractères
        $normalized = $this->validateCharacters($normalized, true);
        
        return $normalized;
    }

    private function normalizeName(string $name): string
    {
        if (empty($name)) {
            return '';
        }

        // Nettoyer et normaliser
        $normalized = $this->cleanAndFormat($name, false);
        
        // Valider les caractères
        $normalized = $this->validateCharacters($normalized, false);
        
        return $normalized;
    }

    private function cleanAndFormat(string $input, bool $isFirstname = false): string
    {
        // Supprimer les espaces en début/fin et multiples espaces
        $input = trim($input);
        $input = preg_replace('/\s+/', ' ', $input);
        
        // Convertir en minuscules puis capitaliser
        $input = mb_strtolower($input, 'UTF-8');
        
        if ($isFirstname) {
            // Pour les prénoms composés avec trait d'union ou espace
            $input = preg_replace_callback('/(\b\w+)/u', function($matches) {
                return mb_convert_case($matches[1], MB_CASE_TITLE, 'UTF-8');
            }, $input);
        } else {
            // Pour les noms de famille
            $input = mb_convert_case($input, MB_CASE_TITLE, 'UTF-8');
        }

        return $input;
    }

    private function validateCharacters(string $input, bool $allowHyphen = false): string
    {
        // Caractères autorisés : lettres, espaces, apostrophes
        $allowedPattern = '/[^a-zA-ZÀ-ÿ\s\']/u';
        
        if ($allowHyphen) {
            // Pour les prénoms, autoriser aussi les traits d'union
            $allowedPattern = '/[^a-zA-ZÀ-ÿ\s\'\-]/u';
        }
        
        // Supprimer les caractères non autorisés
        $cleaned = preg_replace($allowedPattern, '', $input);
        
        // Nettoyer les caractères spéciaux en double
        $cleaned = preg_replace('/[\'\-]{2,}/', '', $cleaned);
        $cleaned = preg_replace('/\s+/', ' ', $cleaned);
        
        return trim($cleaned);
    }

    private function normalizePhone(string $phone): string
    {
        if (empty($phone)) {
            return '';
        }

        // Nettoyer le numéro
        $cleaned = $this->cleanPhoneNumber($phone);
        
        // Normaliser au format français si valide
        if ($this->isValidFrenchPhoneNumber($cleaned)) {
            return $this->formatFrenchPhoneNumber($cleaned);
        }
        
        return $phone; // Retourner tel quel si format invalide
    }

    private function cleanPhoneNumber(string $phone): string
    {
        // Supprimer tous les caractères non numériques sauf le +
        $cleaned = preg_replace('/[^\d+]/', '', $phone);
        
        // Gérer les préfixes internationaux courants
        if (str_starts_with($cleaned, '+33')) {
            $cleaned = '0' . substr($cleaned, 3);
        } elseif (str_starts_with($cleaned, '0033')) {
            $cleaned = '0' . substr($cleaned, 4);
        } elseif (str_starts_with($cleaned, '33') && strlen($cleaned) === 11) {
            $cleaned = '0' . substr($cleaned, 2);
        }
        
        return $cleaned;
    }

    private function isValidFrenchPhoneNumber(string $cleaned): bool
    {
        // Doit faire 10 chiffres et commencer par 0
        if (strlen($cleaned) !== 10 || !str_starts_with($cleaned, '0')) {
            return false;
        }
        
        // Vérifier le préfixe
        $prefix = substr($cleaned, 0, 2);
        $validPrefixes = ['01', '02', '03', '04', '05', '06', '07', '08', '09'];
        
        return in_array($prefix, $validPrefixes, true);
    }

    private function formatFrenchPhoneNumber(string $cleaned): string
    {
        return substr($cleaned, 0, 2) . ' ' . 
               substr($cleaned, 2, 2) . ' ' . 
               substr($cleaned, 4, 2) . ' ' . 
               substr($cleaned, 6, 2) . ' ' . 
               substr($cleaned, 8, 2);
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
