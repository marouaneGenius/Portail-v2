import { createBrowserRouter, Navigate } from "react-router-dom";
import ProtectedRoute from "./protectedRoutes";
import Dashboard from "../pages/Dashboard";
import Home from "../pages/Home";
import Login from "../pages/auth/login";
import DefaultRedirect from "../components/DefaultRedirect";
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
import { Planing } from "../pages/Planing";
import Planning from "../pages/Planning";
import SubscriptionsFormView from "../components/subscriptions/views/SubscriptionFormsView";
import ContractGenerator from "../components/subscriptions/ContractGenerator";
import StudentSubscriptions from "../pages/StudentSubscriptions";
import SessionCalendar from "@/pages/SessionCalendar";
import Tutors from "../pages/Tutors";
import HistoriqueModifications from "@/pages/HistoriqueModifications";
import ParentDashboard from "../pages/ParentDashboard";
import ParentProtectedRoute from "./ParentProtectedRoute";
import PaymentSuccess from "../pages/PaymentSuccess";
import PaymentCancel from "../pages/PaymentCancel";
import Page404 from "../pages/Page404";
import SmartProtectedRoute from "./SmartProtectedRoute";

export const router = createBrowserRouter([
    {
      element: <App />,
      children: [
        // Routes publiques (sans authentification)
        { path: "/", element: <DefaultRedirect /> },
        { path: "/login", element: <Login /> },
        { path: "/payment/success", element: <PaymentSuccess /> },
        { path: "/payment/cancel", element: <PaymentCancel /> },
        
        // Toutes les routes avec gestion intelligente 404
        {
          element: <SmartProtectedRoute />,  
          children: [
            { path: "/home", element: <Home /> },
            {
              element: <ParentProtectedRoute />,
              children: [
                { path: "/dashboard", element: <Dashboard /> },
                { path: "/profile", element: <Profile /> },
                { path: "/centers", element: <Centers /> },
                { path: "/sessions/:id", element: <Sessions /> },
                { path: "/users", element: <Users /> },
                { path: "/students", element: <Students /> },
                { path: "/abonnements/:id", element: <Subscriptions /> },
                { path: '/parents', element: <Parents /> },
                { path: '/form/:resource/:id?', element: <CreationForm /> },
                { path: '/studentDetails/:id', element: <StudentDetails />},
                { path: '/planing', element: <Planing/>},
                { path: '/planning', element: <Planning/>},
                { path: '/subscriptions/:id', element: <SubscriptionsFormView/>},
                { path: '/contract/:id/:student/:combined?', element: <ContractGenerator/>},
                { path: '/student/subscriptions/:id', element: <StudentSubscriptions/>},
                { path: "/session-calendar", element: <SessionCalendar /> },
                { path: "/tutors", element: <Tutors /> },
                { path: "/historique", element: <HistoriqueModifications /> },
                { path: "/parent-dashboard", element: <ParentDashboard /> },
                // Routes génériques à la fin
                { path: '/:resource/:id', element: <ItemDetails /> },
                { path: '/:resource/:id/edit', element: <EditionForm /> },
              ],
            },
          ],
        },
        
        // Route 404 de fallback (ne devrait jamais être atteinte avec SmartProtectedRoute)
        { path: "*", element: <Page404 /> },
      ],
    },
  ]);
  