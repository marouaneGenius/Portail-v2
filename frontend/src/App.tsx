import './App.css';
import { Outlet } from "react-router-dom";
import Navbar from './components/NavBar';
import { useAuth } from './Hooks/auth';
import Sidebar from './components/SideBar';
import { SidebarProvider } from '@/components/ui/sidebar'; // adapte le chemin selon ton arborescence

const App = () => {
  const { user } = useAuth();

  return (
    <div className="flex h-screen w-screen">
      {user ? (
        <SidebarProvider>
          <Sidebar />
          <div className="flex flex-col flex-1">
            {/* <Navbar /> */}
            <main className="flex-1 p-2 sm:p-4 bg-dat-white">
              <Outlet />
            </main>
          </div>
        </SidebarProvider>
      ) : (
        <div className="flex flex-col flex-1">
          <main className="flex-1 overflow-auto bg-gray-50 p-0">
            <Outlet />
          </main>
        </div>
      )}
    </div>
  );
};

export default App;
