import { useSelector } from "react-redux";
import { Navigate, Outlet } from "react-router-dom";

// Usage: <PrivateRoute /> or <PrivateRoute roles={['admin']} />
export default function PrivateRoute({ roles }) {
  const { isAuthenticated, user } = useSelector((state) => state.auth);

  if (!isAuthenticated) return <Navigate to="/login" replace />;

  if (roles && !roles.includes(user?.role)) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}
