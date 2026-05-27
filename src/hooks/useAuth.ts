import { useEffect, useState } from "react";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import type { User } from "@supabase/supabase-js";

export function useAuth() {
  const [session, setSession] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") {
      setLoading(false);
      return;
    }

    let mounted = true;
    supabase.auth.getSession().then(({ data }) => {
      if (!mounted) return;
      const s = data.session;
      setSession(Boolean(s));
      setUser(s?.user ?? null);
      setLoading(false);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(Boolean(session));
      setUser(session?.user ?? null);
    });

    return () => {
      mounted = false;
      // unsubscribe listener when available
      listener?.subscription?.unsubscribe?.();
    };
  }, []);

  async function signIn(email: string, password: string): Promise<boolean> {
    if (!isSupabaseConfigured) return false;
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return error ? false : true;
  }

  async function signOut() {
    await supabase.auth.signOut();
    setSession(false);
    setUser(null);
  }

  return {
    session,
    loading,
    user,
    signIn,
    signOut,
  };
}
