import './App.css'
import { Outlet } from "react-router-dom";
import Navbar from './components/NavBar';
import { useAuth } from './Hooks/auth';
import Sidebar from './components/SideBar';

const App = () => {
  const { user } = useAuth();



  return (
    <div className="flex h-screen w-screen ">
      {user && <Sidebar />}

      <div className="flex flex-col flex-1">
        {user && <Navbar />}
        <main className="flex-1 overflow-auto bg-gray-50 p-0">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default App;
