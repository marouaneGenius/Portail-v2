import { createBrowserRouter } from "react-router-dom";
import ProtectedRoute from "./protectedRoutes";
import Dashboard from "../pages/Dashboard";
import Home from "../pages/Home";
import Login from "../pages/auth/login";
import App from "../App";
import Profile from "../pages/Profile";
import Centers from "../pages/Centers";
import Sessions from "../pages/Sessions";
import Users from "../pages/Users";
import Students from "../pages/Students";

export const router = createBrowserRouter([
    {
      element: <App />,
      children: [
        { path: "/", element: <Home /> },
        { path: "/login", element: <Login /> },
        {
          element: <ProtectedRoute />,  
          children: [
            { path: "/dashboard", element: <Dashboard /> },
            { path: "/profile", element: <Profile /> },
            { path: "/centers", element: <Centers /> },
            { path: "/sessions", element: <Sessions /> },
            { path: "/users", element: <Users /> },
            { path: "/students", element: <Students /> },
          ],
        },
      ],
    },
  ]);
  