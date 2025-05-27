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
import ItemDetails from "../components/ItemDetails";
import Parents from "../pages/Parents";
import CreationForm from "../components/CreationForm";
import EditionForm from "../components/EditionForm";
import Subscriptions from "../pages/Subscriptions";
import { StudentDetails } from "../pages/studentDetails";
import {Planing} from "../pages/planing";

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
            { path: "/abonnements/:id", element: <Subscriptions /> },
            { path: '/:resource/:id', element: <ItemDetails /> },
            { path: '/parents', element: <Parents /> },
            { path: '/form/:resource/:id?', element: <CreationForm /> },
            { path: '/:resource/:id/edit', element: <EditionForm /> },
            { path: '/studentDetails/:id', element: <StudentDetails />},
            { path: '/planing', element: <Planing/>},

          ],
        },
      ],
    },
  ]);
  