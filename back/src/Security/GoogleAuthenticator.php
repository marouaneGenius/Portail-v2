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
        $jwt = $this->jwt->create($token->getUser());
    
        $html = <<<HTML
        <!DOCTYPE html><meta charset="utf-8">
        <script>
        console.log('Page callback chargée');
        
        // Essayer plusieurs méthodes de communication
        function sendTokenToParent(token) {
            console.log('Tentative envoi token...');
            
            // Méthode 1: PostMessage standard
            try {
                if (window.opener && !window.opener.closed) {
                    window.opener.postMessage({ token: token }, '*');
                    console.log('PostMessage envoyé avec *');
                    
                    // Aussi avec le domaine spécifique
                    window.opener.postMessage({ token: token }, 'https://portailv2.geniusclass.fr');
                    console.log('PostMessage envoyé avec domaine');
                    
                    // Attendre un peu puis fermer
                    setTimeout(() => {
                        try {
                            window.close();
                        } catch(e) {
                            console.log('Erreur fermeture:', e);
                            document.body.innerHTML += '<p><button onclick="window.close()">Fermer cette fenêtre</button></p>';
                        }
                    }, 1500);
                    
                    return true;
                }
            } catch (e) {
                console.error('Erreur postMessage:', e);
            }
            
            // Méthode 2: Stockage local partagé (fallback)
            try {
                localStorage.setItem('oauth_token_temp', token);
                localStorage.setItem('oauth_timestamp', Date.now().toString());
                console.log('Token stocké en localStorage');
                
                // Notifier via un événement de stockage
                if (window.opener) {
                    window.opener.postMessage({ type: 'oauth_storage', token: token }, '*');
                }
                
                setTimeout(() => window.close(), 2000);
            } catch (e) {
                console.error('Erreur localStorage:', e);
            }
        }
        
        // Lancer immédiatement
        sendTokenToParent('$jwt');
        </script>
        <body>
            <h3>Connexion réussie</h3>
            <p>Fermeture automatique en cours...</p>
            <p style="font-size: 12px; color: #666;">Token: $jwt</p>
            <button onclick="window.close()" style="margin-top: 10px;">Fermer manuellement</button>
        </body>
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
