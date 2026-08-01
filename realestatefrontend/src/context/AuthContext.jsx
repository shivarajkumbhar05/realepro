import { createContext, useContext, useState, useEffect, useCallback } from "react";
import * as authApi from "../api/auth";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const storedUser = localStorage.getItem("re_user") || localStorage.getItem("user");
    return storedUser ? JSON.parse(storedUser) : null;
  });

  const [loading, setLoading] = useState(true);

  const setAuthUser = useCallback((nextUser) => {
    setUser(nextUser);

    if (nextUser) {
      localStorage.setItem("re_user", JSON.stringify(nextUser));
      localStorage.setItem("user", JSON.stringify(nextUser));
    } else {
      localStorage.removeItem("re_user");
      localStorage.removeItem("user");
    }
  }, []);

  // ================= LOGIN =================

  const login = async (credentials) => {
    const { data } = await authApi.login(credentials);

    localStorage.setItem("re_token", data.token);
    localStorage.setItem("token", data.token);

    setAuthUser(data.user);

    return data;
  };

  // ============== OLD REGISTER ==============
  // (Still available if you want normal registration)

  const register = async (payload) => {
    const { data } = await authApi.register(payload);

    localStorage.setItem("re_token", data.token);
    localStorage.setItem("token", data.token);

    setAuthUser(data.user);

    return data;
  };

  // ============== LOGOUT ====================

  const logout = useCallback(async () => {
    try {
      await authApi.logout();
    } catch (err) {}

    localStorage.removeItem("re_token");
    localStorage.removeItem("token");

    setAuthUser(null);
  }, [setAuthUser]);

  // ============== REFRESH USER ==============

  const refreshUser = useCallback(async () => {
    try {
      const token = localStorage.getItem("re_token");

      if (!token) {
        setLoading(false);
        return;
      }

      const { data } = await authApi.getMe();

      setAuthUser(data.data);
    } catch (err) {
      logout();
    } finally {
      setLoading(false);
    }
  }, [logout, setAuthUser]);

  useEffect(() => {
    refreshUser();
  }, [refreshUser]);

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        logout,
        refreshUser,
        setAuthUser,

        isAdmin: user?.role === "admin",
        isAgent: user?.role === "agent",
        isBuyer: user?.role === "buyer",
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error(
      "useAuth must be used within AuthProvider"
    );
  }

  return context;
};