<?php

namespace App\Security\Voter;

use Symfony\Component\Security\Core\Authentication\Token\TokenInterface;
use Symfony\Component\Security\Core\Authorization\Voter\Voter;
use Symfony\Component\Security\Core\User\UserInterface;

class HistoryVoter extends Voter
{
    // Actions supportées
    public const VIEW = 'HISTORY_VIEW';
    public const EXPORT = 'HISTORY_EXPORT';

    protected function supports(string $attribute, mixed $subject): bool
    {
        // Supporter les attributs définis pour l'historique
        return in_array($attribute, [self::VIEW, self::EXPORT]);
    }

    protected function voteOnAttribute(string $attribute, mixed $subject, TokenInterface $token): bool
    {
        $user = $token->getUser();

        // L'utilisateur doit être connecté
        if (!$user instanceof UserInterface) {
            return false;
        }

        // Les ADMIN ont tous les droits sur l'historique
        if (in_array('ROLE_ADMIN', $user->getRoles())) {
            return true;
        }

        // Vérifier les permissions selon l'action
        return match ($attribute) {
            self::VIEW => $this->canViewHistory($user),
            self::EXPORT => $this->canExportHistory($user),
            default => false,
        };
    }

    private function canViewHistory(UserInterface $user): bool
    {
        // USER ne peut PAS accéder à l'historique des modifications
        if (in_array('ROLE_USER', $user->getRoles())) {
            return false;
        }

        // TUTOR ne peut PAS accéder à l'historique des modifications  
        if (in_array('ROLE_TUTOR', $user->getRoles())) {
            return false;
        }

        // Seuls les ADMIN peuvent voir l'historique (déjà géré plus haut)
        return false;
    }

    private function canExportHistory(UserInterface $user): bool
    {
        // Même règles que pour la visualisation
        return $this->canViewHistory($user);
    }
}