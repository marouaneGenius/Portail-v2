<?php

namespace App\Security\Voter;

use App\Entity\StudentParent;
use Symfony\Component\Security\Core\Authentication\Token\TokenInterface;
use Symfony\Component\Security\Core\Authorization\Voter\Voter;
use Symfony\Component\Security\Core\User\UserInterface;

class ParentVoter extends Voter
{
    // Actions supportées
    public const VIEW = 'PARENT_VIEW';
    public const CREATE = 'PARENT_CREATE';
    public const EDIT = 'PARENT_EDIT';
    public const DELETE = 'PARENT_DELETE';

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

        // Vérifier que le subject est bien un StudentParent
        if (!$subject instanceof StudentParent) {
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

        // Vérifier les permissions selon l'action
        return match ($attribute) {
            self::VIEW => $this->canView($subject, $user),
            self::CREATE => $this->canCreate($user),
            self::EDIT => $this->canEdit($subject, $user),
            self::DELETE => $this->canDelete($subject, $user),
            default => false,
        };
    }

    private function canView(?StudentParent $parent, UserInterface $user): bool
    {
        // TUTOR n'a pas accès aux parents
        if (in_array('ROLE_TUTOR', $user->getRoles())) {
            return false;
        }

        // USER peut voir tous les parents
        return in_array('ROLE_USER', $user->getRoles());
    }

    private function canCreate(UserInterface $user): bool
    {
        // TUTOR ne peut pas créer de parents
        if (in_array('ROLE_TUTOR', $user->getRoles())) {
            return false;
        }

        // USER et ADMIN peuvent créer des parents
        return in_array('ROLE_USER', $user->getRoles()) || 
               in_array('ROLE_ADMIN', $user->getRoles());
    }

    private function canEdit(?StudentParent $parent, UserInterface $user): bool
    {
        if (!$parent) {
            return false;
        }

        // TUTOR n'a pas accès aux parents
        if (in_array('ROLE_TUTOR', $user->getRoles())) {
            return false;
        }

        // USER et ADMIN peuvent modifier tous les parents
        return in_array('ROLE_USER', $user->getRoles()) || 
               in_array('ROLE_ADMIN', $user->getRoles());
    }

    private function canDelete(?StudentParent $parent, UserInterface $user): bool
    {
        if (!$parent) {
            return false;
        }

        // USER ne peut PAS supprimer de parents
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