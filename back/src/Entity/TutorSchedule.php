<?php

namespace App\Entity;

use App\Repository\TutorScheduleRepository;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\DBAL\Types\Types;
use Doctrine\ORM\Mapping as ORM;

#[ORM\Entity(repositoryClass: TutorScheduleRepository::class)]
class TutorSchedule
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    private ?int $id = null;

    #[ORM\ManyToOne(inversedBy: 'tutorSchedules')]
    private ?User $id_user = null;

    #[ORM\Column(type: 'string', length: 20)]
    private ?string $day = null;

    #[ORM\Column(type: Types::TIME_IMMUTABLE)]
    private ?\DateTimeImmutable $start_hour = null;

    #[ORM\Column(type: Types::TIME_IMMUTABLE)]
    private ?\DateTimeImmutable $end_hour = null;

    #[ORM\ManyToMany(targetEntity: Center::class, inversedBy: 'tutorSchedules')]
    private Collection $center;

    public function __construct()
    {
        $this->center = new ArrayCollection();
    }

    public function getId(): ?int
    {
        return $this->id;
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

    public function getDay(): ?string
    {
        return $this->day;
    }
    
    public function setDay(string $day): static
    {
        $this->day = $day;
        return $this;
    }

    public function getStartHour(): ?\DateTimeImmutable
    {
        return $this->start_hour;
    }

    public function setStartHour(\DateTimeImmutable $start_hour): static
    {
        $this->start_hour = $start_hour;

        return $this;
    }

    public function getEndHour(): ?\DateTimeImmutable
    {
        return $this->end_hour;
    }

    public function setEndHour(\DateTimeImmutable $end_hour): static
    {
        $this->end_hour = $end_hour;

        return $this;
    }

    /**
     * @return Collection<int, Center>
     */
    public function getCenter(): Collection
    {
        return $this->center;
    }

    public function addCenter(Center $center): static
    {
        if (!$this->center->contains($center)) {
            $this->center->add($center);
        }

        return $this;
    }

    public function removeCenter(Center $center): static
    {
        $this->center->removeElement($center);

        return $this;
    }
}
