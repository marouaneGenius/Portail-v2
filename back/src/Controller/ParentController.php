<?php

namespace App\Controller;

use App\Entity\StudentParent;
use App\Entity\Session;
use App\Entity\Subscription;
use App\Repository\StudentParentRepository;
use App\Repository\SessionRepository;
use App\Repository\StudentRepository;
use App\Repository\SubscriptionRepository;
use App\Security\StudentParentUser;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Contracts\HttpClient\HttpClientInterface;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\IsGranted;
use Symfony\Component\PasswordHasher\Hasher\UserPasswordHasherInterface;

#[Route('/api/parents')]
class ParentController extends AbstractController
{
    public function __construct(
        private EntityManagerInterface $em,
        private StudentParentRepository $parentRepository,
        private StudentRepository $studentRepository,
        private SessionRepository $sessionRepository,
        private SubscriptionRepository $subscriptionRepository,
        private UserPasswordHasherInterface $passwordHasher,
        private HttpClientInterface $httpClient
    ) {}

    /**
     * Récupère toutes les sessions des enfants d'un parent
     */
    #[Route('/{id}/children-sessions', name: 'api_parent_children_sessions', methods: ['GET'])]
    #[IsGranted('ROLE_PARENT')]
    public function getChildrenSessions(int $id): JsonResponse
    {
        // Vérifier que l'utilisateur connecté est bien ce parent
        $currentUser = $this->getUser();
        if (!$currentUser || $currentUser->getUserIdentifier() !== $this->parentRepository->find($id)?->getEmail()) {
            return $this->json(['error' => 'Accès non autorisé'], 403);
        }

        $parent = $this->parentRepository->find($id);
        if (!$parent) {
            return $this->json(['error' => 'Parent non trouvé'], 404);
        }

        $sessions = [];
        $now = new \DateTime();

        // Récupérer toutes les sessions des enfants de ce parent
        foreach ($parent->getStudents() as $student) {
            foreach ($student->getSessions() as $session) {
                $scheduledAt = $session->getScheduledAt();
                if (!$scheduledAt) continue;

                // Exclure les séances des contrats suspendus ou prévues après la date de résiliation
                $shouldHideSession = false;
                foreach ($session->getIdSubscription() as $subscription) {
                    // Si suspendu ET pas de date de résiliation = vraiment suspendu
                    if ($subscription->isIsSuspended() && !$subscription->getResiliationDate()) {
                        $shouldHideSession = true;
                        break;
                    }

                    // Vérifier si la séance est prévue après la date de résiliation
                    // On affiche toutes les séances dont la date est AVANT ou ÉGALE à la date de résiliation
                    if ($subscription->getResiliationDate()) {
                        $sessionDateSlot = $session->getDateSlot();
                        if ($sessionDateSlot) {
                            // Comparer uniquement les dates (sans heure)
                            $resiliationDate = $subscription->getResiliationDate();
                            $resiliationDate->setTime(0, 0, 0);
                            $sessionDate = clone $sessionDateSlot;
                            $sessionDate->setTime(0, 0, 0);

                            if ($sessionDate > $resiliationDate) {
                                $shouldHideSession = true;
                                break;
                            }
                        }
                    }
                }
                if ($shouldHideSession) continue;

                // Calculer les heures jusqu'à la session
                $hoursUntilSession = ($scheduledAt->getTimestamp() - $now->getTimestamp()) / 3600;
                
                // On peut marquer absent si plus de 48h avant
                $canMarkAbsent = $hoursUntilSession > 48;

                $sessions[] = [
                    'id' => $session->getId(),
                    'child_name' => $student->getFirstname() . ' ' . $student->getLastname(),
                    'child_id' => $student->getId(),
                    'subject' => $session->getSchoolSubjects(),
                    'scheduled_at' => $scheduledAt->format('c'),
                    'tutor_name' => $session->getIdTutor() ? 
                        $session->getIdTutor()->getFirstname() . ' ' . $session->getIdTutor()->getLastname() : 
                        'Non assigné',
                    'center_name' => $session->getCenter() ? $session->getCenter()->getName() : null,
                    'is_absent' => $session->isIsAbsent() ?? false,
                    'absent_by' => $session->getAbsentBy() ?? false,
                    'is_canceled' => $session->isIsCanceled() ?? false,
                    'canceled_by' => $session->getCanceledBy() ?? false,
                    'can_mark_absent' => $canMarkAbsent,
                    'hours_until_session' => round($hoursUntilSession, 1),
                    'is_suspended' => $session->getIdSubscription()->first() ? $session->getIdSubscription()->first()->isIsSuspended() : false
                ];
            }
        }

        // Trier par date
        usort($sessions, function($a, $b) {
            return strtotime($a['scheduled_at']) - strtotime($b['scheduled_at']);
        });

        return $this->json($sessions);
    }

    /**
     * Permet à un parent de marquer son enfant absent/présent
     */
    #[Route('/{parentId}/sessions/{sessionId}/absence', name: 'api_parent_mark_absence', methods: ['PATCH'])]
    #[IsGranted('ROLE_PARENT')]
    public function markAbsence(int $parentId, int $sessionId, Request $request): JsonResponse
    {
        // Vérifier que l'utilisateur connecté est bien ce parent
        $currentUser = $this->getUser();
        if (!$currentUser || $currentUser->getUserIdentifier() !== $this->parentRepository->find($parentId)?->getEmail()) {
            return $this->json(['error' => 'Accès non autorisé'], 403);
        }

        $data = json_decode($request->getContent(), true);
        $isCanceled = $data['is_canceled'] ?? null;
        $childId = $data['child_id'] ?? null;

        if ($isCanceled === null || $childId === null) {
            return $this->json(['error' => 'Paramètres manquants'], 400);
        }

        $parent = $this->parentRepository->find($parentId);
        $child   = $this->studentRepository->find($childId);
        $session = $this->sessionRepository->find($sessionId);

        if (!$parent || !$session) {
            return $this->json(['error' => 'Parent ou session non trouvé'], 404);
        }

        if (!$child) {
            return $this->json(['error' => 'Enfant introuvable'], 404);
        }

        // Vérifier que l'enfant appartient bien à ce parent


        if (!$child || !$parent->getStudents()->contains($child)) {
            return $this->json(['error' => 'Cet enfant ne vous appartient pas'], 403);
        }

        // Vérifier la règle des 48h
        $now = new \DateTime();
        $scheduledAt = $session->getScheduledAt();
        if ($scheduledAt) {
            $hoursUntilSession = ($scheduledAt->getTimestamp() - $now->getTimestamp()) / 3600;
            
            if ($hoursUntilSession <= 48) {
                return $this->json([
                    'error' => 'Impossible de modifier l\'absence moins de 48h avant le cours',
                    'hours_remaining' => round($hoursUntilSession, 1)
                ], 400);
            }
        }

        // Marquer comme annulé/non annulé
        $session->setIsCanceled($isCanceled);
        $session->setUpdatedAt(new \DateTimeImmutable());
        $session->setUpdatedBy($currentUser->getUserIdentifier());
        $session->setCanceledBy($isCanceled ? $currentUser->getUserIdentifier() . ' (Parent)' : null);

        $this->em->flush();

        return $this->json([
            'success' => true,
            'session_id' => $session->getId(),
            'is_absent' => $session->isIsCanceled(),
            'message' => $isCanceled ? 'Enfant marqué Annulé' : 'Enfant marqué présent'
        ]);
    }

    /**
     * Permet à un parent de modifier son mot de passe
     */
    #[Route('/{id}/password', name: 'api_parent_update_password', methods: ['PUT'])]
    #[IsGranted('ROLE_PARENT')]
    public function updatePassword(int $id, Request $request): JsonResponse
    {
        // Vérifier que l'utilisateur connecté est bien ce parent
        $currentUser = $this->getUser();
        if (!$currentUser || $currentUser->getUserIdentifier() !== $this->parentRepository->find($id)?->getEmail()) {
            return $this->json(['error' => 'Accès non autorisé'], 403);
        }

        $data = json_decode($request->getContent(), true);
        $password = $data['password'] ?? null;
        $confirmPassword = $data['confirm_password'] ?? null;

        if (!$password || !$confirmPassword) {
            return $this->json(['error' => 'Mot de passe et confirmation requis'], 400);
        }

        if ($password !== $confirmPassword) {
            return $this->json(['error' => 'Les mots de passe ne correspondent pas'], 400);
        }

        if (strlen($password) < 6) {
            return $this->json(['error' => 'Le mot de passe doit contenir au moins 6 caractères'], 400);
        }

        $parent = $this->parentRepository->find($id);
        if (!$parent) {
            return $this->json(['error' => 'Parent non trouvé'], 404);
        }

        // Hasher le nouveau mot de passe
        $studentParentUser = new StudentParentUser($parent);
        $hashedPassword = $this->passwordHasher->hashPassword($studentParentUser, $password);
        
        $parent->setPassword($hashedPassword);
        $parent->setUpdatedAt(new \DateTimeImmutable());
        $parent->setUpdatedBy($currentUser->getUserIdentifier());

        $this->em->flush();

        return $this->json([
            'success' => true,
            'message' => 'Mot de passe mis à jour avec succès'
        ]);
    }

    /**
     * Récupère tous les contrats des enfants d'un parent
     */
    #[Route('/{id}/children-contracts', name: 'api_parent_children_contracts', methods: ['GET'])]
    #[IsGranted('ROLE_PARENT')]
    public function getChildrenContracts(int $id): JsonResponse
    {
        // Vérifier que l'utilisateur connecté est bien ce parent
        $currentUser = $this->getUser();
        if (!$currentUser || $currentUser->getUserIdentifier() !== $this->parentRepository->find($id)?->getEmail()) {
            return $this->json(['error' => 'Accès non autorisé'], 403);
        }

        $parent = $this->parentRepository->find($id);
        if (!$parent) {
            return $this->json(['error' => 'Parent non trouvé'], 404);
        }

        $contracts = [];

        // Récupérer tous les contrats des enfants de ce parent
        foreach ($parent->getStudents() as $student) {
            $subscriptions = $this->subscriptionRepository->findBy(['id_student' => $student]);
            
            foreach ($subscriptions as $subscription) {
                $contracts[] = [
                    'id' => $subscription->getId(),
                    'child_name' => $student->getFirstname() . ' ' . $student->getLastname(),
                    'child_id' => $student->getId(),
                    'subscription_type' => $subscription->getSubscriptionType(),
                    'offer_type' => $subscription->getOfferType(),
                    'offer_amount' => $subscription->getOfferAmount(),
                    'school_subjects' => $subscription->getSchoolSubjects(),
                    'session_per_week' => $subscription->getSessionPerWeek(),
                    'week_count' => $subscription->getWeekCount(),
                    'subscription_start_date' => $subscription->getSubscriptionStartDate()?->format('Y-m-d'),
                    'subscription_end_date' => $subscription->getSubscriptionEndDate()?->format('Y-m-d'),
                    'is_valide' => $subscription->isIsValide(),
                    'is_canceled' => $subscription->isIsCanceled() ?? false,
                    'payment_mode' => $subscription->getPaymentMode(),
                    'membership_fee' => $subscription->getMembershipFee(),
                    'combined_id' => $subscription->getCombinedId(),
                    'created_at' => $subscription->getCreatedAt()?->format('Y-m-d H:i:s'),
                ];
            }
        }

        // Trier par date de création (plus récent en premier)
        usort($contracts, function($a, $b) {
            return strtotime($b['created_at']) - strtotime($a['created_at']);
        });

        return $this->json($contracts);
    }

    /**
     * Permet à un parent de rompre un contrat de son enfant
     */
    #[Route('/{parentId}/contracts/{contractId}/cancel', name: 'api_parent_cancel_contract', methods: ['PATCH'])]
    #[IsGranted('ROLE_PARENT')]
    public function cancelContract(int $parentId, int $contractId, Request $request): JsonResponse
    {
        // Vérifier que l'utilisateur connecté est bien ce parent
        $currentUser = $this->getUser();
        if (!$currentUser || $currentUser->getUserIdentifier() !== $this->parentRepository->find($parentId)?->getEmail()) {
            return $this->json(['error' => 'Accès non autorisé'], 403);
        }

        $data = json_decode($request->getContent(), true);
        $reason = $data['reason'] ?? 'Rupture demandée par le parent';
        $resiliationDate = $data['resiliation_date'] ?? null;

        $parent = $this->parentRepository->find($parentId);
        $subscription = $this->subscriptionRepository->find($contractId);

        if (!$parent || !$subscription) {
            return $this->json(['error' => 'Parent ou contrat non trouvé'], 404);
        }

        // Vérifier que le contrat appartient bien à un enfant de ce parent
        $student = $subscription->getIdStudent();
        if (!$student || !$parent->getStudents()->contains($student)) {
            return $this->json(['error' => 'Ce contrat ne vous appartient pas'], 403);
        }

        // Vérifier que le contrat n'est pas déjà annulé
        if ($subscription->isIsCanceled()) {
            return $this->json(['error' => 'Ce contrat est déjà annulé'], 400);
        }

        // Annuler le contrat mais ne pas le suspendre si une date de résiliation est fournie
        $subscription->setIsCanceled(true);
        $subscription->setCanceledBy($currentUser->getUserIdentifier() . ' (Parent: ' . $reason . ')');
        $subscription->setCanceledAt(new \DateTimeImmutable());
        $subscription->setUpdatedAt(new \DateTimeImmutable());
        $subscription->setUpdatedBy($currentUser->getUserIdentifier());
        
        // Définir la date de résiliation si fournie
        if ($resiliationDate) {
            $subscription->setResiliationDate(new \DateTime($resiliationDate));
            // Ne pas suspendre complètement, la date de résiliation gérera le filtrage
            $subscription->setIsSuspended(false);
        } else {
            // Si pas de date de résiliation, suspendre immédiatement
            $subscription->setIsSuspended(true);
        }

        $this->em->flush();

        return $this->json([
            'success' => true,
            'contract_id' => $subscription->getId(),
            'is_canceled' => $subscription->isIsCanceled(),
            'is_suspended' => $subscription->isIsSuspended(),
            'canceled_at' => $subscription->getCanceledAt()?->format('Y-m-d H:i:s'),
            'resiliation_date' => $subscription->getResiliationDate()?->format('Y-m-d'),
            'message' => 'Contrat résilié avec succès'
        ]);
    }

    /**
     * Permet à un parent de télécharger le PDF d'un contrat de son enfant
     */
    #[Route('/{parentId}/contracts/{contractId}/download-pdf', name: 'api_parent_download_contract_pdf', methods: ['GET'])]
    #[IsGranted('ROLE_PARENT')]
    public function downloadContractPDF(int $parentId, int $contractId): Response
    {
        // Vérifier que l'utilisateur connecté est bien ce parent
        $currentUser = $this->getUser();
        if (!$currentUser || $currentUser->getUserIdentifier() !== $this->parentRepository->find($parentId)?->getEmail()) {
            return new JsonResponse(['error' => 'Accès non autorisé'], 403);
        }

        $parent = $this->parentRepository->find($parentId);
        $subscription = $this->subscriptionRepository->find($contractId);

        if (!$parent || !$subscription) {
            return new JsonResponse(['error' => 'Parent ou contrat non trouvé'], 404);
        }

        // Vérifier que le contrat appartient bien à un enfant de ce parent
        $student = $subscription->getIdStudent();
        if (!$student || !$parent->getStudents()->contains($student)) {
            return new JsonResponse(['error' => 'Ce contrat ne vous appartient pas'], 403);
        }

        // Récupérer l'URL du PDF depuis la subscription
        $subscriptionUrl = $subscription->getSubscriptionURLs()->first();
        if (!$subscriptionUrl || !$subscriptionUrl->getUrl()) {
            return new JsonResponse(['error' => 'PDF non disponible pour ce contrat'], 404);
        }

        try {
            // Télécharger le fichier PDF depuis l'URL
            $response = $this->httpClient->request('GET', $subscriptionUrl->getUrl());
            $pdfContent = $response->getContent();

            // Créer une réponse avec le contenu PDF
            $response = new Response($pdfContent);
            
            // Définir le nom du fichier
            $fileName = "contrat_{$student->getFirstname()}_{$student->getLastname()}_{$subscription->getId()}.pdf";
            
            // Définir les en-têtes appropriés
            $response->headers->set('Content-Type', 'application/pdf');
            $response->headers->set('Content-Disposition', 'attachment; filename="' . $fileName . '"');
            $response->headers->set('Content-Length', strlen($pdfContent));

            return $response;

        } catch (\Exception $e) {
            return new JsonResponse([
                'error' => 'Erreur lors du téléchargement du PDF',
                'details' => $e->getMessage()
            ], 500);
        }
    }
}