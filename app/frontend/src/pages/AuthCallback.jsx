
import React, { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useApp } from "@/context/AppContext";
import { api } from "@/lib/api";

export const AuthCallback = () => {
  const navigate = useNavigate();
  const { setUser } = useApp();
  const processed = useRef(false);

  useEffect(() => {
    if (processed.current) return;
    processed.current = true;
    const hash = window.location.hash;
    const match = hash.match(/session_id=([^&]+)/);
    const sessionId = match ? match[1] : null;
    (async () => {
      if (sessionId) {
        try {
          // REMINDER: DO NOT HARDCODE THE URL, OR ADD ANY FALLBACKS OR REDIRECT URLS, THIS BREAKS THE AUTH
          const res = await api.post("/auth/session", { session_id: sessionId });
          setUser(res.data);
        } catch (e) { /* ignore */ }
      }
      navigate("/account", { replace: true });
    })();
  }, [navigate, setUser]);

  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="w-10 h-10 border-2 border-slate-900 border-t-transparent rounded-full animate-spin" />
    </div>
  );
};
