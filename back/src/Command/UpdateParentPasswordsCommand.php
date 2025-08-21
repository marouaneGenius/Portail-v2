<?php

namespace App\Command;

use App\Entity\StudentParent;
use App\Repository\StudentParentRepository;
use App\Security\StudentParentUser;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\Console\Attribute\AsCommand;
use Symfony\Component\Console\Command\Command;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Output\OutputInterface;
use Symfony\Component\Console\Style\SymfonyStyle;
use Symfony\Component\PasswordHasher\Hasher\UserPasswordHasherInterface;

#[AsCommand(
    name: 'app:update-parent-passwords',
    description: 'Update existing StudentParent records to add generated passwords'
)]
class UpdateParentPasswordsCommand extends Command
{
    private StudentParentRepository $studentParentRepository;
    private EntityManagerInterface $entityManager;
    private UserPasswordHasherInterface $passwordHasher;

    public function __construct(
        StudentParentRepository $studentParentRepository,
        EntityManagerInterface $entityManager,
        UserPasswordHasherInterface $passwordHasher
    ) {
        $this->studentParentRepository = $studentParentRepository;
        $this->entityManager = $entityManager;
        $this->passwordHasher = $passwordHasher;
        parent::__construct();
    }

    protected function execute(InputInterface $input, OutputInterface $output): int
    {
        $io = new SymfonyStyle($input, $output);

        $io->title('Update StudentParent Passwords');

        // Récupérer tous les parents sans mot de passe
        $parents = $this->studentParentRepository->createQueryBuilder('p')
            ->where('p.password IS NULL OR p.password = :empty')
            ->setParameter('empty', '')
            ->getQuery()
            ->getResult();

        $io->info(sprintf('Found %d parents without passwords', count($parents)));

        $updated = 0;
        foreach ($parents as $parent) {
            /** @var StudentParent $parent */
            
            // Générer le mot de passe : prenomnom2025
            $firstname = strtolower($parent->getFirstname());
            $lastname = strtolower($parent->getLastname());
            $rawPassword = $firstname . $lastname . '2025';
            
            // Hasher le mot de passe
            $studentParentUser = new StudentParentUser($parent);
            $hashedPassword = $this->passwordHasher->hashPassword($studentParentUser, $rawPassword);
            $parent->setPassword($hashedPassword);
            
            $updated++;
            
            $io->text(sprintf(
                'Updated: %s %s (%s) - password: %s',
                $parent->getFirstname(),
                $parent->getLastname(),
                $parent->getEmail(),
                $rawPassword
            ));
        }

        if ($updated > 0) {
            $this->entityManager->flush();
            $io->success(sprintf('Updated %d parent passwords', $updated));
        } else {
            $io->info('No parents to update');
        }

        $io->section('Test Login');
        if (count($parents) > 0) {
            $testParent = $parents[0];
            $firstname = strtolower($testParent->getFirstname());
            $lastname = strtolower($testParent->getLastname());
            $testPassword = $firstname . $lastname . '2025';
            
            $io->text([
                'You can now test login with:',
                sprintf('Email: %s', $testParent->getEmail()),
                sprintf('Password: %s', $testPassword),
                '',
                'curl -X POST http://localhost:8080/login \\',
                '  -H "Content-Type: application/json" \\',
                sprintf('  -d \'{"email": "%s", "password": "%s"}\'', $testParent->getEmail(), $testPassword)
            ]);
        }

        return Command::SUCCESS;
    }
}