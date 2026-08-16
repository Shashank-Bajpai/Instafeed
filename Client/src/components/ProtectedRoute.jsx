import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

// Wrap any page with this to require login first.
// Usage: <ProtectedRoute><Home /></ProtectedRoute>
export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) return <p>Loading...</p>; // wait until we've checked localStorage

  if (!user) return <Navigate to="/login" replace />;

  return children;
}