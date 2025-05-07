<?php
// src/Controller/StudentParentApiController.php
namespace App\Controller;

use App\Entity\Student;
use App\Entity\StudentParent;
use App\Repository\StudentParentRepository;
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
        private StudentParentRepository   $parentRepo
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
    #[IsGranted('ROLE_ADMIN')]
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

    #[Route('/api/parents/{id}', methods: ['PUT'])]
    #[IsGranted('ROLE_ADMIN')]
    public function update(  int $id, Request $request): JsonResponse {
        $parent = $this->em->getRepository(StudentParent::class)->find($id);
        if (!$parent) {
            return $this->json(['error'=>'Parent introuvable'], 404);
        }

        $data = json_decode($request->getContent(), true);
        $parent->setFirstname($data['firstname'] ?? $parent->getFirstname());

        if (!empty($data['student_ids']) && is_array($data['student_ids'])) {
            foreach ($parent->getStudents() as $oldStudent) {
                $parent->removeStudent($oldStudent);
            }
            foreach ($data['student_ids'] as $studentId) {
                $student = $this->em->getRepository(Student::class)->find($studentId);
                if ($student) {
                    $parent->addStudent($student);
                }
            }
        }

        $this->em->flush();

        return $this->json(['success'=>true]);
    }

}
