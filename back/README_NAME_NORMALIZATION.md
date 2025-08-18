# Normalisation des Noms et Prénoms

## Fonctionnalités implémentées

### ✅ **Backend PHP**

#### 1. **Service NameNormalizerService**
- Normalisation automatique avec première lettre en majuscule
- Support des prénoms composés (Jean-Pierre, Marie Claire)
- Nettoyage des espaces multiples et caractères non conformes
- Validation des caractères autorisés (lettres, espaces, apostrophes, traits d'union pour prénoms)
- Génération de suggestions en cas d'erreur

#### 2. **EventSubscriber automatique**
- Normalisation transparente à chaque `persist` et `update`
- Utilise la réflexion pour éviter les boucles infinies
- S'applique automatiquement aux entities `Student` et `StudentParent`

#### 3. **Validation dans les Controllers**
- `StudentController` : Validation avant création
- `StudentParentController` : Validation avant création
- Messages d'erreur avec suggestions automatiques

### ✅ **Frontend TypeScript/React**

#### 1. **Utilitaire NameNormalizer**
- Classe TypeScript synchronisée avec le service PHP
- Normalisation en temps réel pendant la saisie
- Validation côté client avant envoi au backend

#### 2. **Intégration FormGenerator**
- Normalisation automatique des champs `firstname` et `lastname`
- S'applique aux formulaires étudiants et parents
- Normalisation en temps réel avec délai pour ne pas interférer avec la saisie

## Règles de normalisation

### ✅ **Noms de famille**
```
"DUPONT" → "Dupont"
"marie martin" → "Marie Martin"  
"o'connor" → "O'connor"
"  jean  " → "Jean"
```

### ✅ **Prénoms**
```
"jean-pierre" → "Jean-Pierre"
"marie claire" → "Marie Claire"
"anne-sophie" → "Anne-Sophie"
"THOMAS" → "Thomas"
```

### ✅ **Sécurité**
- Suppression des caractères non conformes : `@#$%^&*()+={}[]|\\:";'<>?,./`
- Conservation des caractères autorisés : lettres, espaces, apostrophes, traits d'union (prénoms uniquement)
- Nettoyage des espaces multiples
- Validation de longueur (2-50 caractères par défaut)

## Exemples d'utilisation

### **Backend**
```php
// Automatique via EventSubscriber
$student = new Student();
$student->setFirstname('jean-pierre'); // → "Jean-Pierre"
$student->setLastname('MARTIN');       // → "Martin"

// Manuel via service
$normalized = $nameNormalizer->normalizeFirstname('marie claire'); // → "Marie Claire"
```

### **Frontend**
```typescript
// Normalisation automatique dans les formulaires
// Le champ se normalise automatiquement à la saisie

// Manuel
const normalized = NameNormalizer.normalizeFirstname('jean-pierre'); // → "Jean-Pierre"
const isValid = NameNormalizer.isValidName('Thomas'); // → true
const suggestions = NameNormalizer.getSuggestions('J0hn@'); // → ["John"]
```

## Avantages

### ✅ **Cohérence des données**
- Tous les noms/prénoms suivent le même format
- Plus d'incohérences de capitalisation
- Base de données propre et standardisée

### ✅ **Expérience utilisateur**
- Correction automatique et transparente
- Suggestions en cas d'erreur de saisie
- Validation immédiate côté client

### ✅ **Sécurité**
- Protection contre l'injection de caractères malveillants
- Validation stricte des caractères autorisés
- Nettoyage automatique des données

### ✅ **Performance**
- Normalisation côté client pour réduire les allers-retours
- EventSubscriber efficace côté serveur
- Pas d'impact sur les performances existantes

## Configuration

### **Services automatiquement configurés**
- `NameNormalizerService` : Service de normalisation
- `NameNormalizationSubscriber` : EventSubscriber Doctrine
- Frontend : Intégration transparente dans `FormGenerator`

### **Personnalisation possible**
- Longueur min/max des noms
- Caractères autorisés supplémentaires
- Règles de capitalisation personnalisées

La normalisation est maintenant **automatique et transparente** sur toute la plateforme !