<?php

namespace App\Service;

use Symfony\Contracts\HttpClient\HttpClientInterface;

class ZapierSmsSender
{
    private $httpClient;
    private $zapierWebhookUrl;

    public function __construct(HttpClientInterface $httpClient, string $zapierWebhookUrl)
    {
        $this->httpClient = $httpClient;
        $this->zapierWebhookUrl = $zapierWebhookUrl;
    }

    public function sendSessionPaymentLink(
        string $phoneNumber,
        string $centre,
        \DateTimeInterface $dateCours,
        string $heureDebut,
        string $ville,
        string $adresse,
        string $prenom,
        string $paymentLink
    ): bool {
        $jours = ["Dim.", "Lun.", "Mar.", "Mer.", "Jeu.", "Ven.", "Sam."];
        $mois = ["", "Janvier", "Février", "Mars", "Avril", "Mai", "Juin", 
                "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"];

        $data = [
            'numero' => $phoneNumber,
            'centre' => $centre,
            'date_cours' => $jours[$dateCours->format('w')] . " " . $dateCours->format('d') . " " . $mois[$dateCours->format('n')],
            'heure_debut' => substr($heureDebut, 0, 5),
            'ville' => $ville,
            'adresse' => $adresse,
            'prenom' => $prenom,
            'autorisation' => 1, // Toujours autorisé dans ce contexte
            'lien' => $paymentLink
        ];

        try {
            $response = $this->httpClient->request('POST', $this->zapierWebhookUrl, [
                'json' => $data
            ]);

            return $response->getStatusCode() === 200;
        } catch (\Exception $e) {
            // Log l'erreur
            error_log('Erreur envoi SMS Zapier: ' . $e->getMessage());
            return false;
        }
    }
}