<?php

namespace App\Entity;

use App\Repository\StudentParentRepository;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\ORM\Mapping as ORM;

#[ORM\Entity(repositoryClass: StudentParentRepository::class)]
class StudentParent
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
    private ?string $email = null;

    #[ORM\Column(length: 255)]
    private ?string $phone = null;

    #[ORM\Column(length: 255)]
    private ?string $address = null;

    #[ORM\Column(length: 255, nullable: true)]
    private ?string $zip_code = null;

    #[ORM\Column(length: 255, nullable: true)]
    private ?string $city = null;

    #[ORM\Column]
    private ?\DateTimeImmutable $created_at = null;

    #[ORM\Column(length: 255, nullable: true)]
    private ?string $created_by = null;

    #[ORM\Column(length: 255, nullable: true)]
    private ?string $updated_by = null;

    #[ORM\Column(nullable: true)]
    private ?\DateTimeImmutable $updated_at = null;

    #[ORM\ManyToMany(targetEntity: Student::class, mappedBy: 'id_parent')]
    private Collection $students;

    #[ORM\Column(length: 255, nullable: true)]
    private ?string $password = null;

    #[ORM\Column(length: 255, nullable: true)]
    private ?string $id_sinao = null;


    public function __construct()
    {
        $this->students = new ArrayCollection();
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

    public function getEmail(): ?string
    {
        return $this->email;
    }

    public function setEmail(string $email): static
    {
        $this->email = $email;

        return $this;
    }

    public function getPhone(): ?string
    {
        return $this->phone;
    }

    public function setPhone(string $phone): static
    {
        $this->phone = $phone ? $this->normalizePhoneParent($phone) : $phone;

        return $this;
    }

    public function getAddress(): ?string
    {
        return $this->address;
    }

    public function setAddress(string $address): static
    {
        $this->address = $address;

        return $this;
    }

    public function getZipCode(): ?string
    {
        return $this->zip_code;
    }

    public function setZipCode(?string $zip_code): static
    {
        $this->zip_code = $zip_code;

        return $this;
    }

    public function getCity(): ?string
    {
        return $this->city;
    }

    public function setCity(?string $city): static
    {
        $this->city = $city;

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
     * @return Collection<int, Student>
     */
    public function getStudents(): Collection
    {
        return $this->students;
    }

    public function addStudent(Student $student): static
    {
        if (!$this->students->contains($student)) {
            $this->students->add($student);
            $student->addIdParent($this);
        }

        return $this;
    }

    public function removeStudent(Student $student): static
    {
        if ($this->students->removeElement($student)) {
            $student->removeIdParent($this);
        }

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
            $input = preg_replace_callback('/(\b\w+)/u', function ($matches) {
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

    private function normalizePhoneParent(string $phone): string
    {
        if (empty($phone)) {
            return '';
        }

        // Nettoyer le numéro
        $cleaned = $this->cleanParentPhone($phone);

        // Normaliser au format français si valide
        if ($this->isValidParentPhone($cleaned)) {
            return $this->formatParentPhone($cleaned);
        }

        return $phone; // Retourner tel quel si format invalide
    }

    private function cleanParentPhone(string $phone): string
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

    private function isValidParentPhone(string $cleaned): bool
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

    private function formatParentPhone(string $cleaned): string
    {
        return substr($cleaned, 0, 2) . ' ' .
            substr($cleaned, 2, 2) . ' ' .
            substr($cleaned, 4, 2) . ' ' .
            substr($cleaned, 6, 2) . ' ' .
            substr($cleaned, 8, 2);
    }

    public function getPassword(): ?string
    {
        return $this->password;
    }

    public function setPassword(?string $password): static
    {
        $this->password = $password;

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
}
