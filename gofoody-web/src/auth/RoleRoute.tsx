import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from './AuthContext';

interface RoleRouteProps {
  requiredRole: 'ADMIN' | 'CUSTOMER';
  redirectTo?: string;
}

const RoleRoute = ({ requiredRole, redirectTo = '/' }: RoleRouteProps) => {
  const { isAuthenticated, isAdmin, isCustomer } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (requiredRole === 'ADMIN' && !isAdmin) {
    return <Navigate to={redirectTo} replace />;
  }

  if (requiredRole === 'CUSTOMER' && !isCustomer) {
    return <Navigate to={redirectTo} replace />;
  }

  return <Outlet />;
};

export default RoleRoute;
