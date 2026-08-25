"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import {
  createUserWithEmailAndPassword,
  sendEmailVerification,
  signInWithPopup,
  signOut,
  updateProfile,
} from "firebase/auth";

import { Button } from "@/src/components/ui/Button";
import { Card } from "@/src/components/ui/Card";
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

      // createUserWithEmailAndPassword signs the account in immediately. The login
      // page refuses unverified accounts, so sign back out to match it rather than
      // leaving the user silently authenticated behind the "check your email" notice.
      await signOut(auth);

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
    <main className="flex min-h-screen items-center justify-center bg-panel px-6 py-12 text-ink">
      <Card className="w-full max-w-md sm:p-8">
        <p className="font-display text-xs font-bold uppercase tracking-wider text-beacon">
          DevPilot
        </p>
        <h1 className="mt-3 text-2xl font-bold text-ink">Create your workspace</h1>
        <p className="mt-2 text-sm text-ink-dim">
          Create your account, then verify your email before logging in.
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
        <p className="mt-6 text-center text-sm text-ink-dim">
          Already have an account?{" "}
          <Link href={routes.login} className="font-semibold text-beacon">
            Login
          </Link>
        </p>
      </Card>
    </main>
  );
}
