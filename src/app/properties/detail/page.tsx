"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/components/AuthProvider";
import { getPropertyWithTransactions } from "@/lib/client-store";
import { calculateTargetDealMetrics } from "@/lib/target-deal";
import type { PropertyWithTransactions } from "@/lib/types";

function fmt(n: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(n);
}

export default function PropertyDetailPage() {
  return (
    <Suspense
      fallback={
        <div className="max-w-5xl mx-auto px-4 py-12">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-slate-200 rounded w-64" />
            <div className="h-48 bg-slate-200 rounded-xl" />
          </div>
        </div>
      }
    >
      <PropertyDetailContent />
    </Suspense>
  );
}

function PropertyDetailContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const id = searchParams.get("id");
  const { firebaseUser, loading: authLoading } = useAuth();
  const [property, setProperty] = useState<PropertyWithTransactions | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return;
    if (!firebaseUser) {
      router.push("/login");
      return;
    }
    if (!id) return;

    getPropertyWithTransactions(firebaseUser.uid, id)
      .then(setProperty)
      .finally(() => setLoading(false));
  }, [authLoading, firebaseUser, id, router]);

  if (!id) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-12 text-center">
        <p className="text-slate-500 text-lg">Property not found.</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-12">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-slate-200 rounded w-64" />
          <div className="h-48 bg-slate-200 rounded-xl" />
        </div>
      </div>
    );
  }

  if (!property) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-12 text-center">
        <p className="text-slate-500 text-lg">Property not found.</p>
      </div>
    );
  }

  if (property.portfolioStage === "target") {
    const metrics = calculateTargetDealMetrics(property);

    return (
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-4">
          <Link
            href="/properties"
            className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition-colors hover:text-slate-700"
          >
            <span aria-hidden="true">←</span>
            Back to properties
          </Link>
        </div>
        <div className="flex items-center justify-between mb-6">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold text-slate-900">{property.name}</h1>
              <span className="inline-block text-xs bg-[#EEE9F4] text-[#564B69] px-2 py-0.5 rounded-full">
                Target deal
              </span>
            </div>
            <p className="text-slate-500">
              {property.address}, {property.city}, {property.state} {property.zipCode}
            </p>
          </div>
          <Link
            href={`/properties/edit?id=${property.id}`}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-medium rounded-lg transition-colors"
          >
            Edit
          </Link>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <DetailCard label="Target Price" value={fmt(property.purchasePrice)} />
          <DetailCard label="Carry Total" value={fmt(metrics.carryingCost)} />
          <DetailCard label="Equity Loan" value={fmt(metrics.equityLoanPrincipal)} />
          <DetailCard label="Mortgage" value={fmt(metrics.mortgagePrincipal)} />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <h3 className="text-sm font-medium text-slate-500 mb-3">Deal Inputs</h3>
            <dl className="space-y-2 text-sm">
              <DetailRow label="Type" value={property.propertyType} capitalize />
              <DetailRow
                label="Target Close Date"
                value={new Date(property.purchaseDate).toLocaleDateString()}
              />
              <DetailRow
                label="Down Payment"
                value={`${property.downPaymentPercent}%`}
              />
              <DetailRow
                label="Mortgage Terms"
                value={`${property.mortgageRate}% for ${property.mortgageYears} years`}
              />
              <DetailRow
                label="Equity Loan Terms"
                value={`${property.equityLoanRate}% for ${property.equityLoanYears} years`}
              />
              <DetailRow label="Monthly HOA" value={fmt(property.monthlyHoa)} />
              <DetailRow label="Monthly Tax" value={fmt(property.monthlyTax)} />
            </dl>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <h3 className="text-sm font-medium text-slate-500 mb-3">
              Financing Breakdown
            </h3>
            <dl className="space-y-2 text-sm">
              <DetailRow label="Down Payment" value={fmt(metrics.downPayment)} />
              <DetailRow label="Closing Fee Financed" value={fmt(metrics.closingFee)} />
              <DetailRow label="Mansion Tax Financed" value={fmt(metrics.mansionTax)} />
              <DetailRow
                label="Equity Loan Payment"
                value={fmt(metrics.equityLoanPayment)}
              />
              <DetailRow
                label="Mortgage Payment"
                value={fmt(metrics.mortgagePayment)}
              />
              <DetailRow
                label="HOA + Tax"
                value={fmt(property.monthlyHoa + property.monthlyTax)}
              />
            </dl>
          </div>
        </div>

        {property.notes && (
          <div className="bg-white rounded-xl border border-slate-200 p-6 mb-8">
            <h3 className="text-sm font-medium text-slate-500 mb-2">Notes</h3>
            <p className="text-sm text-slate-700 whitespace-pre-wrap">
              {property.notes}
            </p>
          </div>
        )}
      </div>
    );
  }

  const appreciation = property.currentValue - property.purchasePrice;
  const totalIncome = property.transactions
    .filter((t) => t.type === "income")
    .reduce((s, t) => s + t.amount, 0);
  const totalExpenses = property.transactions
    .filter((t) => t.type === "expense")
    .reduce((s, t) => s + t.amount, 0);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-4">
        <Link
          href="/properties"
          className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition-colors hover:text-slate-700"
        >
          <span aria-hidden="true">←</span>
          Back to properties
        </Link>
      </div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">{property.name}</h1>
          <p className="text-slate-500">
            {property.address}, {property.city}, {property.state} {property.zipCode}
          </p>
        </div>
        <Link
          href={`/properties/edit?id=${property.id}`}
          className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-medium rounded-lg transition-colors"
        >
          Edit
        </Link>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <DetailCard label="Purchase Price" value={fmt(property.purchasePrice)} />
        <DetailCard label="Current Value" value={fmt(property.currentValue)} />
        <DetailCard label="Appreciation" value={fmt(appreciation)} tone={appreciation >= 0 ? "positive" : "negative"} />
        <DetailCard label="Monthly Rent" value={fmt(property.monthlyRent)} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <h3 className="text-sm font-medium text-slate-500 mb-3">Details</h3>
          <dl className="space-y-2 text-sm">
            <DetailRow label="Type" value={property.propertyType} capitalize />
            <DetailRow label="Bedrooms" value={String(property.bedrooms)} />
            <DetailRow label="Bathrooms" value={String(property.bathrooms)} />
            <DetailRow label="Square Feet" value={property.squareFeet.toLocaleString()} />
            <DetailRow
              label="Purchase Date"
              value={new Date(property.purchaseDate).toLocaleDateString()}
            />
          </dl>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <h3 className="text-sm font-medium text-slate-500 mb-3">Financials</h3>
          <dl className="space-y-2 text-sm">
            <DetailRow label="Total Income" value={fmt(totalIncome)} tone="positive" />
            <DetailRow label="Total Expenses" value={fmt(totalExpenses)} tone="negative" />
            <div className="flex justify-between border-t border-slate-200 pt-2">
              <dt className="text-slate-700 font-medium">Net Cash Flow</dt>
              <dd
                className={`font-semibold ${totalIncome - totalExpenses >= 0 ? "text-emerald-600" : "text-red-600"}`}
              >
                {fmt(totalIncome - totalExpenses)}
              </dd>
            </div>
          </dl>
        </div>
      </div>

      {property.notes && (
        <div className="bg-white rounded-xl border border-slate-200 p-6 mb-8">
          <h3 className="text-sm font-medium text-slate-500 mb-2">Notes</h3>
          <p className="text-sm text-slate-700 whitespace-pre-wrap">
            {property.notes}
          </p>
        </div>
      )}

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-slate-900">Transactions</h3>
          <Link
            href={`/transactions?propertyId=${property.id}`}
            className="text-sm text-emerald-600 hover:text-emerald-700 font-medium"
          >
            View All
          </Link>
        </div>
        {property.transactions.length === 0 ? (
          <div className="p-8 text-center text-slate-500 text-sm">
            No transactions yet
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">
                    Category
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">
                    Description
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase">
                    Amount
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {property.transactions.slice(0, 10).map((t) => (
                  <tr key={t.id}>
                    <td className="px-6 py-3 text-sm text-slate-700">
                      {new Date(t.date).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-3 text-sm text-slate-700 capitalize">
                      {t.category}
                    </td>
                    <td className="px-6 py-3 text-sm text-slate-500">
                      {t.description || "—"}
                    </td>
                    <td
                      className={`px-6 py-3 text-sm text-right font-medium ${t.type === "income" ? "text-emerald-600" : "text-red-600"}`}
                    >
                      {t.type === "income" ? "+" : "-"}
                      {fmt(t.amount)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

function DetailCard({
  label,
  value,
  tone = "default",
}: {
  label: string;
  value: string;
  tone?: "default" | "positive" | "negative";
}) {
  const toneClass =
    tone === "positive"
      ? "text-emerald-600"
      : tone === "negative"
        ? "text-red-600"
        : "text-slate-900";

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-4">
      <p className="text-sm text-slate-500">{label}</p>
      <p className={`text-lg font-semibold ${toneClass}`}>{value}</p>
    </div>
  );
}

function DetailRow({
  label,
  value,
  tone = "default",
  capitalize = false,
}: {
  label: string;
  value: string;
  tone?: "default" | "positive" | "negative";
  capitalize?: boolean;
}) {
  const toneClass =
    tone === "positive"
      ? "text-emerald-600 font-medium"
      : tone === "negative"
        ? "text-red-600 font-medium"
        : "text-slate-900";

  return (
    <div className="flex justify-between">
      <dt className="text-slate-500">{label}</dt>
      <dd className={`${toneClass} ${capitalize ? "capitalize" : ""}`}>{value}</dd>
    </div>
  );
}
