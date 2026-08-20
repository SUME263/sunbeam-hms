import { createContext, useContext, useState } from "react";
import { login as loginApi } from "./api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [staff, setStaff] = useState(() => {
    const stored = localStorage.getItem("staff_info");
    return stored ? JSON.parse(stored) : null;
  });

  const login = async (email, password) => {
    const res = await loginApi(email, password);
    const { access_token, role, full_name } = res.data;

    localStorage.setItem("access_token", access_token);
    const info = { role, full_name };
    localStorage.setItem("staff_info", JSON.stringify(info));
    setStaff(info);
    return info;
  };

  const logout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("staff_info");
    setStaff(null);
  };

  const isAdmin = staff?.role === "Administrator";

  return (
    <AuthContext.Provider value={{ staff, login, logout, isAdmin }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
