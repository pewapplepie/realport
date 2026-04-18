"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/components/AuthProvider";

export default function LoginPage() {
  return (
    <Suspense fallback={<AuthShell title="Sign In" subtitle="Real Estate Portfolio Investment Platform" />}>
      <LoginContent />
    </Suspense>
  );
}

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login } = useAuth();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const defaultEmail = searchParams.get("email") ?? "";
  const defaultPassword = searchParams.get("password") ?? "";

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const formData = new FormData(e.currentTarget);
    try {
      await login(
        formData.get("email") as string,
        formData.get("password") as string
      );
      router.push("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to sign in");
      setLoading(false);
    }
  };

  return (
    <AuthShell title="Sign In" subtitle="Real Estate Portfolio Investment Platform">
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8">
        <h2 className="text-xl font-semibold text-slate-900 mb-6">
          Sign In
        </h2>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Email
            </label>
            <input
              name="email"
              type="email"
              defaultValue={defaultEmail}
              required
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-slate-900"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Password
            </label>
            <input
              name="password"
              type="password"
              defaultValue={defaultPassword}
              required
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-slate-900"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50"
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>

        <p className="mt-4 text-center text-sm text-slate-500">
          Don&apos;t have an account?{" "}
          <Link
            href="/register"
            className="text-emerald-600 hover:text-emerald-700 font-medium"
          >
            Create one
          </Link>
        </p>
      </div>
    </AuthShell>
  );
}

function AuthShell({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-emerald-600">RealPort</h1>
          <p className="text-slate-500 mt-2">{subtitle}</p>
        </div>
        {children ?? (
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8">
            <h2 className="text-xl font-semibold text-slate-900">{title}</h2>
          </div>
        )}
      </div>
    </div>
  );
}
