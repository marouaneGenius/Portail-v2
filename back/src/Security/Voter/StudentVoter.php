<?php

namespace App\Security\Voter;

use App\Entity\Student;
use App\Entity\User;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\Security\Core\Authentication\Token\TokenInterface;
use Symfony\Component\Security\Core\Authorization\Voter\Voter;
use Symfony\Component\Security\Core\User\UserInterface;

class StudentVoter extends Voter
{
    // Actions supportées
    public const VIEW = 'STUDENT_VIEW';
    public const CREATE = 'STUDENT_CREATE';
    public const EDIT = 'STUDENT_EDIT';
    public const DELETE = 'STUDENT_DELETE';

    public function __construct(
        private EntityManagerInterface $entityManager
    ) {}

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

        // Vérifier que le subject est bien un Student
        if (!$subject instanceof Student) {
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

    private function canView(?Student $student, UserInterface $user): bool
    {
        // TUTOR peut seulement voir ses étudiants assignés
        if (in_array('ROLE_TUTOR', $user->getRoles())) {
            return $student && $this->isStudentAssignedToTutor($student, $user);
        }

        // USER peut voir tous les étudiants
        return in_array('ROLE_USER', $user->getRoles());
    }

    private function canCreate(UserInterface $user): bool
    {
        // TUTOR ne peut pas créer d'étudiants
        if (in_array('ROLE_TUTOR', $user->getRoles())) {
            return false;
        }

        // USER et ADMIN peuvent créer des étudiants
        return in_array('ROLE_USER', $user->getRoles()) || 
               in_array('ROLE_ADMIN', $user->getRoles());
    }

    private function canEdit(?Student $student, UserInterface $user): bool
    {
        if (!$student) {
            return false;
        }

        // TUTOR peut seulement modifier ses étudiants assignés
        if (in_array('ROLE_TUTOR', $user->getRoles())) {
            return $this->isStudentAssignedToTutor($student, $user);
        }

        // USER peut modifier tous les étudiants
        return in_array('ROLE_USER', $user->getRoles());
    }

    private function canDelete(?Student $student, UserInterface $user): bool
    {
        if (!$student) {
            return false;
        }

        // // USER ne peut PAS supprimer d'étudiants
        // if (in_array('ROLE_USER', $user->getRoles())) {
        //     return false;
        // }

        // TUTOR ne peut rien supprimer
        if (in_array('ROLE_TUTOR', $user->getRoles())) {
            return false;
        }

        // Seuls les ADMIN peuvent supprimer (déjà géré plus haut)
        return false;
    }

    /**
     * Vérifie si un étudiant est assigné à un tuteur via les sessions
     */
    private function isStudentAssignedToTutor(Student $student, UserInterface $tutor): bool
    {
        $query = $this->entityManager->createQuery(
            'SELECT COUNT(s.id) FROM App\Entity\Session s 
             JOIN s.id_student st 
             WHERE s.id_tutor = :tutor 
             AND st = :student'
        );

        $query->setParameter('tutor', $tutor);
        $query->setParameter('student', $student);

        $count = $query->getSingleScalarResult();
        
        return $count > 0;
    }
}