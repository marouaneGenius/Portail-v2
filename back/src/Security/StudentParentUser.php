<?php

namespace App\Security;

use App\Entity\StudentParent;
use Symfony\Component\Security\Core\User\PasswordAuthenticatedUserInterface;
use Symfony\Component\Security\Core\User\UserInterface;

/**
 * Wrapper pour adapter l'entité StudentParent au système de sécurité Symfony
 */
class StudentParentUser implements UserInterface, PasswordAuthenticatedUserInterface
{
    private StudentParent $studentParent;

    public function __construct(StudentParent $studentParent)
    {
        $this->studentParent = $studentParent;
    }

    /**
     * Retourne l'entité StudentParent originale
     */
    public function getStudentParent(): StudentParent
    {
        return $this->studentParent;
    }

    /**
     * Identifiant unique de l'utilisateur (requis par UserInterface)
     */
    public function getUserIdentifier(): string
    {
        return $this->studentParent->getEmail();
    }

    /**
     * Mot de passe de l'utilisateur (requis par PasswordAuthenticatedUserInterface)
     */
    public function getPassword(): ?string
    {
        return $this->studentParent->getPassword();
    }

    /**
     * Rôles de l'utilisateur - tous les parents ont le rôle ROLE_PARENT
     */
    public function getRoles(): array
    {
        return ['ROLE_PARENT', 'ROLE_USER']; // ROLE_USER est souvent requis comme rôle de base
    }

    /**
     * Salt - non utilisé avec les hashers modernes
     */
    public function getSalt(): ?string
    {
        return null;
    }

    /**
     * Nettoie les données sensibles - généralement pas nécessaire
     */
    public function eraseCredentials(): void
    {
        // Rien à faire ici
    }

    /**
     * Méthode pour la compatibilité avec l'ancien système Symfony
     * @deprecated depuis Symfony 5.3, utiliser getUserIdentifier()
     */
    public function getUsername(): string
    {
        return $this->getUserIdentifier();
    }

    /**
     * Accès facile aux propriétés de l'entité StudentParent
     */
    public function getId(): ?int
    {
        return $this->studentParent->getId();
    }

    public function getEmail(): ?string
    {
        return $this->studentParent->getEmail();
    }

    public function getFirstname(): ?string
    {
        return $this->studentParent->getFirstname();
    }

    public function getLastname(): ?string
    {
        return $this->studentParent->getLastname();
    }

    public function getPhone(): ?string
    {
        return $this->studentParent->getPhone();
    }

    public function getCreatedAt(): ?\DateTimeImmutable
    {
        return $this->studentParent->getCreatedAt();
    }
}