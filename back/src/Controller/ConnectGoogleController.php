<?php
namespace App\Controller;

use KnpU\OAuth2ClientBundle\Client\ClientRegistry;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\RedirectResponse;
use Symfony\Component\Routing\Annotation\Route;

class ConnectGoogleController extends AbstractController
{
    /**
     * Démarre le flow OAuth2 Google
     */
    #[Route('/connect/google', name: 'connect_google_start')]
    public function google(ClientRegistry $clients): RedirectResponse
    {
        // Redirige l’utilisateur sur la page de login Google
        return $clients
            ->getClient('google')              // le "client" défini dans knpu_oauth2_client.yaml
            ->redirect(['openid', 'email', 'profile']);
    }
    
    /**
     * Cette route est *seulement* pour que Google la vise en retour.
     * Elle n'est pas exécutée : c'est le firewall qui intercepte.
     */
    #[Route('/connect/google/check', name: 'connect_google_check')]
    public function googleCheck(): void
    {
        // Ce code ne s'exécutera jamais
        throw new \LogicException('Cette route est interceptée par le GoogleAuthenticator.');
    }
}
