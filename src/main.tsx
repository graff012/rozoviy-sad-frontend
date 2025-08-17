import React from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import { RouterProvider } from 'react-router-dom';
import { router } from './routes/Router';
import { AuthProvider } from './contexts/AuthContext';
import { AdminAuthProvider } from './contexts/AdminAuthContext';
import { CartProvider } from './contexts/CartContext';
import { OrdersProvider } from './contexts/OrdersContext';

createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <AuthProvider>
      <AdminAuthProvider>
        <CartProvider>
          <OrdersProvider>
            <RouterProvider router={router} />
          </OrdersProvider>
        </CartProvider>
      </AdminAuthProvider>
    </AuthProvider>
  </React.StrictMode>
);
