import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { getCurrentUser } from '../api/authApi';
import type { AuthResponse, AuthUserDto, CurrentUserDto } from '../api/types';

interface AuthContextValue {
  user: AuthUserDto | null;
  token: string | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isCustomer: boolean;
  loginFromAuthResponse: (res: AuthResponse) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const TOKEN_KEY = 'gofoody_token';

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<AuthUserDto | null>(null);
  const [token, setToken] = useState<string | null>(() => localStorage.getItem(TOKEN_KEY));
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    if (!token) {
      setInitialized(true);
      return;
    }

    const syncUser = async () => {
      try {
        const current: CurrentUserDto = await getCurrentUser();
        setUser({
          id: current.id,
          fullName: current.fullName,
          email: current.email,
          phone: current.phone,
          roles: current.roles,
        });
      } catch {
        // Token không hợp lệ → clear
        localStorage.removeItem(TOKEN_KEY);
        setToken(null);
        setUser(null);
      } finally {
        setInitialized(true);
      }
    };

    syncUser();
  }, [token]);

  const loginFromAuthResponse = (res: AuthResponse) => {
    setToken(res.token);
    localStorage.setItem(TOKEN_KEY, res.token);
    setUser(res.user);
  };

  const logout = () => {
    localStorage.removeItem(TOKEN_KEY);
    setToken(null);
    setUser(null);
  };

  const value = useMemo<AuthContextValue>(() => {
    const roles = user?.roles ?? [];
    const isAdmin = roles.includes('ADMIN');
    const isCustomer = roles.includes('CUSTOMER');
    return {
      user,
      token,
      isAuthenticated: !!user && !!token,
      isAdmin,
      isCustomer,
      loginFromAuthResponse,
      logout,
    };
  }, [user, token]);

  if (!initialized) {
    return <div>Đang khởi tạo...</div>;
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return ctx;
}
