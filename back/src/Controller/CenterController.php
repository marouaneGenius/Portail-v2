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
            ->setCity($data['city']);

        $this->em->persist($center);
        $this->em->flush();

        return $this->json(
            [
                'id'      => $center->getId(),
                'name'    => $center->getName(),
                'address' => $center->getAddress(),
                'city'    => $center->getCity(),
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
            ]);
    }
}
