<?php

namespace App\EventSubscriber;

use App\Entity\Student;
use App\Entity\StudentParent;
use App\Entity\User;
use App\Service\NameNormalizerService;
use Doctrine\Common\EventSubscriber;
use Doctrine\ORM\Events;
use Doctrine\Persistence\Event\LifecycleEventArgs;
use Symfony\Component\DependencyInjection\Attribute\AutoconfigureTag;

#[AutoconfigureTag('doctrine.event_subscriber')]
class NameNormalizationSubscriber implements EventSubscriber
{
    public function __construct(
        private readonly NameNormalizerService $nameNormalizer
    ) {
    }

    public function getSubscribedEvents(): array
    {
        return [
            Events::prePersist,
            Events::preUpdate,
        ];
    }

    public function prePersist(LifecycleEventArgs $args): void
    {
        $this->normalizeEntityNames($args->getObject());
    }

    public function preUpdate(LifecycleEventArgs $args): void
    {
        $this->normalizeEntityNames($args->getObject());
    }

    private function normalizeEntityNames(object $entity): void
    {
        if ($entity instanceof Student) {
            $this->normalizeStudentNames($entity);
        } elseif ($entity instanceof StudentParent) {
            $this->normalizeParentNames($entity);
        } elseif ($entity instanceof User) {
            $this->normalizeUserNames($entity);
        }
    }

    private function normalizeStudentNames(Student $student): void
    {
        if ($student->getFirstname()) {
            $normalized = $this->nameNormalizer->normalizeFirstname($student->getFirstname());
            if ($normalized !== $student->getFirstname()) {
                // Utiliser la réflexion pour éviter la récursion
                $reflection = new \ReflectionClass($student);
                $property = $reflection->getProperty('firstname');
                $property->setAccessible(true);
                $property->setValue($student, $normalized);
            }
        }

        if ($student->getLastname()) {
            $normalized = $this->nameNormalizer->normalizeName($student->getLastname());
            if ($normalized !== $student->getLastname()) {
                // Utiliser la réflexion pour éviter la récursion
                $reflection = new \ReflectionClass($student);
                $property = $reflection->getProperty('lastname');
                $property->setAccessible(true);
                $property->setValue($student, $normalized);
            }
        }
    }

    private function normalizeParentNames(StudentParent $parent): void
    {
        if ($parent->getFirstname()) {
            $normalized = $this->nameNormalizer->normalizeFirstname($parent->getFirstname());
            if ($normalized !== $parent->getFirstname()) {
                // Utiliser la réflexion pour éviter la récursion
                $reflection = new \ReflectionClass($parent);
                $property = $reflection->getProperty('firstname');
                $property->setAccessible(true);
                $property->setValue($parent, $normalized);
            }
        }

        if ($parent->getLastname()) {
            $normalized = $this->nameNormalizer->normalizeName($parent->getLastname());
            if ($normalized !== $parent->getLastname()) {
                // Utiliser la réflexion pour éviter la récursion
                $reflection = new \ReflectionClass($parent);
                $property = $reflection->getProperty('lastname');
                $property->setAccessible(true);
                $property->setValue($parent, $normalized);
            }
        }
    }

    private function normalizeUserNames(User $user): void
    {
        if ($user->getFirstname()) {
            $normalized = $this->nameNormalizer->normalizeFirstname($user->getFirstname());
            if ($normalized !== $user->getFirstname()) {
                // Utiliser la réflexion pour éviter la récursion
                $reflection = new \ReflectionClass($user);
                $property = $reflection->getProperty('firstname');
                $property->setAccessible(true);
                $property->setValue($user, $normalized);
            }
        }

        if ($user->getLastname()) {
            $normalized = $this->nameNormalizer->normalizeName($user->getLastname());
            if ($normalized !== $user->getLastname()) {
                // Utiliser la réflexion pour éviter la récursion
                $reflection = new \ReflectionClass($user);
                $property = $reflection->getProperty('lastname');
                $property->setAccessible(true);
                $property->setValue($user, $normalized);
            }
        }
    }
}