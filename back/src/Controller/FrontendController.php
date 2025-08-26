<?php

namespace App\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;

class FrontendController extends AbstractController
{
    /**
     * Serve the React frontend for frontend routes
     * This handles the case where users type URLs directly in the browser
     */
    #[Route('/login', name: 'frontend_login', methods: ['GET'], priority: -10)]
    public function login(): Response
    {
        // Return a simple HTML page that tells the browser to load the React app
        // This is a workaround for SPA routing when accessed directly via URL
        return new Response('
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <title>Portail Genius - Login</title>
                <script>
                    // Redirect to the main app with the login path
                    window.location.href = "/#/login";
                </script>
            </head>
            <body>
                <p>Redirecting to login form...</p>
                <p>If you are not redirected automatically, <a href="/#/login">click here</a>.</p>
            </body>
            </html>
        ', 200, ['Content-Type' => 'text/html']);
    }

    /**
     * This route will be intercepted by the security firewall for authentication
     * It should never actually execute - the JsonLoginAuthenticator will handle it
     */
    #[Route('/login', name: 'login_check', methods: ['POST'], priority: -10)]
    public function loginCheck(): JsonResponse
    {
        // This method should never be reached due to security firewall interception
        throw new \LogicException('This method can be blank - it will be intercepted by the login key on your firewall.');
    }
}