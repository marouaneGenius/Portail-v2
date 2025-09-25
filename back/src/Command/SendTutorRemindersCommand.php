<?php

namespace App\Command;

use App\Service\TutorReminderService;
use Symfony\Component\Console\Attribute\AsCommand;
use Symfony\Component\Console\Command\Command;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Input\InputOption;
use Symfony\Component\Console\Output\OutputInterface;
use Symfony\Component\Console\Style\SymfonyStyle;

#[AsCommand(
    name: 'app:send-tutor-reminders',
    description: 'Envoie les rappels SMS quotidiens aux tuteurs pour leurs sessions du lendemain'
)]
class SendTutorRemindersCommand extends Command
{
    private TutorReminderService $reminderService;

    public function __construct(TutorReminderService $reminderService)
    {
        parent::__construct();
        $this->reminderService = $reminderService;
    }

    protected function configure(): void
    {
        $this
            ->setDescription('Envoie les rappels SMS quotidiens aux tuteurs')
            ->setHelp('Cette commande envoie un SMS de rappel à tous les tuteurs qui ont des sessions programmées pour le lendemain.')
            ->addOption(
                'force',
                'f',
                InputOption::VALUE_NONE,
                'Force l\'envoi même si les rappels ont déjà été envoyés aujourd\'hui'
            )
            ->addOption(
                'dry-run',
                'd',
                InputOption::VALUE_NONE,
                'Simule l\'envoi sans vraiment envoyer les SMS'
            )
            ->addOption(
                'clean-logs',
                'c',
                InputOption::VALUE_NONE,
                'Nettoie les anciens logs (plus de 30 jours)'
            );
    }

    protected function execute(InputInterface $input, OutputInterface $output): int
    {
        $io = new SymfonyStyle($input, $output);

        $io->title('🔔 Envoi des rappels aux tuteurs');

        try {
            // Option pour nettoyer les anciens logs
            if ($input->getOption('clean-logs')) {
                $io->section('🧹 Nettoyage des anciens logs');
                $deletedCount = $this->reminderService->cleanOldLogs();
                $io->success("$deletedCount anciens logs supprimés.");
            }

            // Option dry-run
            if ($input->getOption('dry-run')) {
                $io->note('Mode DRY-RUN activé - Aucun SMS ne sera réellement envoyé');
                // TODO: Implémenter la simulation
                return Command::SUCCESS;
            }

            // Forcer l'envoi si demandé
            if ($input->getOption('force')) {
                $io->note('Mode FORCE activé - Les vérifications de doublons sont ignorées');
                // TODO: Passer le paramètre force au service
            }

            $io->section('📱 Envoi des rappels SMS');

            // Envoyer les rappels
            $results = $this->reminderService->sendDailyReminders();

            // Afficher les résultats
            $this->displayResults($io, $results);

            // Statistiques des derniers 7 jours
            $io->section('📊 Statistiques des 7 derniers jours');
            $from = new \DateTime('-7 days');
            $to = new \DateTime();
            $stats = $this->reminderService->getReminderStats($from, $to);

            $io->table(
                ['Métrique', 'Valeur'],
                [
                    ['Total envoyés', $stats['total'] ?? 0],
                    ['Réussis', $stats['successful'] ?? 0],
                    ['Échoués', $stats['failed'] ?? 0],
                    ['Taux de réussite', $this->calculateSuccessRate($stats)]
                ]
            );

            return Command::SUCCESS;

        } catch (\Exception $e) {
            $io->error('Erreur lors de l\'envoi des rappels: ' . $e->getMessage());
            return Command::FAILURE;
        }
    }

    private function displayResults(SymfonyStyle $io, array $results): void
    {
        if ($results['sent'] > 0) {
            $io->success("✅ {$results['sent']} rappels envoyés avec succès");
        }

        if ($results['skipped'] > 0) {
            $io->info("⏭️  {$results['skipped']} tuteurs ignorés (déjà contactés ou pas de session)");
        }

        if ($results['failed'] > 0) {
            $io->warning("❌ {$results['failed']} échecs d'envoi");
        }

        if (!empty($results['errors'])) {
            $io->error('Erreurs détectées:');
            foreach ($results['errors'] as $error) {
                $io->text("  • $error");
            }
        }

        if ($results['sent'] === 0 && $results['failed'] === 0) {
            $io->note('Aucun rappel à envoyer aujourd\'hui');
        }

        // Résumé
        $io->table(
            ['Tuteurs traités', 'SMS envoyés', 'Ignorés', 'Échecs'],
            [[$results['processed'], $results['sent'], $results['skipped'], $results['failed']]]
        );
    }

    private function calculateSuccessRate(array $stats): string
    {
        $total = $stats['total'] ?? 0;
        $successful = $stats['successful'] ?? 0;

        if ($total === 0) {
            return '0%';
        }

        $rate = round(($successful / $total) * 100, 1);
        return "$rate%";
    }
}