import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

import { clearTokens, getRefreshToken, setAccessToken, setRefreshToken } from "@/lib/api";
import { endpoints } from "@/lib/endpoints";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [team, setTeam] = useState(null);
  const [ready, setReady] = useState(false);
  const [signedIn, setSignedIn] = useState(false);
  const navigate = useNavigate();
  const hasBooted = useRef(false);
  const isMounted = useRef(true);

  // Reflects real mount status. Under StrictMode this effect also runs
  // mount->cleanup->mount, but synchronously — so isMounted.current is
  // back to true well before any async work below resolves. It only
  // stays false if the component genuinely unmounts.
  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);

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
    if (hasBooted.current) return;
    hasBooted.current = true;

    const boot = async () => {
      if (!getRefreshToken()) {
        if (isMounted.current) setReady(true);
        return;
      }
      await refreshTeam();
      if (isMounted.current) setReady(true);
    };
    void boot();
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