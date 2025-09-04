<?php
// src/Controller/StudentParentApiController.php
namespace App\Controller;

use App\Entity\Student;
use App\Entity\StudentParent;
use App\Repository\StudentParentRepository;
use App\Service\NameNormalizerService;
use App\Service\PhoneValidatorService;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Annotation\Route;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\IsGranted;

#[Route('/api/parent')]
class StudentParentController extends AbstractController
{
    public function __construct(
        private EntityManagerInterface    $em,
        private StudentParentRepository   $parentRepo,
        private NameNormalizerService     $nameNormalizer,
        private PhoneValidatorService     $phoneValidator
    ) {}

    /**
     * Crée un nouveau parent d’élève.
     *
     * JSON attendu : {
     *   firstname, lastname, gender, email, phone, address,
     *   zip_code?, city?
     * }
     *
     * @return JsonResponse
     */
    #[Route('', name: 'api_parents_create', methods: ['POST'])]
    #[IsGranted('ROLE_USER')]
    public function create(Request $request): JsonResponse
    {
        $data = json_decode($request->getContent(), true);

        // Validation basique
        foreach (['firstname', 'lastname', 'gender', 'email', 'phone', 'address'] as $f) {
            if (empty($data[$f] ?? null)) {
                return $this->json(
                    ['error' => sprintf('Le champ "%s" est requis.', $f)],
                    JsonResponse::HTTP_BAD_REQUEST
                );
            }
        }

        // Validation et normalisation des noms
        if (!$this->nameNormalizer->isValidName($data['firstname'])) {
            $suggestions = $this->nameNormalizer->getSuggestions($data['firstname']);
            return $this->json([
                'error' => 'Le prénom contient des caractères non valides.',
                'suggestions' => $suggestions
            ], JsonResponse::HTTP_BAD_REQUEST);
        }

        if (!$this->nameNormalizer->isValidName($data['lastname'])) {
            $suggestions = $this->nameNormalizer->getSuggestions($data['lastname']);
            return $this->json([
                'error' => 'Le nom contient des caractères non valides.',
                'suggestions' => $suggestions
            ], JsonResponse::HTTP_BAD_REQUEST);
        }

        // Validation du téléphone (requis pour les parents)
        if (!$this->phoneValidator->isValidPhone($data['phone'])) {
            $suggestions = $this->phoneValidator->getSuggestions($data['phone']);
            return new JsonResponse([
                'error' => 'Numéro de téléphone invalide.',
                'phone_provided' => $data['phone'],
                'suggestions' => $suggestions,
                'example' => '06 12 34 56 78'
            ], JsonResponse::HTTP_BAD_REQUEST);
        }

        $parent = new StudentParent();
        $parent
            ->setFirstname($data['firstname'])
            ->setLastname($data['lastname'])
            ->setGender($data['gender'])
            ->setEmail($data['email'])
            ->setPhone($data['phone'])
            ->setAddress($data['address'])
            ->setZipCode($data['zip_code'] ?? null)
            ->setCity($data['city'] ?? null)
            ->setCreatedAt(new \DateTimeImmutable())
            ->setCreatedBy($this->getUser()->getUserIdentifier())
        ;

        $this->em->persist($parent);
        $this->em->flush();

        // ✅ Préparation des données à envoyer à Zapier (modification parent dans sinao)
        $dataZapierParent = [
            'mail'      => $parent->getEmail(),
            'phone'     =>  $parent->getPhone(),
            'name'      => $parent->getLastname(),
            'prenom'    => $parent->getFirstname(),
            'ville'     => $parent->getCity(),
            'code_postal' => $parent->getZipCode(),
            'adresse'   => $parent->getAddress(),
            'telephone' => $parent->getPhone(),
            'id'        => $parent->getId()
        ];

        // Encodage JSON
        $jsonDataParent = json_encode($dataZapierParent);

        // URL Zapier
        $urlParent = 'https://hooks.zapier.com/hooks/catch/22004412/ut5i5cr/';

        // Contexte HTTP POST
        $optionsParent = [
            'http' => [
                'method'  => 'POST',
                'header'  => "Content-Type: application/json\r\n",
                'content' => $jsonDataParent
            ]
        ];

        $contextParent = stream_context_create($optionsParent);
        $result = file_get_contents($urlParent, false, $contextParent);

        return $this->json(
            [
                'id'         => $parent->getId(),
                'firstname'  => $parent->getFirstname(),
                'lastname'   => $parent->getLastname(),
                'gender'     => $parent->getGender(),
                'email'      => $parent->getEmail(),
                'phone'      => $parent->getPhone(),
                'address'    => $parent->getAddress(),
                'zip_code'   => $parent->getZipCode(),
                'city'       => $parent->getCity(),
                'created_at' => $parent->getCreatedAt()->format(\DateTime::ATOM),
                'created_by' => $parent->getCreatedBy(),
            ],
            JsonResponse::HTTP_CREATED
        );
    }

    /**
     * Liste tous les parents d’élèves.
     *
     * @return JsonResponse
     */
    #[Route('', name: 'api_parents_list', methods: ['GET'])]
    public function list(): JsonResponse
    {
        $parents = $this->parentRepo->findAll();

        $data = array_map(fn(StudentParent $p) => [
            'id'         => $p->getId(),
            'firstname'  => $p->getFirstname(),
            'lastname'   => $p->getLastname(),
            'gender'     => $p->getGender(),
            'email'      => $p->getEmail(),
            'phone'      => $p->getPhone(),
            'address'    => $p->getAddress(),
            'zip_code'   => $p->getZipCode(),
            'city'       => $p->getCity(),
            'created_at' => $p->getCreatedAt()->format(\DateTime::ATOM),
            'created_by' => $p->getCreatedBy(),
        ], $parents);

        return $this->json($data);
    }



    #[Route('/{id<\d+>}', methods: ['GET'])]
    public function show(int $id): JsonResponse
    {
        $parent = $this->parentRepo->find($id);
        if (!$parent) {
            return $this->json(['message' => 'Pas trouvé'], 404);
        }

        // Sérialisation des élèves liés
        $students = $parent->getStudents()->map(function (\App\Entity\Student $s) {
            return [
                'id'        => $s->getId(),
                'firstname' => $s->getFirstname(),
                'lastname'  => $s->getLastname(),
                // 'email'     => $s->getEmail(),
                'class'     => $s->getClass(),
                // 'is_active' => $s->isIsActive(),
            ];
        })->toArray();

        return $this->json([
            'id'          => $parent->getId(),
            'firstname'   => $parent->getFirstname(),
            'lastname'    => $parent->getLastname(),
            'gender'      => $parent->getGender(),
            'email'       => $parent->getEmail(),
            'phone'       => $parent->getPhone(),
            'address'     => $parent->getAddress(),
            'zip_code'    => $parent->getZipCode(),
            'city'        => $parent->getCity(),
            'created_at'  => $parent->getCreatedAt()->format(\DateTime::ATOM),
            'created_by'  => $parent->getCreatedBy(),
            'updated_at'  => $parent->getUpdatedAt()?->format(\DateTime::ATOM),
            'updated_by'  => $parent->getUpdatedBy(),
            'students'    => $students,
        ]);
    }

    // webhook declanche une music et elle s'arrete que quand y'a autre webhook 
    // declanche new lead
    // l'apelle passe et arrete la music
    // le numero du telephone c'est le meme 
    // idee une list des apelle en attente

    #[Route('/{id}', name: 'api_parents_update', methods: ['PUT'])]
    #[IsGranted('ROLE_USER')]
    public function update(int $id, Request $request): JsonResponse
    {
        // 1. Charger le parent
        $parent = $this->parentRepo->find($id);
        if (!$parent) {
            return $this->json(['error' => 'Parent non trouvé'], JsonResponse::HTTP_NOT_FOUND);
        }

        // 2. Décoder le JSON
        $data = json_decode($request->getContent(), true);
        if (!\is_array($data)) {
            return $this->json(['error' => 'JSON invalide'], JsonResponse::HTTP_BAD_REQUEST);
        }

        // 3. Hydrater les champs éditables
        foreach (['firstname', 'lastname', 'gender', 'email', 'phone', 'address', 'zip_code', 'city'] as $field) {
            if (array_key_exists($field, $data)) {
                // Construire le nom du setter, en camel case
                $setter = 'set' . str_replace(' ', '', ucwords(str_replace('_', ' ', $field)));
                $parent->$setter($data[$field]);
            }
        }

        // 4. Mettre à jour les métadonnées
        $parent->setUpdatedAt(new \DateTimeImmutable());
        $parent->setUpdatedBy($this->getUser()->getUserIdentifier());

        // 5. Persister
        $this->em->flush();

        // ✅ Préparation des données à envoyer à Zapier (modification parent dans sinao)
        $dataZapierParent = [
            'mail'      => $parent->getEmail(),
            'phone'     =>  $parent->getPhone(),
            'name'      => $parent->getLastname(),
            'prenom'    => $parent->getFirstname(),
            'ville'     => $parent->getCity(),
            'code_postal' => $parent->getZipCode(),
            'adresse'   => $parent->getAddress(),
            'telephone' => $parent->getPhone(),
            'id'        => $parent->getId()
        ];

        // Encodage JSON
        $jsonDataParent = json_encode($dataZapierParent);

        // URL Zapier
        $urlParent = 'https://hooks.zapier.com/hooks/catch/22004412/ut5i5cr/';

        // Contexte HTTP POST
        $optionsParent = [
            'http' => [
                'method'  => 'POST',
                'header'  => "Content-Type: application/json\r\n",
                'content' => $jsonDataParent
            ]
        ];

        $contextParent = stream_context_create($optionsParent);
        $result = file_get_contents($urlParent, false, $contextParent);

        // 6. Retour JSON de confirmation
        return $this->json([
            'id'        => $parent->getId(),
            'firstname' => $parent->getFirstname(),
            'lastname'  => $parent->getLastname(),
            'gender'    => $parent->getGender(),
            'email'     => $parent->getEmail(),
            'phone'     => $parent->getPhone(),
            'address'   => $parent->getAddress(),
            'zip_code'  => $parent->getZipCode(),
            'city'      => $parent->getCity(),
        ]);
    }

    #[Route('/{id}', name: 'api_parents_delete', methods: ['DELETE'])]
    #[IsGranted('ROLE_USER')]
    public function delete(int $id): JsonResponse
    {
        $parent = $this->parentRepo->find($id);
        if (!$parent) {
            return $this->json(['error' => 'Parent non trouvé'], JsonResponse::HTTP_NOT_FOUND);
        }

        $this->em->remove($parent);
        $this->em->flush();

        return new JsonResponse(null, JsonResponse::HTTP_NO_CONTENT);
    }



    #[Route('/search', name: 'api_parent_search', methods: ['GET'])]
    public function search(Request $request, StudentParentRepository $repo): JsonResponse
    {
        $q = trim((string) $request->query->get('q', ''));
        if ($q === '') {
            return $this->json([]);
        }

        $parts = array_filter(explode(' ', $q));

        $qb = $repo->createQueryBuilder('p');
        foreach ($parts as $k => $part) {
            $qb->andWhere(
                $qb->expr()->orX(
                    $qb->expr()->like('LOWER(p.firstname)', ":t$k"),
                    $qb->expr()->like('LOWER(p.lastname)', ":t$k")
                )
            )
                ->setParameter("t$k", '%' . strtolower($part) . '%');
        }

        $parents = $qb
            ->setMaxResults(20)
            ->getQuery()
            ->getArrayResult();

        return $this->json($parents);
    }
}
