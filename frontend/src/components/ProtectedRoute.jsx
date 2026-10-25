import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import LoadingSpinner from "./LoadingSpinner";

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "60vh" }}>
        <LoadingSpinner text="Checking authentication status..." />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Prevent unverified users from accessing authenticated application features
  if (!user.isEmailVerified) {
    return (
      <Navigate
        to="/resend-verification"
        state={{
          unverified: true,
          email: user.email,
          from: location.pathname,
        }}
        replace
      />
    );
  }

  if (allowedRoles && allowedRoles.length > 0) {
    // Normalize role: student and candidate are equivalent
    const normalizedUserRole = user.role === "student" ? "candidate" : user.role;
    const normalizedAllowed = allowedRoles.map((r) => (r === "student" ? "candidate" : r));

    if (!normalizedAllowed.includes(normalizedUserRole)) {
      return <Navigate to="/unauthorized" replace />;
    }
  }

  return children;
};

export default ProtectedRoute;
