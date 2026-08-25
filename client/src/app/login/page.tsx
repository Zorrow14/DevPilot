"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import {
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
} from "firebase/auth";

import { Button } from "@/src/components/ui/Button";
import { Card } from "@/src/components/ui/Card";
import { Input } from "@/src/components/ui/Input";
import { routes } from "@/src/constants/routes";
import { auth, googleProvider } from "@/src/lib/firebase";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setMessage(null);
    setIsSubmitting(true);

    try {
      const credential = await signInWithEmailAndPassword(auth, email, password);

      if (!credential.user.emailVerified) {
        await signOut(auth);
        setError("Please verify your email before continuing.");
        return;
      }

      router.push(routes.dashboard);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to login.");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleGoogleLogin() {
    setError(null);
    setMessage(null);
    setIsSubmitting(true);

    try {
      await signInWithPopup(auth, googleProvider);
      router.push(routes.dashboard);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to continue with Google.");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handlePasswordReset() {
    setError(null);
    setMessage(null);

    if (!email) {
      setError("Enter your email address before requesting a password reset.");
      return;
    }

    setIsSubmitting(true);

    try {
      await sendPasswordResetEmail(auth, email);
      setMessage("Password reset email sent. Please check your inbox.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to send password reset email.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-panel px-6 py-12 text-ink">
      <Card className="w-full max-w-md sm:p-8">
        <p className="font-display text-xs font-bold uppercase tracking-wider text-beacon">
          DevPilot
        </p>
        <h1 className="mt-3 text-2xl font-bold text-ink">Welcome back</h1>
        <p className="mt-2 text-sm text-ink-dim">
          Sign in with your verified email address or continue with Google.
        </p>
        {message ? (
          <p className="mt-5 rounded-bezel border border-nominal-dim bg-nominal-dim/20 px-4 py-3 text-sm text-nominal">
            {message}
          </p>
        ) : null}
        {error ? (
          <p className="mt-5 rounded-bezel border border-alert-dim bg-alert-dim/20 px-4 py-3 text-sm text-alert">
            {error}
          </p>
        ) : null}
        <form className="mt-6 space-y-4" onSubmit={handleLogin}>
          <Input
            label="Email"
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
          />
          <Input
            label="Password"
            type="password"
            placeholder="Password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
          />
          <div className="flex justify-end">
            <button
              type="button"
              className="text-sm font-semibold text-beacon hover:brightness-110"
              onClick={handlePasswordReset}
              disabled={isSubmitting}
            >
              Forgot password?
            </button>
          </div>
          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? "Logging in..." : "Login"}
          </Button>
          <Button
            type="button"
            variant="secondary"
            className="w-full"
            disabled={isSubmitting}
            onClick={handleGoogleLogin}
          >
            Continue with Google
          </Button>
        </form>
        <p className="mt-6 text-center text-sm text-ink-dim">
          New to DevPilot?{" "}
          <Link href={routes.register} className="font-semibold text-beacon">
            Create an account
          </Link>
        </p>
      </Card>
    </main>
  );
}
