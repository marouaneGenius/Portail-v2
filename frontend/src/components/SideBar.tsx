// src/components/Sidebar.tsx
import {
  Users,
  Building,
  GraduationCap,
  UserCheck,
  Calendar,
  User,
  LogOut,
  CalendarRange
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

const menuItems = [
  { title: 'Utilisateurs', url: '/users', icon: Users },
  { title: 'Centres', url: '/centers', icon: Building },
  { title: 'Étudiants', url: '/students', icon: GraduationCap },
  { title: 'Parents', url: '/parents', icon: UserCheck },
  { title: 'Planning séances', url: '/session-calendar', icon: Calendar },
  { title: 'Planning tuteurs',url: '/planing', icon: CalendarRange },
  { title: 'Mon profil', url: '/profile', icon: User },
];

const CustomSidebar: React.FC = () => {
  const { user, logout } = useAuth();
  if (!user) return null;

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
              {menuItems.map(({ url, icon: Icon, title }) => (
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
