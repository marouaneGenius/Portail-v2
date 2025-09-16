// src/components/Sidebar.tsx
import React, { useState } from 'react';
import {
  Users,
  Building,
  GraduationCap,
  UserCheck,
  Calendar,
  User,
  LogOut,
  CalendarRange,
  HistoryIcon,
  GraduationCap as TutorIcon
} from 'lucide-react';
import { NavLink } from 'react-router-dom';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuItem,
  SidebarHeader,
} from '@/components/ui/sidebar';
import { useAuth } from '../Hooks/auth';
import { usePermissions } from '@/Hooks/usePermissions';

// Définir les items de menu avec leurs permissions requises
const menuItems = [
  { 
    title: 'Utilisateurs', 
    url: '/users', 
    icon: Users,
    permission: 'user:view',
    roles: ['ROLE_ADMIN', 'ROLE_USER'] 
  },
  { 
    title: 'Centres', 
    url: '/centers', 
    icon: Building,
    permission: 'center:view',
    roles: ['ROLE_ADMIN', 'ROLE_USER'] // TUTOR n'y a plus accès
  },
  { 
    title: 'Élèves', 
    url: '/students', 
    icon: GraduationCap,
    permission: 'student:view',
    roles: ['ROLE_ADMIN', 'ROLE_USER'] // TUTOR n'y a plus accès
  },
  { 
    title: 'Parents', 
    url: '/parents', 
    icon: UserCheck,
    permission: 'parent:view',
    roles: ['ROLE_ADMIN', 'ROLE_USER'] // TUTOR n'a pas accès aux parents
  },
  { 
    title: 'Planning séances', 
    url: '/session-calendar', 
    icon: Calendar,
    permission: 'session:view',
    roles: ['ROLE_ADMIN', 'ROLE_USER'] // TUTOR n'y a plus accès
  },
  { 
    title: 'Planning tuteurs', 
    url: '/tutors', 
    icon: CalendarRange,
    permission: 'planning:view',
    roles: ['ROLE_ADMIN', 'ROLE_USER'] // Gestion globale pour ADMIN/USER
  },
  { 
    title: 'Mon Planning', 
    url: '/planning', 
    icon: CalendarRange,
    permission: 'planning:view',
    roles: ['ROLE_TUTOR'] // Vue personnelle pour TUTOR
  },
  { 
    title: 'Mon profil', 
    url: '/profile', 
    icon: User,
    roles: ['ROLE_ADMIN', 'ROLE_USER', 'ROLE_TUTOR', 'ROLE_PARENT'] // Tous les rôles
  },
  { 
    title: 'Historique', 
    url: '/historique', 
    icon: HistoryIcon,
    permission: 'history:view',
    roles: ['ROLE_ADMIN'] // Seulement ADMIN
  },
];

const CustomSidebar: React.FC = () => {
  const { user, logout } = useAuth();
  const { hasPermission, hasRole } = usePermissions();
  const [open, setOpen] = useState(false);

  if (!user) return null;

  // Filtrer les items selon les permissions de l'utilisateur
  const visibleMenuItems = menuItems.filter(item => {
    // Vérifier si l'utilisateur a un des rôles requis pour cet item
    const hasRequiredRole = item.roles.some(role => hasRole(role));
    
    // Si une permission spécifique est définie, la vérifier aussi
    const hasRequiredPermission = item.permission ? hasPermission(item.permission as any) : true;
    
    return hasRequiredRole && hasRequiredPermission;
  });

  return (
    <>
      {/* Bouton hamburger visible uniquement sur mobile */}
      <button
        className="fixed top-4 left-4 z-50 sm:hidden bg-white rounded-full p-2 shadow border border-fading-grey"
        onClick={() => setOpen(true)}
        aria-label="Ouvrir le menu"
      >
        <svg width="24" height="24" fill="none"><path d="M4 6h16M4 12h16M4 18h16" stroke="#222" strokeWidth="2" strokeLinecap="round"/></svg>
      </button>

      {/* Overlay pour fermer la sidebar sur mobile */}
      {open && (
        <div
          className="fixed inset-0 bg-black/30 z-40 sm:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      <aside
        className={`
          fixed top-0 left-0 z-50 h-screen w-[80vw] max-w-xs bg-white border-r border-fading-grey
          flex flex-col transition-transform duration-300
          ${open ? 'translate-x-0' : '-translate-x-full'}
          sm:translate-x-0 sm:w-[260px] sm:max-w-[260px] sm:h-screen sm:fixed
        `}
      >
        <SidebarHeader className="border-b border-fading-grey p-4 sm:p-6">
          <div className="flex items-center gap-2 sm:gap-3">
            <img
              src="/logo/GENIUS-THUNDERBOLD-BIG.png"
              alt="Logo Genius"
              className="h-8 w-8 object-contain"
            />
            <div>
              <h2 className="text-base sm:text-lg font-bold text-mister-anthracite">Genius</h2>
              <p className="text-xs sm:text-sm text-mister-anthracite/70">Soutien scolaire</p>
            </div>
          </div>
          {/* Bouton fermer sur mobile */}
          <button
            className="absolute top-4 right-4 sm:hidden text-mister-anthracite"
            onClick={() => setOpen(false)}
            aria-label="Fermer le menu"
          >
            <svg width="24" height="24" fill="none"><path d="M6 6l12 12M6 18L18 6" stroke="#222" strokeWidth="2" strokeLinecap="round"/></svg>
          </button>
        </SidebarHeader>

        <SidebarContent className="px-3 sm:px-4 py-4 sm:py-6">
          <SidebarGroup>
            <SidebarGroupLabel className="text-mister-anthracite/70 text-xs font-semibold uppercase tracking-wider mb-2 sm:mb-3">
              Navigation
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu className="space-y-1">
                {visibleMenuItems.map(({ url, icon: Icon, title }) => (
                  <SidebarMenuItem key={url}>
                    <NavLink
                      to={url}
                      className={({ isActive }) =>
                        `
                        flex items-center gap-2 sm:gap-3 w-full p-2 sm:p-3 text-left rounded-lg transition-all duration-200 group
                        ${isActive
                          ? 'bg-hello-yellow/20 text-hello-yellow font-semibold'
                          : 'hover:bg-hello-yellow/10 hover:text-mister-anthracite text-mister-anthracite/70'
                        }
                      `
                      }
                    >
                      <Icon className="w-4 h-4 sm:w-5 sm:h-5 group-hover:text-hello-yellow transition-colors" />
                      <span className="text-sm sm:text-base">{title}</span>
                    </NavLink>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>

        <SidebarFooter className="p-3 sm:p-4 border-t border-fading-grey">
          <button className="flex items-center gap-2 sm:gap-3 w-full p-2 sm:p-3 text-left hover:bg-crazy-magenta/10 transition-all duration-200 rounded-lg group" onClick={() => logout()}>
            <LogOut className="w-4 h-4 sm:w-5 sm:h-5 text-crazy-magenta" />
            <span className="text-sm sm:text-base text-mister-anthracite font-medium group-hover:text-crazy-magenta transition-colors">
              Déconnexion
            </span>
          </button>
        </SidebarFooter>
      </aside>
    </>
  );
};

export default CustomSidebar;
