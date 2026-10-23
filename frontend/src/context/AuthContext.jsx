import { createContext, useContext, useEffect, useState } from 'react';
import { api, getToken, setToken } from '../api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(!!getToken());

  // Si hay un token guardado, se recupera la sesión al recargar la página
  useEffect(() => {
    if (!getToken()) return;
    api('/auth/me')
      .then(setUser)
      .catch(() => setToken(null))
      .finally(() => setLoading(false));
  }, []);

  const handleSession = ({ token, user }) => {
    setToken(token);
    setUser(user);
    return user;
  };

  const value = {
    user,
    loading,
    isStaff: user?.rol === 'admin' || user?.rol === 'empleado',
    login: (email, password) => api('/auth/login', { method: 'POST', body: { email, password } }).then(handleSession),
    register: (data) => api('/auth/register', { method: 'POST', body: data }).then(handleSession),
    logout: () => {
      setToken(null);
      setUser(null);
    },
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);
