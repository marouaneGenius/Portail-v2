<?php

namespace App\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\Security\Http\Attribute\IsGranted;
use Symfony\Contracts\HttpClient\HttpClientInterface;

#[Route('/api/address')]
class AddressController extends AbstractController
{
    private const GOOGLE_API_KEY = 'AIzaSyALk5yaiJvYE9mtoO7YKMlTkJcY2KAAeJM';
    private const BASE_URL = 'https://maps.googleapis.com/maps/api/place';

    public function __construct(
        private HttpClientInterface $httpClient
    ) {}

    #[Route('/search', name: 'api_address_search', methods: ['GET'])]
    public function searchAddresses(Request $request): JsonResponse
    {
        $input = $request->query->get('input');
        
        if (!$input || strlen($input) < 3) {
            return $this->json([
                'predictions' => [],
                'status' => 'OK'
            ]);
        }

        try {
            $response = $this->httpClient->request('GET', self::BASE_URL . '/autocomplete/json', [
                'query' => [
                    'input' => $input,
                    'types' => 'address',
                    'components' => 'country:fr',
                    'key' => self::GOOGLE_API_KEY
                ]
            ]);

            $data = $response->toArray();
            
            if ($data['status'] === 'OK') {
                return $this->json([
                    'predictions' => $data['predictions'] ?? [],
                    'status' => 'OK'
                ]);
            }
            
            return $this->json([
                'predictions' => [],
                'status' => $data['status'] ?? 'ERROR',
                'error_message' => $data['error_message'] ?? 'Erreur inconnue'
            ], 400);

        } catch (\Exception $e) {
            return $this->json([
                'predictions' => [],
                'status' => 'ERROR',
                'error_message' => 'Erreur de connexion à Google Places API'
            ], 500);
        }
    }

    #[Route('/details', name: 'api_address_details', methods: ['GET'])]
    public function getAddressDetails(Request $request): JsonResponse
    {
        $placeId = $request->query->get('place_id');
        
        if (!$placeId) {
            return $this->json([
                'error' => 'place_id manquant'
            ], 400);
        }

        try {
            $response = $this->httpClient->request('GET', self::BASE_URL . '/details/json', [
                'query' => [
                    'place_id' => $placeId,
                    'fields' => 'formatted_address,address_components,geometry',
                    'key' => self::GOOGLE_API_KEY
                ]
            ]);

            $data = $response->toArray();
            
            if ($data['status'] === 'OK' && isset($data['result'])) {
                $result = $data['result'];
                $components = $result['address_components'] ?? [];
                
                $getComponent = function(string $type) use ($components) {
                    foreach ($components as $component) {
                        if (in_array($type, $component['types'])) {
                            return $component['long_name'] ?? '';
                        }
                    }
                    return '';
                };
                
                return $this->json([
                    'result' => [
                        'formatted_address' => $result['formatted_address'] ?? '',
                        'street_number' => $getComponent('street_number'),
                        'route' => $getComponent('route'),
                        'locality' => $getComponent('locality'),
                        'postal_code' => $getComponent('postal_code'),
                        'country' => $getComponent('country'),
                        'geometry' => $result['geometry'] ?? null
                    ],
                    'status' => 'OK'
                ]);
            }
            
            return $this->json([
                'result' => null,
                'status' => $data['status'] ?? 'ERROR',
                'error_message' => $data['error_message'] ?? 'Adresse non trouvée'
            ], 404);

        } catch (\Exception $e) {
            return $this->json([
                'result' => null,
                'status' => 'ERROR',
                'error_message' => 'Erreur de connexion à Google Places API'
            ], 500);
        }
    }

    #[Route('/validate', name: 'api_address_validate', methods: ['POST'])]
    public function validateAddress(Request $request): JsonResponse
    {
        $data = json_decode($request->getContent(), true);
        
        if (!$data) {
            return $this->json(['error' => 'Données JSON invalides'], 400);
        }

        $errors = [];
        
        // Validation de l'adresse
        if (isset($data['address'])) {
            $address = trim($data['address']);
            if (strlen($address) < 5) {
                $errors['address'] = 'L\'adresse doit contenir au moins 5 caractères';
            } elseif (!preg_match('/\d/', $address)) {
                $errors['address'] = 'L\'adresse doit contenir un numéro';
            } elseif (!preg_match('/[a-zA-ZÀ-ÿ]/', $address)) {
                $errors['address'] = 'L\'adresse doit contenir le nom de la rue';
            }
        }

        // Validation de la ville
        if (isset($data['city'])) {
            $city = trim($data['city']);
            if (strlen($city) < 2) {
                $errors['city'] = 'Le nom de ville doit contenir au moins 2 caractères';
            } elseif (!preg_match('/^[a-zA-ZÀ-ÿ\s\'\-]+$/', $city)) {
                $errors['city'] = 'Le nom de ville contient des caractères invalides';
            }
        }

        // Validation du code postal
        if (isset($data['zip_code'])) {
            $zipCode = str_replace(' ', '', $data['zip_code']);
            if (!preg_match('/^[0-9]{5}$/', $zipCode)) {
                $errors['zip_code'] = 'Le code postal doit contenir 5 chiffres';
            }
        }

        return $this->json([
            'is_valid' => empty($errors),
            'errors' => $errors
        ]);
    }
}