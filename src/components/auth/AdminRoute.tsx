import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { UserRole } from '@/types/user';

interface AdminRouteProps {
  children: React.ReactNode;
}

const AdminRoute: React.FC<AdminRouteProps> = ({ children }) => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div>Loading application...</div>
      </div>
    );
  }

  if (!user || user.role !== UserRole.ADMIN) {
    // Redirect them to the home page if they are not an admin.
    // You could also show a 403 Forbidden page.
    return <Navigate to="/" replace />;
  }

  return children;
};

export default AdminRoute;
