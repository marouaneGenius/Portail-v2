<?php

namespace App\Service;

use App\Repository\StudentRepository;
use App\Repository\CenterRepository;
use App\Repository\SubscriptionRepository;
use Doctrine\ORM\EntityManagerInterface;

class StudentExportService
{
    public function __construct(
        private EntityManagerInterface $em,
        private StudentRepository $studentRepository,
        private CenterRepository $centerRepository,
        private SubscriptionRepository $subscriptionRepository
    ) {}

    /**
     * Récupère les données des élèves filtrées et formatées pour l'export
     *
     * @param array $filters Tableau de filtres : centers[], classes[], statuses[]
     * @return array Tableau de lignes prêtes pour l'export
     */
    public function getFilteredStudentsForExport(array $filters): array
    {
        $qb = $this->studentRepository->createQueryBuilder('s')
            ->leftJoin('s.id_center', 'c')
            ->leftJoin('s.id_parent', 'p')
            ->leftJoin('s.subscriptions', 'sub')
            ->where('s.is_deleted = :isDeleted')
            ->setParameter('isDeleted', false);

        // Filtrage par centres
        if (!empty($filters['centers'])) {
            $qb->andWhere('c.id IN (:centers)')
                ->setParameter('centers', $filters['centers']);
        }

        // Filtrage par classes
        if (!empty($filters['classes'])) {
            $qb->andWhere('s.class IN (:classes)')
                ->setParameter('classes', $filters['classes']);
        }

        $students = $qb->getQuery()->getResult();

        // Filtrage par statut et formatage des données
        $exportData = [];
        $statusFilters = $filters['statuses'] ?? [];

        foreach ($students as $student) {
            $studentStatus = $this->determineStudentStatus($student);

            // Si des filtres de statut sont définis, vérifier si l'élève correspond
            if (!empty($statusFilters) && !in_array($studentStatus, $statusFilters)) {
                continue;
            }

            // Récupérer les informations des parents
            $parents = $student->getIdParent();
            $parentData = [];
            $totalParentExpenses = 0;

            foreach ($parents as $parent) {
                $parentData[] = [
                    'firstname' => $parent->getFirstname(),
                    'lastname' => $parent->getLastname(),
                    'email' => $parent->getEmail(),
                    'phone' => $parent->getPhone(),
                ];

                // Calculer les dépenses totales du parent (tous ses enfants)
                $totalParentExpenses += $this->calculateParentTotalExpenses($parent);
            }

            // Récupérer l'abonnement actif
            $activeSubscription = $this->getActiveSubscription($student);
            $subscriptionType = $activeSubscription ? $activeSubscription->getSubscriptionType() : 'Aucun';
            $hoursPerWeek = $activeSubscription ? $activeSubscription->getSessionPerWeek() : 0;

            $exportData[] = [
                'student_firstname' => $student->getFirstname(),
                'student_lastname' => $student->getLastname(),
                'student_class' => $student->getClass(),
                'center_name' => $student->getIdCenter() ? $student->getIdCenter()->getName() : 'N/A',
                'status' => $studentStatus, // Un seul statut
                'parents' => $parentData,
                'subscription_type' => $subscriptionType,
                'hours_per_week' => $hoursPerWeek,
                'total_expenses' => $totalParentExpenses,
            ];
        }

        return $exportData;
    }

    /**
     * Détermine le statut principal d'un élève (priorité au statut le plus récent/pertinent)
     */
    private function determineStudentStatus($student): string
    {
        $subscriptions = $student->getSubscriptions();
        $now = new \DateTime();

        // Priorité 1 : Abonnement en cours (valide, programmé, non annulé, non résilié)
        foreach ($subscriptions as $subscription) {
            if ($subscription->isIsValide() &&
                $subscription->isIsProgramed() &&
                !$subscription->isIsCanceled() &&
                $subscription->getResiliationDate() === null) {
                return 'active_subscription';
            }
        }

        // Priorité 2 : Abonnement résilié (valide mais avec date de résiliation)
        foreach ($subscriptions as $subscription) {
            if ($subscription->isIsValide() &&
                $subscription->isIsProgramed() &&
                !$subscription->isIsCanceled() &&
                $subscription->getResiliationDate() !== null) {
                return 'resiliated_subscription';
            }
        }

        // Priorité 3 : Abonnement terminé (date de fin dépassée ET pas valide/programmé)
        foreach ($subscriptions as $subscription) {
            if ($subscription->getSubscriptionEndDate() &&
                $subscription->getSubscriptionEndDate() < $now &&
                (!$subscription->isIsValide() || !$subscription->isIsProgramed())) {
                return 'terminated_subscription';
            }
        }

        // Priorité 4 : A effectué une séance d'essai (mais pas d'abonnement)
        $sessions = $student->getSessions();
        foreach ($sessions as $session) {
            if ($session->getSessionType() === 'Séance d\'essai') {
                return 'trial_session';
            }
        }

        // Priorité 5 : Simplement inscrit (cas par défaut)
        return 'registered';
    }

    /**
     * Récupère l'abonnement actif d'un élève
     */
    private function getActiveSubscription($student)
    {
        $subscriptions = $student->getSubscriptions();

        foreach ($subscriptions as $subscription) {
            if ($subscription->isIsValide() &&
                $subscription->isIsProgramed() &&
                !$subscription->isIsCanceled() &&
                $subscription->getResiliationDate() === null) {
                return $subscription;
            }
        }

        return null;
    }

    /**
     * Calcule le montant total des dépenses d'un parent (tous ses enfants)
     */
    private function calculateParentTotalExpenses($parent): float
    {
        $totalExpenses = 0;
        $students = $parent->getStudents();

        foreach ($students as $student) {
            $subscriptions = $student->getSubscriptions();

            foreach ($subscriptions as $subscription) {
                if ($subscription->isIsValide()) {
                    // Calcul basé sur le type d'offre et le montant
                    $offerAmount = $subscription->getOfferAmount() ?? 0;
                    $installmentCount = $subscription->getInstallmentCount() ?? 1;

                    // Ajouter les frais d'adhésion
                    $membershipFee = $subscription->getMembershipFee() ?? 0;

                    $totalExpenses += ($offerAmount * $installmentCount) + $membershipFee;
                }
            }
        }

        return $totalExpenses;
    }

    /**
     * Génère un fichier CSV à partir des données d'export
     *
     * @param array $data Données formatées pour l'export
     * @return string Contenu du fichier CSV
     */
    public function generateCSV(array $data): string
    {
        $output = fopen('php://temp', 'r+');

        // En-têtes du CSV
        fputcsv($output, [
            'Prénom Élève',
            'Nom Élève',
            'Classe',
            'Centre',
            'Statut',
            'Prénom Parent(s)',
            'Nom Parent(s)',
            'Email Parent(s)',
            'Téléphone Parent(s)',
            'Type Abonnement',
            'Nombres de séances par semaine',
            'Montant total dépenses (€)'
        ], ';');

        // Lignes de données
        foreach ($data as $row) {
            // Formater les informations des parents
            $parentsFirstnames = [];
            $parentsLastnames = [];
            $parentsEmails = [];
            $parentsPhones = [];

            foreach ($row['parents'] as $parent) {
                $parentsFirstnames[] = $parent['firstname'];
                $parentsLastnames[] = $parent['lastname'];
                $parentsEmails[] = $parent['email'];
                $parentsPhones[] = $parent['phone'];
            }

            // Traduire le statut
            $statusLabel = $this->translateStatus($row['status']);

            fputcsv($output, [
                $row['student_firstname'],
                $row['student_lastname'],
                $row['student_class'],
                $row['center_name'],
                $statusLabel,
                implode(' / ', $parentsFirstnames),
                implode(' / ', $parentsLastnames),
                implode(' / ', $parentsEmails),
                implode(' / ', $parentsPhones),
                $row['subscription_type'],
                $row['hours_per_week'],
                number_format($row['total_expenses'], 2, ',', ' ')
            ], ';');
        }

        rewind($output);
        $csv = stream_get_contents($output);
        fclose($output);

        return $csv;
    }

    /**
     * Traduit le code de statut en libellé français
     */
    private function translateStatus(string $status): string
    {
        $statusMap = [
            'registered' => 'Inscrit',
            'trial_session' => 'A effectué une séance d\'essai',
            'active_subscription' => 'Abonnement en cours',
            'resiliated_subscription' => 'Abonnement résilié',
            'terminated_subscription' => 'Abonnement terminé'
        ];

        return $statusMap[$status] ?? $status;
    }

    /**
     * Récupère la liste de tous les centres
     */
    public function getAllCenters(): array
    {
        return $this->centerRepository->findAll();
    }

    /**
     * Récupère la liste de toutes les classes distinctes
     */
    public function getAllClasses(): array
    {
        $qb = $this->em->createQueryBuilder();
        $qb->select('DISTINCT s.class')
            ->from('App\Entity\Student', 's')
            ->where('s.is_deleted = :isDeleted')
            ->setParameter('isDeleted', false)
            ->orderBy('s.class', 'ASC');

        $result = $qb->getQuery()->getResult();
        return array_column($result, 'class');
    }
}
