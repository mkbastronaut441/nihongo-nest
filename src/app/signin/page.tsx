"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { getProviders, signIn, type ClientSafeProvider } from "next-auth/react";
import { ArrowLeft, Mail, Sparkles } from "lucide-react";
import { Button, Card } from "@/components/ui";
import { Mascot } from "@/components/mascot";

export default function SignInPage() {
  const [providers, setProviders] = useState<Record<string, ClientSafeProvider> | null>(null);
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let active = true;
    const fallback = window.setTimeout(() => {
      if (active) setProviders({});
    }, 5000);

    void getProviders()
      .then((available) => {
        if (active) setProviders(available ?? {});
      })
      .catch(() => {
        if (active) setProviders({});
      })
      .finally(() => window.clearTimeout(fallback));

    return () => {
      active = false;
      window.clearTimeout(fallback);
    };
  }, []);

  const sendMagicLink = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!providers?.email) return;
    setBusy(true);
    setMessage("");
    const result = await signIn("email", { email, callbackUrl: "/dashboard", redirect: false });
    setBusy(false);
    setMessage(
      result?.ok
        ? "Check your inbox for a sign-in link."
        : "We couldn’t send that link. Please try again.",
    );
  };

  return (
    <main id="main-content" className="onboarding-page">
      <Card className="signin-card">
        <Link href="/onboarding" className="back-link">
          <ArrowLeft size={17} /> Back to your nest
        </Link>
        <div className="signin-identity">
          <Mascot mood="happy" compact />
        </div>
        <span className="eyebrow">PICK UP WHERE YOU LEFT OFF</span>
        <h1>Welcome back to your nest</h1>
        <p className="onboarding-lead">
          Save your cozy corner and bring your guest preferences along when you sign in.
        </p>
        {providers?.google && (
          <Button
            className="signin-provider"
            variant="secondary"
            size="large"
            onClick={() => signIn("google", { callbackUrl: "/dashboard" })}
          >
            Continue with Google
          </Button>
        )}
        {providers?.email && (
          <>
            <div className="signin-divider">
              <span>or use your email</span>
            </div>
            <form className="signin-form" onSubmit={sendMagicLink}>
              <label htmlFor="signin-email">Email address</label>
              <div className="signin-email-input">
                <Mail size={17} />
                <input
                  autoComplete="email"
                  id="signin-email"
                  type="email"
                  required
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="you@example.com"
                />
              </div>
              <Button disabled={busy} size="large" type="submit">
                {busy ? "Sending a little note…" : "Send me a sign-in link"}
                <Sparkles size={17} />
              </Button>
            </form>
          </>
        )}
        {!providers && <p className="signin-status">Preparing the sign-in options…</p>}
        {providers && !providers.google && !providers.email && (
          <p className="signin-status">
            Sign-in isn’t configured yet. Add Google or email credentials to `.env` to enable it.
          </p>
        )}
        {message && (
          <p className="signin-status" role="status">
            {message}
          </p>
        )}
        <div className="signin-guest">
          <p>You can keep exploring as a guest. Your age mode and goal are saved on this device.</p>
          <Link href="/dashboard">
            <Button variant="quiet">
              Continue as a guest <ArrowLeft className="guest-arrow" size={16} />
            </Button>
          </Link>
        </div>
      </Card>
    </main>
  );
}
