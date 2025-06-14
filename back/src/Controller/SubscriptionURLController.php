<?php
namespace App\Controller;

use App\Entity\SubscriptionURL;
use App\Repository\StudentRepository;
use App\Repository\SubscriptionURLRepository;
use App\Repository\UserRepository;
use App\Repository\SubscriptionRepository;
use Doctrine\ORM\EntityManagerInterface;

// use GuzzleHttp\Psr7\UploadedFile;
use Symfony\Component\HttpFoundation\File\UploadedFile;

use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\Filesystem\Filesystem;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpKernel\Exception\BadRequestHttpException;
use Symfony\Component\Routing\Annotation\Route;

#[Route('/api/subscription-url', name: 'subscription_url_')]
class SubscriptionURLController extends AbstractController
{
    public function __construct(
        private readonly EntityManagerInterface $em,
        private readonly StudentRepository $studentRepo,
        private readonly SubscriptionRepository $subRepo,
        private readonly Filesystem $filesystem
    ) {}

    #[Route('', name: 'create', methods: ['POST'])]
    public function create(Request $request): JsonResponse
    {
        // 1) Récupérer l’UploadedFile
        /** @var UploadedFile|null $file */
        $file = $request->files->get('file');
        if (!$file instanceof UploadedFile) {
            throw new BadRequestHttpException('Le fichier PDF est requis.');
        }
    
        // 2) Récupérer les autres champs
        $studentId      = $request->request->getInt('user_id');
        $subscriptionId = $request->request->getInt('subscription_id');
    
        if (!$studentId || !$subscriptionId) {
            throw new BadRequestHttpException('user_id et subscription_id sont requis.');
        }
    
        // 3) Charger Student et Subscription
        $student = $this->studentRepo->find($studentId);
        $sub     = $this->subRepo->find($subscriptionId);
        if (!$student || !$sub) {
            return $this->json(['error' => 'Student ou Subscription introuvable.'], JsonResponse::HTTP_NOT_FOUND);
        }
    
        // 4) Préparer le dossier de stockage
        $uploadDir = $this->getParameter('kernel.project_dir') . '/public/contrats';
        if (!$this->filesystem->exists($uploadDir)) {
            $this->filesystem->mkdir($uploadDir, 0755);
        }
    
        // 5) Générer un nom de fichier unique
        $baseName = pathinfo($file->getClientOriginalName(), PATHINFO_FILENAME);
        $safeName = preg_replace('/[^a-zA-Z0-9_\-]/', '_', $baseName);
        $filename = sprintf('%s_%s.%s',
            $safeName,
            uniqid(),
            $file->guessExtension() ?: 'pdf'
        );
    
        // 6) Déplacer le fichier dans public/contrats
        $file->move($uploadDir, $filename);
    
        // 7) Construire l’URL publique
        $publicUrl = $request->getSchemeAndHttpHost() . '/contrats/' . $filename;
    
        // 8) Créer et persister l’entité SubscriptionURL
        $subscriptionUrl = new SubscriptionURL();
        $subscriptionUrl
            ->setStudent($student)
            ->setSubscription($sub)
            ->setUrl($publicUrl);
    
        $this->em->persist($subscriptionUrl);
        $this->em->flush();
    
        // 9) Retourner la réponse JSON
        return $this->json([
            'id'               => $subscriptionUrl->getId(),
            'student_id'       => $student->getId(),
            'subscription_id'  => $sub->getId(),
            'url'              => $publicUrl,
        ], JsonResponse::HTTP_CREATED);
    }
    
    #[Route('/student/{studentId}', name: 'list_by_student', methods: ['GET'])]
    public function listByStudent(int $studentId): JsonResponse
    {
        $student = $this->studentRepo->find($studentId);
        if (!$student) {
            return $this->json([
                'error' => 'Étudiant introuvable.'
            ], JsonResponse::HTTP_NOT_FOUND);
        }

        /** @var SubscriptionURL[] $urls */
        $urls = $this->em
            ->getRepository(SubscriptionURL::class)
            ->findBy(['student' => $student]);

        // 3) Préparer le tableau de réponse
        $data = array_map(fn(SubscriptionURL $su) => [
            'id'               => $su->getId(),
            'subscription_id'  => $su->getSubscription()->getId(),
            'url'              => $su->getUrl(),
        ], $urls);

        // 4) Retourner en JSON
        return $this->json($data, JsonResponse::HTTP_OK);
    }
}
