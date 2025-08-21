import { useAuth, User } from "./auth";


export type Permission = 
  | 'user:view' | 'user:create' | 'user:edit' | 'user:delete'
  | 'student:view' | 'student:create' | 'student:edit' | 'student:delete'
  | 'parent:view' | 'parent:create' | 'parent:edit' | 'parent:delete'
  | 'center:view' | 'center:create' | 'center:edit' | 'center:delete'
  | 'history:view' | 'history:export'
  | 'session:view' | 'session:create' | 'session:edit' | 'session:delete'
  | 'planning:view';

/**
 * Hook pour gérer les permissions utilisateur selon les rôles
 */
export const usePermissions = () => {
  const { user } = useAuth();

  const hasRole = (role: string): boolean => {
    if (!user?.roles) return false;
    return user.roles.includes(role);
  };

  const isAdmin = (): boolean => hasRole('ROLE_ADMIN');
  const isUser = (): boolean => hasRole('ROLE_USER'); 
  const isTutor = (): boolean => hasRole('ROLE_TUTOR');
  const isParent = (): boolean => hasRole('ROLE_PARENT');

  const hasPermission = (permission: Permission, targetUser?: User): boolean => {
    if (!user) return false;

    // Les ADMIN ont tous les droits
    if (isAdmin()) return true;

    // Logique selon le rôle et la permission
    const [entity, action] = permission.split(':') as [string, string];

    switch (entity) {
      case 'user':
        return checkUserPermissions(action, targetUser);
      case 'student':
        return checkStudentPermissions(action);
      case 'parent':
        return checkParentPermissions(action);
      case 'center':
        return checkCenterPermissions(action);
      case 'history':
        return checkHistoryPermissions(action);
      case 'session':
        return checkSessionPermissions(action);
      case 'planning':
        return checkPlanningPermissions(action);
      default:
        return false;
    }
  };

  const checkUserPermissions = (action: string, targetUser?: User): boolean => {
    if (isUser()) {
      switch (action) {
        case 'view':
        case 'create':
          return true;
        case 'edit':
          // USER peut modifier sa propre fiche ou les TUTORS uniquement
          if (targetUser) {
            if (targetUser.id === user?.id) return true; // Sa propre fiche
            const hasRestrictedRole = targetUser.roles?.some(role => 
              ['ROLE_ADMIN', 'ROLE_USER'].includes(role)
            );
            return !hasRestrictedRole && targetUser.roles?.includes('ROLE_TUTOR');
          }
          return true; // Si pas de targetUser spécifique, on autorise (sera vérifié côté serveur)
        case 'delete':
          return false; // USER ne peut pas supprimer
        default:
          return false;
      }
    }

    if (isTutor()) {
      switch (action) {
        case 'view':
        case 'edit':
          // TUTOR peut seulement voir/modifier sa propre fiche
          return targetUser ? targetUser.id === user?.id : false;
        case 'create':
        case 'delete':
          return false;
        default:
          return false;
      }
    }

    return false;
  };

  const checkStudentPermissions = (action: string): boolean => {
    if (isUser()) {
      switch (action) {
        case 'view':
        case 'create':
        case 'edit':
          return true;
        case 'delete':
          return false; // USER ne peut pas supprimer d'étudiants
        default:
          return false;
      }
    }

    // TUTOR n'a plus accès aux étudiants via l'interface générale
    // Il doit passer par son planning personnel uniquement
    if (isTutor()) {
      return false;
    }

    return false;
  };

  const checkParentPermissions = (action: string): boolean => {
    if (isUser()) {
      switch (action) {
        case 'view':
        case 'create':
        case 'edit':
          return true;
        case 'delete':
          return false; // USER ne peut pas supprimer de parents
        default:
          return false;
      }
    }

    // TUTOR n'a pas accès aux parents
    if (isTutor()) {
      return false;
    }

    return false;
  };

  const checkCenterPermissions = (action: string): boolean => {
    if (isUser()) {
      return ['view', 'create', 'edit', 'delete'].includes(action);
    }

    // TUTOR n'a plus accès aux centres via l'interface générale
    if (isTutor()) {
      return false;
    }

    return false;
  };

  const checkHistoryPermissions = (action: string): boolean => {
    // Seuls les ADMIN peuvent accéder à l'historique
    return false;
  };

  const checkSessionPermissions = (action: string): boolean => {
    if (isUser()) {
      return ['view', 'create', 'edit', 'delete'].includes(action);
    }

    // TUTOR n'a plus accès au planning général des sessions
    // Il doit utiliser son planning personnel uniquement
    if (isTutor()) {
      return false;
    }

    return false;
  };

  const checkPlanningPermissions = (action: string): boolean => {
    // Tous peuvent voir leur planning
    return action === 'view';
  };

  return {
    hasPermission,
    hasRole,
    isAdmin,
    isUser, 
    isTutor,
    isParent,
    user
  };
};