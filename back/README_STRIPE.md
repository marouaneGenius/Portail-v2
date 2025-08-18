# Configuration Stripe Optimisée

## Améliorations apportées

### 1. **Entity Student mise à jour**
- Ajout de la propriété `stripe_customer_id` avec ses getters/setters
- Permet de lier chaque étudiant à un customer Stripe unique

### 2. **Service StripeCustomerService**
Nouveau service pour gérer les customers Stripe :
- `getOrCreateCustomer()` : Crée ou récupère un customer Stripe existant
- `updateCustomerMetadata()` : Met à jour les métadonnées du customer
- `createPaymentLink()` : Crée des liens de paiement optimisés avec customers

### 3. **SessionController mis à jour**
- Utilise maintenant le `StripeCustomerService` pour créer les payment links
- Associe automatiquement les paiements aux customers Stripe
- Tracking amélioré via les métadonnées et customer ID

### 4. **Webhook Controller**
Nouveau contrôleur `StripeWebhookController` qui gère :
- `checkout.session.completed` : Marque automatiquement les sessions comme payées
- `payment_intent.succeeded` : Traite les paiements réussis
- `customer.created/updated` : Synchronise les données customers

## Configuration requise

### Variables d'environnement
```env
# Dans .env
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret_here
TEST_STRIPE_PRIVATE_KEY=sk_test_your_private_key
```

### Configuration Stripe Dashboard
1. Créer un endpoint webhook : `https://yourdomain.com/api/stripe/webhook`
2. Événements à écouter :
   - `checkout.session.completed`
   - `payment_intent.succeeded`
   - `customer.created`
   - `customer.updated`

## Avantages du nouveau système

### ✅ **Tracking robuste**
- Chaque étudiant a un customer Stripe unique
- Historique des paiements par customer
- Métadonnées riches pour le debugging

### ✅ **Webhooks automatiques**
- Paiements marqués automatiquement comme payés
- Plus de vérifications manuelles nécessaires
- Logs détaillés de tous les événements

### ✅ **Résilience**
- Gestion des erreurs améliorée
- Récupération automatique des customers existants
- Synchronisation bidirectionnelle avec Stripe

### ✅ **Évolutivité**
- Support des abonnements récurrents
- Gestion multi-étudiants par famille
- Intégration facile avec d'autres services Stripe

## Utilisation

### Créer un payment link
```php
$paymentLinkId = $this->stripeCustomerService->createPaymentLink(
    $student,
    3000, // 30€ en centimes
    'Séance d\'essai',
    ['session_id' => $session->getId()]
);
```

### Vérifier le statut d'un paiement
Les webhooks se chargent automatiquement de marquer les sessions comme payées.
Vous pouvez toujours utiliser l'endpoint `/api/sessions/{id}/payment-status` pour vérifier manuellement.

## Migration des données existantes

Pour les étudiants qui ont déjà des paiements Stripe sans customer ID :
1. Le service créera automatiquement un customer à la prochaine transaction
2. Les anciens payment links continueront de fonctionner
3. La migration se fait de manière transparente