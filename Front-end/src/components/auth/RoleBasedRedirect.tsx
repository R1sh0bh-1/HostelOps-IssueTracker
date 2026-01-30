import { Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

/**
 * Redirects users based on their role:
 * - Management/Warden users go to /management
 * - Students and others go to /dashboard
 */
export function RoleBasedRedirect() {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  // Management/Warden users go directly to management dashboard
  if (user.role === 'management' || user.role === 'warden') {
    return <Navigate to="/management" replace />;
  }

  // All other users go to the student dashboard
  return <Navigate to="/dashboard" replace />;
}
