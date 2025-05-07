<?php
// src/Controller/StudentApiController.php
namespace App\Controller;

use App\Entity\Student;
use App\Repository\StudentRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Annotation\Route;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\IsGranted;

#[Route('/api/student')]
class StudentController extends AbstractController
{
    public function __construct(
        private EntityManagerInterface $em,
        private StudentRepository      $studentRepo
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
}
