<?php

namespace App\Security\Voter;

use App\Entity\User;
use Symfony\Component\Security\Core\Authentication\Token\TokenInterface;
use Symfony\Component\Security\Core\Authorization\Voter\Voter;
use Symfony\Component\Security\Core\User\UserInterface;

class UserVoter extends Voter
{
    // Actions supportées
    public const VIEW = 'USER_VIEW';
    public const CREATE = 'USER_CREATE';
    public const EDIT = 'USER_EDIT';
    public const DELETE = 'USER_DELETE';

    protected function supports(string $attribute, mixed $subject): bool
    {
        // Supporter les attributs définis
        if (!in_array($attribute, [self::VIEW, self::CREATE, self::EDIT, self::DELETE])) {
            return false;
        }

        // Pour CREATE, pas besoin de subject spécifique
        if ($attribute === self::CREATE) {
            return true;
        }

        // Vérifier que le subject est bien un User
        if (!$subject instanceof User) {
            return false;
        }

        return true;
    }

    protected function voteOnAttribute(string $attribute, mixed $subject, TokenInterface $token): bool
    {
        $user = $token->getUser();

        // L'utilisateur doit être connecté
        if (!$user instanceof UserInterface) {
            return false;
        }

        // Les ADMIN ont tous les droits
        if (in_array('ROLE_ADMIN', $user->getRoles())) {
            return true;
        }
        
        if ($attribute === self::EDIT && in_array('ROLE_TUTOR', $user->getRoles())) {
            return false;
        }

        // Vérifier les permissions selon l'action
        return match ($attribute) {
            self::VIEW => $this->canView($subject, $user),
            self::CREATE => $this->canCreate($user),
            self::EDIT => $this->canEdit($subject, $user),
            self::DELETE => $this->canDelete($subject, $user),
            default => false,
        };
    }

    private function canView(?User $targetUser, UserInterface $user): bool
    {
        // VIEW: Tous les rôles peuvent voir (sauf restriction spécifique)
        // TUTOR ne peut voir que sa propre fiche
        if (in_array('ROLE_TUTOR', $user->getRoles())) {
            return $targetUser && $targetUser->getId() === $user->getId();
        }

        // USER et ADMIN peuvent voir tous les utilisateurs
        return in_array('ROLE_USER', $user->getRoles()) || in_array('ROLE_ADMIN', $user->getRoles());
    }

    private function canCreate(UserInterface $user): bool
    {
        // CREATE: Seuls ADMIN et USER peuvent créer des utilisateurs
        // TUTOR ne peut pas créer d'utilisateurs
        return in_array('ROLE_ADMIN', $user->getRoles()) || 
               in_array('ROLE_USER', $user->getRoles());
    }

    private function canEdit(?User $targetUser, UserInterface $user): bool
    {
        if (!$targetUser) {
            return false;
        }

        // TUTOR peut seulement modifier sa propre fiche
        if (in_array('ROLE_TUTOR', $user->getRoles())) {
            return $targetUser->getId() === $user->getId();
        }

        // USER peut modifier :
        // - Sa propre fiche
        // - Les utilisateurs avec ROLE_TUTOR uniquement
        if (in_array('ROLE_USER', $user->getRoles())) {
            // Peut modifier sa propre fiche
            if ($targetUser->getId() === $user->getId()) {
                return true;
            }
            
            // Peut modifier seulement les TUTORS, pas les ADMIN ou autres USER
            $targetRoles = $targetUser->getRoles();
            $hasRestrictedRole = array_intersect($targetRoles, ['ROLE_ADMIN', 'ROLE_USER']);
            
            return empty($hasRestrictedRole) && in_array('ROLE_TUTOR', $targetRoles);
        }

        // ADMIN peut tout modifier (déjà géré plus haut)
        return false;
    }

    private function canDelete(?User $targetUser, UserInterface $user): bool
    {
        if (!$targetUser) {
            return false;
        }

        // USER ne peut PAS supprimer d'utilisateurs
        if (in_array('ROLE_USER', $user->getRoles())) {
            return false;
        }

        // TUTOR ne peut rien supprimer
        if (in_array('ROLE_TUTOR', $user->getRoles())) {
            return false;
        }

        // Seuls les ADMIN peuvent supprimer (déjà géré plus haut)
        return false;
    }
}