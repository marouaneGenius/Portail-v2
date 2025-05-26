<?php
// src/Controller/StudentApiController.php
namespace App\Controller;

use App\Entity\Student;
use App\Repository\CenterRepository;
use App\Repository\StudentParentRepository;
use App\Repository\StudentRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\IsGranted;

#[Route('/api/student')]
class StudentController extends AbstractController
{
    public function __construct(
        private EntityManagerInterface $em,
        private StudentRepository      $studentRepo,
        private CenterRepository $centerRepository,
        private StudentParentRepository $studentParentRepository,

    ) {}

    /**
     * Crée un nouvel étudiant.
     *
     * @param Request $request JSON { firstname, lastname, gender, class, email, phone?, id_center }
     * @return JsonResponse
     */
    #[Route('', name: 'api_students_create', methods: ['POST'])]
    #[IsGranted('ROLE_ADMIN')]
    public function create(Request $request): JsonResponse
    {
        $data = json_decode($request->getContent(), true);

        // Champs requis
        $required = ['firstname', 'lastname', 'gender', 'class', 'email', 'id_center'];
        foreach ($required as $f) {
            if (empty($data[$f] ?? null)) {
                return $this->json(
                    ['error' => sprintf('Le champ "%s" est requis.', $f)],
                    JsonResponse::HTTP_BAD_REQUEST
                );
            }
        }

        $student = new Student();
        $student
            ->setFirstname($data['firstname'])
            ->setLastname($data['lastname'])
            ->setGender($data['gender'])
            ->setClass($data['class'])
            ->setEmail($data['email'])
            ->setPhone($data['phone'] ?? null)
            ->setIsActive(true)
            ->setIsDeleted(false)
            ->setCreatedAt(new \DateTimeImmutable())
            ->setCreatedBy($this->getUser()->getUserIdentifier())
        ;

        // Lier le centre
        $center = $this->em->getRepository(\App\Entity\Center::class)
                         ->find($data['id_center']);
        if (!$center) {
            return $this->json(
                ['error' => 'Centre introuvable.'],
                JsonResponse::HTTP_BAD_REQUEST
            );
        }
        $student->setIdCenter($center);

        $this->em->persist($student);
        $this->em->flush();

        return $this->json(
            [
                'id'        => $student->getId(),
                'firstname' => $student->getFirstname(),
                'lastname'  => $student->getLastname(),
                'gender'    => $student->getGender(),
                'class'     => $student->getClass(),
                'email'     => $student->getEmail(),
                'phone'     => $student->getPhone(),
                'is_active' => $student->isIsActive(),
                'is_deleted'=> $student->isIsDeleted(),
                'id_center' => $student->getIdCenter()->getId(),
                'created_at'=> $student->getCreatedAt()->format(\DateTime::ATOM),
                'created_by'=> $student->getCreatedBy(),
            ],
            JsonResponse::HTTP_CREATED
        );
    }

    /**
     * Liste tous les étudiants.
     *
     * @return JsonResponse
     */
    #[Route('', name: 'api_students_list', methods: ['GET'])]
    public function list(): JsonResponse
    {
        $students = $this->studentRepo->findAll();

        $data = array_map(fn(Student $s) => [
            'id'         => $s->getId(),
            'firstname'  => $s->getFirstname(),
            'lastname'   => $s->getLastname(),
            'gender'     => $s->getGender(),
            'class'      => $s->getClass(),
            'email'      => $s->getEmail(),
            'phone'      => $s->getPhone(),
            'is_active'  => $s->isIsActive(),
            'is_deleted' => $s->isIsDeleted(),
            'id_center'  => $s->getIdCenter()?->getId(),
            'created_at' => $s->getCreatedAt()->format(\DateTime::ATOM),
            'created_by' => $s->getCreatedBy(),
        ], $students);

        return $this->json($data);
    }


    #[Route('/{id}', methods: ['GET'])]
    public function show(int $id): JsonResponse
    {
        $student = $this->studentRepo->find($id);
        if (!$student) {
            return $this->json(['message'=>'Pas trouvé'], 404);
        }

        $parents = $student->getIdParent()->map(function(\App\Entity\StudentParent $p) {
            return [
                'id'        => $p->getId(),
                'firstname' => $p->getFirstname(),
                'lastname'  => $p->getLastname(),
                'email'     => $p->getEmail(),
                'phone'     => $p->getPhone(),
            ];
        })->toArray();

        $sessions = $student->getSessions()->map(function(\App\Entity\Session $s) {
            return [
                'id'             => $s->getId(),
                'date_slot'      => $s->getDateSlot()->format('Y-m-d'),
                'session_type'   => $s->getSessionType(),
                'is_canceled'    => $s->isIsCanceled(),
                'tutor_id'       => $s->getIdTutor()?->getId(),
            ];
        })->toArray();

        $subscriptions = $student->getSessions()->map(function(\App\Entity\Subscription $session) {
            return [
                'id'             => $session->getId(),
                'offre_type'     =>$session->getOfferType(),
                'is_multiple'    => $session->getCombinedId(),
                'tutor'          => $session->getSchoolSubjects(),
                'is_valid'          => $session->isIsValide(),
            ];
        })->toArray();

        $user = $this->studentRepo->find($id);
        if (!$user) { return $this->json(['message'=>'Pas trouvé'],404); }
        return $this->json([
            'id'                => $user->getId(),
            'email'             => $user->getEmail(),
            'firstname'         => $user->getFirstname(),
            'lastname'          => $user->getLastname(),
            'phone'             => $user->getPhone(),
            'is_active'         => $user->isIsActive(),
            'is_deleted'        => $user->isIsDeleted(),
            'created_at'        => $user->getCreatedAt(),
            'class'             => $user->getClass(),
            'created_by'        => $user->getCreatedBy(),
            'updated_at'        => $user->getUpdatedAt(),
            'updated_by'        => $user->getUpdatedBy(),
            'reports' => array_map(fn($r) => [
                'id'          => $r->getId(),
                'created_at'  => $r->getCreatedAt()->format(\DateTime::ATOM),
            ], $user->getReports()->toArray()),
            'centers' => $user->getIdCenter()
                ? [
                    'id'      => $user->getIdCenter()->getId(),
                    'name'    => $user->getIdCenter()->getName(),
                    'address' => $user->getIdCenter()->getAddress(),
                    'city'    => $user->getIdCenter()->getCity(),
                ]
                : null,
            'parents'   => $parents,
            'sessions'  => $sessions,
            ]);
    }

    #[Route('/{id}', name: 'api_students_update', methods: ['PUT'])]
    #[IsGranted('ROLE_ADMIN')]
    public function update(int $id, Request $request): JsonResponse
    {
        // 1. Charger l'élève
        $student = $this->studentRepo->find($id);
        if (!$student) {
            return $this->json(['error' => 'Élève non trouvé'], JsonResponse::HTTP_NOT_FOUND);
        }

        // 2. Décoder le JSON
        $data = json_decode($request->getContent(), true);
        if (!\is_array($data)) {
            return $this->json(['error' => 'JSON invalide'], JsonResponse::HTTP_BAD_REQUEST);
        }

        // 3. Hydrater les champs simples
        foreach (['firstname', 'lastname', 'gender', 'class', 'email', 'phone'] as $field) {
            if (array_key_exists($field, $data)) {
                $setter = 'set' . ucfirst($field);
                $student->$setter($data[$field]);
            }
        }

        // 4. Mettre à jour le center si fourni
        if (array_key_exists('id_center', $data)) {
            if ($data['id_center'] === null) {
                $student->setIdCenter(null);
            } else {
                // Récupération dans une variable explicite
                $centerEntity = $this->centerRepository->find($data['id_center']);
                if (!$centerEntity) {
                    return $this->json(['error' => 'Centre non trouvé'], JsonResponse::HTTP_BAD_REQUEST);
                }
                // NE PAS passer $student mais bien l'entité Center
                $student->setIdCenter($centerEntity);
            }
        }

        // 5. Champs booléens
        if (array_key_exists('is_active', $data)) {
            $student->setIsActive((bool)$data['is_active']);
        }
        if (array_key_exists('is_deleted', $data)) {
            $student->setIsDeleted((bool)$data['is_deleted']);
        }

        // 6. Mettre à jour les métadonnées
        $student->setUpdatedAt(new \DateTimeImmutable());
        $student->setUpdatedBy($this->getUser()->getUserIdentifier());

        // 7. Persister
        $this->em->flush();

        // 8. Réponse JSON
        return $this->json([
            'id'         => $student->getId(),
            'firstname'  => $student->getFirstname(),
            'lastname'   => $student->getLastname(),
            'gender'     => $student->getGender(),
            'class'      => $student->getClass(),
            'email'      => $student->getEmail(),
            'phone'      => $student->getPhone(),
            'is_active'  => $student->isIsActive(),
            'is_deleted' => $student->isIsDeleted(),
            'id_center'  => $student->getIdCenter()?->getId(),
        ]);
    }

    #[Route('/{id}', name: 'api_students_delete', methods: ['DELETE'])]
    #[IsGranted('ROLE_ADMIN')]
    public function delete(int $id): JsonResponse
    {
        $student = $this->studentRepo->find($id);
        if (!$student) {
            return $this->json(['error' => 'Élève non trouvé'], JsonResponse::HTTP_NOT_FOUND);
        }

        $this->em->remove($student);
        $this->em->flush();

        return new JsonResponse(null, JsonResponse::HTTP_NO_CONTENT);
    }


    #[Route('/{studentId}/parents', name: 'student_add_parent', methods: ['POST'])]
    public function addParent(int $studentId, Request $request): JsonResponse
    {
        $data = json_decode($request->getContent(), true);
        $parentId = $data['parentId'] ?? null;

        if (!$parentId) {
            return $this->json(['error'=>'parentId manquant'], 400);
        }

        $student = $this->studentRepo->find($studentId);
        $parent  = $this->studentParentRepository->find($parentId);

        if (!$student || !$parent) {
            return $this->json(['error'=>'Étudiant ou parent introuvable'], 404);
        }

        // Associer
        $student->addIdParent($parent);
        $this->em->flush();

        return $this->json([
            'studentId' => $student->getId(),
            'parentId'  => $parent->getId(),
            'message'   => 'Parent associé à l’élève avec succès'
        ], 201);
    }

    #[Route('/{id}/siblings', name: 'api_students_siblings', methods: ['GET'])]
    public function siblings(int $id): JsonResponse
    {
        $student = $this->studentRepo->find($id);

        if (!$student) {
            return $this->json(['error' => 'Élève non trouvé'], Response::HTTP_NOT_FOUND);
        }

        /** @var \\App\\Entity\\StudentParent[] $parents */
        $parents = $student->getIdParent()->toArray();

        if (!$parents) {
            // L'élève n'a aucun parent enregistré → donc pas de frère/sœur
            return $this->json([], Response::HTTP_OK);
        }

        // (on peut tout faire en RAM vu les volumes habituels)
        $siblings = [];
        foreach ($parents as $parent) {
            foreach ($parent->getStudents() as $child) {
                if ($child->getId() === $id) {
                    continue; // on exclut l’élève lui-même
                }
                // On indexe par id pour dé-dupliquer si deux parents communs
                $siblings[$child->getId()] = [
                    'id'        => $child->getId(),
                    'firstname' => $child->getFirstname(),
                    'lastname'  => $child->getLastname(),
                    'class'     => $child->getClass(),
                    'email'     => $child->getEmail(),
                ];
            }
        }

        return $this->json(array_values($siblings), Response::HTTP_OK);
    }


}
