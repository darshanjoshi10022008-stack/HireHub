import React from "react";
import { useNavigate } from "react-router-dom";
import { GoogleLogin } from "@react-oauth/google";
import { authApi } from "./api";
import { useAuth } from "./context/AuthContext";

function GoogleLoginButton({ role = "student" }) {
  const navigate = useNavigate();
  const { googleAuth } = useAuth();

  const handleGoogleSuccess = async (response) => {
    try {
      const data = await authApi.googleLogin({
        credential: response.credential,
        role,
      });

      if (!data.success) {
        throw new Error(data.message || "Google authentication failed");
      }

      if (googleAuth) {
        googleAuth(data);
      }

      // Navigate to corresponding dashboard based on user role
      if (data.user?.role === "admin") {
        navigate("/admin/dashboard", { replace: true });
      } else if (data.user?.role === "recruiter") {
        navigate("/recruiter/dashboard", { replace: true });
      } else {
        navigate("/candidate/dashboard", { replace: true });
      }
    } catch (error) {
      console.error("Google login error:", error);
      alert(error.message || "Google login failed. Please try again.");
    }
  };

  return (
    <div>
      <GoogleLogin
        onSuccess={handleGoogleSuccess}
        onError={() => alert("Google sign-in could not be completed.")}
        text="continue_with"
        shape="rectangular"
        width="200"
      />
    </div>
  );
}

export default GoogleLoginButton;
