"use client";

import { SessionProvider, useSession } from "next-auth/react";
import { useEffect, useRef } from "react";
import { usePreferences } from "@/store/preferences";

function GuestPreferencesMigration() {
  const { status } = useSession();
  const { ageMode, goal } = usePreferences();
  const migratedForSession = useRef(false);

  useEffect(() => {
    if (status !== "authenticated" || migratedForSession.current || !goal) return;
    migratedForSession.current = true;
    void fetch("/api/profile/migrate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ageMode, goal }),
    })
      .then((response) => {
        if (!response.ok) migratedForSession.current = false;
      })
      .catch(() => {
        // Guest preferences stay in local storage so they can be retried next time.
        migratedForSession.current = false;
      });
  }, [ageMode, goal, status]);

  return null;
}

export function AuthSessionProvider({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <GuestPreferencesMigration />
      {children}
    </SessionProvider>
  );
}
