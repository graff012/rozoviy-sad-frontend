import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { ReactNode } from 'react';

interface AdminAuthContextType {
  isAuthenticated: boolean;
  login: (token: string, onSuccess: () => void) => void;
  logout: (onSuccess: () => void) => void;
  loading: boolean;
}

const AdminAuthContext = createContext<AdminAuthContextType | null>(null);

export const AdminAuthProvider = ({ children }: { children: ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);

  // Check authentication status on initial load
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = sessionStorage.getItem('adminToken');
        if (token) {
          // You might want to validate the token with the server here
          setIsAuthenticated(true);
        }
      } catch (error) {
        console.error('Auth check failed:', error);
        setIsAuthenticated(false);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = useCallback(async (token: string, onSuccess: () => void) => {
    try {
      setLoading(true);
      // Store the token in session storage
      sessionStorage.setItem('adminToken', token);
      sessionStorage.setItem('adminLoginSuccess', 'true');
      
      // Set authenticated state
      setIsAuthenticated(true);
      
      // Call the success callback
      onSuccess();
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback((onSuccess: () => void) => {
    try {
      // Clear auth data from storage
      sessionStorage.removeItem('adminToken');
      sessionStorage.removeItem('adminLoginSuccess');
      
      // Update state
      setIsAuthenticated(false);
      
      // Call the success callback
      onSuccess();
    } catch (error) {
      console.error('Logout failed:', error);
      throw error;
    }
  }, []);

  return (
    <AdminAuthContext.Provider 
      value={{ 
        isAuthenticated, 
        login, 
        logout, 
        loading 
      }}
    >
      {children}
    </AdminAuthContext.Provider>
  );
};

export const useAdminAuth = () => {
  const context = useContext(AdminAuthContext);
  if (!context) {
    throw new Error('useAdminAuth must be used within an AdminAuthProvider');
  }
  return context;
};
