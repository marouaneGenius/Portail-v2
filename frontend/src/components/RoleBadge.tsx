import React from 'react';
import { Shield, User, Crown } from 'lucide-react';

interface RoleBadgeProps {
  role: string;
}

const RoleBadge: React.FC<RoleBadgeProps> = ({ role }) => {
  const getRoleConfig = (role: string) => {
    switch (role.toUpperCase()) {
      case 'ROLE_ADMIN':
      case 'ADMIN':
        return {
          icon: Crown,
          label: 'Administrateur',
          className: 'bg-red-100 text-red-800 hover:bg-red-200 border border-red-200'
        };
      case 'ROLE_MODERATOR':
      case 'MODERATOR':
        return {
          icon: Shield,
          label: 'Modérateur',
          className: 'bg-blue-100 text-blue-800 hover:bg-blue-200 border border-blue-200'
        };
      case 'ROLE_USER':
      case 'USER':
      default:
        return {
          icon: User,
          label: 'Utilisateur',
          className: 'bg-green-100 text-green-800 hover:bg-green-200 border border-green-200'
        };
    }
  };

  const { icon: Icon, label, className } = getRoleConfig(role);

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-sm font-medium transition-colors ${className}`}
    >
      <Icon className="w-3 h-3 mr-1" />
      {label}
    </span>
  );
};

export default RoleBadge;
