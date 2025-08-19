<?php

namespace App\Security\Voter;

use App\Entity\Center;
use Symfony\Component\Security\Core\Authentication\Token\TokenInterface;
use Symfony\Component\Security\Core\Authorization\Voter\Voter;
use Symfony\Component\Security\Core\User\UserInterface;

class CenterVoter extends Voter
{
    // Actions supportées
    public const VIEW = 'CENTER_VIEW';
    public const CREATE = 'CENTER_CREATE';
    public const EDIT = 'CENTER_EDIT';
    public const DELETE = 'CENTER_DELETE';

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

        // Vérifier que le subject est bien un Center
        if (!$subject instanceof Center) {
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

    private function canView(?Center $center, UserInterface $user): bool
    {
        // TUTOR peut voir les centres (pour comprendre où il intervient)
        // USER peut voir tous les centres
        return in_array('ROLE_USER', $user->getRoles()) || 
               in_array('ROLE_TUTOR', $user->getRoles());
    }

    private function canCreate(UserInterface $user): bool
    {
        // TUTOR ne peut pas créer de centres
        if (in_array('ROLE_TUTOR', $user->getRoles())) {
            return false;
        }

        // USER et ADMIN peuvent créer des centres
        return in_array('ROLE_USER', $user->getRoles());
    }

    private function canEdit(?Center $center, UserInterface $user): bool
    {
        if (!$center) {
            return false;
        }

        // TUTOR ne peut pas modifier les centres
        if (in_array('ROLE_TUTOR', $user->getRoles())) {
            return false;
        }

        // USER peut modifier les centres
        return in_array('ROLE_USER', $user->getRoles());
    }

    private function canDelete(?Center $center, UserInterface $user): bool
    {
        if (!$center) {
            return false;
        }

        // USER ne peut PAS supprimer de centres (selon vos règles, mais on peut l'ajuster)
        if (in_array('ROLE_USER', $user->getRoles())) {
            return true; // Ici on autorise USER à supprimer les centres
        }

        // TUTOR ne peut rien supprimer
        if (in_array('ROLE_TUTOR', $user->getRoles())) {
            return false;
        }

        // Seuls les ADMIN peuvent supprimer (déjà géré plus haut)
        return false;
    }
}