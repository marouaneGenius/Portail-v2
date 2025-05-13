<?php

namespace App\Controller;

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
        $user->setRoles($data['roles'] ?? ['ROLE_USER']);


        // 3. Associer le Center si fourni
        if (!empty($data['id_center'])) {
            $center = $this->centerRepository->find($data['id_center']);
            if (!$center) {
                return new JsonResponse(
                    ['error' => 'Center not found'],
                    JsonResponse::HTTP_BAD_REQUEST
                );
            }
            $user->setIdCenter($center);
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
            'id_center' => $user->getIdCenter()?->getId(),
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
            'roles'     => $u->getRoles(),
        ], $users);

        return $this->json($data);
    }

    #[Route('/{id}', methods: ['GET'])]
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
            'tutor_schedules' => array_map(fn($ts) => [
                'id'         => $ts->getId(),
                'day'        => $ts->getDay()->format('Y-m-d'),
                'start_hour' => $ts->getStartHour()->format('H:i:s'),
                'end_hour'   => $ts->getEndHour()->format('H:i:s'),
            ], $user->getTutorSchedules()->toArray()),

            'reports' => array_map(fn($r) => [
                'id'          => $r->getId(),
                'created_at'  => $r->getCreatedAt()->format(\DateTime::ATOM),
            ], $user->getReports()->toArray()),

            'center' => $user->getIdCenter()
                ? [
                    'id'      => $user->getIdCenter()->getId(),
                    'name'    => $user->getIdCenter()->getName(),
                    'address' => $user->getIdCenter()->getAddress(),
                    'city'    => $user->getIdCenter()->getCity(),
                ]
                : null,
            ]);
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
    
        // Champs simples
        
        foreach (['firstname','lastname','siret','max_session','price_per_hour'] as $f) {
            if (array_key_exists($f, $data)) {
                $setter = 'set'.ucfirst($f);
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



    
}
