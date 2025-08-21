<?php

namespace App\Service;

use App\Entity\Student;
use Doctrine\ORM\EntityManagerInterface;
use Psr\Log\LoggerInterface;
use Stripe\StripeClient;

class StripeCustomerService
{
    public function __construct(
        private readonly StripeClient $stripe,
        private readonly EntityManagerInterface $em,
        private readonly LoggerInterface $logger
    ) {
    }

    public function getOrCreateCustomer(Student $student): string
    {
        // Si l'étudiant a déjà un ID Stripe, on le vérifie OBLIGATOIREMENT

        if ($student->getIdStripe()) {
            try {
                $customer = $this->stripe->customers->retrieve($student->getIdStripe());
                if (!$customer->deleted) {
                    $this->logger->info('Using existing Stripe customer', [
                        'student_id' => $student->getId(),
                        'stripe_customer_id' => $customer->id
                    ]);
                    return $customer->id;
                }
                
                // Customer supprimé côté Stripe mais l'ID existe encore en BDD
                $this->logger->error('Stripe customer deleted but ID still in database', [
                    'student_id' => $student->getId(),
                    'deleted_stripe_customer_id' => $student->getIdStripe()
                ]);
                throw new \RuntimeException('Le compte Stripe de cet étudiant a été supprimé. Veuillez contacter l\'administration.');
                
            } catch (\Stripe\Exception\InvalidRequestException $e) {
                // Customer n'existe pas côté Stripe
                $this->logger->error('Stripe customer ID invalid or not found', [
                    'student_id' => $student->getId(),
                    'invalid_stripe_customer_id' => $student->getIdStripe(),
                    'error' => $e->getMessage()
                ]);
                throw new \RuntimeException('L\'ID Stripe de cet étudiant est invalide. Veuillez contacter l\'administration.');
            }
        }

        // Si pas d'ID Stripe, on refuse de créer pour éviter les doublons
        // L'ID Stripe doit être créé via Zapier lors de la création du student
        $this->logger->error('Student has no Stripe customer ID - refusing to create new one', [
            'student_id' => $student->getId(),
            'student_name' => $student->getFirstname() . ' ' . $student->getLastname()
        ]);
        
        throw new \RuntimeException(
            'Aucun compte Stripe trouvé pour cet étudiant. ' . 
            'Le compte Stripe doit être créé automatiquement lors de l\'inscription. ' .
            'Veuillez contacter l\'administration.'
        );
    }

    public function createCustomer(Student $student): string
    {
        $parent = $student->getIdParent()->first();
        
        $customerData = [
            'name' => $student->getFirstname() . ' ' . $student->getLastname(),
            'metadata' => [
                'student_id' => $student->getId(),
                'student_name' => $student->getFirstname() . ' ' . $student->getLastname(),
                'center_id' => $student->getIdCenter()?->getId(),
            ]
        ];

        if ($parent) {
            $customerData['email'] = $parent->getEmail();
            $customerData['phone'] = $parent->getPhone();
            $customerData['metadata']['parent_id'] = $parent->getId();
        }

        try {
            $customer = $this->stripe->customers->create($customerData);
            
            $this->logger->info('Created new Stripe customer', [
                'student_id' => $student->getId(),
                'stripe_customer_id' => $customer->id
            ]);

            return $customer->id;
        } catch (\Exception $e) {
            $this->logger->error('Failed to create Stripe customer', [
                'student_id' => $student->getId(),
                'error' => $e->getMessage()
            ]);
            throw new \RuntimeException('Impossible de créer le compte Stripe: ' . $e->getMessage());
        }
    }

    public function updateCustomerMetadata(Student $student, array $additionalMetadata = []): void
    {
        $customerId = $this->getOrCreateCustomer($student);
        
        $parent = $student->getIdParent()->first();
        if (!$parent) {
            return;
        }

        $metadata = array_merge([
            'student_id' => $student->getId(),
            'student_name' => $student->getFirstname() . ' ' . $student->getLastname(),
            'parent_id' => $parent->getId(),
            'center_id' => $student->getIdCenter()?->getId(),
        ], $additionalMetadata);

        try {
            $this->stripe->customers->update($customerId, [
                'metadata' => $metadata
            ]);
        } catch (\Exception $e) {
            $this->logger->error('Failed to update customer metadata', [
                'customer_id' => $customerId,
                'error' => $e->getMessage()
            ]);
        }
    }

    public function createCheckoutSession(Student $student, int $amountInCents, string $description, array $metadata = []): string
    {
        $customerId = $this->getOrCreateCustomer($student);

        try {
            $session = $this->stripe->checkout->sessions->create([
                'mode' => 'payment',
                'customer' => $customerId,
                'line_items' => [[
                    'price_data' => [
                        'currency' => 'eur',
                        'unit_amount' => $amountInCents,
                        'product_data' => ['name' => $description],
                    ],
                    'quantity' => 1,
                ]],
                'client_reference_id' => (string)$student->getId(),
                'metadata' => array_merge([
                    'student_id' => $student->getId(),
                ], $metadata),
                'success_url' => $_ENV['FRONTEND_URL'] . '/payment/success?session_id={CHECKOUT_SESSION_ID}',
                'cancel_url' => $_ENV['FRONTEND_URL'] . '/payment/cancel?session_id={CHECKOUT_SESSION_ID}',
                'expires_at' => time() + 24*3600,
            ]);

            $this->logger->info('Created Stripe checkout session', [
                'student_id' => $student->getId(),
                'session_id' => $session->id,
                'amount' => $amountInCents
            ]);

            return $session->id;
        } catch (\Exception $e) {
            $this->logger->error('Failed to create checkout session', [
                'student_id' => $student->getId(),
                'amount' => $amountInCents,
                'error' => $e->getMessage()
            ]);
            throw new \RuntimeException('Impossible de créer la session de paiement: ' . $e->getMessage());
        }
    }

    public function getCheckoutSessionUrl(string $sessionId): string
    {
        try {
            $session = $this->stripe->checkout->sessions->retrieve($sessionId);
            return $session->url;
        } catch (\Exception $e) {
            $this->logger->error('Failed to retrieve checkout session URL', [
                'session_id' => $sessionId,
                'error' => $e->getMessage()
            ]);
            throw new \RuntimeException('Impossible de récupérer l\'URL de paiement: ' . $e->getMessage());
        }
    }
}