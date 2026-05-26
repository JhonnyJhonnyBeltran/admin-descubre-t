import { useState } from "react";

const AUTH_KEY = "cpifp_admin_auth";

export function useAuth() {
  const [session, setSession] = useState<boolean>(() => {
    if (typeof window === "undefined") return false;
    return localStorage.getItem(AUTH_KEY) === "1";
  });

  function signIn(username: string, password: string): boolean {
    if (username.trim() === "cpifp" && password.trim() === "cpifparenal") {
      localStorage.setItem(AUTH_KEY, "1");
      setSession(true);
      return true;
    }
    return false;
  }

  function signOut() {
    localStorage.removeItem(AUTH_KEY);
    setSession(false);
  }

  return {
    session,
    loading: false,
    user: session ? { username: "cpifp" } : null,
    signIn,
    signOut,
  };
}
