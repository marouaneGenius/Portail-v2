<?php

namespace App\Command;

use App\Security\UnifiedUserProvider;
use App\Security\StudentParentUser;
use Symfony\Component\Console\Attribute\AsCommand;
use Symfony\Component\Console\Command\Command;
use Symfony\Component\Console\Input\InputArgument;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Output\OutputInterface;
use Symfony\Component\Console\Style\SymfonyStyle;
use Symfony\Component\PasswordHasher\Hasher\UserPasswordHasherInterface;

#[AsCommand(
    name: 'app:test-parent-login',
    description: 'Test parent login credentials'
)]
class TestParentLoginCommand extends Command
{
    private UnifiedUserProvider $userProvider;
    private UserPasswordHasherInterface $passwordHasher;

    public function __construct(
        UnifiedUserProvider $userProvider,
        UserPasswordHasherInterface $passwordHasher
    ) {
        $this->userProvider = $userProvider;
        $this->passwordHasher = $passwordHasher;
        parent::__construct();
    }

    protected function configure(): void
    {
        $this
            ->addArgument('email', InputArgument::REQUIRED, 'Parent email')
            ->addArgument('password', InputArgument::REQUIRED, 'Password to test');
    }

    protected function execute(InputInterface $input, OutputInterface $output): int
    {
        $io = new SymfonyStyle($input, $output);
        
        $email = $input->getArgument('email');
        $password = $input->getArgument('password');

        $io->title(sprintf('Testing login for: %s', $email));

        try {
            // 1. Charger l'utilisateur
            $user = $this->userProvider->loadUserByIdentifier($email);
            
            if ($user instanceof StudentParentUser) {
                $io->info('✅ User found as StudentParent');
                $io->text([
                    sprintf('Name: %s %s', $user->getFirstname(), $user->getLastname()),
                    sprintf('Email: %s', $user->getEmail()),
                    sprintf('Roles: %s', implode(', ', $user->getRoles())),
                ]);
                
                // 2. Vérifier le mot de passe
                $isValid = $this->passwordHasher->isPasswordValid($user, $password);
                
                if ($isValid) {
                    $io->success('✅ Password is VALID - Login should work!');
                } else {
                    $io->error('❌ Password is INVALID');
                    
                    // Test avec différentes variantes
                    $firstname = strtolower($user->getFirstname());
                    $lastname = strtolower($user->getLastname());
                    $expectedPassword = $firstname . $lastname . '2025';
                    
                    $io->section('Debug Info:');
                    $io->text([
                        sprintf('Expected password: %s', $expectedPassword),
                        sprintf('Provided password: %s', $password),
                        sprintf('Match: %s', $expectedPassword === $password ? 'YES' : 'NO'),
                        sprintf('Firstname: "%s"', $user->getFirstname()),
                        sprintf('Lastname: "%s"', $user->getLastname()),
                    ]);
                }
                
            } else {
                $io->info('User found as regular User (not StudentParent)');
            }
            
        } catch (\Exception $e) {
            $io->error(sprintf('Error: %s', $e->getMessage()));
            return Command::FAILURE;
        }

        return Command::SUCCESS;
    }
}