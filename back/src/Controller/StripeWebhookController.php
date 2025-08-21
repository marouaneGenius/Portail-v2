<?php

namespace App\Controller;

use App\Repository\SessionRepository;
use App\Repository\StudentRepository;
use Doctrine\ORM\EntityManagerInterface;
use Psr\Log\LoggerInterface;
use Stripe\Exception\SignatureVerificationException;
use Stripe\Webhook;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\Routing\Annotation\Route;

#[Route('/api/stripe', name: 'stripe_')]
class StripeWebhookController extends AbstractController
{
    public function __construct(
        private readonly EntityManagerInterface $em,
        private readonly SessionRepository $sessionRepo,
        private readonly StudentRepository $studentRepo,
        private readonly LoggerInterface $logger
    ) {
    }

    #[Route('/webhook', name: 'webhook', methods: ['POST'])]
    public function handleWebhook(Request $request): JsonResponse
    {
        $payload = $request->getContent();
        $sigHeader = $request->headers->get('stripe-signature');
        $endpointSecret = $_ENV['STRIPE_WEBHOOK_SECRET'] ?? '';

        try {
            $event = Webhook::constructEvent($payload, $sigHeader, $endpointSecret);
        } catch (\UnexpectedValueException $e) {
            $this->logger->error('Invalid payload', ['error' => $e->getMessage()]);
            return new JsonResponse(['error' => 'Invalid payload'], 400);
        } catch (SignatureVerificationException $e) {
            $this->logger->error('Invalid signature', ['error' => $e->getMessage()]);
            return new JsonResponse(['error' => 'Invalid signature'], 400);
        }

        $this->logger->info('Stripe webhook received', [
            'event_type' => $event->type,
            'event_id' => $event->id
        ]);

        switch ($event->type) {
            case 'checkout.session.completed':
                $this->handleCheckoutSessionCompleted($event->data->object);
                break;
            
            case 'payment_intent.succeeded':
                $this->handlePaymentIntentSucceeded($event->data->object);
                break;
            
            case 'customer.created':
                $this->handleCustomerCreated($event->data->object);
                break;
            
            case 'customer.updated':
                $this->handleCustomerUpdated($event->data->object);
                break;

            default:
                $this->logger->info('Unhandled webhook event type', ['type' => $event->type]);
        }

        return new JsonResponse(['status' => 'success']);
    }

    private function handleCheckoutSessionCompleted($checkoutSession): void
    {
        try {
            $this->logger->info('Processing checkout.session.completed', [
                'checkout_session_id' => $checkoutSession->id,
                'payment_status' => $checkoutSession->payment_status,
                'customer_id' => $checkoutSession->customer
            ]);

            if ($checkoutSession->payment_status !== 'paid') {
                $this->logger->warning('Checkout session not paid', [
                    'checkout_session_id' => $checkoutSession->id,
                    'payment_status' => $checkoutSession->payment_status
                ]);
                return;
            }

            // Récupérer la session à partir des métadonnées
            $sessionId = $checkoutSession->metadata->session_id ?? null;
            if (!$sessionId) {
                $this->logger->error('No session_id in checkout session metadata', [
                    'checkout_session_id' => $checkoutSession->id
                ]);
                return;
            }

            $session = $this->sessionRepo->find($sessionId);
            if (!$session) {
                $this->logger->error('Session not found', ['session_id' => $sessionId]);
                return;
            }

            // Marquer la session comme payée
            $session->setIsPaid(true);
            $session->setUpdatedAt(new \DateTimeImmutable());
            $session->setUpdatedBy('stripe_webhook');
            
            $this->em->persist($session);
            $this->em->flush();

            $this->logger->info('Session marked as paid', [
                'session_id' => $sessionId,
                'checkout_session_id' => $checkoutSession->id,
                'amount_total' => $checkoutSession->amount_total
            ]);

        } catch (\Exception $e) {
            $this->logger->error('Error processing checkout.session.completed', [
                'error' => $e->getMessage(),
                'checkout_session_id' => $checkoutSession->id ?? 'unknown'
            ]);
        }
    }

    private function handlePaymentIntentSucceeded($paymentIntent): void
    {
        try {
            $this->logger->info('Processing payment_intent.succeeded', [
                'payment_intent_id' => $paymentIntent->id,
                'customer_id' => $paymentIntent->customer,
                'amount' => $paymentIntent->amount
            ]);

            // Logique supplémentaire pour les PaymentIntents si nécessaire
            // Par exemple, mise à jour d'autres entités liées au paiement

        } catch (\Exception $e) {
            $this->logger->error('Error processing payment_intent.succeeded', [
                'error' => $e->getMessage(),
                'payment_intent_id' => $paymentIntent->id ?? 'unknown'
            ]);
        }
    }

    private function handleCustomerCreated($customer): void
    {
        try {
            $this->logger->info('Processing customer.created', [
                'customer_id' => $customer->id,
                'email' => $customer->email
            ]);

            $studentId = $customer->metadata->student_id ?? null;
            if ($studentId) {
                $student = $this->studentRepo->find($studentId);
                if ($student && !$student->getIdStripe()) {
                    $student->setIdStripe($customer->id);
                    $this->em->persist($student);
                    $this->em->flush();
                    
                    $this->logger->info('Student updated with Stripe customer ID', [
                        'student_id' => $studentId,
                        'customer_id' => $customer->id
                    ]);
                }
            }

        } catch (\Exception $e) {
            $this->logger->error('Error processing customer.created', [
                'error' => $e->getMessage(),
                'customer_id' => $customer->id ?? 'unknown'
            ]);
        }
    }

    private function handleCustomerUpdated($customer): void
    {
        try {
            $this->logger->info('Processing customer.updated', [
                'customer_id' => $customer->id,
                'email' => $customer->email
            ]);

            // Logique pour synchroniser les données customer si nécessaire
            
        } catch (\Exception $e) {
            $this->logger->error('Error processing customer.updated', [
                'error' => $e->getMessage(),
                'customer_id' => $customer->id ?? 'unknown'
            ]);
        }
    }
}