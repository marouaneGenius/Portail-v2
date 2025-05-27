// src/components/Sidebar.tsx
import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { HiUsers, HiOfficeBuilding, HiUserCircle, HiMenu, HiX, HiOutlineUsers, HiCubeTransparent, HiAcademicCap, HiViewGridAdd, HiViewGrid, HiCalendar } from 'react-icons/hi';
import { useAuth } from '../Hooks/auth';

const Sidebar: React.FC = () => {
  const { user } = useAuth();
  const [collapsed, setCollapsed] = useState(false);

  if (!user) return null;

  const menu = [
    { to: '/users', icon: <HiUsers className='h-7 w-7' />, label: 'Utilisateurs' },
    { to: '/centers', icon: <HiOfficeBuilding className='h-7 w-7' />, label: 'Centres' },
    { to: '/students', icon: <HiAcademicCap className='h-7 w-7' />, label: 'Étudiants' },
    { to: '/parents', icon: <HiOutlineUsers className='h-7 w-7 ' />, label: 'Parents' },
    { to: '/sessions', icon: <HiOfficeBuilding className='h-7 w-7 ' />, label: 'Séances' },
    { to: '/profile', icon: <HiUserCircle className='h-7 w-7 ' />, label: 'Mon profil' },
    { to: '/planing', icon: <HiCalendar className='h-7 w-7 ' />, label: 'Planing' },
    // { to: '/abonnements', icon: <HiViewGridAdd className='h-7 w-7 ' />, label: 'Abonnements' },
    // { to: '/tutor-schedule', icon: <HiCalendar className='h-7 w-7 ' />, label: 'Dispo Tuteur' },
  ];

  return (
    <aside
      className={`
        flex flex-col
        bg-white shadow-md
        ${collapsed ? 'w-16' : 'w-64'}
        transition-width duration-200
        overflow-hidden
      `}
    >
      <div className="flex items-center justify-between p-4 border-b">
        {!collapsed && 
            <h2 className="flex items-center space-x-3 text-2xl font-bold">
              <img
                src="/logo/GENIUS-THUNDERBOLD-BIG.png"
                alt="Logo Genius"
                className="h-8 w-8 object-contain"
              />
            </h2>
        }
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-1 text-gray-600 hover:text-gray-800 focus:outline-none"
        >
          {collapsed ? <HiMenu size={24} /> : <HiX size={24} />}
        </button>
      </div>
      <nav className="flex-1 p-2 space-y-1 ">
        {menu.map(({ to, icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex items-center p-2 rounded hover-bg transition-colors text-center bg-border items-center border-b-2
              ${isActive ? 'bg-green-300 font-semibold' : 'text-gray-700'}`
            }
          >
              <span className="text-lg text-center ">{icon}</span>
            {!collapsed && <span className="ml-3">{label}</span>}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
};

export default Sidebar;
