<?php

namespace App\Controller;

use App\Entity\Center;
use App\Entity\TutorSchedule;
use App\Entity\User;
use App\Form\UserType;
use App\Repository\CenterRepository;
use App\Repository\UserRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\PasswordHasher\Hasher\UserPasswordHasherInterface;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\Security\Http\Attribute\CurrentUser;
use Symfony\Component\Validator\Validator\ValidatorInterface;
use Symfony\Component\Validator\Constraints as Assert;

#[Route('/api/user', name: 'api_user_')]
class UserController extends AbstractController
{
    private EntityManagerInterface $em;
    private UserPasswordHasherInterface $passwordHasher;
    private CenterRepository $centerRepository;

    public function __construct(
        EntityManagerInterface $em,
        UserPasswordHasherInterface $passwordHasher,
        CenterRepository $centerRepository,
        private UserRepository $userRepository
    ) {
        $this->em               = $em;
        $this->passwordHasher   = $passwordHasher;
        $this->centerRepository = $centerRepository;
    }


    #[Route('', name: 'create', methods: ['POST'])]
    #[IsGranted('ROLE_ADMIN')]
    public function create(Request $request): JsonResponse
    {
        // 1. Récupérer et décoder le JSON
        $data = json_decode($request->getContent(), true);
        if (!\is_array($data)) {
            return new JsonResponse(
                ['error' => 'Invalid JSON body'],
                JsonResponse::HTTP_BAD_REQUEST
            );
        }

        // 2. Créer et hydrater l’entité User
        $user = new User();
        $user->setFirstname($data['firstname'] ?? null);
        $user->setLastname($data['lastname'] ?? null);
        $user->setEmail($data['email'] ?? '');
        $user->setPhone($data['phone'] ?? '');
        $user->setSiret($data['siret'] ?? null);
        $user->setIsActive($data['is_active'] ?? true);
        $user->setIsDeleted($data['is_deleted'] ?? false);
        $user->setCreatedAt(new \DateTimeImmutable());
        $user->setCreatedBy($data['created_by'] ?? 'api');
        $user->setUpdatedAt(null);
        $user->setUpdatedBy(null);
        $user->setMaxSession($data['max_session'] ?? null);
        $user->setPricePerHour($data['price_per_hour'] ?? null);
        $user->setRoles([$data['role']]?? ['ROLE_USER']);
        $user->setSchoolSubjects($data['school_subjects'] ?? null);

        if (!empty($data['centers']) && is_array($data['centers'])) {
            foreach ($data['centers'] as $centerId) {
                // /** @var Center|null $center */
                $center = $this->centerRepository->find($centerId);
                if ($center) {
                    // addCentre gérera l’inverse dans Center
                    $user->addCentre($center);
                }
            }
        }

        // 4. Hasher le password
        if (empty($data['password'])) {
            return new JsonResponse(
                ['error' => 'Password is required'],
                JsonResponse::HTTP_BAD_REQUEST
            );
        }
        if (!empty($data['email'])) {
            $existing = $this->userRepository->findOneBy(['email' => $data['email']]);
            if ($existing) {
                return new JsonResponse(
                    ['error' => 'Un utilisateur avec cet email existe déjà.'],
                    JsonResponse::HTTP_CONFLICT
                );
            }
        }
        if (!empty($data['phone'])) {
            $existing = $this->userRepository->findOneBy(['phone' => $data['phone']]);
            if ($existing) {
                return new JsonResponse(
                    ['error' => 'Un utilisateur avec ce numéro de téléphone existe déjà.'],
                    JsonResponse::HTTP_CONFLICT
                );
            }
        }
        $hashedPwd = $this->passwordHasher->hashPassword($user, $data['password']);
        $user->setPassword($hashedPwd);

        // 5. Persister en base
        $this->em->persist($user);
        $this->em->flush();

        // 6. Réponse JSON 201 Created
        return new JsonResponse([
            'id'        => $user->getId(),
            'firstname' => $user->getFirstname(),
            'lastname'  => $user->getLastname(),
            'email'     => $user->getEmail(),
            'phone'     => $user->getPhone(),
            'centers' => array_map(fn(Center $c) => [
                'id'   => $c->getId(),
                'name' => $c->getName(),
                'city' => $c->getCity(),
                'phone' => $c->getPhone(),
                'email' => $c->getEmail(),

            ], $user->getCentres()->toArray()),
        ], JsonResponse::HTTP_CREATED);
    }
    
    #[Route('', name: 'api_users_list', methods: ['GET'])]
    #[IsGranted('ROLE_ADMIN')]
    public function list(): JsonResponse
    {
        $users = $this->userRepository->findAll();

        // On mappe chaque entité User en tableau simple
        $data = array_map(fn($u) => [
            'id'        => $u->getId(),
            'email'     => $u->getEmail(),
            'firstname' => $u->getFirstname(),
            'lastname'  => $u->getLastname(),
            'is_active'  => $u->isIsActive(),
            'roles'     => $u->getRoles(),
            'google_id' => $u->getGoogleId()
        ], $users);

        return $this->json($data);
    }

    #[Route('/{id}', methods: ['GET'], requirements: ['id' => '\d+'])]
    #[IsGranted('ROLE_ADMIN')]
    public function show(int $id): JsonResponse
    {
        $user = $this->userRepository->find($id);
        if (!$user) { return $this->json(['message'=>'Pas trouvé'],404); }
        return $this->json([
            'id'                => $user->getId(),
            'email'             => $user->getEmail(),
            'firstname'         => $user->getFirstname(),
            'lastname'          => $user->getLastname(),
            'roles'             => $user->getRoles(),
            'phone'             => $user->getPhone(),
            'siret'             => $user->getSiret(),
            'is_active'         => $user->isIsActive(),
            'is_deleted'        => $user->isIsDeleted(),
            'created_at'        => $user->getCreatedAt(),
            'created_by'        => $user->getCreatedBy(),
            'updated_at'        => $user->getUpdatedAt(),
            'updated_by'        => $user->getUpdatedBy(),
            'max_session'       => $user->getMaxSession(),
            'price_per_hour'    => $user->getPricePerHour(),
            'school_subjects'   => $user->getSchoolSubjects(),
            'tutor_schedules' => array_map(fn($ts) => [
                'id'         => $ts->getId(),
                'day'        => $ts->getDay(),
                'start_hour' => $ts->getStartHour()->format('H:i:s'),
                'end_hour'   => $ts->getEndHour()->format('H:i:s'),
                'centers'   => array_map(fn(Center $c) => [
                    'id'   => $c->getId(),
                    'name' => $c->getName(),
                    'city' => $c->getCity(),
                    'phone' => $c->getPhone(),
                    'email' => $c->getEmail(),
                ], $ts->getCenter()->toArray()),
            ], $user->getTutorSchedules()->toArray()),

            'reports' => array_map(fn($r) => [
                'id'          => $r->getId(),
                'created_at'  => $r->getCreatedAt()->format(\DateTime::ATOM),
            ], $user->getReports()->toArray()),

            'centers' => array_map(fn($c) => [
                'id'          => $c->getId(),
                // 'created_at'  => $c->getCreatedAt()->format(\DateTime::ATOM),
                'name'        => $c->getName(),
                'address'     => $c->getAddress(),
                'city'        => $c->getCity(),
                'phone' => $c->getPhone(),
                'email' => $c->getEmail(),
            ], $user->getCentres()->toArray()),


            
        ]);
    }


    #[Route('/tutors', name: 'api_tutors_list', methods: ['GET'])]
    public function tutorsList(): JsonResponse
    {
        $users = $this->userRepository->findTutors();
        // On mappe chaque entité User en tableau simple
        $data = array_map(fn($u) => [
            'id'        => $u->getId(),
            'email'     => $u->getEmail(),
            'firstname' => $u->getFirstname(),
            'lastname'  => $u->getLastname(),
            'is_active'  => $u->isIsActive(),
            'roles'     => $u->getRoles(),
            'school_subjects' => $u->getSchoolSubjects(),
            'centers' => array_map(fn(Center $c) => [
                'id'   => $c->getId(),
                'name' => $c->getName(),
            ], $u->getCentres()->toArray()),
            'events' => array_map(fn(TutorSchedule $tutorSchedule) => [
                'id'   => $tutorSchedule->getId(),
                'day' => $tutorSchedule->getDay(),
                'start_hour' => $tutorSchedule->getStartHour(),
                'end_hour' => $tutorSchedule->getEndHour(),
                'centers' => (function() use ($tutorSchedule) {
                        $centers = $tutorSchedule->getCenter()->toArray();
                        $first = $centers[0] ?? null;
                        if (!$first) return null;
                        return [
                            'id'    => $first->getId(),
                            'name'  => $first->getName(),
                            'city'  => $first->getCity(),
                            'phone' => $first->getPhone(),
                            'email' => $first->getEmail(),
                        ];
            })(),
            ], $u->getTutorSchedules()->toArray()),
        ], $users);

        return $this->json($data);
    }

    private function snakeToCamel(string $field): string
    {
        // 1) remplace les '_' par des espaces, 2) ucwords() → "Max Session", 
        // 3) enlève les espaces → "MaxSession"
        return str_replace(' ', '', ucwords(str_replace('_', ' ', $field)));
    }

    #[Route('/{id}', methods: ['PUT'])]
    #[IsGranted('ROLE_ADMIN')]
    public function update(int $id, Request $request): JsonResponse
    {
        $user = $this->userRepository->find($id);
        if (!$user) {
            return $this->json(['error'=>'Utilisateur non trouvé'], 404);
        }

        $data = json_decode($request->getContent(), true);
        if (!\is_array($data)) {
            return $this->json(['error'=>'JSON invalide'], 400);
        }
    
        // Unicité email / phone
        if (!empty($data['email']) && $data['email'] !== $user->getEmail()) {
            if ($this->userRepository->findOneBy(['email'=>$data['email']])) {
                return $this->json(['error'=>'Email déjà utilisé'], 409);
            }
            $user->setEmail($data['email']);
        }
        
        if (!empty($data['phone']) && $data['phone'] !== $user->getPhone()) {
            if ($this->userRepository->findOneBy(['phone'=>$data['phone']])) {
                return $this->json(['error'=>'Téléphone déjà utilisé'], 409);
            }
            $user->setPhone($data['phone']);
        }

        //recuperer uniquement les id des centre
        if (!empty($data['centers']) && is_array($data['centers'])) {

            // Vider les centres existants de l'utilisateur avant d'ajouter les nouveaux
            foreach ($user->getCentres() as $existingCenter) {
                $user->removeCentre($existingCenter);
            }
        
            // Ajouter uniquement les centres envoyés dans la nouvelle liste
            foreach ($data['centers'] as $centerData) {
        
                // Vérifie si l'élément courant est un tableau (objet) ou un entier directement
                if (is_array($centerData) && isset($centerData['id'])) {
                    $centerId = $centerData['id'];
                } else {
                    $centerId = $centerData; // suppose que c’est directement un entier
                }
        
                $center = $this->centerRepository->find($centerId);
        
                if ($center) {
                    $user->addCentre($center);
                }
            }
        }

        if (array_key_exists('roles', $data)) {
            // cas idéal : on reçoit ["ROLE_USER","ROLE_ADMIN"]
            $roles = $data['roles'];
        } elseif (isset($data['role'])) {
            // cas fallback : on reçoit "ROLE_ADMIN"
            $roles = [$data['role']];
        }
        
        if (isset($roles) && is_array($roles)) {
            $user->setRoles($roles);
        }
        

        foreach (['firstname','lastname','siret','max_session','price_per_hour', 'school_subjects'] as $f) {
            if (array_key_exists($f, $data)) {
                $setter = 'set' . $this->snakeToCamel($f);
                // Vérification que la méthode existe bien
                if (!method_exists($user, $setter)) {
                    throw new \RuntimeException("Méthode $setter introuvable sur User");
                }
                $user->$setter($data[$f]);
            }
        }



        if (isset($data['is_active'])) {
            $user->setIsActive((bool)$data['is_active']);
        }
        if (isset($data['is_deleted'])) {
            $user->setIsDeleted((bool)$data['is_deleted']);
        }
        // Met à jour la date
        $user->setUpdatedAt(new \DateTimeImmutable());
        $user->setUpdatedBy($this->getUser()->getUserIdentifier());

    
        $this->em->flush();
    
        return $this->json([
            'id'        => $user->getId(),
            'email'     => $user->getEmail(),
            'firstname' => $user->getFirstname(),
            'lastname'  => $user->getLastname(),
            'roles'  => $user->getRoles(),
            // etc.
        ]);
    }

    #[Route('/{id}', name: 'api_users_delete', methods: ['DELETE'])]
    #[IsGranted('ROLE_ADMIN')]
    public function delete(int $id): JsonResponse
    {
        $user = $this->userRepository->find($id);
        if (!$user) {
            return $this->json(['error' => 'Utilisateur non trouvé'], JsonResponse::HTTP_NOT_FOUND);
        }

        $this->em->remove($user);
        $this->em->flush();

        // 204 No Content, suppression OK
        return new JsonResponse(null, JsonResponse::HTTP_NO_CONTENT);
    }

    #[Route('/{id}/password', name: 'api_user_change_password', methods: ['PUT'])]
    // #[IsGranted('ROLE_ADMIN')]
    public function changePassword(
        #[CurrentUser] ?User $currentUser,            // utilisateur connecté (via JWT)
        User $user,                                   // {id} dans l’URL
        Request $request,
        UserPasswordHasherInterface $hasher,
        EntityManagerInterface $em,
        ValidatorInterface $validator
        ): JsonResponse {

        if ($user !== $currentUser && !$this->isGranted('ROLE_ADMIN')) {
            throw $this->createAccessDeniedException();
        }
    
        /* 2) Lecture + validation */
        $payload = json_decode($request->getContent(), true);
        $violations = $validator->validate(
            $payload,
            new Assert\Collection([
                // pas d’ancien mot de passe
                'password'        => [new Assert\NotBlank(), new Assert\Length(min: 8)],
                'confirm_password' => new Assert\NotBlank(),
            ])
        );
    
        if (count($violations) > 0) {
            return $this->json(['errors' => (string) $violations], 422);
        }
    
        /* 3) Concordance des deux mdp */
        if ($payload['password'] !== $payload['confirm_password']) {
            return $this->json(['error' => 'Les mots de passe ne correspondent pas'], 400);
        }
    
        /* 4) Hash + save */
        $user->setPassword($hasher->hashPassword($user, $payload['password']));
        $em->flush();
    
        return $this->json(['message' => 'Mot de passe mis à jour'], 200);
    
    }


    #[Route('/me/current_user', name: 'user_me', methods: ['GET'])]
    public function me(): JsonResponse
    {
        $user = $this->getUser();                

        if (!$user) {
            return $this->json(['message' => 'Non authentifié'], 401);
        }

        return $this->json([
            'id'             => $user->getId(),
            'email'          => $user->getEmail(),
            'firstname'      => $user->getFirstname(),
            'lastname'       => $user->getLastname(),
            'roles'          => $user->getRoles(),
            'is_active'      => $user->isIsActive(),
            'created_at'     => $user->getCreatedAt(),
        ]);
    }
}
