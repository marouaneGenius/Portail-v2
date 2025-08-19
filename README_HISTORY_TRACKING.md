# 📊 Système de Tracking d'Historique des Modifications

Ce document décrit le système complet d'historique des modifications implémenté pour tracer toutes les actions sur les entités principales de l'application.

## 🎯 Objectif

Tracer automatiquement **toutes les modifications** des équipes, élèves, parents et centres avec :
- **QUI** : L'utilisateur qui a fait la modification
- **QUOI** : Les champs qui ont été modifiés (avant/après) 
- **QUAND** : Date et heure précise de la modification
- **OÙ** : Adresse IP et contexte

## 🏗️ Architecture

### Backend (Symfony)

#### 1. Entité ModificationHistory
```php
// src/Entity/ModificationHistory.php
```

**Champs principaux :**
- `id` : Identifiant unique
- `user_id` : Utilisateur ayant fait la modification
- `entity_type` : Type d'entité (student, parent, center, user)
- `entity_id` : ID de l'entité modifiée
- `entity_name` : Nom affiché de l'entité
- `field_name` : Champ modifié
- `old_value` : Ancienne valeur (JSON)
- `new_value` : Nouvelle valeur (JSON)
- `action` : Type d'action (create, update, delete)
- `ip_address` : Adresse IP
- `user_agent` : Navigateur utilisé
- `created_at` : Date/heure de la modification
- `metadata` : Données contextuelles (JSON)

#### 2. Service HistoryTracker
```php
// src/Service/HistoryTracker.php
```

**Fonctionnalités :**
- Capture automatique des modifications
- Formatage intelligent des valeurs
- Gestion des types de données complexes
- Exclusion des champs sensibles
- Métadonnées contextuelles

#### 3. Event Listener Doctrine
```php
// src/EventListener/EntityModificationListener.php
```

**Événements écoutés :**
- `postPersist` : Créations d'entités
- `preUpdate` : Modifications d'entités  
- `postRemove` : Suppressions d'entités

#### 4. Repository avec filtres avancés
```php
// src/Repository/ModificationHistoryRepository.php
```

**Méthodes principales :**
- `findWithFilters()` : Recherche avec filtres et pagination
- `exportWithFilters()` : Export CSV
- `findByEntity()` : Historique d'une entité
- `getModificationStats()` : Statistiques
- `cleanOldModifications()` : Nettoyage RGPD

#### 5. Contrôleur API
```php
// src/Controller/HistoriqueController.php
```

**Endpoints disponibles :**
- `GET /api/historique/modifications` : Liste avec filtres
- `GET /api/historique/filter-options` : Options pour les filtres
- `GET /api/historique/export` : Export CSV
- `GET /api/historique/modification/{id}` : Détail d'une modification
- `GET /api/historique/entity/{type}/{id}` : Historique d'une entité
- `GET /api/historique/stats` : Statistiques

### Frontend (React/TypeScript)

#### 1. Service API
```typescript
// src/services/historyService.ts
```

**Fonctionnalités :**
- Interface avec l'API backend
- Validation des filtres
- Export CSV automatique
- Formatage des données
- Gestion d'erreurs

#### 2. Page principale
```tsx
// src/pages/HistoriqueModifications.tsx
```

**Caractéristiques :**
- Gestion d'état complète
- URL persistante avec paramètres
- Statistiques en temps réel
- Messages d'erreur/succès
- Actualisation automatique

#### 3. Composant de filtres
```tsx
// src/components/HistoryFilters.tsx
```

**Filtres disponibles :**
- Type d'entité (Élève, Parent, Centre, Utilisateur)
- Action (Création, Modification, Suppression)
- Utilisateur spécifique
- Entité spécifique (par dropdown)
- Plage de dates
- Recherche textuelle
- Champ modifié

#### 4. Tableau avec détails
```tsx
// src/components/HistoryTable.tsx
```

**Fonctionnalités :**
- Pagination avancée
- Tri par colonnes
- Modal de détail
- Export des données
- États de chargement

## 🚀 Installation et Configuration

### 1. Migration de base de données

```bash
# Appliquer la migration
php bin/console doctrine:migrations:migrate

# Ou créer manuellement la table
php bin/console doctrine:schema:update --force
```

### 2. Configuration des services

Ajouter dans `config/services.yaml` :
```yaml
imports:
    - { resource: services_history.yaml }
```

### 3. Configuration des logs

Les modifications sont loggées dans `var/log/history.log` avec rotation automatique.

### 4. Routes frontend

Ajouter dans votre router React :
```tsx
import HistoriqueModifications from './pages/HistoriqueModifications';

// Dans vos routes
<Route path="/historique" element={<HistoriqueModifications />} />
```

## 📊 Utilisation

### Consultation de l'historique

1. **Page principale** : `/historique`
2. **Filtres avancés** : Utilisez les filtres pour cibler les modifications
3. **Export CSV** : Bouton d'export avec les filtres appliqués
4. **Détails** : Cliquez sur une ligne pour voir tous les détails

### Filtres disponibles

- **Par utilisateur** : Voir les modifications d'un utilisateur spécifique
- **Par type** : Élèves, Parents, Centres, Utilisateurs
- **Par action** : Créations, Modifications, Suppressions  
- **Par période** : Plage de dates personnalisée
- **Par entité** : Historique d'un élève/parent/centre spécifique
- **Recherche** : Texte libre dans les valeurs

### Export des données

L'export CSV inclut :
- Date et heure de la modification
- Utilisateur (nom complet)
- Type d'entité et nom
- Action effectuée
- Champ modifié
- Ancienne et nouvelle valeur
- Adresse IP

## 🔧 Personnalisation

### Ajouter de nouvelles entités à tracer

1. **Modifier le listener** :
```php
// Dans EntityModificationListener.php
private const TRACKED_ENTITIES = [
    Student::class,
    StudentParent::class, 
    Center::class,
    User::class,
    VotreNouvelleEntite::class // Ajouter ici
];
```

2. **Mettre à jour le mapping** :
```php
// Dans HistoryTracker.php
private const ENTITY_TYPE_MAPPING = [
    // ... entités existantes
    VotreNouvelleEntite::class => 'votre_type'
];
```

### Exclure des champs du tracking

```php
// Dans HistoryTracker.php
private const SENSITIVE_FIELDS = [
    'password',
    'token', 
    'secret',
    'votre_champ_sensible' // Ajouter ici
];
```

### Personnaliser le formatage des valeurs

```php
// Dans HistoryTracker.php - méthode getEntityName()
switch (get_class($entity)) {
    case VotreEntite::class:
        return $entity->getCustomDisplayName();
    // ...
}
```

## 📈 Monitoring et Performance

### Index de base de données

Les index suivants sont créés automatiquement :
- `user_id` : Requêtes par utilisateur
- `entity_type, entity_id` : Requêtes par entité
- `created_at` : Tri chronologique
- `entity_type, created_at` : Filtres combinés

### Nettoyage automatique (RGPD)

```php
// Supprimer les modifications de plus de 2 ans
$repository = $entityManager->getRepository(ModificationHistory::class);
$count = $repository->cleanOldModifications(new \DateTime('-2 years'));
```

### Performances recommandées

- **Pagination** : Limitée à 100 éléments par page
- **Export** : Limité à 10 000 enregistrements
- **Cache** : Les options de filtres peuvent être mises en cache
- **Index** : Surveiller les requêtes lentes avec le profiler Symfony

## 🛡️ Sécurité et RGPD

### Données sensibles

- Les mots de passe ne sont **jamais** tracés
- Les tokens et secrets sont exclus automatiquement
- Les données personnelles peuvent être anonymisées

### Anonymisation RGPD

```php
// Service d'anonymisation (à implémenter si nécessaire)
$historyTracker->anonymizeUserData($userId);
```

### Contrôle d'accès

- L'accès à l'historique peut être restreint par rôle
- Les API sont protégées par JWT
- Les logs incluent l'IP pour l'audit

## 🐛 Dépannage

### Modifications non tracées

1. Vérifier que l'entité est dans `TRACKED_ENTITIES`
2. Vérifier les logs dans `var/log/history.log`
3. S'assurer que l'Event Listener est enregistré

### Erreurs de performance

1. Vérifier les index de base de données
2. Limiter la plage de dates dans les filtres
3. Utiliser la pagination appropriée

### Problèmes d'export

1. Vérifier les permissions d'écriture
2. Limiter le nombre d'enregistrements exportés
3. S'assurer que le serveur a assez de mémoire

## 📚 Exemples d'utilisation

### Tracking personnalisé depuis un contrôleur

```php
// Dans un contrôleur
private EntityModificationListener $historyListener;

public function customAction(Request $request): Response 
{
    // Votre logique métier
    
    // Tracer une action personnalisée
    $this->historyListener->trackCustomAction(
        'student',
        $studentId,
        'custom_action',
        'Action personnalisée effectuée',
        ['context' => 'additional_data']
    );
    
    return $this->json(['success' => true]);
}
```

### Récupération d'historique via l'API

```javascript
// Côté frontend
import historyService from './services/historyService';

// Historique d'un élève spécifique
const studentHistory = await historyService.getEntityHistory('student', 123);

// Recherche avec filtres
const modifications = await historyService.getModifications({
    entity_type: 'student',
    date_from: '2024-01-01',
    date_to: '2024-12-31'
}, 1, 50);
```

## 🎉 Conclusion

Ce système fournit un tracking complet et performant de toutes les modifications avec :

✅ **Capture automatique** via les Event Listeners Doctrine
✅ **Interface utilisateur intuitive** avec filtres avancés  
✅ **Export CSV** pour l'analyse externe
✅ **Performance optimisée** avec index et pagination
✅ **Sécurité RGPD** avec anonymisation possible
✅ **Monitoring complet** avec logs détaillés

Le système est prêt pour la production et peut facilement être étendu pour d'autres entités ou besoins spécifiques.