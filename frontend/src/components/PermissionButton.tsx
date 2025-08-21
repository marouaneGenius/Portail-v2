import React from 'react';
import { Button } from '@/components/ui/button';
import { usePermissions, Permission } from '../Hooks/usePermissions';
import { User } from '../hooks/auth';

interface PermissionButtonProps {
  permission: Permission;
  targetUser?: User;
  onClick?: () => void;
  children: React.ReactNode;
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  className?: string;
  disabled?: boolean;
}

/**
 * Composant Button qui affiche ou cache selon les permissions
 */
const PermissionButton: React.FC<PermissionButtonProps> = ({
  permission,
  targetUser,
  onClick,
  children,
  variant = 'default',
  size = 'default',
  className,
  disabled = false,
}) => {
  const { hasPermission } = usePermissions();

  // Vérifier si l'utilisateur a la permission
  const canPerformAction = hasPermission(permission, targetUser);

  // Ne pas afficher le bouton si pas de permission
  if (!canPerformAction) {
    return null;
  }

  return (
    <Button
      onClick={onClick}
      variant={variant}
      size={size}
      className={className}
      disabled={disabled}
    >
      {children}
    </Button>
  );
};

export default PermissionButton;