<?php

namespace App\Service;

use App\Entity\Session;
use App\Entity\TutorReminderLog;
use App\Entity\User;
use App\Repository\SessionRepository;
use App\Repository\TutorReminderLogRepository;
use Doctrine\ORM\EntityManagerInterface;
use Psr\Log\LoggerInterface;

class TutorReminderService
{
    private EntityManagerInterface $entityManager;
    private SessionRepository $sessionRepository;
    private TutorReminderLogRepository $reminderLogRepository;
    private SmsService $smsService;
    private LoggerInterface $logger;

    public function __construct(
        EntityManagerInterface $entityManager,
        SessionRepository $sessionRepository,
        TutorReminderLogRepository $reminderLogRepository,
        SmsService $smsService,
        LoggerInterface $logger
    ) {
        $this->entityManager = $entityManager;
        $this->sessionRepository = $sessionRepository;
        $this->reminderLogRepository = $reminderLogRepository;
        $this->smsService = $smsService;
        $this->logger = $logger;
    }

    /**
     * Envoie les rappels quotidiens aux tuteurs pour leurs sessions du lendemain
     */
    public function sendDailyReminders(): array
    {
        $results = [
            'processed' => 0,
            'sent' => 0,
            'skipped' => 0,
            'failed' => 0,
            'errors' => []
        ];

        try {
            // Vérifier si les rappels ont déjà été envoyés aujourd'hui
            if ($this->reminderLogRepository->hasDailyReminderBeenSent()) {
                $this->logger->info('Daily reminders already sent today, skipping');
                return $results;
            }

            // Date de demain
            $tomorrow = new \DateTime('+1 day');
            $tomorrow->setTime(0, 0, 0);

            // Récupérer toutes les sessions de demain non annulées
            $tomorrowSessions = $this->sessionRepository->findSessionsForDate($tomorrow);

            $this->logger->info('Found sessions for tomorrow', [
                'date' => $tomorrow->format('Y-m-d'),
                'count' => count($tomorrowSessions)
            ]);

            // Grouper les sessions par tuteur
            $sessionsByTutor = $this->groupSessionsByTutor($tomorrowSessions);

            // Envoyer un rappel à chaque tuteur
            foreach ($sessionsByTutor as $tutor => $sessions) {
                $results['processed']++;

                /** @var User $tutorUser */
                $tutorUser = $sessions[0]->getIdTutor();

                if (!$tutorUser || !in_array('ROLE_TUTOR', $tutorUser->getRoles())) {
                    $results['skipped']++;
                    continue;
                }

                // Vérifier si ce tuteur a déjà reçu un rappel pour demain
                if ($this->reminderLogRepository->hasReminderBeenSent($tutorUser, $tomorrow)) {
                    $this->logger->info('Reminder already sent to tutor', [
                        'tutor_id' => $tutorUser->getId(),
                        'session_date' => $tomorrow->format('Y-m-d')
                    ]);
                    $results['skipped']++;
                    continue;
                }

                // Créer le message personnalisé
                $message = $this->createReminderMessage($tutorUser, $sessions, $tomorrow);

                // Envoyer le SMS
                $success = $this->smsService->sendSms($tutorUser->getPhone(), $message);

                // Logger le résultat
                $this->logReminderAttempt($tutorUser, $tomorrow, $message, $success);

                if ($success) {
                    $results['sent']++;
                } else {
                    $results['failed']++;
                }
            }

            $this->entityManager->flush();

        } catch (\Exception $e) {
            $this->logger->error('Error sending daily reminders', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            $results['errors'][] = $e->getMessage();
        }

        $this->logger->info('Daily reminder process completed', $results);

        return $results;
    }

    /**
     * Groupe les sessions par tuteur
     */
    private function groupSessionsByTutor(array $sessions): array
    {
        $grouped = [];

        /** @var Session $session */
        foreach ($sessions as $session) {
            $tutor = $session->getIdTutor();
            if ($tutor) {
                $tutorKey = $tutor->getId();
                if (!isset($grouped[$tutorKey])) {
                    $grouped[$tutorKey] = [];
                }
                $grouped[$tutorKey][] = $session;
            }
        }

        return $grouped;
    }

    /**
     * Crée le message de rappel personnalisé
     */
    private function createReminderMessage(User $tutor, array $sessions, \DateTime $sessionDate): string
    {
        $firstName = $tutor->getFirstname() ?? 'Cher tuteur';
        $sessionCount = count($sessions);
        $dateStr = $this->formatDateToFrench($sessionDate);

        // Récupérer les créneaux horaires
        $timeSlots = [];
        /** @var Session $session */
        foreach ($sessions as $session) {
            if ($session->getScheduledAt()) {
                $timeSlots[] = $session->getScheduledAt()->format('H\hi');
            }
        }

        $message = "Bonjour {$firstName}, ";

        if ($sessionCount === 1) {
            $timeSlot = !empty($timeSlots) ? ' à ' . $timeSlots[0] : '';
            $message .= "vous avez 1 session prévue demain {$dateStr}{$timeSlot}.";
        } else {
            $timeSlotsStr = !empty($timeSlots) ? ' (' . implode(', ', $timeSlots) . ')' : '';
            $message .= "vous avez {$sessionCount} sessions prévues demain {$dateStr}{$timeSlotsStr}.";
        }

        $message .= " N'oubliez pas, pour plus d'informations, consultez votre espace personnel : https://portailv2.geniusclass.fr/login. Bonne journée.";

        return $message;
    }

    /**
     * Formate une date en français
     */
    private function formatDateToFrench(\DateTime $date): string
    {
        $days = [
            'Monday' => 'lundi',
            'Tuesday' => 'mardi',
            'Wednesday' => 'mercredi',
            'Thursday' => 'jeudi',
            'Friday' => 'vendredi',
            'Saturday' => 'samedi',
            'Sunday' => 'dimanche'
        ];

        $months = [
            'January' => 'janvier',
            'February' => 'février',
            'March' => 'mars',
            'April' => 'avril',
            'May' => 'mai',
            'June' => 'juin',
            'July' => 'juillet',
            'August' => 'août',
            'September' => 'septembre',
            'October' => 'octobre',
            'November' => 'novembre',
            'December' => 'décembre'
        ];

        $dayName = $days[$date->format('l')];
        $monthName = $months[$date->format('F')];

        return $dayName . ' ' . $date->format('j') . ' ' . $monthName;
    }

    /**
     * Log une tentative de rappel
     */
    private function logReminderAttempt(User $tutor, \DateTime $sessionDate, string $message, bool $success, string $errorMessage = null): void
    {
        $log = new TutorReminderLog();
        $log->setTutor($tutor);
        $log->setSessionDate($sessionDate);
        $log->setPhone($tutor->getPhone());
        $log->setMessage($message);
        $log->setSuccessful($success);

        if (!$success && $errorMessage) {
            $log->setErrorMessage($errorMessage);
        }

        $this->entityManager->persist($log);
    }

    /**
     * Nettoie les anciens logs de rappels
     */
    public function cleanOldLogs(): int
    {
        return $this->reminderLogRepository->cleanOldLogs();
    }

    /**
     * Récupère les statistiques des rappels
     */
    public function getReminderStats(\DateTimeInterface $from, \DateTimeInterface $to): array
    {
        return $this->reminderLogRepository->getReminderStats($from, $to);
    }
}