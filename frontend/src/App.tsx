import './App.css';
import { Outlet } from "react-router-dom";
import Navbar from './components/NavBar';
import { useAuth } from './Hooks/auth';
import Sidebar from './components/SideBar';
import { SidebarProvider } from '@/components/ui/sidebar'; // adapte le chemin selon ton arborescence
import { Toaster } from '@/components/ui/sonner';
import { usePermissions } from './Hooks/usePermissions';

const App = () => {
  const { user } = useAuth();
  const { isParent } = usePermissions();

  return (
    <div className="sm:ml-[260px]"> {/* Ajoute ce wrapper */}
      {user ? (
        // Si c'est un parent, pas de sidebar
        isParent() ? (
          <div className="flex flex-col flex-1">
            <main className="flex-1 p-2 sm:p-4 bg-dat-white">
              <Outlet />
            </main>
          </div>
        ) : (
          // Pour les autres utilisateurs, sidebar normale
          <SidebarProvider>
            <Sidebar />
            <div className="flex flex-col flex-1">
              {/* <Navbar /> */}
              <main className="flex-1 p-2 sm:p-4 bg-dat-white">
                <Outlet />
              </main>
            </div>
          </SidebarProvider>
        )
      ) : (
        <div className="flex flex-col flex-1">
          <main className="flex-1 overflow-auto bg-gray-50 p-0">
            <Outlet />
          </main>
        </div>
      )}
     <Toaster richColors closeButton />
    </div>
  );
};

export default App;
