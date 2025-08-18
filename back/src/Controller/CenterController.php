<?php
namespace App\Controller;

use App\Entity\Center;
use App\Repository\CenterRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Annotation\Route;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\IsGranted;

#[Route('/api/center')]
class CenterController extends AbstractController
{
    public function __construct(
        private EntityManagerInterface $em,
        private CenterRepository       $centerRepo
    ) {}

    /**
     * Crée un nouveau centre.
     *
     * @param Request $request
     * @return JsonResponse
     */
    #[Route('', name: 'api_centers_create', methods: ['POST'])]
    #[IsGranted('ROLE_ADMIN')]
    public function create(Request $request): JsonResponse
    {
        $data = json_decode($request->getContent(), true);

        // validation basique
        foreach (['name', 'address', 'city'] as $field) {
            if (empty($data[$field] ?? null)) {
                return $this->json(
                    ['error' => sprintf('Le champ "%s" est requis.', $field)],
                    JsonResponse::HTTP_BAD_REQUEST
                );
            }
        }

        $center = new Center();

        $center
            ->setName($data['name'])
            ->setAddress($data['address'])
            ->setCity($data['city'])
            ->setPhone($data['phone'])
            ->setZipCode($data['zip_code'])
            ->setEmail($data['email']);

        $this->em->persist($center);
        $this->em->flush();

        return $this->json(
            [
                'id'      => $center->getId(),
                'name'    => $center->getName(),
                'address' => $center->getAddress(),
                'city'    => $center->getCity(),
                'phone'    => $center->getPhone(),
                'email'    => $center->getEmail(),
                'zip_code' => $center->getZipCode(),
            ],
            JsonResponse::HTTP_CREATED
        );
    }

    /**
     * Renvoie la liste de tous les centres.
     *
     * @return JsonResponse
     */
    #[Route('', name: 'api_centers_list', methods: ['GET'])]
    public function list(): JsonResponse
    {
        $centers = $this->centerRepo->findAll();

        $data = array_map(fn(Center $c) => [
            'id'      => $c->getId(),
            'name'    => $c->getName(),
            'address' => $c->getAddress(),
            'city'    => $c->getCity(),
            'phone'    => $c->getPhone(),
            'email'    => $c->getEmail(),
            'zip_code' => $c->getZipCode(),

        ], $centers);

        return $this->json($data);
    }


    #[Route('/{id}', methods: ['GET'])]
    public function show(int $id): JsonResponse
    {
        $center = $this->centerRepo->find($id);
        if (!$center) { return $this->json(['message'=>'Pas trouvé'],404); }
        return $this->json([
            'id'        => $center->getId(),
            'name'      => $center->getName(),
            'address'   => $center->getAddress(),
            'city'      => $center->getCity(),
            'phone'    => $center->getPhone(),
            'email'    => $center->getEmail(),
            'zip_code'  => $center->getZipCode(),
            ]);
    }

    #[Route('/{id}', name: 'api_centers_update', methods: ['PUT'])]
    #[IsGranted('ROLE_ADMIN')]
    public function update(int $id, Request $request): JsonResponse
    {
        // 1. Charger le centre
        $center = $this->centerRepo->find($id);
        if (!$center) {
            return $this->json(['error' => 'Centre non trouvé'], JsonResponse::HTTP_NOT_FOUND);
        }

        // 2. Décoder le JSON
        $data = json_decode($request->getContent(), true);
        if (!\is_array($data)) {
            return $this->json(['error' => 'JSON invalide'], JsonResponse::HTTP_BAD_REQUEST);
        }

        // 3. Hydrater les champs éditables
        foreach (['name', 'address', 'city', 'phone', 'email'] as $field) {
            if (array_key_exists($field, $data)) {
                $setter = 'set' . ucfirst($field);
                $center->$setter($data[$field]);
            }
        }

        if($data['zip_code'] ?? null) {
            $center->setZipCode($data['zip_code']);
        }


        // 4. Mettre à jour la date et l’utilisateur
        // $center-> setUpdatedAt(new \DateTimeImmutable());
        // $center->setUpdatedBy($this->getUser()->getUserIdentifier());

        // 5. Persister
        $this->em->flush();

        // 6. Retour JSON de confirmation
        return $this->json([
            'id'      => $center->getId(),
            'name'    => $center->getName(),
            'address' => $center->getAddress(),
            'city'    => $center->getCity(),
            'phone'    => $center->getPhone(),
            'email'    => $center->getEmail(),
            
        ]);
    }

    #[Route('/{id}', name: 'api_centers_delete', methods: ['DELETE'])]
    #[IsGranted('ROLE_ADMIN')]
    public function delete(int $id): JsonResponse
    {
        $center = $this->centerRepo->find($id);
        if (!$center) {
            return $this->json(['error' => 'Centre non trouvé'], JsonResponse::HTTP_NOT_FOUND);
        }

        $this->em->remove($center);
        $this->em->flush();

        return new JsonResponse(null, JsonResponse::HTTP_NO_CONTENT);
    }

}
