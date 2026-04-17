"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
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
  totalValue: number;
  totalCost: number;
  totalAppreciation: number;
  totalIncome: number;
  totalExpenses: number;
  netCashFlow: number;
  monthlyRent: number;
  roi: number;
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

interface AnalyticsData {
  summary: Summary;
  allocationByType: Record<string, number>;
  monthlyCashFlow: MonthlyCashFlow[];
  propertyPerformance: PropertyPerf[];
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
  const { summary, allocationByType, monthlyCashFlow, propertyPerformance } =
    data;

  const pieData = Object.entries(allocationByType).map(([name, value]) => ({
    name: name.charAt(0).toUpperCase() + name.slice(1),
    value,
  }));

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
        <Link
          href="/properties/new"
          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium rounded-lg transition-colors"
        >
          + Add Property
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard
          title="Total Portfolio Value"
          value={fmt(summary.totalValue)}
          subtitle={`${summary.propertyCount} properties`}
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
              No transaction data yet
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
              No properties yet
            </div>
          )}
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200">
          <h2 className="text-lg font-semibold text-slate-900">
            Property Comparison
          </h2>
        </div>

        {propertyPerformance.length === 0 ? (
          <div className="p-12 text-center text-slate-500">
            <p className="text-lg mb-2">No properties yet</p>
            <p className="text-sm">
              <Link
                href="/properties/new"
                className="text-emerald-600 hover:text-emerald-700 font-medium"
              >
                Add your first property
              </Link>{" "}
              to start tracking your portfolio.
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
