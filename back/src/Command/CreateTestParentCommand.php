<?php

namespace App\Command;

use App\Entity\StudentParent;
use App\Repository\StudentParentRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\Console\Attribute\AsCommand;
use Symfony\Component\Console\Command\Command;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Output\OutputInterface;
use Symfony\Component\Console\Style\SymfonyStyle;
use Symfony\Component\PasswordHasher\Hasher\UserPasswordHasherInterface;
use App\Security\StudentParentUser;

#[AsCommand(
    name: 'app:create-test-parent',
    description: 'Create a test StudentParent with password for authentication testing'
)]
class CreateTestParentCommand extends Command
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

        $io->title('Create Test StudentParent');

        // Vérifier s'il existe déjà un parent de test
        $existingParent = $this->studentParentRepository->findOneBy(['email' => 'parent.test@genius.fr']);
        
        if ($existingParent) {
            $io->info('Test parent already exists: parent.test@genius.fr');
            
            // Vérifier si il a un mot de passe
            if (!$existingParent->getPassword()) {
                $io->text('Adding password to existing test parent...');
                $studentParentUser = new StudentParentUser($existingParent);
                $hashedPassword = $this->passwordHasher->hashPassword($studentParentUser, 'password123');
                $existingParent->setPassword($hashedPassword);
                $this->entityManager->flush();
                $io->success('Password added to existing test parent');
            } else {
                $io->info('Test parent already has a password');
            }
            
            $this->showTestInstructions($io, $existingParent);
            return Command::SUCCESS;
        }

        // Créer un nouveau parent de test
        $testParent = new StudentParent();
        $testParent->setFirstname('Jean');
        $testParent->setLastname('Dupont');
        $testParent->setEmail('parent.test@genius.fr');
        $testParent->setPhone('0123456789');
        $testParent->setGender('M');
        $testParent->setAddress('123 Rue de Test');
        $testParent->setCity('Paris');
        $testParent->setZipCode('75001');
        $testParent->setCreatedAt(new \DateTimeImmutable());
        $testParent->setCreatedBy('test-command');

        // Hasher le mot de passe
        $studentParentUser = new StudentParentUser($testParent);
        $hashedPassword = $this->passwordHasher->hashPassword($studentParentUser, 'password123');
        $testParent->setPassword($hashedPassword);

        // Sauvegarder
        $this->entityManager->persist($testParent);
        $this->entityManager->flush();

        $io->success('Test parent created successfully!');
        $this->showTestInstructions($io, $testParent);

        return Command::SUCCESS;
    }

    private function showTestInstructions(SymfonyStyle $io, StudentParent $parent): void
    {
        $io->section('Test Instructions');
        
        $io->text([
            'Test parent details:',
            sprintf('  Email: %s', $parent->getEmail()),
            '  Password: password123',
            '',
            'Test the unified authentication with:',
            '',
            '1. Login via API:',
            '   curl -X POST http://localhost:8080/api/login \\',
            '   -H "Content-Type: application/json" \\',
            '   -d \'{"email": "parent.test@genius.fr", "password": "password123"}\'',
            '',
            '2. Expected response: JWT token with ROLE_PARENT',
            '',
            '3. Use the JWT token to access protected endpoints:',
            '   curl -H "Authorization: Bearer YOUR_JWT_TOKEN" \\',
            '   http://localhost:8080/api/some-protected-endpoint',
        ]);
    }
}