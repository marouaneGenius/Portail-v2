<?php

namespace App\Command;

use App\Entity\User;
use App\Repository\UserRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\Console\Attribute\AsCommand;
use Symfony\Component\Console\Command\Command;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Output\OutputInterface;
use Symfony\Component\Console\Style\SymfonyStyle;
use Symfony\Component\PasswordHasher\Hasher\UserPasswordHasherInterface;

#[AsCommand(
    name: 'app:create-test-user',
    description: 'Create a test User for authentication testing'
)]
class CreateTestUserCommand extends Command
{
    private UserRepository $userRepository;
    private EntityManagerInterface $entityManager;
    private UserPasswordHasherInterface $passwordHasher;

    public function __construct(
        UserRepository $userRepository,
        EntityManagerInterface $entityManager,
        UserPasswordHasherInterface $passwordHasher
    ) {
        $this->userRepository = $userRepository;
        $this->entityManager = $entityManager;
        $this->passwordHasher = $passwordHasher;
        parent::__construct();
    }

    protected function execute(InputInterface $input, OutputInterface $output): int
    {
        $io = new SymfonyStyle($input, $output);

        $io->title('Create Test User');

        // Vérifier s'il existe déjà un utilisateur de test
        $existingUser = $this->userRepository->findOneBy(['email' => 'user.test@genius.fr']);
        
        if ($existingUser) {
            $io->info('Test user already exists: user.test@genius.fr');
            $this->showTestInstructions($io, $existingUser);
            return Command::SUCCESS;
        }

        // Créer un nouveau utilisateur de test
        $testUser = new User();
        $testUser->setFirstname('Marie');
        $testUser->setLastname('Martin');
        $testUser->setEmail('user.test@genius.fr');
        $testUser->setPhone('0123456789');
        $testUser->setRoles(['ROLE_USER', 'ROLE_ADMIN']);
        $testUser->setIsActive(true);
        $testUser->setCreatedAt(new \DateTimeImmutable());

        // Hasher le mot de passe
        $hashedPassword = $this->passwordHasher->hashPassword($testUser, 'userpassword123');
        $testUser->setPassword($hashedPassword);

        // Sauvegarder
        $this->entityManager->persist($testUser);
        $this->entityManager->flush();

        $io->success('Test user created successfully!');
        $this->showTestInstructions($io, $testUser);

        return Command::SUCCESS;
    }

    private function showTestInstructions(SymfonyStyle $io, User $user): void
    {
        $io->section('Test Instructions for User');
        
        $io->text([
            'Test user details:',
            sprintf('  Email: %s', $user->getEmail()),
            '  Password: userpassword123',
            sprintf('  Roles: %s', implode(', ', $user->getRoles())),
            '',
            'Test the unified authentication with:',
            '',
            '1. Login via API:',
            '   curl -X POST http://localhost:8080/login \\',
            '   -H "Content-Type: application/json" \\',
            '   -d \'{"email": "user.test@genius.fr", "password": "userpassword123"}\'',
            '',
            '2. Expected response: JWT token with ROLE_USER and ROLE_ADMIN',
        ]);
    }
}