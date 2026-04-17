"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<{ name: string; email: string } | null>(
    null
  );
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((data) => {
        if (data.user) setUser(data.user);
      });
  }, []);

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
  };

  const links = [
    { href: "/dashboard", label: "Dashboard" },
    { href: "/properties", label: "Properties" },
    { href: "/transactions", label: "Transactions" },
    { href: "/opportunity", label: "Opportunity" },
    { href: "/analytics", label: "Analytics" },
  ];

  const isActive = (href: string) => pathname.startsWith(href);

  return (
    <nav className="sticky top-0 z-30 border-b border-stone-200/80 bg-white/90 text-stone-950 shadow-sm backdrop-blur">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link
            href="/dashboard"
            className="text-lg font-semibold text-stone-950"
          >
            RealPort
          </Link>

          <div className="hidden md:flex items-center gap-1 rounded-lg border border-stone-200 bg-stone-50 p-1">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                  isActive(link.href)
                    ? "bg-white text-[#564B69] shadow-sm"
                    : "text-stone-600 hover:bg-white hover:text-stone-950"
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          <div className="hidden md:flex items-center gap-4">
            {user ? (
              <>
                <span className="text-sm text-stone-500">{user.name}</span>
                <button
                  onClick={handleLogout}
                  className="text-sm font-medium text-stone-600 transition-colors hover:text-stone-950"
                >
                  Logout
                </button>
              </>
            ) : (
              <div className="flex items-center gap-3">
                <Link
                  href="/login"
                  className="text-sm font-medium text-stone-600 transition-colors hover:text-stone-950"
                >
                  Sign In
                </Link>
                <Link
                  href="/register"
                  className="rounded-md bg-[#564B69] px-3 py-1.5 text-sm font-medium text-white transition-colors hover:bg-[#3C334C]"
                >
                  Get Started
                </Link>
              </div>
            )}
          </div>

          <button
            className="rounded-md border border-stone-200 p-2 text-stone-700 md:hidden"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              {menuOpen ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              )}
            </svg>
          </button>
        </div>
      </div>

      {menuOpen && (
        <div className="border-t border-stone-200 bg-white px-2 pb-3 pt-2 shadow-sm md:hidden">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`block px-3 py-2 rounded-md text-base font-medium ${
                isActive(link.href)
                  ? "bg-[#EEE9F4] text-[#564B69]"
                  : "text-stone-600 hover:bg-stone-50"
              }`}
              onClick={() => setMenuOpen(false)}
            >
              {link.label}
            </Link>
          ))}
          {user ? (
            <button
              onClick={handleLogout}
              className="block w-full rounded-md px-3 py-2 text-left text-base font-medium text-stone-600 hover:bg-stone-50"
            >
              Logout
            </button>
          ) : (
            <>
              <Link
                href="/login"
                className="block rounded-md px-3 py-2 text-base font-medium text-stone-600 hover:bg-stone-50"
                onClick={() => setMenuOpen(false)}
              >
                Sign In
              </Link>
              <Link
                href="/register"
                className="block rounded-md px-3 py-2 text-base font-medium text-[#564B69] hover:bg-[#EEE9F4]"
                onClick={() => setMenuOpen(false)}
              >
                Get Started
              </Link>
            </>
          )}
        </div>
      )}
    </nav>
  );
}
