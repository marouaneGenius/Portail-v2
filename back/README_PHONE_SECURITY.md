# Sécurisation des Numéros de Téléphone

## Système de validation implémenté

### ✅ **Backend PHP**

#### 1. **Service PhoneValidatorService**
- Validation stricte des numéros français (01-09)
- Normalisation automatique au format "XX XX XX XX XX"
- Support des formats internationaux (+33, 0033)
- Suggestions de correction automatiques
- Types de numéros détectés (mobile, fixe, spécial, VoIP)

#### 2. **Intégration dans les entities**
- **User** : Téléphone requis avec validation stricte
- **StudentParent** : Téléphone requis avec validation stricte  
- **Student** : Téléphone optionnel mais validé si fourni

#### 3. **Validation dans les controllers**
- Blocage immédiat si numéro invalide
- Messages d'erreur avec suggestions
- Exemples de formats corrects

### ✅ **Frontend TypeScript/React**

#### 1. **Utilitaire PhoneValidator**
- Classe TypeScript synchronisée avec le service PHP
- Validation en temps réel
- Auto-formatage pendant la saisie
- Messages d'erreur contextuels

#### 2. **Intégration FormGenerator**
- Validation côté client avant envoi
- Normalisation automatique des champs téléphone
- Alertes avec suggestions de correction

## Règles de validation

### ✅ **Formats acceptés**
```
"0612345678" → "06 12 34 56 78"
"06.12.34.56.78" → "06 12 34 56 78"
"+33612345678" → "06 12 34 56 78"
"33612345678" → "06 12 34 56 78"
"06-12-34-56-78" → "06 12 34 56 78"
```

### ✅ **Préfixes valides**
- **01-05** : Numéros fixes par région
- **06-07** : Numéros mobiles
- **08** : Numéros spéciaux/surtaxés
- **09** : Numéros internet/VoIP

### ❌ **Formats rejetés**
```
"123456789" → Erreur: "Trop court"
"12345678901" → Erreur: "Trop long" 
"1012345678" → Erreur: "Préfixe invalide"
"06abc12345" → Erreur: "Caractères non numériques"
"+1234567890" → Erreur: "Pas un numéro français"
```

## Exemples d'utilisation

### **Backend**
```php
// Validation dans controller
if (!$this->phoneValidator->isValidPhone($data['phone'])) {
    $suggestions = $this->phoneValidator->getSuggestions($data['phone']);
    return new JsonResponse([
        'error' => 'Numéro de téléphone invalide.',
        'suggestions' => $suggestions,
        'example' => '06 12 34 56 78'
    ], 400);
}

// Normalisation automatique dans entities
$user->setPhone('0612345678'); // → "06 12 34 56 78"
```

### **Frontend**
```typescript
// Validation
const isValid = PhoneValidator.isValidPhone('0612345678'); // → true

// Normalisation
const formatted = PhoneValidator.normalizePhone('06.12.34.56.78'); // → "06 12 34 56 78"

// Validation complète
const result = PhoneValidator.validateAndFormat('0612abc');
// → { isValid: false, suggestions: ['06 12 ???'], type: 'invalid' }
```

## Sécurité

### ✅ **Protection contre**
- Injection de caractères malveillants
- Numéros internationaux non autorisés
- Formats non standard
- Données corrompues

### ✅ **Contrôles**
- Validation stricte côté client ET serveur
- Blocage immédiat des données invalides
- Logs des tentatives d'injection
- Suggestions de correction utilisateur

### ✅ **Normalisation**
- Format uniforme en base de données
- Suppression des caractères parasites
- Conversion automatique des formats internationaux
- Cohérence garantie

## Messages d'erreur

### **Exemples de retours API**
```json
// Numéro trop court
{
  "error": "Numéro de téléphone invalide.",
  "phone_provided": "0612345",
  "suggestions": ["06 12 34 5? ??"],
  "example": "06 12 34 56 78"
}

// Format international
{
  "error": "Numéro de téléphone invalide.",
  "phone_provided": "+33612345678",
  "suggestions": ["06 12 34 56 78"],
  "example": "06 12 34 56 78"
}

// Caractères invalides
{
  "error": "Numéro de téléphone invalide.",
  "phone_provided": "06abc12345",
  "suggestions": ["06 12 ???"],
  "example": "06 12 34 56 78"
}
```

## Configuration

### **Services automatiquement configurés**
- `PhoneValidatorService` : Service de validation backend
- `PhoneValidator` : Classe utilitaire frontend
- Intégration transparente dans tous les formulaires

### **Règles personnalisables**
- Préfixes autorisés (actuellement 01-09)
- Format de sortie (actuellement "XX XX XX XX XX")
- Messages d'erreur
- Support numéros internationaux (désactivé par défaut)

La validation des téléphones est maintenant **stricte et sécurisée** sur toute la plateforme ! ⚡