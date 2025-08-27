<?php
namespace App\Security;

use KnpU\OAuth2ClientBundle\Security\Authenticator\OAuth2Authenticator;
use KnpU\OAuth2ClientBundle\Client\ClientRegistry;
use League\OAuth2\Client\Provider\GoogleUser;
use Symfony\Component\HttpFoundation\{Request, JsonResponse, Response};
use Symfony\Component\Security\Http\Authenticator\Passport\{Passport, SelfValidatingPassport};
use Symfony\Component\Security\Http\Authenticator\Passport\Badge\UserBadge;
use Symfony\Component\Security\Core\Exception\AuthenticationException;
use Symfony\Component\Security\Core\Authentication\Token\TokenInterface;
use Lexik\Bundle\JWTAuthenticationBundle\Services\JWTTokenManagerInterface;
use App\Repository\UserRepository;
use Doctrine\ORM\EntityManagerInterface;

final class GoogleAuthenticator extends OAuth2Authenticator
{
    public function __construct(
        private ClientRegistry           $clients,
        private UserRepository           $users,
        private JWTTokenManagerInterface $jwt,
        private EntityManagerInterface   $em,
    ) {}

    public function supports(Request $request): bool
    {
        return $request->attributes->get('_route') === 'connect_google_check';
    }

    public function authenticate(Request $request): Passport
    {
        $client      = $this->clients->getClient('google');
        $accessToken = $this->fetchAccessToken($client);

        return new SelfValidatingPassport(
            new UserBadge($accessToken->getToken(), function () use ($client, $accessToken) {

                /** @var GoogleUser $gUser */
                $gUser = $client->fetchUserFromToken($accessToken);



                // Vérifier le domaine email au lieu du hosted domain
                $email = $gUser->getEmail();
                if (!str_ends_with($email, '@geniusclass.fr')) {
                    throw new AuthenticationException("Cette adresse n'est pas valide, veuillez contacter Genius");
                }

                // 1) déjà lié
                if ($user = $this->users->findOneBy(['google_id' => $gUser->getId()])) {
                    return $user;
                }

                // 2) même email sans googleId  ⇒ on lie
                if ($user = $this->users->findOneBy(['email' => $gUser->getEmail()])) {
                    $user->setGoogleId($gUser->getId());
                } else {
                    // 3) nouvel utilisateur
                    $user = (new \App\Entity\User())
                        ->setEmail($gUser->getEmail())
                        ->setFirstname($gUser->getFirstName())
                        ->setLastname($gUser->getLastName())
                        ->setPassword('')
                        ->setPhone('N/C')
                        ->setCreatedAt(new \DateTimeImmutable())
                        ->setGoogleId($gUser->getId())
                        ->setRoles(['ROLE_USER']);
                    $this->em->persist($user);
                }
                $this->em->flush();

                return $user;
            })
        );
    }

    // public function onAuthenticationSuccess(Request $request, TokenInterface $token, string $firewallName): ?Response
    // {
    //     return new JsonResponse([
    //         'token' => $this->jwt->create($token->getUser()),
    //     ]);
    // }

    public function onAuthenticationSuccess(Request $request, TokenInterface $token, string $firewall): Response
    {
        // $jwt = $this->jwt->create($token->getUser());

        // $html = <<<HTML
        // <!DOCTYPE html><meta charset="utf-8">
        // <script>
        // window.opener?.postMessage({ token: '$jwt' }, '*');
        // window.close();
        // </script>
        // <body>Authentification réussie…</body>
        // HTML;
        
        // return new Response($html);

        $jwt = $this->jwt->create($token->getUser());
        error_log("JWT généré pour user: " . $token->getUser()->getEmail());
    
        $html = <<<HTML
        <!DOCTYPE html><meta charset="utf-8">
        <script>
        console.log('Page callback chargée');
        console.log('Token à envoyer:', '$jwt'.substring(0, 20));
        
        // Envoyer vers tous les domaines possibles
        if (window.opener) {
            window.opener.postMessage({ token: '$jwt' }, 'https://portailv2.geniusclass.fr');
            window.opener.postMessage({ token: '$jwt' }, '*');
            console.log('Messages envoyés');
        }
        
        // Auto-fermeture après 2 secondes
        setTimeout(() => window.close(), 2000);
        </script>
        <body><h3>Connexion réussie, fermeture...</h3><p>Token: $jwt</p></body>
        HTML;
        
        return new Response($html);
    }
    

    public function onAuthenticationFailure(Request $request, AuthenticationException $exception): Response
    {
        // Envoyer l'erreur à la popup parent comme pour le succès
        $error = $exception->getMessage();
        
        $html = <<<HTML
        <!DOCTYPE html><meta charset="utf-8">
        <script>
        window.opener?.postMessage({ error: '$error' }, '*');
        window.close();
        </script>
        <body>Erreur d'authentification: $error</body>
        HTML;
        
        return new Response($html);
    }
}
