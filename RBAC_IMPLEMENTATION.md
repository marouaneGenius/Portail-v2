# Système RBAC (Role-Based Access Control) - Implémentation

## 📋 Vue d'ensemble

Cette implémentation ajoute un système de gestion des permissions fines basé sur les rôles pour l'application Symfony/React. Le système utilise des **Voters** côté backend et un hook de permissions côté frontend.

## 🏗️ Architecture

### Backend (Symfony)

#### Voters (`/back/src/Security/Voter/`)
- **UserVoter** : Gère les permissions sur les utilisateurs
- **StudentVoter** : Gère les permissions sur les étudiants
- **ParentVoter** : Gère les permissions sur les parents
- **HistoryVoter** : Gère l'accès à l'historique des modifications
- **CenterVoter** : Gère les permissions sur les centres

#### Intégration dans les contrôleurs
Les contrôleurs utilisent `$this->denyAccessUnlessGranted(VoterConstante, $entity)` pour vérifier les permissions.

### Frontend (React)

#### Hook de permissions (`/frontend/src/hooks/usePermissions.tsx`)
Hook central qui :
- Vérifie les permissions selon les rôles
- Fournit des méthodes utilitaires (`hasPermission`, `isAdmin`, etc.)
- Gère la logique métier des permissions

#### Composants
- **PermissionButton** : Bouton qui s'affiche/se cache selon les permissions
- **Sidebar adaptative** : Menu qui s'adapte selon le rôle de l'utilisateur
- **Pages protégées** : Redirection automatique si permissions insuffisantes

## 🔐 Règles de permissions par rôle

### ROLE_ADMIN
✅ **Accès complet à toutes les fonctionnalités**

### ROLE_USER
✅ **Autorisations :**
- Voir, créer, modifier : utilisateurs, étudiants, parents, centres
- Modifier uniquement les utilisateurs ROLE_TUTOR
- Accéder à toutes les pages sauf historique

❌ **Interdictions :**
- Supprimer : utilisateurs, étudiants, parents
- Modifier : utilisateurs ROLE_ADMIN ou ROLE_USER
- Accéder à l'historique des modifications

### ROLE_TUTOR
✅ **Autorisations :**
- Modifier uniquement SES étudiants assignés (VIA la page "Mon Planning" uniquement)
- Modifier sa propre fiche utilisateur
- Accéder à "Mon Planning" uniquement

❌ **Interdictions :**
- Accès direct aux pages : utilisateurs, étudiants, parents, centres, sessions
- Accès à l'historique des modifications
- Création d'entités
- Suppression d'entités
- **Toutes les fonctionnalités sauf "Mon Planning" et "Mon profil"**

## 📱 Adaptations interface utilisateur

### Sidebar
- **ADMIN** : Tous les éléments de menu visibles
- **USER** : Tous les éléments sauf "Historique"
- **TUTOR** : Seulement "Mon Planning" et "Mon profil" (**accès ultra-restreint**)

### Boutons d'action
- Affichage conditionnel selon `hasPermission('action:entity')`
- Boutons "Supprimer" masqués pour USER
- Boutons contextuels selon la relation tuteur-étudiant

### Pages
- Redirection automatique si accès non autorisé
- Vérification des permissions avant affichage du contenu

## 🚀 Utilisation

### Backend - Dans un contrôleur
```php
use App\Security\Voter\UserVoter;

public function edit(User $user): Response 
{
    $this->denyAccessUnlessGranted(UserVoter::EDIT, $user);
    // ... logique
}
```

### Frontend - Vérification de permissions
```tsx
import { usePermissions } from '../hooks/usePermissions';

const { hasPermission } = usePermissions();

// Vérifier une permission
if (hasPermission('user:edit', targetUser)) {
  // Afficher le bouton
}
```

### Frontend - Bouton avec permissions
```tsx
import PermissionButton from '../components/PermissionButton';

<PermissionButton
  permission="user:delete"
  targetUser={user}
  onClick={() => deleteUser()}
  variant="destructive"
>
  Supprimer
</PermissionButton>
```

## 🔧 Nouveaux endpoints

### Planning pour tuteurs
- **Route** : `/planning`
- **Composant** : `Planning.tsx`
- **Accès** : Tous les rôles (contenu adaptatif)

## ✅ Points de vérification

1. ✅ **Voters fonctionnels** : Toutes les permissions backend implémentées
2. ✅ **Contrôleurs sécurisés** : Vérifications ajoutées aux actions sensibles
3. ✅ **Sidebar adaptative** : Affichage selon les rôles
4. ✅ **Boutons conditionnels** : Masquage selon les permissions
5. ✅ **Pages protégées** : Redirections automatiques
6. ✅ **Planning tuteur** : Nouvelle page accessible aux TUTOR

## 🔄 Prochaines étapes

### Améliorations à considérer :
1. **Intégration complète dans CustomDataTable** pour masquer automatiquement les colonnes d'action
2. **Gestion des erreurs** avec messages spécifiques selon le type d'interdiction
3. **Tests unitaires** pour les Voters et le hook de permissions
4. **Audit trail** des tentatives d'accès non autorisées
5. **Interface d'administration** pour gérer les permissions dynamiquement

## 🐛 Dépannage

### Problèmes courants :
- **"Access Denied"** : Vérifier les rôles de l'utilisateur et la logique du Voter
- **Page blanche** : Contrôler les redirections et les conditions d'affichage
- **Boutons toujours visibles** : Vérifier l'implémentation de `hasPermission`
- **API 403** : Contrôler que les Voters sont bien appelés côté backend

### Debug :
```tsx
const { hasPermission, user } = usePermissions();
console.log('User roles:', user?.roles);
console.log('Has permission user:view:', hasPermission('user:view'));
```