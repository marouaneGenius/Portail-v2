<?php

namespace App\Command;

use App\Entity\StudentParent;
use App\Repository\StudentParentRepository;
use App\Security\UnifiedUserProvider;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\Console\Attribute\AsCommand;
use Symfony\Component\Console\Command\Command;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Output\OutputInterface;
use Symfony\Component\Console\Style\SymfonyStyle;
use Symfony\Component\PasswordHasher\Hasher\UserPasswordHasherInterface;
use App\Security\StudentParentUser;

#[AsCommand(
    name: 'app:setup-parent-auth',
    description: 'Setup authentication for StudentParent users - hash passwords and test authentication'
)]
class SetupParentAuthCommand extends Command
{
    private StudentParentRepository $studentParentRepository;
    private EntityManagerInterface $entityManager;
    private UserPasswordHasherInterface $passwordHasher;
    private UnifiedUserProvider $userProvider;

    public function __construct(
        StudentParentRepository $studentParentRepository,
        EntityManagerInterface $entityManager,
        UserPasswordHasherInterface $passwordHasher,
        UnifiedUserProvider $userProvider
    ) {
        $this->studentParentRepository = $studentParentRepository;
        $this->entityManager = $entityManager;
        $this->passwordHasher = $passwordHasher;
        $this->userProvider = $userProvider;
        parent::__construct();
    }

    protected function execute(InputInterface $input, OutputInterface $output): int
    {
        $io = new SymfonyStyle($input, $output);

        $io->title('Setup StudentParent Authentication');

        // 1. Vérifier combien de parents existent
        $parents = $this->studentParentRepository->findAll();
        $io->info(sprintf('Found %d StudentParent records', count($parents)));

        // 2. Vérifier les parents avec des mots de passe
        $parentsWithPassword = array_filter($parents, function(StudentParent $parent) {
            return !empty($parent->getPassword());
        });

        $io->info(sprintf('%d parents have passwords set', count($parentsWithPassword)));

        // 3. Hasher les mots de passe non hashés
        $hashedCount = 0;
        foreach ($parentsWithPassword as $parent) {
            $currentPassword = $parent->getPassword();
            
            // Vérifier si le mot de passe est déjà hashé (commence par $2y$ pour bcrypt)
            if (!str_starts_with($currentPassword, '$2y$') && !str_starts_with($currentPassword, '$argon')) {
                // Créer un wrapper pour utiliser le password hasher
                $studentParentUser = new StudentParentUser($parent);
                $hashedPassword = $this->passwordHasher->hashPassword($studentParentUser, $currentPassword);
                
                $parent->setPassword($hashedPassword);
                $hashedCount++;
                
                $io->text(sprintf('Hashed password for: %s (%s)', 
                    $parent->getFirstname() . ' ' . $parent->getLastname(),
                    $parent->getEmail()
                ));
            }
        }

        if ($hashedCount > 0) {
            $this->entityManager->flush();
            $io->success(sprintf('Hashed %d passwords', $hashedCount));
        } else {
            $io->info('All passwords are already hashed or no passwords to hash');
        }

        // 4. Tester l'authentification
        $io->section('Testing Authentication');
        
        if (empty($parentsWithPassword)) {
            $io->warning('No parents with passwords to test. Create a test parent first.');
            return Command::SUCCESS;
        }

        // Prendre le premier parent pour tester
        $parentsArray = array_values($parentsWithPassword);
        $testParent = $parentsArray[0];
        $testEmail = $testParent->getEmail();

        try {
            $user = $this->userProvider->loadUserByIdentifier($testEmail);
            
            if ($user instanceof StudentParentUser) {
                $io->success(sprintf('✅ Authentication test passed for parent: %s (%s)', 
                    $user->getFirstname() . ' ' . $user->getLastname(),
                    $user->getEmail()
                ));
                $io->text(sprintf('   - Roles: %s', implode(', ', $user->getRoles())));
                $io->text(sprintf('   - User ID: %d', $user->getId()));
            } else {
                $io->error('Unexpected user type returned');
            }
            
        } catch (\Exception $e) {
            $io->error(sprintf('❌ Authentication test failed: %s', $e->getMessage()));
        }

        // 5. Instructions pour la suite
        $io->section('Next Steps');
        $io->text([
            '1. Test the login endpoint with a parent\'s credentials:',
            '   POST /api/login',
            '   {"email": "parent@example.com", "password": "their_password"}',
            '',
            '2. The parent should receive a JWT token and have ROLE_PARENT',
            '',
            '3. Use the JWT token to access protected API endpoints',
        ]);

        return Command::SUCCESS;
    }
}