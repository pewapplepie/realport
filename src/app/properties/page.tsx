"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface Property {
  id: string;
  name: string;
  address: string;
  city: string;
  state: string;
  propertyType: string;
  purchasePrice: number;
  currentValue: number;
  monthlyRent: number;
}

function fmt(n: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(n);
}

export default function PropertiesPage() {
  const router = useRouter();
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/properties")
      .then((r) => {
        if (r.status === 401) {
          router.push("/login");
          return null;
        }
        return r.json();
      })
      .then((data) => {
        if (data) setProperties(data.properties);
        setLoading(false);
      });
  }, [router]);

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this property? All transactions will also be deleted."))
      return;

    const res = await fetch(`/api/properties/${id}`, { method: "DELETE" });
    if (res.ok) {
      setProperties((prev) => prev.filter((p) => p.id !== id));
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-slate-200 rounded w-48" />
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-20 bg-slate-200 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold text-slate-900">Properties</h1>
        <Link
          href="/properties/new"
          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium rounded-lg transition-colors"
        >
          + Add Property
        </Link>
      </div>

      {properties.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-12 text-center">
          <p className="text-lg text-slate-500 mb-2">No properties yet</p>
          <Link
            href="/properties/new"
            className="text-emerald-600 hover:text-emerald-700 font-medium"
          >
            Add your first property
          </Link>
        </div>
      ) : (
        <div className="grid gap-4">
          {properties.map((p) => (
            <div
              key={p.id}
              className="bg-white rounded-xl shadow-sm border border-slate-200 p-6"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <Link
                    href={`/properties/${p.id}`}
                    className="text-lg font-semibold text-emerald-600 hover:text-emerald-700"
                  >
                    {p.name}
                  </Link>
                  <p className="text-sm text-slate-500">
                    {p.address}, {p.city}, {p.state}
                  </p>
                  <span className="inline-block mt-1 text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full capitalize">
                    {p.propertyType}
                  </span>
                </div>
                <div className="flex items-center gap-6">
                  <div className="text-right">
                    <p className="text-sm text-slate-500">Current Value</p>
                    <p className="text-lg font-semibold text-slate-900">
                      {fmt(p.currentValue)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-slate-500">Monthly Rent</p>
                    <p className="text-lg font-semibold text-slate-900">
                      {fmt(p.monthlyRent)}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Link
                      href={`/properties/${p.id}/edit`}
                      className="px-3 py-1.5 text-sm bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors"
                    >
                      Edit
                    </Link>
                    <button
                      onClick={() => handleDelete(p.id)}
                      className="px-3 py-1.5 text-sm bg-red-50 hover:bg-red-100 text-red-600 rounded-lg transition-colors"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
