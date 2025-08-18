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
        if ($student->getStripeCustomerId()) {
            try {
                $customer = $this->stripe->customers->retrieve($student->getStripeCustomerId());
                if (!$customer->deleted) {
                    return $customer->id;
                }
            } catch (\Exception $e) {
                $this->logger->warning('Stripe customer not found, creating new one', [
                    'student_id' => $student->getId(),
                    'old_stripe_customer_id' => $student->getStripeCustomerId(),
                    'error' => $e->getMessage()
                ]);
            }
        }

        $parent = $student->getIdParent()->first();
        if (!$parent) {
            throw new \RuntimeException('Aucun parent trouvé pour l\'étudiant ID: ' . $student->getId());
        }

        try {
            $customer = $this->stripe->customers->create([
                'email' => $parent->getEmail(),
                'name' => $parent->getFirstname() . ' ' . $parent->getLastname(),
                'phone' => $parent->getPhone(),
                'metadata' => [
                    'student_id' => $student->getId(),
                    'student_name' => $student->getFirstname() . ' ' . $student->getLastname(),
                    'parent_id' => $parent->getId(),
                    'center_id' => $student->getIdCenter()?->getId(),
                ]
            ]);

            $student->setStripeCustomerId($customer->id);
            $this->em->persist($student);
            $this->em->flush();

            $this->logger->info('Stripe customer created', [
                'student_id' => $student->getId(),
                'stripe_customer_id' => $customer->id
            ]);

            return $customer->id;

        } catch (\Exception $e) {
            $this->logger->error('Failed to create Stripe customer', [
                'student_id' => $student->getId(),
                'error' => $e->getMessage()
            ]);
            throw new \RuntimeException('Erreur lors de la création du customer Stripe: ' . $e->getMessage());
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