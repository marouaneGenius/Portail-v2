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
        CenterRepository $centerRepository
    ) {
        $this->em               = $em;
        $this->passwordHasher   = $passwordHasher;
        $this->centerRepository = $centerRepository;
    }

    
    #[Route('/', name: 'app_user_index', methods: ['GET'])]
    public function index(UserRepository $userRepository): Response
    {
        return $this->render('user/index.html.twig', [
            'users' => $userRepository->findAll(),
        ]);
    }

    #[Route('', name: 'create', methods: ['POST'])]
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

    #[Route('/{id}', name: 'app_user_show', methods: ['GET'])]
    public function show(User $user): Response
    {
        return $this->render('user/show.html.twig', [
            'user' => $user,
        ]);
    }

    #[Route('/{id}/edit', name: 'app_user_edit', methods: ['GET', 'POST'])]
    public function edit(Request $request, User $user, EntityManagerInterface $entityManager): Response
    {
        $form = $this->createForm(UserType::class, $user);
        $form->handleRequest($request);

        if ($form->isSubmitted() && $form->isValid()) {
            $entityManager->flush();

            return $this->redirectToRoute('app_user_index', [], Response::HTTP_SEE_OTHER);
        }

        return $this->renderForm('user/edit.html.twig', [
            'user' => $user,
            'form' => $form,
        ]);
    }

    #[Route('/{id}', name: 'app_user_delete', methods: ['POST'])]
    public function delete(Request $request, User $user, EntityManagerInterface $entityManager): Response
    {
        if ($this->isCsrfTokenValid('delete'.$user->getId(), $request->request->get('_token'))) {
            $entityManager->remove($user);
            $entityManager->flush();
        }

        return $this->redirectToRoute('app_user_index', [], Response::HTTP_SEE_OTHER);
    }
}
