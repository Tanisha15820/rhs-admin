import { Navigate, Outlet, useLocation } from "react-router-dom";
import { isAuthenticated } from "../utils/auth";

const ProtectedRoute = () => {
  const location = useLocation();
  const authed = isAuthenticated();

  if (!authed) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
