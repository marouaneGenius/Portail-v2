<?php

namespace App\Service;

use Psr\Log\LoggerInterface;
use Symfony\Component\HttpClient\HttpClient;
use Symfony\Contracts\HttpClient\HttpClientInterface;

class SmsService
{
    private HttpClientInterface $httpClient;
    private LoggerInterface $logger;
    private string $smsApiKey;
    private string $smsApiUrl;
    private bool $smsEnabled;

    public function __construct(
        LoggerInterface $logger,
        string $smsApiKey = '',
        string $smsApiUrl = 'https://rest.smsmode.com/sms/v1/',
        bool $smsEnabled = false
    ) {
        $this->httpClient = HttpClient::create();
        $this->logger = $logger;
        $this->smsApiKey = $smsApiKey;
        $this->smsApiUrl = $smsApiUrl;
        $this->smsEnabled = $smsEnabled;
    }

    /**
     * Envoie un SMS via SMSMode REST API
     */
    public function sendSms(string $phoneNumber, string $message): bool
    {
        if (!$this->smsEnabled) {
            $this->logger->info('SMS service is disabled', [
                'phone' => $phoneNumber,
                'message' => $message
            ]);
            return true; // Return true for dev/test environments
        }

        if (empty($this->smsApiKey)) {
            $this->logger->error('SMS API key not configured');
            return false;
        }

        try {
            // Format phone number (remove spaces, add +33 if needed)
            $formattedPhone = $this->formatPhoneNumber($phoneNumber);

            $messageData = [
                'recipient' => [
                    'to' => $formattedPhone
                ],
                'body' => [
                    'text' => $message
                ],
                'from' => 'Genius' // Nom de l'expéditeur (11 caractères max)
            ];

            $response = $this->httpClient->request('POST', $this->smsApiUrl . 'messages', [
                'headers' => [
                    'Content-Type' => 'application/json',
                    'Accept' => 'application/json',
                    'X-Api-Key' => $this->smsApiKey
                ],
                'json' => $messageData
            ]);

            $statusCode = $response->getStatusCode();
            $content = $response->toArray(false);

            if ($statusCode >= 200 && $statusCode < 300) {
                $this->logger->info('SMS sent successfully', [
                    'phone' => $formattedPhone,
                    'message_id' => $content['messageId'] ?? null,
                    'status' => $content['status']['value'] ?? null
                ]);
                return true;
            } else {
                $this->logger->error('SMS sending failed', [
                    'phone' => $formattedPhone,
                    'status_code' => $statusCode,
                    'response' => $content
                ]);
                return false;
            }

        } catch (\Exception $e) {
            $this->logger->error('SMS service error', [
                'phone' => $phoneNumber,
                'error' => $e->getMessage()
            ]);
            return false;
        }
    }

    /**
     * Formate le numéro de téléphone pour l'API SMSMode
     */
    private function formatPhoneNumber(string $phoneNumber): string
    {
        // Nettoie le numéro
        $phone = preg_replace('/[^0-9+]/', '', $phoneNumber);

        // Si commence par 0, remplace par +33
        if (str_starts_with($phone, '0')) {
            $phone = '+33' . substr($phone, 1);
        }

        // Si ne commence pas par +, ajoute +33
        if (!str_starts_with($phone, '+')) {
            $phone = '+33' . $phone;
        }

        return $phone;
    }

    /**
     * Vérifie si le service SMS est activé
     */
    public function isEnabled(): bool
    {
        return $this->smsEnabled && !empty($this->smsApiKey);
    }
}