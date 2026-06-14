"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import {
  createUserWithEmailAndPassword,
  sendEmailVerification,
  signInWithPopup,
  updateProfile,
} from "firebase/auth";

import { Button } from "@/src/components/ui/Button";
import { Input } from "@/src/components/ui/Input";
import { routes } from "@/src/constants/routes";
import { auth, googleProvider } from "@/src/lib/firebase";

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleRegister(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setMessage(null);
    setIsSubmitting(true);

    try {
      const credential = await createUserWithEmailAndPassword(auth, email, password);

      if (name.trim()) {
        await updateProfile(credential.user, {
          displayName: name.trim(),
        });
      }

      await sendEmailVerification(credential.user);
      setMessage("Account created successfully. Please check your email to verify your account.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to create account.");
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

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-6 py-12 text-slate-700 dark:bg-slate-900 dark:text-slate-200">
      <section className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-700 dark:bg-slate-800 sm:p-8">
        <p className="text-sm font-semibold text-indigo-700 dark:text-indigo-300">
          DevPilot
        </p>
        <h1 className="mt-3 text-2xl font-bold text-slate-900 dark:text-slate-100">
          Create your workspace
        </h1>
        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
          Create your account, then verify your email before logging in.
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
        <form className="mt-6 space-y-4" onSubmit={handleRegister}>
          <Input
            label="Name"
            placeholder="Your name"
            value={name}
            onChange={(event) => setName(event.target.value)}
            required
          />
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
            placeholder="Create a password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            minLength={6}
            required
          />
          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? "Creating account..." : "Register"}
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
          Already have an account?{" "}
          <Link href={routes.login} className="font-semibold text-indigo-700 dark:text-indigo-300">
            Login
          </Link>
        </p>
      </section>
    </main>
  );
}
