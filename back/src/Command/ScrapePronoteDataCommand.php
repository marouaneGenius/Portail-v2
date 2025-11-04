<?php

namespace App\Command;

use App\Repository\StudentRepository;
use Symfony\Component\Console\Attribute\AsCommand;
use Symfony\Component\Console\Command\Command;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Input\InputOption;
use Symfony\Component\Console\Output\OutputInterface;
use Symfony\Component\Console\Style\SymfonyStyle;
use Symfony\Contracts\HttpClient\HttpClientInterface;

#[AsCommand(
    name: 'app:scrape-pronote',
    description: 'Lance le scraping Pronote pour tous les élèves ayant des identifiants configurés',
)]
class ScrapePronoteDataCommand extends Command
{
    public function __construct(
        private StudentRepository $studentRepository,
        private HttpClientInterface $httpClient,
        private string $scrapperServiceUrl = 'http://scrapper:3000',
    ) {
        parent::__construct();
    }

    protected function configure(): void
    {
        $this
            ->addOption('student-id', 's', InputOption::VALUE_OPTIONAL, 'Scraper uniquement cet élève (ID)')
            ->addOption('delay', 'd', InputOption::VALUE_OPTIONAL, 'Délai en secondes entre chaque scraping (défaut: 5)', 5)
            ->setHelp('Cette commande lance le scraping Pronote pour tous les élèves qui ont des identifiants configurés.');
    }

    protected function execute(InputInterface $input, OutputInterface $output): int
    {
        $io = new SymfonyStyle($input, $output);
        $studentId = $input->getOption('student-id');
        $delay = (int) $input->getOption('delay');

        $io->title('🔄 Scraping Pronote');

        // Récupérer les élèves à scraper
        if ($studentId) {
            $student = $this->studentRepository->find($studentId);
            if (!$student) {
                $io->error("Élève avec l'ID {$studentId} introuvable.");
                return Command::FAILURE;
            }
            $students = [$student];
            $io->info("Scraping pour l'élève : {$student->getFirstname()} {$student->getLastname()}");
        } else {
            $students = $this->studentRepository->findBy([
                'school_app' => 'pronote',
            ]);

            // Filtrer ceux qui ont tous les identifiants
            $students = array_filter($students, function ($student) {
                return $student->getSchoolAppUrl()
                    && $student->getSchoolAppUsername()
                    && $student->getSchoolAppPassword();
            });

            $io->info(sprintf('📊 %d élève(s) trouvé(s) avec des identifiants Pronote', count($students)));
        }

        if (empty($students)) {
            $io->warning('Aucun élève à scraper.');
            return Command::SUCCESS;
        }

        $io->progressStart(count($students));

        $success = 0;
        $failed = 0;
        $errors = [];

        foreach ($students as $student) {
            try {
                $io->progressAdvance();

                // Appeler l'API du scraper
                $response = $this->httpClient->request('POST', "{$this->scrapperServiceUrl}/api/scrape/{$student->getId()}", [
                    'timeout' => 120, // 2 minutes timeout
                ]);

                $statusCode = $response->getStatusCode();
                $data = $response->toArray(false);

                if ($statusCode === 200 && ($data['success'] ?? false)) {
                    $success++;
                    $io->writeln('');
                    $io->success("✅ {$student->getFirstname()} {$student->getLastname()} (ID: {$student->getId()})");

                    // Afficher les statistiques si disponibles
                    if (isset($data['data']['stats'])) {
                        $stats = $data['data']['stats'];
                        $io->text([
                            "  📚 Notes: {$stats['grades']['inserted']} nouvelles, {$stats['grades']['duplicates']} doublons",
                            "  📝 DS: {$stats['exams']['inserted']} nouveaux, {$stats['exams']['duplicates']} doublons",
                            "  ✏️  Devoirs: {$stats['homework']['inserted']} nouveaux, {$stats['homework']['duplicates']} doublons",
                        ]);
                    }
                } else {
                    $failed++;
                    $errorMsg = $data['error'] ?? $data['message'] ?? 'Erreur inconnue';
                    $errors[] = [
                        'student' => "{$student->getFirstname()} {$student->getLastname()} (ID: {$student->getId()})",
                        'error' => $errorMsg,
                    ];
                    $io->writeln('');
                    $io->error("❌ {$student->getFirstname()} {$student->getLastname()} : {$errorMsg}");
                }

                // Délai entre chaque scraping pour éviter la détection
                if ($delay > 0 && $student !== end($students)) {
                    sleep($delay);
                }

            } catch (\Exception $e) {
                $failed++;
                $errors[] = [
                    'student' => "{$student->getFirstname()} {$student->getLastname()} (ID: {$student->getId()})",
                    'error' => $e->getMessage(),
                ];
                $io->writeln('');
                $io->error("❌ {$student->getFirstname()} {$student->getLastname()} : {$e->getMessage()}");
            }
        }

        $io->progressFinish();
        $io->newLine(2);

        // Résumé
        $io->section('📊 Résumé');
        $io->table(
            ['Statut', 'Nombre'],
            [
                ['✅ Réussis', $success],
                ['❌ Échoués', $failed],
                ['📊 Total', count($students)],
            ]
        );

        // Afficher les erreurs détaillées si nécessaire
        if (!empty($errors)) {
            $io->section('❌ Détails des erreurs');
            $io->table(
                ['Élève', 'Erreur'],
                array_map(fn($e) => [$e['student'], $e['error']], $errors)
            );
        }

        if ($failed > 0) {
            $io->warning(sprintf('%d scraping(s) échoué(s)', $failed));
            return Command::FAILURE;
        }

        $io->success('Tous les scrapings ont été exécutés avec succès ! 🎉');
        return Command::SUCCESS;
    }
}
