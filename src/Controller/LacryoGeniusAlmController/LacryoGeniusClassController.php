<?php


namespace App\Controller\LacryoGeniusAlmController;

use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;

class LacryoGeniusClassController extends AbstractController
{
    #[Route('/hello', name: 'hello_world')]
    public function index(): Response
    {
        return new Response('Hello world');
    }
}
