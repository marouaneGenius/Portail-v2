<?php

namespace App\Security;

use App\Entity\User;
use App\Entity\StudentParent;
use App\Repository\UserRepository;
use App\Repository\StudentParentRepository;
use Symfony\Component\Security\Core\Exception\UserNotFoundException;
use Symfony\Component\Security\Core\User\UserInterface;
use Symfony\Component\Security\Core\User\UserProviderInterface;
use Symfony\Component\Security\Core\Exception\UnsupportedUserException;

/**
 * Provider unifié qui cherche les utilisateurs dans les tables User et StudentParent
 */
class UnifiedUserProvider implements UserProviderInterface
{
    private UserRepository $userRepository;
    private StudentParentRepository $studentParentRepository;

    public function __construct(
        UserRepository $userRepository,
        StudentParentRepository $studentParentRepository
    ) {
        $this->userRepository = $userRepository;
        $this->studentParentRepository = $studentParentRepository;
    }

    /**
     * Charge un utilisateur par son identifiant (email)
     * Cherche d'abord dans User, puis dans StudentParent
     */
    public function loadUserByIdentifier(string $identifier): UserInterface
    {
        // 1. Chercher d'abord dans la table User
        $user = $this->userRepository->findOneBy(['email' => $identifier]);
        if ($user instanceof User) {
            // Vérifier que l'utilisateur est actif
            if (!$user->isIsActive()) {
                throw new UserNotFoundException('User account is disabled.');
            }
            return $user;
        }

        // 2. Si pas trouvé, chercher dans la table StudentParent
        $studentParent = $this->studentParentRepository->findOneBy(['email' => $identifier]);
        if ($studentParent instanceof StudentParent) {
            // Vérifier que le parent a bien un mot de passe défini
            if (!$studentParent->getPassword()) {
                throw new UserNotFoundException('Parent account has no password set.');
            }
            return new StudentParentUser($studentParent);
        }

        // 3. Aucun utilisateur trouvé
        throw new UserNotFoundException(sprintf('User with email "%s" not found.', $identifier));
    }

    /**
     * Méthode pour la compatibilité avec l'ancien système Symfony
     * @deprecated depuis Symfony 5.3, utiliser loadUserByIdentifier()
     */
    public function loadUserByUsername(string $username): UserInterface
    {
        return $this->loadUserByIdentifier($username);
    }

    /**
     * Rafraîchit un utilisateur depuis la base de données
     */
    public function refreshUser(UserInterface $user): UserInterface
    {
        // Si c'est un User standard
        if ($user instanceof User) {
            $refreshedUser = $this->userRepository->find($user->getId());
            if (!$refreshedUser) {
                throw new UserNotFoundException('User not found.');
            }
            return $refreshedUser;
        }

        // Si c'est un StudentParentUser
        if ($user instanceof StudentParentUser) {
            $refreshedStudentParent = $this->studentParentRepository->find($user->getId());
            if (!$refreshedStudentParent) {
                throw new UserNotFoundException('StudentParent not found.');
            }
            return new StudentParentUser($refreshedStudentParent);
        }

        throw new UnsupportedUserException(sprintf('User class "%s" is not supported.', get_class($user)));
    }

    /**
     * Vérifie si le provider supporte cette classe d'utilisateur
     */
    public function supportsClass(string $class): bool
    {
        return $class === User::class || $class === StudentParentUser::class;
    }
}