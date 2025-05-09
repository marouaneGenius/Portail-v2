// src/components/Navbar.tsx
import { Link } from "react-router-dom";
import { useAuth } from "../Hooks/auth";
import { HiLogout } from "react-icons/hi";

const Navbar: React.FC = () => {
  const { user, logout } = useAuth();

  return (
    <nav className="bg-white shadow-md p-4 flex justify-between">
      <div className="flex items-center space-x-4">
        <Link to="/dashboard" className="font-bold text-lg">
          {/* Admin */}
          <span >Bonjour {user?.firstname}</span>

        </Link>
        {/* <Link to="/dashboard/students" className="text-gray-600 hover:text-gray-800">
          Étudiants
        </Link>
        <Link to="/dashboard/sessions" className="text-gray-600 hover:text-gray-800">
          Séances
        </Link> */}
      </div>
      <div className="flex items-center space-x-3">
        <button
          onClick={() => logout()}
          className="flex items-center space-x-1 text-red-500 hover:text-red-700"
        > Déconnexion
          <HiLogout className="h-5 w-5" />
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
