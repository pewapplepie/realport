"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/components/AuthProvider";
import { deleteProperty, listProperties } from "@/lib/client-store";
import { calculateTargetDealMetrics } from "@/lib/target-deal";
import type { PropertyRecord } from "@/lib/types";

function fmt(n: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(n);
}

export default function PropertiesPage() {
  const router = useRouter();
  const { firebaseUser, loading: authLoading } = useAuth();
  const [properties, setProperties] = useState<PropertyRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return;
    if (!firebaseUser) {
      router.push("/login");
      return;
    }

    listProperties(firebaseUser.uid)
      .then(setProperties)
      .finally(() => setLoading(false));
  }, [authLoading, firebaseUser, router]);

  const ownedProperties = useMemo(
    () => properties.filter((property) => property.portfolioStage !== "target"),
    [properties]
  );
  const targetDeals = useMemo(
    () => properties.filter((property) => property.portfolioStage === "target"),
    [properties]
  );

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this item? Any linked transactions will also be deleted."))
      return;

    if (firebaseUser && (await deleteProperty(firebaseUser.uid, id))) {
      setProperties((prev) => prev.filter((property) => property.id !== id));
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-slate-200 rounded w-48" />
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-28 bg-slate-200 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Properties</h1>
        <p className="mt-2 text-slate-500">
          Keep current holdings separate from target deals so you can run the
          portfolio you own and the opportunities you are considering side by side.
        </p>
      </div>

      <section className="space-y-4">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-semibold text-slate-900">
              Current owned properties
            </h2>
            <p className="text-sm text-slate-500">
              Existing holdings that feed the live portfolio and transaction views.
            </p>
          </div>
          <Link
            href="/properties/new?stage=owned"
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium rounded-lg transition-colors"
          >
            + Add Property
          </Link>
        </div>

        {ownedProperties.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-12 text-center">
            <p className="text-lg text-slate-500 mb-2">No owned properties yet</p>
            <Link
              href="/properties/new?stage=owned"
              className="text-emerald-600 hover:text-emerald-700 font-medium"
            >
              Add your first property
            </Link>
          </div>
        ) : (
          <div className="grid gap-4">
            {ownedProperties.map((property) => (
              <div
                key={property.id}
                className="bg-white rounded-xl shadow-sm border border-slate-200 p-6"
              >
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                  <div>
                    <Link
                      href={`/properties/detail?id=${property.id}`}
                      className="text-lg font-semibold text-emerald-600 hover:text-emerald-700"
                    >
                      {property.name}
                    </Link>
                    <p className="text-sm text-slate-500">
                      {property.address}, {property.city}, {property.state}
                    </p>
                    <span className="inline-block mt-1 text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full capitalize">
                      {property.propertyType}
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-6">
                    <div className="text-right">
                      <p className="text-sm text-slate-500">Current Value</p>
                      <p className="text-lg font-semibold text-slate-900">
                        {fmt(property.currentValue)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-slate-500">Monthly Rent</p>
                      <p className="text-lg font-semibold text-slate-900">
                        {fmt(property.monthlyRent)}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Link
                        href={`/properties/edit?id=${property.id}`}
                        className="px-3 py-1.5 text-sm bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors"
                      >
                        Edit
                      </Link>
                      <button
                        onClick={() => handleDelete(property.id)}
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
      </section>

      <section className="space-y-4">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-semibold text-slate-900">
              Target deals
            </h2>
            <p className="text-sm text-slate-500">
              Potential purchases with the full financing stack so you can compare
              different opportunities cleanly.
            </p>
          </div>
          <Link
            href="/properties/new?stage=target"
            className="px-4 py-2 bg-[#564B69] hover:bg-[#463a55] text-white text-sm font-medium rounded-lg transition-colors"
          >
            + Add Target Deal
          </Link>
        </div>

        {targetDeals.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-12 text-center">
            <p className="text-lg text-slate-500 mb-2">No target deals yet</p>
            <Link
              href="/properties/new?stage=target"
              className="text-[#564B69] hover:text-[#463a55] font-medium"
            >
              Add a target deal
            </Link>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-200 bg-slate-50/70">
              <p className="text-sm text-slate-500">
                Target deals compare best as a shortlist. Open any row for the full
                financing breakdown.
              </p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                      Deal
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">
                      Target Price
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">
                      Carry Total
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">
                      Equity Loan
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">
                      Mortgage
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">
                      HOA + Tax
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {targetDeals.map((property) => {
                    const metrics = calculateTargetDealMetrics(property);
                    const looksIncomplete =
                      property.purchasePrice <= 0 &&
                      metrics.carryingCost <= 0 &&
                      metrics.equityLoanPrincipal <= 0 &&
                      metrics.mortgagePrincipal <= 0;

                    return (
                      <tr key={property.id} className="hover:bg-slate-50">
                        <td className="px-6 py-4">
                          <Link
                            href={`/properties/detail?id=${property.id}`}
                            className="text-sm font-medium text-[#564B69] hover:text-[#463a55]"
                          >
                            {property.name}
                          </Link>
                          <p className="text-xs text-slate-500">
                            {property.address}, {property.city}, {property.state}
                          </p>
                          <div className="mt-2 flex flex-wrap gap-2">
                            <span className="inline-block text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full capitalize">
                              {property.propertyType}
                            </span>
                            {looksIncomplete ? (
                              <span className="inline-block text-xs bg-amber-50 text-amber-700 px-2 py-0.5 rounded-full">
                                Re-save deal to refresh numbers
                              </span>
                            ) : null}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-right text-sm text-slate-700">
                          {fmt(property.purchasePrice)}
                        </td>
                        <td className="px-6 py-4 text-right text-sm font-medium text-slate-900">
                          {fmt(metrics.carryingCost)}
                        </td>
                        <td className="px-6 py-4 text-right text-sm text-slate-700">
                          {fmt(metrics.equityLoanPrincipal)}
                        </td>
                        <td className="px-6 py-4 text-right text-sm text-slate-700">
                          {fmt(metrics.mortgagePrincipal)}
                        </td>
                        <td className="px-6 py-4 text-right text-sm text-slate-700">
                          {fmt(property.monthlyHoa + property.monthlyTax)}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex justify-end gap-2">
                            <Link
                              href={`/properties/edit?id=${property.id}`}
                              className="px-3 py-1.5 text-sm bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors"
                            >
                              Edit
                            </Link>
                            <button
                              onClick={() => handleDelete(property.id)}
                              className="px-3 py-1.5 text-sm bg-red-50 hover:bg-red-100 text-red-600 rounded-lg transition-colors"
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
