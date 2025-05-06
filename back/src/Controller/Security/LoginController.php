<?php

namespace App\Controller\Security;

use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;
use KnpU\OAuth2ClientBundle\Client\ClientRegistry;
use Symfony\Component\HttpFoundation\RedirectResponse;

class LoginController extends AbstractController
{
    #[Route('/login', name: 'app_login', methods: ['GET', 'POST'])]
    public function login(Request $request): Response
    {
        if ($request->isMethod('POST')) {
            $email = $request->request->get('input_mail');
            $password = $request->request->get('input_mdp');

            dd($email,$password);

            // if (isValid($email, $password)) {
            //     return $this->redirectToRoute('dashboard');
            // } else {
            //     $this->addFlash('error', 'Identifiants invalides.');
            // }
        }

        return $this->render('security/login.html.twig');
    }

    #[Route('/login/google', name: 'app_google_login')]
    public function connectGoogle(ClientRegistry $clientRegistry): RedirectResponse
    {
        // Redirige l'utilisateur vers la page de connexion Google en demandant les scopes 'profile' et 'email'
        return $clientRegistry
            ->getClient('google') // 'google' doit correspondre au nom configuré dans vos paramètres
            ->redirect(['profile', 'email']);
    }
}
