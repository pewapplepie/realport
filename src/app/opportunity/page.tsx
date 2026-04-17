"use client";

import { useMemo, useState } from "react";

type PurchaseInput = {
  id: string;
  name: string;
  homePrice: number;
  downPaymentPercent: number;
  mortgageRate: number;
  mortgageYears: number;
  equityLoanRate: number;
  equityLoanYears: number;
};

type ExistingPropertyInput = {
  id: string;
  name: string;
  rent: number;
  commonCharge: number;
  monthlyTax: number;
};

type CalculatorInputs = {
  annualIncome: number;
  purchases: PurchaseInput[];
  existingProperties: ExistingPropertyInput[];
};

type ScenarioKey =
  | "mortgageRate"
  | "equityLoanRate"
  | "mortgageYears"
  | "equityLoanYears"
  | "existingNetCashFlow";

type ScenarioAxis = {
  key: ScenarioKey;
  min: number;
  max: number;
  steps: number;
};

type ScenarioConfig = {
  x: ScenarioAxis;
  y: ScenarioAxis;
};

const defaultPurchase: PurchaseInput = {
  id: "purchase-1",
  name: "Purchase 1",
  homePrice: 2_000_000,
  downPaymentPercent: 10,
  mortgageRate: 6,
  mortgageYears: 30,
  equityLoanRate: 5,
  equityLoanYears: 30,
};

const defaultExistingProperty: ExistingPropertyInput = {
  id: "existing-1",
  name: "Existing property 1",
  rent: 10_000,
  commonCharge: 1_455,
  monthlyTax: 2_452,
};

const defaultInputs: CalculatorInputs = {
  annualIncome: 250_000,
  purchases: [defaultPurchase],
  existingProperties: [defaultExistingProperty],
};

function monthlyPayment(principal: number, annualRate: number, years: number) {
  if (principal <= 0 || years <= 0) return 0;

  const months = years * 12;
  const monthlyRate = annualRate / 100 / 12;

  if (monthlyRate === 0) {
    return principal / months;
  }

  const growth = Math.pow(1 + monthlyRate, months);
  return principal * ((monthlyRate * growth) / (growth - 1));
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
}

function formatNumberInput(value: number) {
  if (!Number.isFinite(value)) return "";

  return new Intl.NumberFormat("en-US", {
    maximumFractionDigits: 0,
  }).format(value);
}

function parseFormattedNumber(value: string) {
  const parsed = Number(value.replace(/[^0-9.-]/g, ""));
  return Number.isFinite(parsed) ? parsed : 0;
}

function formatPercent(value: number) {
  return new Intl.NumberFormat("en-US", {
    maximumFractionDigits: 1,
  }).format(value);
}

function formatSignedCurrency(value: number) {
  const sign = value >= 0 ? "+" : "-";
  return `${sign}${formatCurrency(Math.abs(value))}`;
}

function formatRate(value: number) {
  return value.toFixed(6);
}

function makeId(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.round(Math.random() * 1_000)}`;
}

function averagePurchaseValue(
  inputs: CalculatorInputs,
  key: keyof Pick<
    PurchaseInput,
    "mortgageRate" | "equityLoanRate" | "mortgageYears" | "equityLoanYears"
  >
) {
  if (inputs.purchases.length === 0) return 0;

  return (
    inputs.purchases.reduce((sum, purchase) => sum + purchase[key], 0) /
    inputs.purchases.length
  );
}

function baseExistingNetCashFlow(inputs: CalculatorInputs) {
  return inputs.existingProperties.reduce(
    (sum, property) =>
      sum + property.rent - property.commonCharge - property.monthlyTax,
    0
  );
}

const scenarioOptions: Record<
  ScenarioKey,
  {
    label: string;
    shortLabel: string;
    suffix?: string;
    step: number;
    min: (inputs: CalculatorInputs) => number;
    max: (inputs: CalculatorInputs) => number;
    format: (value: number) => string;
  }
> = {
  mortgageRate: {
    label: "Mortgage rate",
    shortLabel: "Mortgage",
    suffix: "%",
    step: 0.125,
    min: (inputs) => Math.max(averagePurchaseValue(inputs, "mortgageRate") - 1, 0),
    max: (inputs) => averagePurchaseValue(inputs, "mortgageRate") + 1,
    format: (value) => `${value.toFixed(2)}%`,
  },
  equityLoanRate: {
    label: "Equity loan rate",
    shortLabel: "Equity rate",
    suffix: "%",
    step: 0.125,
    min: (inputs) =>
      Math.max(averagePurchaseValue(inputs, "equityLoanRate") - 1, 0),
    max: (inputs) => averagePurchaseValue(inputs, "equityLoanRate") + 1,
    format: (value) => `${value.toFixed(2)}%`,
  },
  mortgageYears: {
    label: "Mortgage term",
    shortLabel: "Mortgage yrs",
    suffix: "yrs",
    step: 1,
    min: (inputs) =>
      Math.max(averagePurchaseValue(inputs, "mortgageYears") - 10, 1),
    max: (inputs) => averagePurchaseValue(inputs, "mortgageYears") + 10,
    format: (value) => `${Math.round(value)}y`,
  },
  equityLoanYears: {
    label: "Equity loan term",
    shortLabel: "Equity yrs",
    suffix: "yrs",
    step: 1,
    min: (inputs) =>
      Math.max(averagePurchaseValue(inputs, "equityLoanYears") - 10, 1),
    max: (inputs) => averagePurchaseValue(inputs, "equityLoanYears") + 10,
    format: (value) => `${Math.round(value)}y`,
  },
  existingNetCashFlow: {
    label: "Expected cash flow",
    shortLabel: "Cash flow",
    step: 250,
    min: (inputs) => baseExistingNetCashFlow(inputs) - 2_000,
    max: (inputs) => baseExistingNetCashFlow(inputs) + 2_000,
    format: (value) => formatCurrency(value),
  },
};

function axisDefaults(key: ScenarioKey, inputs: CalculatorInputs): ScenarioAxis {
  return {
    key,
    min: Math.round(scenarioOptions[key].min(inputs) * 100) / 100,
    max: Math.round(scenarioOptions[key].max(inputs) * 100) / 100,
    steps: 6,
  };
}

function axisValues(axis: ScenarioAxis) {
  const steps = Math.min(Math.max(Math.round(axis.steps), 2), 9);
  const min = Number.isFinite(axis.min) ? axis.min : 0;
  const max = Number.isFinite(axis.max) ? axis.max : min;

  if (steps === 1 || min === max) return [min];

  const distance = max - min;
  return Array.from({ length: steps }, (_, index) => {
    const value = min + (distance / (steps - 1)) * index;
    return Math.round(value * 100) / 100;
  });
}

function calculateOpportunity(
  inputs: CalculatorInputs,
  overrides: Partial<Record<ScenarioKey, number>> = {}
) {
  const purchaseResults = inputs.purchases.map((purchase) => {
    const downPayment =
      purchase.homePrice * (purchase.downPaymentPercent / 100);
    const mortgagePrincipal = Math.max(purchase.homePrice - downPayment, 0);
    const equityLoanRate =
      overrides.equityLoanRate ?? purchase.equityLoanRate;
    const equityLoanYears =
      overrides.equityLoanYears ?? purchase.equityLoanYears;
    const mortgageRate = overrides.mortgageRate ?? purchase.mortgageRate;
    const mortgageYears = overrides.mortgageYears ?? purchase.mortgageYears;
    const equityLoanPayment = monthlyPayment(
      downPayment,
      equityLoanRate,
      equityLoanYears
    );
    const mortgagePayment = monthlyPayment(
      mortgagePrincipal,
      mortgageRate,
      mortgageYears
    );

    return {
      ...purchase,
      downPayment,
      mortgagePrincipal,
      equityLoanRate,
      equityLoanYears,
      mortgageRate,
      mortgageYears,
      equityLoanPayment,
      mortgagePayment,
      equityLoanMonthlyRate: equityLoanRate / 100 / 12,
      mortgageMonthlyRate: mortgageRate / 100 / 12,
      equityLoanMonths: equityLoanYears * 12,
      mortgageMonths: mortgageYears * 12,
    };
  });

  const existingPropertyResults = inputs.existingProperties.map((property) => {
    const cost = property.commonCharge + property.monthlyTax;
    return {
      ...property,
      cost,
      netCashFlow: property.rent - cost,
    };
  });

  const totalHomePrice = purchaseResults.reduce(
    (sum, purchase) => sum + purchase.homePrice,
    0
  );
  const downPayment = purchaseResults.reduce(
    (sum, purchase) => sum + purchase.downPayment,
    0
  );
  const mortgagePrincipal = purchaseResults.reduce(
    (sum, purchase) => sum + purchase.mortgagePrincipal,
    0
  );
  const equityLoanPayment = purchaseResults.reduce(
    (sum, purchase) => sum + purchase.equityLoanPayment,
    0
  );
  const mortgagePayment = purchaseResults.reduce(
    (sum, purchase) => sum + purchase.mortgagePayment,
    0
  );
  const totalRent = existingPropertyResults.reduce(
    (sum, property) => sum + property.rent,
    0
  );
  const existingPropertyCost = existingPropertyResults.reduce(
    (sum, property) => sum + property.cost,
    0
  );
  const baseCashFlow = existingPropertyResults.reduce(
    (sum, property) => sum + property.netCashFlow,
    0
  );
  const existingNetCashFlow =
    overrides.existingNetCashFlow ?? baseCashFlow;
  const totalDebtPayment = equityLoanPayment + mortgagePayment;
  const netMonthlyCost = totalDebtPayment - existingNetCashFlow;
  const monthlyGrossIncome = inputs.annualIncome / 12;
  const netCostToGrossIncome =
    monthlyGrossIncome > 0 ? (netMonthlyCost / monthlyGrossIncome) * 100 : 0;
  const debtToGrossIncome =
    monthlyGrossIncome > 0 ? (totalDebtPayment / monthlyGrossIncome) * 100 : 0;

  return {
    purchaseResults,
    existingPropertyResults,
    totalHomePrice,
    downPayment,
    mortgagePrincipal,
    equityLoanPayment,
    mortgagePayment,
    totalRent,
    existingPropertyCost,
    existingNetCashFlow,
    totalDebtPayment,
    netMonthlyCost,
    monthlyGrossIncome,
    netCostToGrossIncome,
    debtToGrossIncome,
  };
}

function heatmapStyle(costToIncomePercent: number) {
  if (!Number.isFinite(costToIncomePercent)) {
    return { backgroundColor: "#EEE9F4", color: "#201B26" };
  }

  if (costToIncomePercent < 33) {
    return { backgroundColor: "#E7F0F1", color: "#264A52" };
  }
  if (costToIncomePercent <= 66) {
    return { backgroundColor: "#F6E8D8", color: "#6F4B1D" };
  }
  return { backgroundColor: "#F1DDE1", color: "#71313A" };
}

function NumericField({
  label,
  value,
  min = 0,
  step = 1,
  suffix,
  onChange,
}: {
  label: string;
  value: number;
  min?: number;
  step?: number;
  suffix?: string;
  onChange: (value: number) => void;
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-medium text-stone-700">
        {label}
      </span>
      <span className="relative block">
        <input
          type="number"
          min={min}
          step={step}
          value={Number.isFinite(value) ? value : 0}
          onChange={(event) => onChange(Number(event.target.value))}
          className={`w-full rounded-lg border border-stone-300 bg-white px-3 py-2 text-stone-950 shadow-sm transition-colors focus:border-[#564B69] focus:outline-none focus:ring-2 focus:ring-[#564B69]/20 ${
            suffix ? "pr-14" : ""
          }`}
        />
        {suffix && (
          <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-sm text-stone-500">
            {suffix}
          </span>
        )}
      </span>
    </label>
  );
}

function MoneyField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;
  onChange: (value: number) => void;
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-medium text-stone-700">
        {label}
      </span>
      <span className="relative block">
        <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-sm text-stone-500">
          $
        </span>
        <input
          inputMode="decimal"
          value={formatNumberInput(value)}
          onChange={(event) =>
            onChange(parseFormattedNumber(event.target.value))
          }
          className="w-full rounded-lg border border-stone-300 bg-white px-3 py-2 pl-7 text-stone-950 shadow-sm transition-colors focus:border-[#564B69] focus:outline-none focus:ring-2 focus:ring-[#564B69]/20"
        />
      </span>
    </label>
  );
}

function TextField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-medium text-stone-700">
        {label}
      </span>
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="w-full rounded-lg border border-stone-300 bg-white px-3 py-2 text-stone-950 shadow-sm transition-colors focus:border-[#564B69] focus:outline-none focus:ring-2 focus:ring-[#564B69]/20"
      />
    </label>
  );
}

function ResultRow({
  label,
  value,
  tone = "default",
}: {
  label: string;
  value: string;
  tone?: "default" | "income" | "cost";
}) {
  const toneClass =
    tone === "income"
      ? "text-[#477A87]"
      : tone === "cost"
        ? "text-rose-700"
        : "text-stone-950";

  return (
    <div className="flex items-center justify-between gap-4 border-b border-stone-100 py-3 last:border-0">
      <span className="text-sm text-stone-500">{label}</span>
      <span className={`text-sm font-semibold ${toneClass}`}>{value}</span>
    </div>
  );
}

function ScenarioAxisControls({
  label,
  axis,
  unavailableKey,
  onChange,
}: {
  label: string;
  axis: ScenarioAxis;
  unavailableKey: ScenarioKey;
  onChange: (axis: ScenarioAxis) => void;
}) {
  const option = scenarioOptions[axis.key];

  return (
    <div className="rounded-xl border border-stone-200 bg-white p-4">
      <p className="text-sm font-semibold text-stone-950">{label}</p>
      <div className="mt-3 grid gap-3 sm:grid-cols-4">
        <label className="block sm:col-span-4">
          <span className="mb-1 block text-xs font-medium uppercase text-stone-500">
            Variable
          </span>
          <select
            value={axis.key}
            onChange={(event) =>
              onChange({
                ...axis,
                key: event.target.value as ScenarioKey,
              })
            }
            className="w-full rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm text-stone-950 shadow-sm focus:border-[#564B69] focus:outline-none focus:ring-2 focus:ring-[#564B69]/20"
          >
            {Object.entries(scenarioOptions).map(([key, item]) => (
              <option
                key={key}
                value={key}
                disabled={key === unavailableKey}
              >
                {item.label}
              </option>
            ))}
          </select>
        </label>
        <NumericField
          label="Low"
          value={axis.min}
          step={option.step}
          onChange={(value) => onChange({ ...axis, min: value })}
        />
        <NumericField
          label="High"
          value={axis.max}
          step={option.step}
          onChange={(value) => onChange({ ...axis, max: value })}
        />
        <NumericField
          label="Steps"
          value={axis.steps}
          min={2}
          step={1}
          onChange={(value) => onChange({ ...axis, steps: value })}
        />
        <div className="flex items-end text-sm text-stone-500">
          {option.suffix ? `Units: ${option.suffix}` : "Monthly dollars"}
        </div>
      </div>
    </div>
  );
}

export default function OpportunityPage() {
  const [inputs, setInputs] = useState(defaultInputs);
  const [scenarioConfig, setScenarioConfig] = useState<ScenarioConfig>(() => ({
    x: axisDefaults("mortgageRate", defaultInputs),
    y: axisDefaults("existingNetCashFlow", defaultInputs),
  }));

  const results = useMemo(() => calculateOpportunity(inputs), [inputs]);
  const scenarioGrid = useMemo(() => {
    const xValues = axisValues(scenarioConfig.x);
    const yValues = axisValues(scenarioConfig.y).slice().reverse();
    const cells = yValues.map((yValue) =>
      xValues.map((xValue) => {
        const scenario = calculateOpportunity(inputs, {
          [scenarioConfig.x.key]: xValue,
          [scenarioConfig.y.key]: yValue,
        });

        return {
          xValue,
          yValue,
          netMonthlyCost: scenario.netMonthlyCost,
          totalDebtPayment: scenario.totalDebtPayment,
          existingNetCashFlow: scenario.existingNetCashFlow,
          netCostToGrossIncome: scenario.netCostToGrossIncome,
        };
      })
    );
    const flat = cells.flat();
    const values = flat.map((cell) => cell.netMonthlyCost);
    const min = Math.min(...values);
    const max = Math.max(...values);
    const best = flat.reduce((winner, cell) =>
      cell.netMonthlyCost < winner.netMonthlyCost ? cell : winner
    );
    const worst = flat.reduce((loser, cell) =>
      cell.netMonthlyCost > loser.netMonthlyCost ? cell : loser
    );

    return { xValues, yValues, cells, min, max, best, worst };
  }, [inputs, scenarioConfig]);

  const updatePurchase = (
    id: string,
    changes: Partial<Omit<PurchaseInput, "id">>
  ) => {
    setInputs((current) => ({
      ...current,
      purchases: current.purchases.map((purchase) =>
        purchase.id === id ? { ...purchase, ...changes } : purchase
      ),
    }));
  };

  const updateExistingProperty = (
    id: string,
    changes: Partial<Omit<ExistingPropertyInput, "id">>
  ) => {
    setInputs((current) => ({
      ...current,
      existingProperties: current.existingProperties.map((property) =>
        property.id === id ? { ...property, ...changes } : property
      ),
    }));
  };

  const addPurchase = () => {
    setInputs((current) => {
      const source =
        current.purchases[current.purchases.length - 1] ?? defaultPurchase;
      return {
        ...current,
        purchases: [
          ...current.purchases,
          {
            ...source,
            id: makeId("purchase"),
            name: `Purchase ${current.purchases.length + 1}`,
          },
        ],
      };
    });
  };

  const removePurchase = (id: string) => {
    setInputs((current) => ({
      ...current,
      purchases:
        current.purchases.length > 1
          ? current.purchases.filter((purchase) => purchase.id !== id)
          : current.purchases,
    }));
  };

  const addExistingProperty = () => {
    setInputs((current) => {
      const source =
        current.existingProperties[current.existingProperties.length - 1] ??
        defaultExistingProperty;
      return {
        ...current,
        existingProperties: [
          ...current.existingProperties,
          {
            ...source,
            id: makeId("existing"),
            name: `Existing property ${current.existingProperties.length + 1}`,
          },
        ],
      };
    });
  };

  const removeExistingProperty = (id: string) => {
    setInputs((current) => ({
      ...current,
      existingProperties:
        current.existingProperties.length > 1
          ? current.existingProperties.filter((property) => property.id !== id)
          : current.existingProperties,
    }));
  };

  const updateScenarioAxis = (dimension: "x" | "y", axis: ScenarioAxis) => {
    setScenarioConfig((current) => {
      const currentAxis = current[dimension];
      const nextAxis =
        axis.key === currentAxis.key
          ? axis
          : {
              ...axisDefaults(axis.key, inputs),
              steps: currentAxis.steps,
            };

      return {
        ...current,
        [dimension]: nextAxis,
      };
    });
  };

  const resetExample = () => {
    setInputs(defaultInputs);
    setScenarioConfig({
      x: axisDefaults("mortgageRate", defaultInputs),
      y: axisDefaults("existingNetCashFlow", defaultInputs),
    });
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-8 border-b border-stone-200 pb-8">
        <div>
          <p className="text-sm font-semibold uppercase text-[#564B69]">
            Opportunity Calculator
          </p>
          <h1 className="mt-3 max-w-3xl text-4xl font-semibold leading-tight text-stone-950">
            Build a leveraged purchase stack.
          </h1>
          <p className="mt-4 max-w-3xl text-lg leading-8 text-stone-600">
            Add multiple purchases, keep each down-payment equity loan synced to
            its purchase, and offset the debt stack with cash flow from one or
            more existing properties.
          </p>
        </div>
        <button
          type="button"
          onClick={resetExample}
          className="mt-6 w-fit rounded-lg border border-stone-300 bg-white px-4 py-2 text-sm font-medium text-stone-700 shadow-sm transition-colors hover:bg-stone-50"
        >
          Reset Example
        </button>
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.15fr)_minmax(360px,0.85fr)]">
        <section className="space-y-6">
          <div className="rounded-xl border border-stone-200 bg-white/90 p-6 shadow-[0_14px_40px_rgba(23,32,25,0.05)]">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-lg font-semibold text-stone-950">
                  New purchases
                </h2>
                <p className="mt-1 text-sm text-stone-500">
                  Each purchase has a synced equity loan equal to its down
                  payment.
                </p>
              </div>
              <button
                type="button"
                onClick={addPurchase}
                className="w-fit rounded-lg bg-[#564B69] px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#3C334C]"
              >
                Add Purchase
              </button>
            </div>

            <div className="mt-5 space-y-4">
              {inputs.purchases.map((purchase, index) => {
                const purchaseResult = results.purchaseResults.find(
                  (item) => item.id === purchase.id
                );
                const downPayment = purchaseResult?.downPayment ?? 0;

                return (
                  <div
                    key={purchase.id}
                    className="border border-stone-200 bg-[#F7F4F2] p-4"
                  >
                    <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <TextField
                        label={`Purchase ${index + 1} name`}
                        value={purchase.name}
                        onChange={(value) =>
                          updatePurchase(purchase.id, { name: value })
                        }
                      />
                      <button
                        type="button"
                        onClick={() => removePurchase(purchase.id)}
                        disabled={inputs.purchases.length === 1}
                        className="w-fit rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm font-medium text-stone-600 transition-colors hover:bg-stone-50 disabled:cursor-not-allowed disabled:opacity-40"
                      >
                        Remove
                      </button>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                      <MoneyField
                        label="New home price"
                        value={purchase.homePrice}
                        onChange={(value) =>
                          updatePurchase(purchase.id, { homePrice: value })
                        }
                      />
                      <NumericField
                        label="Down payment"
                        value={purchase.downPaymentPercent}
                        step={0.1}
                        suffix="%"
                        onChange={(value) =>
                          updatePurchase(purchase.id, {
                            downPaymentPercent: value,
                          })
                        }
                      />
                      <NumericField
                        label="New mortgage rate"
                        value={purchase.mortgageRate}
                        step={0.125}
                        suffix="%"
                        onChange={(value) =>
                          updatePurchase(purchase.id, { mortgageRate: value })
                        }
                      />
                      <NumericField
                        label="New mortgage term"
                        value={purchase.mortgageYears}
                        step={1}
                        suffix="yrs"
                        onChange={(value) =>
                          updatePurchase(purchase.id, { mortgageYears: value })
                        }
                      />
                    </div>

                    <div className="mt-4 border-t border-stone-200 pt-4">
                      <p className="text-sm font-semibold text-stone-950">
                        Synced equity loan for down payment
                      </p>
                      <p className="mt-1 text-sm text-stone-500">
                        Loan amount: {formatCurrency(downPayment)}
                      </p>
                      <div className="mt-3 grid gap-4 sm:grid-cols-2">
                        <NumericField
                          label="Equity loan rate"
                          value={purchase.equityLoanRate}
                          step={0.125}
                          suffix="%"
                          onChange={(value) =>
                            updatePurchase(purchase.id, {
                              equityLoanRate: value,
                            })
                          }
                        />
                        <NumericField
                          label="Equity loan term"
                          value={purchase.equityLoanYears}
                          step={1}
                          suffix="yrs"
                          onChange={(value) =>
                            updatePurchase(purchase.id, {
                              equityLoanYears: value,
                            })
                          }
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="rounded-xl border border-stone-200 bg-white/90 p-6 shadow-[0_14px_40px_rgba(23,32,25,0.05)]">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-lg font-semibold text-stone-950">
                  Existing properties
                </h2>
                <p className="mt-1 text-sm text-stone-500">
                  Add rental properties that can offset the new debt stack.
                </p>
              </div>
              <button
                type="button"
                onClick={addExistingProperty}
                className="w-fit rounded-lg bg-[#564B69] px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#3C334C]"
              >
                Add Property
              </button>
            </div>

            <div className="mt-5 space-y-4">
              {inputs.existingProperties.map((property, index) => {
                const propertyResult = results.existingPropertyResults.find(
                  (item) => item.id === property.id
                );

                return (
                  <div
                    key={property.id}
                    className="border border-stone-200 bg-[#F7F4F2] p-4"
                  >
                    <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <TextField
                        label={`Existing property ${index + 1} name`}
                        value={property.name}
                        onChange={(value) =>
                          updateExistingProperty(property.id, { name: value })
                        }
                      />
                      <button
                        type="button"
                        onClick={() => removeExistingProperty(property.id)}
                        disabled={inputs.existingProperties.length === 1}
                        className="w-fit rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm font-medium text-stone-600 transition-colors hover:bg-stone-50 disabled:cursor-not-allowed disabled:opacity-40"
                      >
                        Remove
                      </button>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-3">
                      <MoneyField
                        label="Monthly rent"
                        value={property.rent}
                        onChange={(value) =>
                          updateExistingProperty(property.id, { rent: value })
                        }
                      />
                      <MoneyField
                        label="Common charge"
                        value={property.commonCharge}
                        onChange={(value) =>
                          updateExistingProperty(property.id, {
                            commonCharge: value,
                          })
                        }
                      />
                      <MoneyField
                        label="Monthly tax"
                        value={property.monthlyTax}
                        onChange={(value) =>
                          updateExistingProperty(property.id, {
                            monthlyTax: value,
                          })
                        }
                      />
                    </div>

                    <p className="mt-3 text-sm text-stone-500">
                      Net cash flow:{" "}
                      <span className="font-semibold text-[#477A87]">
                        {formatSignedCurrency(propertyResult?.netCashFlow ?? 0)}
                      </span>
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="rounded-xl border border-stone-200 bg-white/90 p-6 shadow-[0_14px_40px_rgba(23,32,25,0.05)]">
            <h2 className="text-lg font-semibold text-stone-950">
              Income lens
            </h2>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <MoneyField
                label="Annual pre-tax income"
                value={inputs.annualIncome}
                onChange={(value) =>
                  setInputs((current) => ({
                    ...current,
                    annualIncome: Number.isFinite(value) ? value : 0,
                  }))
                }
              />
            </div>
          </div>
        </section>

        <aside className="lg:sticky lg:top-6 lg:self-start">
          <div className="rounded-xl border border-[#E3DCE8] bg-white p-6 shadow-[0_24px_70px_rgba(32,27,38,0.1)]">
            <p className="text-sm font-semibold uppercase text-stone-500">
              Estimated monthly cost
            </p>
            <p className="mt-3 text-5xl font-semibold text-stone-950">
              {formatCurrency(results.netMonthlyCost)}
            </p>
            <p className="mt-3 text-sm leading-6 text-stone-500">
              Total debt service across purchases minus total cash flow from
              existing properties.
            </p>

            <div className="mt-6 grid gap-4">
              <div className="border border-stone-200 bg-[#F7F4F2] p-4">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-xs font-semibold uppercase text-stone-500">
                      Total loan monthly cost
                    </p>
                    <p className="mt-2 text-2xl font-semibold text-stone-950">
                      {formatCurrency(results.totalDebtPayment)}
                    </p>
                  </div>
                  <span className="rounded-lg bg-white px-3 py-1 text-xs font-semibold text-rose-700">
                    Cost
                  </span>
                </div>
                <div className="mt-3 divide-y divide-stone-200">
                  <ResultRow
                    label="Equity loans"
                    value={formatCurrency(results.equityLoanPayment)}
                    tone="cost"
                  />
                  <ResultRow
                    label="New mortgages"
                    value={formatCurrency(results.mortgagePayment)}
                    tone="cost"
                  />
                </div>
              </div>

              <div className="border border-stone-200 bg-[#F7F4F2] p-4">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-xs font-semibold uppercase text-stone-500">
                      Existing property cash flow
                    </p>
                    <p className="mt-2 text-2xl font-semibold text-[#477A87]">
                      {formatSignedCurrency(results.existingNetCashFlow)}
                    </p>
                  </div>
                  <span className="rounded-lg bg-white px-3 py-1 text-xs font-semibold text-[#477A87]">
                    Offset
                  </span>
                </div>
                <div className="mt-3 divide-y divide-stone-200">
                  <ResultRow
                    label="Rent"
                    value={formatSignedCurrency(results.totalRent)}
                    tone="income"
                  />
                  <ResultRow
                    label="Common charges + taxes"
                    value={formatCurrency(results.existingPropertyCost)}
                    tone="cost"
                  />
                </div>
              </div>
            </div>

            <div className="mt-6 grid gap-x-6 gap-y-5 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
              <div>
                <p className="text-xs font-medium uppercase text-stone-500">
                  Purchase value
                </p>
                <p className="mt-2 text-lg font-semibold text-stone-950">
                  {formatCurrency(results.totalHomePrice)}
                </p>
              </div>
              <div>
                <p className="text-xs font-medium uppercase text-stone-500">
                  Mortgage principal
                </p>
                <p className="mt-2 text-lg font-semibold text-stone-950">
                  {formatCurrency(results.mortgagePrincipal)}
                </p>
              </div>
              <div>
                <p className="text-xs font-medium uppercase text-stone-500">
                  Monthly gross income
                </p>
                <p className="mt-2 text-lg font-semibold text-stone-950">
                  {formatCurrency(results.monthlyGrossIncome)}
                </p>
              </div>
              <div>
                <p className="text-xs font-medium uppercase text-stone-500">
                  Cost to gross income
                </p>
                <p className="mt-2 text-lg font-semibold text-stone-950">
                  {formatPercent(results.netCostToGrossIncome)}%
                </p>
              </div>
            </div>

            <div className="mt-6 border-t border-[#E3DCE8] pt-4 text-sm text-[#564B69]">
              {formatCurrency(results.totalDebtPayment)} total loan monthly
              cost - {formatCurrency(results.existingNetCashFlow)} cash flow ={" "}
              <span className="font-semibold">
                {formatCurrency(results.netMonthlyCost)} per month
              </span>
            </div>

            <div className="mt-6 border-t border-stone-200 pt-5">
              <h3 className="text-sm font-semibold uppercase text-stone-500">
                How this is calculated
              </h3>
              <div className="mt-4 space-y-4 text-sm leading-6 text-stone-600">
                <div>
                  <p className="font-medium text-stone-950">
                    Monthly loan payment
                  </p>
                  <code className="mt-2 block overflow-x-auto rounded-lg bg-[#F7F4F2] px-3 py-2 font-mono text-xs text-[#3C334C]">
                    M = P x (i(1 + i)^n) / ((1 + i)^n - 1)
                  </code>
                  <p className="mt-2">
                    Each purchase runs this formula for its synced equity loan
                    and mortgage. The page then sums all equity loan payments
                    and all mortgage payments.
                  </p>
                </div>

                <div className="space-y-3 border-t border-stone-100 pt-4">
                  {results.purchaseResults.map((purchase, index) => (
                    <div key={purchase.id}>
                      <p className="font-medium text-stone-950">
                        {purchase.name || `Purchase ${index + 1}`}
                      </p>
                      <p>
                        Equity loan: P = {formatCurrency(purchase.downPayment)},
                        i = {formatRate(purchase.equityLoanMonthlyRate)}, n ={" "}
                        {purchase.equityLoanMonths}. Payment ={" "}
                        <span className="font-semibold text-stone-950">
                          {formatCurrency(purchase.equityLoanPayment)}
                        </span>
                        .
                      </p>
                      <p>
                        Mortgage: P ={" "}
                        {formatCurrency(purchase.mortgagePrincipal)}, i ={" "}
                        {formatRate(purchase.mortgageMonthlyRate)}, n ={" "}
                        {purchase.mortgageMonths}. Payment ={" "}
                        <span className="font-semibold text-stone-950">
                          {formatCurrency(purchase.mortgagePayment)}
                        </span>
                        .
                      </p>
                    </div>
                  ))}
                </div>

                <div className="border-t border-stone-100 pt-4">
                  <p className="font-medium text-stone-950">
                    Net monthly housing cost
                  </p>
                  <code className="mt-2 block overflow-x-auto rounded-lg bg-[#F7F4F2] px-3 py-2 font-mono text-xs text-[#3C334C]">
                    Net cost = total loan monthly cost - total cash flow
                  </code>
                  <p className="mt-2">
                    Current scenario: {formatCurrency(results.totalDebtPayment)}{" "}
                    - {formatCurrency(results.existingNetCashFlow)} ={" "}
                    <span className="font-semibold text-stone-950">
                      {formatCurrency(results.netMonthlyCost)}
                    </span>
                    .
                  </p>
                </div>
              </div>
            </div>
          </div>
        </aside>
      </div>

      <section className="mt-8 border-t border-stone-200 pt-8">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase text-[#564B69]">
              Advanced comparison
            </p>
            <h2 className="mt-2 text-2xl font-semibold text-stone-950">
              Compare two assumptions across the full stack.
            </h2>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-stone-600">
              Rate and term variables apply to every new purchase in the
              comparison. Expected cash flow replaces the total existing
              property cash flow for each cell.
            </p>
          </div>
          <div className="grid gap-2 text-sm text-stone-600 sm:grid-cols-2">
            <div>
              <span className="font-medium text-stone-950">Best: </span>
              {formatCurrency(scenarioGrid.best.netMonthlyCost)}
            </div>
            <div>
              <span className="font-medium text-stone-950">Worst: </span>
              {formatCurrency(scenarioGrid.worst.netMonthlyCost)}
            </div>
          </div>
        </div>

        <div className="mt-6 grid gap-4 lg:grid-cols-2">
          <ScenarioAxisControls
            label="Horizontal axis"
            axis={scenarioConfig.x}
            unavailableKey={scenarioConfig.y.key}
            onChange={(axis) => updateScenarioAxis("x", axis)}
          />
          <ScenarioAxisControls
            label="Vertical axis"
            axis={scenarioConfig.y}
            unavailableKey={scenarioConfig.x.key}
            onChange={(axis) => updateScenarioAxis("y", axis)}
          />
        </div>

        <div className="mt-6 overflow-x-auto border border-stone-200 bg-white">
          <table className="min-w-full border-collapse text-sm">
            <thead>
              <tr>
                <th className="sticky left-0 z-10 border-b border-r border-stone-200 bg-white px-3 py-3 text-left font-semibold text-stone-600">
                  {scenarioOptions[scenarioConfig.y.key].shortLabel} /{" "}
                  {scenarioOptions[scenarioConfig.x.key].shortLabel}
                </th>
                {scenarioGrid.xValues.map((value) => (
                  <th
                    key={value}
                    className="border-b border-stone-200 px-3 py-3 text-right font-semibold text-stone-600"
                  >
                    {scenarioOptions[scenarioConfig.x.key].format(value)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {scenarioGrid.cells.map((row, rowIndex) => (
                <tr key={scenarioGrid.yValues[rowIndex]}>
                  <th className="sticky left-0 z-10 border-r border-stone-200 bg-white px-3 py-3 text-left font-semibold text-stone-600">
                    {scenarioOptions[scenarioConfig.y.key].format(
                      scenarioGrid.yValues[rowIndex]
                    )}
                  </th>
                  {row.map((cell) => (
                    <td
                      key={`${cell.xValue}-${cell.yValue}`}
                      className="min-w-28 border-l border-t border-white/60 px-3 py-3 text-right"
                      style={heatmapStyle(cell.netCostToGrossIncome)}
                      title={`Debt ${formatCurrency(
                        cell.totalDebtPayment
                      )}, cash flow ${formatSignedCurrency(
                        cell.existingNetCashFlow
                      )}, cost-to-income ${formatPercent(
                        cell.netCostToGrossIncome
                      )}%`}
                    >
                      <span className="block font-semibold">
                        {formatCurrency(cell.netMonthlyCost)}
                      </span>
                      <span className="block text-xs opacity-80">
                        {formatPercent(cell.netCostToGrossIncome)}% income
                      </span>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-4 flex flex-wrap gap-3 text-xs text-stone-600">
          <span className="inline-flex items-center gap-2">
            <span className="h-3 w-6 rounded-sm bg-[#E7F0F1]" />
            Under 33% of income
          </span>
          <span className="inline-flex items-center gap-2">
            <span className="h-3 w-6 rounded-sm bg-[#F6E8D8]" />
            33% to 66% of income
          </span>
          <span className="inline-flex items-center gap-2">
            <span className="h-3 w-6 rounded-sm bg-[#F1DDE1]" />
            Over 66% of income
          </span>
        </div>
      </section>
    </div>
  );
}
