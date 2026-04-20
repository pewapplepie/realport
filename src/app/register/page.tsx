"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { useAuth } from "@/components/AuthProvider";

export default function RegisterPage() {
  return (
    <Suspense
      fallback={
        <AuthShell subtitle="Create your investment account">
          <div className="rounded-xl border border-white/18 bg-white/94 p-8 shadow-[0_20px_80px_rgba(0,0,0,0.28)] backdrop-blur-sm">
            <h2 className="text-xl font-semibold text-slate-900">Register</h2>
          </div>
        </AuthShell>
      }
    >
      <RegisterContent />
    </Suspense>
  );
}

function RegisterContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { register } = useAuth();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const defaultName = searchParams.get("name") ?? "";
  const defaultEmail = searchParams.get("email") ?? "";
  const defaultPassword = searchParams.get("password") ?? "";

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const formData = new FormData(e.currentTarget);
    try {
      await register(
        formData.get("name") as string,
        formData.get("email") as string,
        formData.get("password") as string
      );
      router.push("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to create account");
      setLoading(false);
    }
  };

  return (
    <AuthShell subtitle="Create your investment account">
      <div className="rounded-xl border border-white/18 bg-white/94 p-8 shadow-[0_20px_80px_rgba(0,0,0,0.28)] backdrop-blur-sm">
        <h2 className="text-xl font-semibold text-slate-900 mb-6">
          Register
        </h2>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Name
            </label>
            <input
              name="name"
              defaultValue={defaultName}
              required
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-slate-900"
            />
          </div>
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
              Password (min 6 characters)
            </label>
            <input
              name="password"
              type="password"
              defaultValue={defaultPassword}
              required
              minLength={6}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-slate-900"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50"
          >
            {loading ? "Creating account..." : "Create Account"}
          </button>
        </form>

        <p className="mt-4 text-center text-sm text-slate-500">
          Already have an account?{" "}
          <Link
            href="/login"
            className="text-emerald-600 hover:text-emerald-700 font-medium"
          >
            Sign in
          </Link>
        </p>
      </div>
    </AuthShell>
  );
}

function AuthShell({
  subtitle,
  children,
}: {
  subtitle: string;
  children: React.ReactNode;
}) {
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#10161a] px-4 py-10">
      <Image
        src="https://images.unsplash.com/photo-1529307474719-3d0a417aaf8a?auto=format&fit=crop&w=1800&q=80"
        alt="Orange and black high-rise building"
        fill
        priority
        sizes="100vw"
        className="object-cover object-center"
      />
      <div className="absolute inset-0 bg-[linear-gradient(140deg,rgba(11,16,19,0.88)_0%,rgba(11,16,19,0.72)_45%,rgba(11,16,19,0.84)_100%)]" />
      <div className="relative w-full max-w-md">
        <div className="text-center mb-8">
          <Link
            href="/"
            className="inline-block text-3xl font-bold text-white transition-colors hover:text-[#ADB2D3]"
          >
            RealPort
          </Link>
          <p className="mt-2 text-white/72">{subtitle}</p>
        </div>
        {children}
      </div>
    </div>
  );
}
