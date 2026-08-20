import { Navigate } from "react-router-dom";
import { useAuth } from "../services/AuthContext";

// Guards routes so only logged-in staff can reach the dashboard (RBAC enforcement starts here)
export default function ProtectedRoute({ children }) {
  const { staff } = useAuth();
  if (!staff) {
    return <Navigate to="/login" replace />;
  }
  return children;
}
