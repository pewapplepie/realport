import { requireAuth } from "@/lib/auth";
import { store } from "@/lib/store";

export const runtime = "nodejs";

export async function GET() {
  try {
    const session = await requireAuth();

    const properties = await store.listPropertiesWithTransactions(
      session.userId
    );
    const transactions = properties.flatMap((property) => property.transactions);

    const totalValue = properties.reduce((sum, p) => sum + p.currentValue, 0);
    const totalCost = properties.reduce((sum, p) => sum + p.purchasePrice, 0);
    const totalAppreciation = totalValue - totalCost;

    const totalIncome = transactions
      .filter((t) => t.type === "income")
      .reduce((sum, t) => sum + t.amount, 0);

    const totalExpenses = transactions
      .filter((t) => t.type === "expense")
      .reduce((sum, t) => sum + t.amount, 0);

    const netCashFlow = totalIncome - totalExpenses;
    const monthlyRent = properties.reduce((sum, p) => sum + p.monthlyRent, 0);

    // ROI = (net income + appreciation) / total cost * 100
    const roi =
      totalCost > 0
        ? ((netCashFlow + totalAppreciation) / totalCost) * 100
        : 0;

    // Allocation by property type
    const allocationByType = properties.reduce(
      (acc, p) => {
        acc[p.propertyType] = (acc[p.propertyType] || 0) + p.currentValue;
        return acc;
      },
      {} as Record<string, number>
    );

    // Monthly cash flow (last 12 months)
    const now = new Date();
    const twelveMonthsAgo = new Date(now);
    twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12);

    const recentTransactions = transactions.filter(
      (t) => new Date(t.date) >= twelveMonthsAgo
    );

    const monthlyCashFlow: { month: string; income: number; expenses: number }[] = [];
    for (let i = 11; i >= 0; i--) {
      const d = new Date(now);
      d.setMonth(d.getMonth() - i);
      const label = d.toLocaleString("default", {
        month: "short",
        year: "2-digit",
      });

      const monthIncome = recentTransactions
        .filter((t) => {
          const td = new Date(t.date);
          return (
            t.type === "income" &&
            td.getFullYear() === d.getFullYear() &&
            td.getMonth() === d.getMonth()
          );
        })
        .reduce((sum, t) => sum + t.amount, 0);

      const monthExpenses = recentTransactions
        .filter((t) => {
          const td = new Date(t.date);
          return (
            t.type === "expense" &&
            td.getFullYear() === d.getFullYear() &&
            td.getMonth() === d.getMonth()
          );
        })
        .reduce((sum, t) => sum + t.amount, 0);

      monthlyCashFlow.push({
        month: label,
        income: monthIncome,
        expenses: monthExpenses,
      });
    }

    // Per-property performance
    const propertyPerformance = properties.map((p) => {
      const pIncome = p.transactions
        .filter((t) => t.type === "income")
        .reduce((sum, t) => sum + t.amount, 0);
      const pExpenses = p.transactions
        .filter((t) => t.type === "expense")
        .reduce((sum, t) => sum + t.amount, 0);
      const appreciation = p.currentValue - p.purchasePrice;
      const pRoi =
        p.purchasePrice > 0
          ? ((pIncome - pExpenses + appreciation) / p.purchasePrice) * 100
          : 0;

      return {
        id: p.id,
        name: p.name,
        currentValue: p.currentValue,
        purchasePrice: p.purchasePrice,
        income: pIncome,
        expenses: pExpenses,
        netCashFlow: pIncome - pExpenses,
        appreciation,
        roi: Math.round(pRoi * 100) / 100,
      };
    });

    return Response.json({
      summary: {
        propertyCount: properties.length,
        totalValue,
        totalCost,
        totalAppreciation,
        totalIncome,
        totalExpenses,
        netCashFlow,
        monthlyRent,
        roi: Math.round(roi * 100) / 100,
      },
      allocationByType,
      monthlyCashFlow,
      propertyPerformance,
    });
  } catch {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }
}
