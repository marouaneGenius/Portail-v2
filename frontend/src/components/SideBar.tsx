// src/components/Sidebar.tsx
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
import { usePermissions } from '@/hooks/usePermissions';

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
    title: 'Étudiants', 
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
    <Sidebar className="border-r border-fading-grey bg-white">
      <SidebarHeader className="border-b border-fading-grey p-4 sm:p-6">
        <div className="flex items-center gap-2 sm:gap-3">
          <img
            src="/logo/GENIUS-THUNDERBOLD-BIG.png"
            alt="Logo Genius"
            className="h-8 w-8 object-contain"
          />
          <div className="hidden sm:block">
            <h2 className="text-base sm:text-lg font-bold text-mister-anthracite">Genius</h2>
            <p className="text-xs sm:text-sm text-mister-anthracite/70">Soutien scolaire</p>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent className="px-3 sm:px-4 py-4 sm:py-6">
        <SidebarGroup>
          <SidebarGroupLabel className="text-mister-anthracite/70 text-xs font-semibold uppercase tracking-wider mb-2 sm:mb-3 hidden sm:block">
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
                    <span className="text-sm sm:text-base hidden sm:inline">{title}</span>
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
          <span className="text-sm sm:text-base text-mister-anthracite font-medium group-hover:text-crazy-magenta transition-colors hidden sm:inline">
            Déconnexion
          </span>
        </button>
      </SidebarFooter>
    </Sidebar>
  );
};

export default CustomSidebar;
