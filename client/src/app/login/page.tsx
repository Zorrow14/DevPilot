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
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-6 py-12 text-slate-700 dark:bg-slate-900 dark:text-slate-200">
      <section className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-700 dark:bg-slate-800 sm:p-8">
        <p className="text-sm font-semibold text-indigo-700 dark:text-indigo-300">
          DevPilot
        </p>
        <h1 className="mt-3 text-2xl font-bold text-slate-900 dark:text-slate-100">
          Welcome back
        </h1>
        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
          Sign in with your verified email address or continue with Google.
        </p>
        {message ? (
          <p className="mt-5 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-200">
            {message}
          </p>
        ) : null}
        {error ? (
          <p className="mt-5 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-200">
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
              className="text-sm font-semibold text-indigo-700 hover:text-indigo-800 dark:text-indigo-300"
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
        <p className="mt-6 text-center text-sm text-slate-500 dark:text-slate-400">
          New to DevPilot?{" "}
          <Link href={routes.register} className="font-semibold text-indigo-700 dark:text-indigo-300">
            Create an account
          </Link>
        </p>
      </section>
    </main>
  );
}
