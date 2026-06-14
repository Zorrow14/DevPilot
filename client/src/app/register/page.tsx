import Link from "next/link";
import { Button } from "@/src/components/ui/Button";
import { Input } from "@/src/components/ui/Input";
import { routes } from "@/src/constants/routes";

export default function RegisterPage() {
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
          Registration is a visual placeholder until the auth phase.
        </p>
        <form className="mt-6 space-y-4">
          <Input label="Name" placeholder="Your name" />
          <Input label="Email" type="email" placeholder="you@example.com" />
          <Input label="Password" type="password" placeholder="Create a password" />
          <Button className="w-full">Register</Button>
          <Button variant="secondary" className="w-full">
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
