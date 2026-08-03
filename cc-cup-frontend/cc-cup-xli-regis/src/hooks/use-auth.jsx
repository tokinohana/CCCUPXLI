import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import { clearTokens, getRefreshToken, setAccessToken, setRefreshToken } from "@/lib/api";
import { endpoints } from "@/lib/endpoints";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [team, setTeam] = useState(null);
  const [ready, setReady] = useState(false);
  const [signedIn, setSignedIn] = useState(false);
  const navigate = useNavigate();

  const refreshTeam = useCallback(async () => {
    try {
      const next = await endpoints.dashboard();
      setTeam(next);
      setSignedIn(true);
      return next;
    } catch {
      setTeam(null);
      setSignedIn(false);
      return null;
    }
  }, []);

  // Restore the session from the persisted refresh token on first load.
  useEffect(() => {
    let active = true;
    const boot = async () => {
      if (!getRefreshToken()) {
        if (active) setReady(true);
        return;
      }
      await refreshTeam();
      if (active) setReady(true);
    };
    void boot();
    return () => {
      active = false;
    };
  }, [refreshTeam]);

  const applyAuth = useCallback((payload) => {
    setAccessToken(payload.access);
    setRefreshToken(payload.refresh);
    setTeam(payload.team);
    setSignedIn(true);
    setReady(true);
  }, []);

  const signOut = useCallback(async () => {
    const refresh = getRefreshToken();
    if (refresh) {
      try {
        await endpoints.logout(refresh);
      } catch {
        // Ignore — clearing local tokens is what matters for the user.
      }
    }
    clearTokens();
    setTeam(null);
    setSignedIn(false);
    navigate("/masuk");
  }, [navigate]);

  const value = useMemo(
    () => ({ team, ready, signedIn, applyAuth, setTeam, refreshTeam, signOut }),
    [team, ready, signedIn, applyAuth, refreshTeam, signOut]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used inside <AuthProvider>");
  }
  return context;
}