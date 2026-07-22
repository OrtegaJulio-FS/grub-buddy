import { createContext, useCallback, useEffect, useState } from 'react';
import { getCurrentUser, login as apiLogin, logout as apiLogout, signup as apiSignup } from '../api/auth';

export const AuthContext = createContext(null);

// Loads the current session (if any) once on app start via GET /auth/me,
// which succeeds only if the browser is sending a valid httpOnly auth
// cookie. `loading` covers that initial check - consumers should wait for
// it before deciding whether to redirect to /login.
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const refetchUser = useCallback(async () => {
    try {
      setUser(await getCurrentUser());
    } catch {
      setUser(null);
    }
  }, []);

  useEffect(() => {
    refetchUser().finally(() => setLoading(false));
  }, [refetchUser]);

  async function login(credentials) {
    const { user: loggedInUser } = await apiLogin(credentials);
    setUser(loggedInUser);
    return loggedInUser;
  }

  async function signup(details) {
    const { user: newUser } = await apiSignup(details);
    setUser(newUser);
    return newUser;
  }

  async function logout() {
    await apiLogout();
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, signup, logout, refetchUser }}>
      {children}
    </AuthContext.Provider>
  );
}
