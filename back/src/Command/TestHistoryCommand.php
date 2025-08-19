<?php

namespace App\Command;

use App\Entity\User;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\Console\Attribute\AsCommand;
use Symfony\Component\Console\Command\Command;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Output\OutputInterface;
use Symfony\Component\Console\Style\SymfonyStyle;

#[AsCommand(
    name: 'app:test-history',
    description: 'Test le système d\'historique des modifications',
)]
class TestHistoryCommand extends Command
{
    public function __construct(private EntityManagerInterface $entityManager)
    {
        parent::__construct();
    }

    protected function execute(InputInterface $input, OutputInterface $output): int
    {
        $io = new SymfonyStyle($input, $output);

        // Trouver un utilisateur à modifier
        $user = $this->entityManager->getRepository(User::class)->findOneBy(['is_deleted' => false]);
        
        if (!$user) {
            $io->error('Aucun utilisateur trouvé');
            return Command::FAILURE;
        }

        $io->info("Test avec l'utilisateur : {$user->getFirstname()} {$user->getLastname()} (ID: {$user->getId()})");

        // Compter les enregistrements d'historique avant
        $historyCountBefore = $this->entityManager->createQuery(
            'SELECT COUNT(h) FROM App\Entity\ModificationHistory h'
        )->getSingleScalarResult();

        $io->info("Nombre d'enregistrements d'historique avant : {$historyCountBefore}");

        // Modifier l'utilisateur
        $oldFirstname = $user->getFirstname();
        $newFirstname = 'TEST_' . time();
        
        $io->info("Modification du prénom de '{$oldFirstname}' vers '{$newFirstname}'");
        
        $user->setFirstname($newFirstname);
        $this->entityManager->flush();

        // Attendre un peu et compter les enregistrements après
        sleep(1);
        
        $historyCountAfter = $this->entityManager->createQuery(
            'SELECT COUNT(h) FROM App\Entity\ModificationHistory h'
        )->getSingleScalarResult();

        $io->info("Nombre d'enregistrements d'historique après : {$historyCountAfter}");

        if ($historyCountAfter > $historyCountBefore) {
            $io->success('✅ Le système de tracking fonctionne ! Une modification a été enregistrée.');
            
            // Afficher le dernier enregistrement
            $lastHistory = $this->entityManager->createQuery(
                'SELECT h FROM App\Entity\ModificationHistory h ORDER BY h.createdAt DESC'
            )->setMaxResults(1)->getOneOrNullResult();
            
            if ($lastHistory) {
                $io->table(['Champ', 'Valeur'], [
                    ['ID', $lastHistory->getId()],
                    ['Type entité', $lastHistory->getEntityType()],
                    ['ID entité', $lastHistory->getEntityId()],
                    ['Nom entité', $lastHistory->getEntityName()],
                    ['Champ modifié', $lastHistory->getFieldName()],
                    ['Action', $lastHistory->getAction()],
                    ['Ancienne valeur', $lastHistory->getFormattedOldValue()],
                    ['Nouvelle valeur', $lastHistory->getFormattedNewValue()],
                    ['Date', $lastHistory->getCreatedAt()->format('Y-m-d H:i:s')],
                ]);
            }
        } else {
            $io->error('❌ Le système de tracking ne fonctionne pas. Aucune modification n\'a été enregistrée.');
            
            // Information de debug
            $io->section('Debug information');
            $io->text('Vérifiez que :');
            $io->listing([
                'Les services sont bien configurés',
                'L\'EntityModificationListener est enregistré comme event listener',
                'Les événements Doctrine sont correctement déclenchés'
            ]);
        }

        // Remettre l'ancienne valeur
        $user->setFirstname($oldFirstname);
        $this->entityManager->flush();
        
        $io->note("Prénom remis à la valeur originale : {$oldFirstname}");

        return Command::SUCCESS;
    }
}