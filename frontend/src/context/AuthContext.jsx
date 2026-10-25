import React, { createContext, useContext, useState, useEffect } from "react";
import { authApi } from "../api";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem("hirehubUser");
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  const [token, setToken] = useState(() => localStorage.getItem("hirehubToken") || null);
  const [loading, setLoading] = useState(true);

  // Load and verify current user on mount
  useEffect(() => {
    const initAuth = async () => {
      const savedToken = localStorage.getItem("hirehubToken");
      if (savedToken) {
        try {
          const res = await authApi.getMe();
          if (res.success && res.user) {
            setUser(res.user);
            localStorage.setItem("hirehubUser", JSON.stringify(res.user));
          } else {
            logout();
          }
        } catch (err) {
          console.error("Auth validation notice:", err.message);
          logout();
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const login = async (email, password) => {
    const res = await authApi.login({ email, password });
    if (res.success && res.token) {
      setToken(res.token);
      setUser(res.user);
      localStorage.setItem("hirehubToken", res.token);
      localStorage.setItem("hirehubUser", JSON.stringify(res.user));
    }
    return res;
  };

  const register = async (userData) => {
    const res = await authApi.register(userData);
    if (res.success && res.token) {
      setToken(res.token);
      setUser(res.user);
      localStorage.setItem("hirehubToken", res.token);
      localStorage.setItem("hirehubUser", JSON.stringify(res.user));
    }
    return res;
  };

  const googleAuth = (resData) => {
    if (resData.success && resData.token) {
      setToken(resData.token);
      setUser(resData.user);
      localStorage.setItem("hirehubToken", resData.token);
      localStorage.setItem("hirehubUser", JSON.stringify(resData.user));
    }
  };

  const setAuthData = ({ token, user }) => {
    if (token) {
      setToken(token);
      localStorage.setItem("hirehubToken", token);
    }
    if (user) {
      setUser(user);
      localStorage.setItem("hirehubUser", JSON.stringify(user));
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem("hirehubToken");
    localStorage.removeItem("hirehubUser");
  };

  const refreshUser = async () => {
    try {
      const res = await authApi.getMe();
      if (res.success && res.user) {
        setUser(res.user);
        localStorage.setItem("hirehubUser", JSON.stringify(res.user));
      }
    } catch (err) {
      console.error("Refresh user error:", err);
    }
  };

  const isCandidate = user?.role === "student" || user?.role === "candidate";
  const isRecruiter = user?.role === "recruiter";
  const isAdmin = user?.role === "admin";

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        register,
        googleAuth,
        logout,
        setAuthData,
        refreshUser,
        isCandidate,
        isRecruiter,
        isAdmin,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
