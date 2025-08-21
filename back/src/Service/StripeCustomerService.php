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

    public function createPaymentLink(Student $student, int $amountInCents, string $description, array $metadata = []): string
    {
        $customerId = $this->getOrCreateCustomer($student);

        $price = $this->stripe->prices->create([
            'unit_amount' => $amountInCents,
            'currency' => 'eur',
            'product_data' => [
                'name' => $description,
            ],
        ]);

        $paymentLink = $this->stripe->paymentLinks->create([
            'line_items' => [
                [
                    'price' => $price->id,
                    'quantity' => 1,
                ],
            ],
            'metadata' => array_merge([
                'customer_id' => $customerId,
                'student_id' => $student->getId(),
            ], $metadata),
            'custom_fields' => [
                [
                    'key' => 'student_name',
                    'label' => [
                        'type' => 'custom',
                        'custom' => 'Nom de l\'étudiant'
                    ],
                    'type' => 'text',
                    'optional' => true,
                ]
            ]
        ]);

        return $paymentLink->id;
    }
}