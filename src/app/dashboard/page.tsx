"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { useAuth } from "@/components/AuthProvider";
import { listPropertiesWithTransactions } from "@/lib/client-store";
import { buildPortfolioAnalytics } from "@/lib/portfolio-analytics";
import StatCard from "@/components/StatCard";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

interface Summary {
  propertyCount: number;
  targetCount: number;
  totalValue: number;
  totalCost: number;
  totalAppreciation: number;
  totalIncome: number;
  totalExpenses: number;
  netCashFlow: number;
  monthlyRent: number;
  roi: number;
  totalTargetPipelineValue: number;
  totalTargetCarry: number;
}

interface MonthlyCashFlow {
  month: string;
  income: number;
  expenses: number;
}

interface PropertyPerf {
  id: string;
  name: string;
  currentValue: number;
  purchasePrice: number;
  income: number;
  expenses: number;
  netCashFlow: number;
  appreciation: number;
  roi: number;
}

interface TargetOpportunity {
  id: string;
  name: string;
  city: string;
  state: string;
  purchasePrice: number;
  carryingCost: number;
  equityLoanPrincipal: number;
  mortgagePrincipal: number;
  equityLoanPayment: number;
  mortgagePayment: number;
  monthlyHoa: number;
  monthlyTax: number;
  closingFee: number;
  mansionTax: number;
}

interface AnalyticsData {
  summary: Summary;
  allocationByType: Record<string, number>;
  monthlyCashFlow: MonthlyCashFlow[];
  propertyPerformance: PropertyPerf[];
  targetOpportunityComparison: TargetOpportunity[];
  lowestCarryTarget: TargetOpportunity | null;
}

const COLORS = ["#564B69", "#477A87", "#B6854E", "#A3545C", "#8D7AA5"];

function fmt(n: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(n);
}

export default function DashboardPage() {
  const router = useRouter();
  const { firebaseUser, loading: authLoading } = useAuth();
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return;
    if (!firebaseUser) {
      router.push("/login");
      return;
    }

    listPropertiesWithTransactions(firebaseUser.uid)
      .then((properties) => setData(buildPortfolioAnalytics(properties)))
      .finally(() => setLoading(false));
  }, [authLoading, firebaseUser, router]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-slate-200 rounded w-48" />
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-28 bg-slate-200 rounded-xl" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!data) return null;
  const {
    summary,
    allocationByType,
    monthlyCashFlow,
    propertyPerformance,
    targetOpportunityComparison,
    lowestCarryTarget,
  } = data;

  const pieData = Object.entries(allocationByType).map(([name, value]) => ({
    name: name.charAt(0).toUpperCase() + name.slice(1),
    value,
  }));

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
        <div className="flex gap-2">
          <Link
            href="/properties/new?stage=target"
            className="px-4 py-2 bg-[#564B69] hover:bg-[#463a55] text-white text-sm font-medium rounded-lg transition-colors"
          >
            + Add Target Deal
          </Link>
          <Link
            href="/properties/new?stage=owned"
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium rounded-lg transition-colors"
          >
            + Add Property
          </Link>
        </div>
      </div>

      <section className="relative mb-8 overflow-hidden rounded-xl border border-slate-200 bg-[#11161a] text-white">
        <div className="absolute inset-0">
          <Image
            src="https://images.unsplash.com/photo-1511452885600-a3d2c9148a31?auto=format&fit=crop&w=1800&q=80"
            alt="White and black building during daytime"
            fill
            sizes="(min-width: 1024px) 1200px, 100vw"
            className="object-cover object-center opacity-45"
          />
          <div className="absolute inset-0 bg-[linear-gradient(105deg,rgba(12,15,18,0.92)_0%,rgba(12,15,18,0.86)_40%,rgba(12,15,18,0.58)_70%,rgba(12,15,18,0.82)_100%)]" />
        </div>
        <div className="relative grid gap-6 px-6 py-8 lg:grid-cols-[1.1fr_0.9fr] lg:px-8">
          <div className="max-w-2xl">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#ADB2D3]">
              Portfolio command
            </p>
            <h2 className="mt-3 text-3xl font-semibold leading-tight">
              Keep the owned portfolio and the next move in the same frame.
            </h2>
            <p className="mt-4 max-w-xl text-sm leading-7 text-white/72 sm:text-base">
              Track live holdings with transaction-backed performance, then compare
              target deals with full financing assumptions before they join the book.
            </p>
          </div>
          <div className="grid gap-3 self-end sm:grid-cols-3 lg:grid-cols-1">
            <div className="rounded-lg border border-white/14 bg-white/6 p-4 backdrop-blur-sm">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#ADB2D3]">
                Portfolio value
              </p>
              <p className="mt-2 text-2xl font-semibold">{fmt(summary.totalValue)}</p>
            </div>
            <div className="rounded-lg border border-white/14 bg-white/6 p-4 backdrop-blur-sm">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#ADB2D3]">
                Target deals
              </p>
              <p className="mt-2 text-2xl font-semibold">{summary.targetCount}</p>
            </div>
            <div className="rounded-lg border border-white/14 bg-white/6 p-4 backdrop-blur-sm">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#C89A62]">
                Next step
              </p>
              <Link
                href="/opportunity"
                className="mt-2 inline-flex text-base font-semibold text-white transition-colors hover:text-[#ADB2D3]"
              >
                Price the next opportunity
              </Link>
            </div>
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard
          title="Owned Portfolio Value"
          value={fmt(summary.totalValue)}
          subtitle={`${summary.propertyCount} owned properties`}
        />
        <StatCard
          title="Total Appreciation"
          value={fmt(summary.totalAppreciation)}
          trend={summary.totalAppreciation >= 0 ? "up" : "down"}
          subtitle={`${summary.roi >= 0 ? "+" : ""}${summary.roi}% ROI`}
        />
        <StatCard
          title="Net Cash Flow"
          value={fmt(summary.netCashFlow)}
          trend={summary.netCashFlow >= 0 ? "up" : "down"}
          subtitle={`${fmt(summary.totalIncome)} income - ${fmt(summary.totalExpenses)} expenses`}
        />
        <StatCard
          title="Monthly Cost"
          value={fmt(summary.monthlyRent)}
          subtitle={`${fmt(summary.monthlyRent * 12)} / year tracked`}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">
            Monthly Cash Flow
          </h2>
          {monthlyCashFlow.some((m) => m.income > 0 || m.expenses > 0) ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={monthlyCashFlow}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e3dce8" />
                <XAxis dataKey="month" fontSize={12} tick={{ fill: "#6f6578" }} />
                <YAxis fontSize={12} tick={{ fill: "#6f6578" }} />
                <Tooltip
                  formatter={(value) => fmt(Number(value))}
                  contentStyle={{
                    borderRadius: "8px",
                    border: "1px solid #e3dce8",
                  }}
                />
                <Legend />
                <Bar
                  dataKey="income"
                  fill="#477A87"
                  name="Income"
                  radius={[4, 4, 0, 0]}
                />
                <Bar
                  dataKey="expenses"
                  fill="#A3545C"
                  name="Expenses"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-64 flex items-center justify-center text-slate-400">
              No owned-property transaction data yet
            </div>
          )}
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">
            Portfolio Allocation
          </h2>
          {pieData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={4}
                  dataKey="value"
                  label={({ name, percent }) =>
                    `${name} ${((percent ?? 0) * 100).toFixed(0)}%`
                  }
                >
                  {pieData.map((_, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => fmt(Number(value))} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-64 flex items-center justify-center text-slate-400">
              No owned properties yet
            </div>
          )}
        </div>
      </div>

      <section className="mb-8 space-y-6">
        <div className="flex items-end justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">Target deal pipeline</h2>
            <p className="mt-1 text-sm text-slate-500">
              Compare the monthly carry and financing mix across the opportunities
              you are considering.
            </p>
          </div>
          <Link
            href="/properties/new?stage=target"
            className="text-sm font-medium text-[#564B69] hover:text-[#463a55]"
          >
            Add another target deal
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <StatCard
            title="Target Deals"
            value={String(summary.targetCount)}
            subtitle="Active pipeline"
          />
          <StatCard
            title="Pipeline Value"
            value={fmt(summary.totalTargetPipelineValue)}
            subtitle="Combined target prices"
          />
          <StatCard
            title="Lowest Carry"
            value={lowestCarryTarget ? fmt(lowestCarryTarget.carryingCost) : "—"}
            subtitle={
              lowestCarryTarget
                ? lowestCarryTarget.name
                : "Add a target deal to compare"
            }
          />
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-200">
            <h3 className="text-lg font-semibold text-slate-900">
              Target opportunity comparison
            </h3>
          </div>
          {targetOpportunityComparison.length === 0 ? (
            <div className="p-12 text-center text-slate-500">
              <p className="text-lg mb-2">No target deals yet</p>
              <p className="text-sm">
                Add a target deal from the{" "}
                <Link
                  href="/properties/new?stage=target"
                  className="text-[#564B69] hover:text-[#463a55] font-medium"
                >
                  Properties page
                </Link>{" "}
                to compare monthly carry across opportunities.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                      Target Deal
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">
                      Price
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
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {targetOpportunityComparison.map((deal) => (
                    <tr key={deal.id} className="hover:bg-slate-50">
                      <td className="px-6 py-4">
                        <Link
                          href={`/properties/detail?id=${deal.id}`}
                          className="text-sm font-medium text-[#564B69] hover:text-[#463a55]"
                        >
                          {deal.name}
                        </Link>
                        <p className="text-xs text-slate-500">
                          {deal.city}, {deal.state}
                        </p>
                      </td>
                      <td className="px-6 py-4 text-right text-sm text-slate-700">
                        {fmt(deal.purchasePrice)}
                      </td>
                      <td className="px-6 py-4 text-right text-sm font-medium text-slate-900">
                        {fmt(deal.carryingCost)}
                      </td>
                      <td className="px-6 py-4 text-right text-sm text-slate-700">
                        {fmt(deal.equityLoanPrincipal)}
                      </td>
                      <td className="px-6 py-4 text-right text-sm text-slate-700">
                        {fmt(deal.mortgagePrincipal)}
                      </td>
                      <td className="px-6 py-4 text-right text-sm text-slate-700">
                        {fmt(deal.monthlyHoa + deal.monthlyTax)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </section>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200">
          <h2 className="text-lg font-semibold text-slate-900">
            Owned Property Comparison
          </h2>
        </div>

        {propertyPerformance.length === 0 ? (
          <div className="p-12 text-center text-slate-500">
            <p className="text-lg mb-2">No owned properties yet</p>
            <p className="text-sm">
              <Link
                href="/properties/new?stage=owned"
                className="text-emerald-600 hover:text-emerald-700 font-medium"
              >
                Add your first property
              </Link>{" "}
              to start tracking your live portfolio.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Property
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Cost
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Value
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Income
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Expenses
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Net CF
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">
                    ROI
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {propertyPerformance.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50">
                    <td className="px-6 py-4">
                      <Link
                        href={`/properties/detail?id=${p.id}`}
                        className="text-sm font-medium text-emerald-600 hover:text-emerald-700"
                      >
                        {p.name}
                      </Link>
                    </td>
                    <td className="px-6 py-4 text-right text-sm text-slate-700">
                      {fmt(p.purchasePrice)}
                    </td>
                    <td className="px-6 py-4 text-right text-sm text-slate-700">
                      {fmt(p.currentValue)}
                    </td>
                    <td className="px-6 py-4 text-right text-sm text-emerald-600">
                      {fmt(p.income)}
                    </td>
                    <td className="px-6 py-4 text-right text-sm text-red-600">
                      {fmt(p.expenses)}
                    </td>
                    <td
                      className={`px-6 py-4 text-right text-sm font-medium ${p.netCashFlow >= 0 ? "text-emerald-600" : "text-red-600"}`}
                    >
                      {fmt(p.netCashFlow)}
                    </td>
                    <td
                      className={`px-6 py-4 text-right text-sm font-medium ${p.roi >= 0 ? "text-emerald-600" : "text-red-600"}`}
                    >
                      {p.roi}%
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
