import { createBrowserRouter, Navigate } from "react-router-dom";
import RootLayout from "../layouts/RootLayout";
import HomePage from "../pages/HomePage";
import Cart from "../pages/Cart";
import Admin from "../pages/Admin";
import AdminLogin from "../components/AdminLogin";
import FlowerDetail from "../pages/FlowerDetail";
import LoginPage from "../pages/LoginPage";
import FavoritesPage from "../pages/FavoritesPage";
import OrderSuccess from "../pages/OrderSuccess";
import { useAuth } from "../contexts/AuthContext";
import { useAdminAuth } from "../contexts/AdminAuthContext";

// Protected Route for regular users
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user } = useAuth();
  return user ? <>{children}</> : <Navigate to="/login" />;
};

// Protected Route for admin users
const AdminProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, loading } = useAdminAuth();
  
  if (loading) {
    return <div>Loading...</div>; // Or a proper loading spinner
  }
  
  return isAuthenticated ? <>{children}</> : <Navigate to="/admin-login" />;
};

export const router = createBrowserRouter([
  {
    path: "/",
    element: <RootLayout />,
    children: [
      {
        index: true,
        element: <HomePage />,
      },
      {
        path: "/cart",
        element: <Cart />,
      },
      {
        path: "/order-success",
        element: <OrderSuccess />,
      },
    ],
  },
  {
    path: "/login",
    element: <LoginPage />,
  },
  {
    path: "/favorites",
    element: (
      <ProtectedRoute>
        <FavoritesPage />
      </ProtectedRoute>
    ),
  },
  {
    path: "/admin-login",
    element: <AdminLogin />,
  },
  {
    path: "/admin",
    element: (
      <AdminProtectedRoute>
        <Admin />
      </AdminProtectedRoute>
    ),
  },
  {
    path: "/flowers/:id",
    element: <FlowerDetail />,
  },
]);
