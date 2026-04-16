import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { authApi, setAuthToken } from "../services/api";

const AuthContext = createContext(null);
const STORAGE_KEY = "eventmitra-auth";

export function AuthProvider({ children }) {
  const [authState, setAuthState] = useState(() => {
    const savedState = localStorage.getItem(STORAGE_KEY);
    return savedState ? JSON.parse(savedState) : { token: null, user: null };
  });
  const [isBootstrapping, setIsBootstrapping] = useState(Boolean(authState.token));

  useEffect(() => {
    if (authState.token) {
      setAuthToken(authState.token);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(authState));
    } else {
      setAuthToken(null);
      localStorage.removeItem(STORAGE_KEY);
    }
  }, [authState]);

  useEffect(() => {
    const bootstrapSession = async () => {
      if (!authState.token) {
        setIsBootstrapping(false);
        return;
      }

      try {
        const response = await authApi.getProfile();
        setAuthState((previous) => ({
          ...previous,
          user: response.data.data,
        }));
      } catch (error) {
        setAuthState({ token: null, user: null });
      } finally {
        setIsBootstrapping(false);
      }
    };

    bootstrapSession();
  }, [authState.token]);

  const value = useMemo(
    () => ({
      token: authState.token,
      user: authState.user,
      isAuthenticated: Boolean(authState.token && authState.user),
      isBootstrapping,
      login: (payload) => {
        setAuthToken(payload.token);
        setAuthState(payload);
      },
      logout: () => {
        setAuthToken(null);
        setAuthState({ token: null, user: null });
      },
      updateUser: (user) =>
        setAuthState((previous) => ({
          ...previous,
          user,
        })),
    }),
    [authState, isBootstrapping]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider.");
  }

  return context;
};
