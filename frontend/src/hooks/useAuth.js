import { useState } from 'react';
import { apiRequest } from '../services/api';
import { useLocalStorage } from './useLocalStorage';

const DEMO_USERS = {
  'admin@kidszone.edu': { id: 'demo-admin', nombre: 'Dirección General', email: 'admin@kidszone.edu', role: 'admin' },
  'docente@kidszone.edu': { id: 'demo-doc', nombre: 'Prof. Mariana Ruiz', email: 'docente@kidszone.edu', role: 'docente' },
  'padre@kidszone.edu': { id: 'demo-pad', nombre: 'Laura Gómez', email: 'padre@kidszone.edu', role: 'padre' },
};

export function useAuth() {
  const [user, setUser] = useLocalStorage('kz_user', null);
  const [authError, setAuthError] = useState('');
  const [loading, setLoading] = useState(false);

  const login = async (email, password) => {
    setLoading(true);
    setAuthError('');
    try {
      const data = await apiRequest('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });
      localStorage.setItem('kz_token', data.token);
      setUser(data.user);
      return true;
    } catch (error) {
      const demo = DEMO_USERS[String(email).toLowerCase()];
      if (demo && password === '123456') {
        localStorage.setItem('kz_token', 'demo-jwt-token');
        setUser(demo);
        return true;
      }
      setAuthError(error.message || 'Credenciales inválidas');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const register = async ({ nombre, email, password, role }) => {
    setLoading(true);
    setAuthError('');
    try {
      const data = await apiRequest('/auth/register', {
        method: 'POST',
        body: JSON.stringify({ nombre, email, password, role }),
      });
      localStorage.setItem('kz_token', data.token);
      setUser(data.user);
      return true;
    } catch (error) {
      if (String(error.message).includes('Failed to fetch')) {
        const localUser = { id: `local-${Date.now()}`, nombre, email, role };
        localStorage.setItem('kz_token', 'demo-jwt-token');
        setUser(localUser);
        return true;
      }
      setAuthError(error.message);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const switchDemoRole = (role) => {
    const map = { admin: 'admin@kidszone.edu', docente: 'docente@kidszone.edu', padre: 'padre@kidszone.edu' };
    setUser(DEMO_USERS[map[role]]);
  };

  const logout = () => {
    localStorage.removeItem('kz_token');
    localStorage.removeItem('token');
    setUser(null);
  };

  return { user, authError, loading, login, register, switchDemoRole, logout };
}
