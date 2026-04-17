"use client";

import { useMemo, useState } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

type BuyVsInvestInputs = {
  includeTaxAnalysis: boolean;
  annualIncome: number;
  monthlyRent: number;
  rentIncreasePercent: number;
  monthlyDebt: number;
  cashAvailable: number;
  monthlyInvestmentBudget: number;
  investmentName: string;
  expectedAnnualReturn: number;
  housePrice: number;
  downPaymentPercent: number;
  mortgageRate: number;
  loanYears: number;
  propertyTaxPercent: number;
  insuranceMonthly: number;
  hoaMonthly: number;
  maintenancePercent: number;
  closingCostPercent: number;
  sellingCostPercent: number;
  terminalHomePrice: number;
  horizonYears: number;
  marginalTaxRate: number;
  investmentGainTaxRate: number;
  homeSaleGainTaxRate: number;
  primaryResidenceExclusion: number;
  mortgageInterestDeductionCap: number;
  saltDeductionCap: number;
  otherSaltUsedAnnual: number;
  transferTaxPercent: number;
};

const defaultInputs: BuyVsInvestInputs = {
  includeTaxAnalysis: false,
  annualIncome: 250_000,
  monthlyRent: 5_500,
  rentIncreasePercent: 5,
  monthlyDebt: 500,
  cashAvailable: 240_000,
  monthlyInvestmentBudget: 1_500,
  investmentName: "S&P 500",
  expectedAnnualReturn: 7,
  housePrice: 1_500_000,
  downPaymentPercent: 20,
  mortgageRate: 6.25,
  loanYears: 30,
  propertyTaxPercent: 1.2,
  insuranceMonthly: 250,
  hoaMonthly: 600,
  maintenancePercent: 1,
  closingCostPercent: 3,
  sellingCostPercent: 6,
  terminalHomePrice: 2_000_000,
  horizonYears: 10,
  marginalTaxRate: 35,
  investmentGainTaxRate: 31,
  homeSaleGainTaxRate: 31,
  primaryResidenceExclusion: 250_000,
  mortgageInterestDeductionCap: 750_000,
  saltDeductionCap: 40_000,
  otherSaltUsedAnnual: 0,
  transferTaxPercent: 0.11,
};

const HOLDING_PERIOD_OPTIONS = [5, 10, 15, 20, 30];

function monthlyPayment(principal: number, annualRate: number, years: number) {
  if (principal <= 0 || years <= 0) return 0;

  const months = years * 12;
  const monthlyRate = annualRate / 100 / 12;

  if (monthlyRate === 0) return principal / months;

  const growth = Math.pow(1 + monthlyRate, months);
  return principal * ((monthlyRate * growth) / (growth - 1));
}

function remainingBalance(
  principal: number,
  annualRate: number,
  years: number,
  monthsPaid: number
) {
  if (principal <= 0) return 0;

  const totalMonths = years * 12;
  const paid = Math.min(Math.max(monthsPaid, 0), totalMonths);
  const monthlyRate = annualRate / 100 / 12;

  if (monthlyRate === 0) {
    return Math.max(principal - (principal / totalMonths) * paid, 0);
  }

  const payment = monthlyPayment(principal, annualRate, years);
  const growth = Math.pow(1 + monthlyRate, paid);
  return principal * growth - payment * ((growth - 1) / monthlyRate);
}

function futureValueFromMonthlyContributions(
  initial: number,
  monthlyContributions: number[],
  annualReturn: number
) {
  const monthlyReturn = annualReturn / 100 / 12;

  return monthlyContributions.reduce(
    (value, contribution) => value * (1 + monthlyReturn) + contribution,
    initial
  );
}

function sumMonthlyContributions(monthlyContributions: number[]) {
  return monthlyContributions.reduce(
    (total, contribution) => total + contribution,
    0
  );
}

function impliedAnnualAppreciation(
  startingValue: number,
  terminalValue: number,
  years: number
) {
  if (startingValue <= 0 || terminalValue <= 0 || years <= 0) return 0;

  return (Math.pow(terminalValue / startingValue, 1 / years) - 1) * 100;
}

function totalInterestPaid(
  principal: number,
  annualRate: number,
  years: number,
  monthsPaid: number
) {
  if (principal <= 0 || years <= 0 || monthsPaid <= 0) return 0;

  const totalMonths = years * 12;
  const paid = Math.min(Math.max(monthsPaid, 0), totalMonths);
  const monthlyRate = annualRate / 100 / 12;
  const payment = monthlyPayment(principal, annualRate, years);
  let balance = principal;
  let interestPaid = 0;

  for (let month = 0; month < paid; month += 1) {
    const interest = monthlyRate === 0 ? 0 : balance * monthlyRate;
    const principalPaid =
      monthlyRate === 0 ? principal / totalMonths : payment - interest;

    interestPaid += interest;
    balance = Math.max(balance - principalPaid, 0);
  }

  return interestPaid;
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
}

function formatCompactCurrency(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    notation: "compact",
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

function SwitchField({
  label,
  helper,
  checked,
  onChange,
}: {
  label: string;
  helper: string;
  checked: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <p className="text-sm font-medium text-stone-700">{label}</p>
        <p className="mt-1 text-sm leading-5 text-stone-500">{helper}</p>
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`flex h-9 w-16 shrink-0 items-center rounded-lg border p-1 transition-colors focus:outline-none focus:ring-2 focus:ring-[#564B69]/20 ${
          checked
            ? "border-[#564B69] bg-[#564B69]"
            : "border-stone-300 bg-stone-100"
        }`}
      >
        <span
          className={`h-7 w-7 rounded-md bg-white shadow-sm transition-transform ${
            checked ? "translate-x-7" : "translate-x-0"
          }`}
        />
      </button>
    </div>
  );
}

function MetricCard({
  label,
  value,
  helper,
  tone = "default",
}: {
  label: string;
  value: string;
  helper?: string;
  tone?: "default" | "good" | "warn";
}) {
  const toneClass =
    tone === "good"
      ? "text-[#477A87]"
      : tone === "warn"
        ? "text-[#A3545C]"
        : "text-stone-950";

  return (
    <div className="rounded-xl border border-stone-200 bg-white p-5 shadow-[0_14px_40px_rgba(32,27,38,0.05)]">
      <p className="text-sm font-medium text-stone-500">{label}</p>
      <p className={`mt-2 text-2xl font-semibold ${toneClass}`}>{value}</p>
      {helper && <p className="mt-2 text-sm leading-5 text-stone-500">{helper}</p>}
    </div>
  );
}

function ComparisonRow({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center justify-between gap-4 border-t border-stone-100 py-3 first:border-0">
      <span className="text-sm text-stone-500">{label}</span>
      <span className="text-sm font-semibold text-stone-950">{value}</span>
    </div>
  );
}

function Section({
  title,
  eyebrow,
  children,
}: {
  title: string;
  eyebrow?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-xl border border-stone-200 bg-white/90 p-6 shadow-[0_14px_40px_rgba(32,27,38,0.05)]">
      {eyebrow && (
        <p className="text-sm font-semibold uppercase text-[#564B69]">
          {eyebrow}
        </p>
      )}
      <h2 className="mt-1 text-lg font-semibold text-stone-950">{title}</h2>
      <div className="mt-5">{children}</div>
    </section>
  );
}

export default function AnalyticsPage() {
  const [inputs, setInputs] = useState(defaultInputs);

  const update = <K extends keyof BuyVsInvestInputs>(
    key: K,
    value: BuyVsInvestInputs[K]
  ) => {
    setInputs((current) => ({ ...current, [key]: value }));
  };

  const results = useMemo(() => {
    const monthlyIncome = inputs.annualIncome / 12;
    const downPayment = inputs.housePrice * (inputs.downPaymentPercent / 100);
    const closingCost = inputs.housePrice * (inputs.closingCostPercent / 100);
    const cashNeeded = downPayment + closingCost;
    const loanAmount = Math.max(inputs.housePrice - downPayment, 0);
    const principalInterest = monthlyPayment(
      loanAmount,
      inputs.mortgageRate,
      inputs.loanYears
    );
    const propertyTax = (inputs.housePrice * (inputs.propertyTaxPercent / 100)) / 12;
    const maintenance =
      (inputs.housePrice * (inputs.maintenancePercent / 100)) / 12;
    const monthlyOwnerCost =
      principalInterest +
      propertyTax +
      inputs.insuranceMonthly +
      inputs.hoaMonthly +
      maintenance;
    const buyerDti =
      monthlyIncome > 0
        ? ((monthlyOwnerCost + inputs.monthlyDebt) / monthlyIncome) * 100
        : 0;
    const renterMonthlyCost = inputs.monthlyRent + inputs.monthlyDebt;
    const renterDti =
      monthlyIncome > 0 ? (renterMonthlyCost / monthlyIncome) * 100 : 0;
    const months = inputs.horizonYears * 12;
    const monthlyInvestmentContributions = Array.from(
      { length: months },
      (_, month) => {
        const rentForMonth =
          inputs.monthlyRent *
          Math.pow(1 + inputs.rentIncreasePercent / 100, Math.floor(month / 12));
        const rentAdvantage = Math.max(monthlyOwnerCost - rentForMonth, 0);

        return inputs.monthlyInvestmentBudget + rentAdvantage;
      }
    );
    const monthlyRentAdvantage = Math.max(
      monthlyOwnerCost - inputs.monthlyRent,
      0
    );
    const impliedHomeAppreciationPercent = impliedAnnualAppreciation(
      inputs.housePrice,
      inputs.terminalHomePrice,
      inputs.horizonYears
    );
    const futureHomeValue = inputs.terminalHomePrice;
    const balance = remainingBalance(
      loanAmount,
      inputs.mortgageRate,
      inputs.loanYears,
      months
    );
    const sellingCost = futureHomeValue * (inputs.sellingCostPercent / 100);
    const transferTax = inputs.includeTaxAnalysis
      ? futureHomeValue * (inputs.transferTaxPercent / 100)
      : 0;
    const preTaxHomeEquity = Math.max(
      futureHomeValue - balance - sellingCost,
      0
    );
    const homeSaleGain = Math.max(
      futureHomeValue - inputs.housePrice - sellingCost - transferTax,
      0
    );
    const taxableHomeSaleGain = inputs.includeTaxAnalysis
      ? Math.max(homeSaleGain - inputs.primaryResidenceExclusion, 0)
      : 0;
    const homeSaleTax =
      taxableHomeSaleGain * (inputs.homeSaleGainTaxRate / 100);
    const mortgageInterestPaid = totalInterestPaid(
      loanAmount,
      inputs.mortgageRate,
      inputs.loanYears,
      months
    );
    const qualifiedDebtRatio =
      loanAmount > 0
        ? Math.min(inputs.mortgageInterestDeductionCap / loanAmount, 1)
        : 0;
    const deductibleMortgageInterest =
      inputs.includeTaxAnalysis ? mortgageInterestPaid * qualifiedDebtRatio : 0;
    const availableSaltAnnual = Math.max(
      inputs.saltDeductionCap - inputs.otherSaltUsedAnnual,
      0
    );
    const deductiblePropertyTax =
      inputs.includeTaxAnalysis
        ? Math.min(propertyTax * 12, availableSaltAnnual) * inputs.horizonYears
        : 0;
    const ownerTaxSavings =
      (deductibleMortgageInterest + deductiblePropertyTax) *
      (inputs.marginalTaxRate / 100);
    const projectedHomeEquity = Math.max(
      preTaxHomeEquity - homeSaleTax - transferTax + ownerTaxSavings,
      0
    );
    const investedInitial = Math.max(cashNeeded, 0);
    const investedMonthly = inputs.monthlyInvestmentBudget + monthlyRentAdvantage;
    const totalMonthlyInvested = sumMonthlyContributions(
      monthlyInvestmentContributions
    );
    const investmentPrincipal = investedInitial + totalMonthlyInvested;
    const preTaxInvestmentValue = futureValueFromMonthlyContributions(
      investedInitial,
      monthlyInvestmentContributions,
      inputs.expectedAnnualReturn
    );
    const taxableInvestmentGain = inputs.includeTaxAnalysis
      ? Math.max(preTaxInvestmentValue - investmentPrincipal, 0)
      : 0;
    const investmentTax =
      taxableInvestmentGain * (inputs.investmentGainTaxRate / 100);
    const projectedInvestmentValue = preTaxInvestmentValue - investmentTax;
    const advantage = projectedHomeEquity - projectedInvestmentValue;
    const cashShortfall = Math.max(cashNeeded - inputs.cashAvailable, 0);

    return {
      monthlyIncome,
      downPayment,
      closingCost,
      cashNeeded,
      loanAmount,
      principalInterest,
      propertyTax,
      maintenance,
      monthlyOwnerCost,
      buyerDti,
      renterMonthlyCost,
      renterDti,
      monthlyRentAdvantage,
      monthlyInvestmentContributions,
      investedMonthly,
      investmentPrincipal,
      preTaxInvestmentValue,
      investmentTax,
      impliedHomeAppreciationPercent,
      futureHomeValue,
      balance,
      sellingCost,
      transferTax,
      preTaxHomeEquity,
      homeSaleGain,
      taxableHomeSaleGain,
      homeSaleTax,
      mortgageInterestPaid,
      deductibleMortgageInterest,
      deductiblePropertyTax,
      ownerTaxSavings,
      projectedHomeEquity,
      projectedInvestmentValue,
      advantage,
      cashShortfall,
    };
  }, [inputs]);

  const targetRange = useMemo(() => {
    const cashLimitedPrice =
      inputs.downPaymentPercent + inputs.closingCostPercent > 0
        ? inputs.cashAvailable /
          ((inputs.downPaymentPercent + inputs.closingCostPercent) / 100)
        : 0;

    const monthlyIncome = inputs.annualIncome / 12;
    const priceForDti = (targetDti: number) => {
      let low = 0;
      let high = Math.max(inputs.housePrice * 2, cashLimitedPrice, 500_000);

      for (let i = 0; i < 40; i++) {
        const mid = (low + high) / 2;
        const downPayment = mid * (inputs.downPaymentPercent / 100);
        const loan = Math.max(mid - downPayment, 0);
        const ownerCost =
          monthlyPayment(loan, inputs.mortgageRate, inputs.loanYears) +
          (mid * (inputs.propertyTaxPercent / 100)) / 12 +
          inputs.insuranceMonthly +
          inputs.hoaMonthly +
          (mid * (inputs.maintenancePercent / 100)) / 12;
        const dti =
          monthlyIncome > 0
            ? ((ownerCost + inputs.monthlyDebt) / monthlyIncome) * 100
            : 100;

        if (dti <= targetDti) low = mid;
        else high = mid;
      }

      return low;
    };

    const comfortable = Math.min(priceForDti(33), cashLimitedPrice || Infinity);
    const stretch = Math.min(priceForDti(45), cashLimitedPrice || Infinity);

    return {
      cashLimitedPrice,
      comfortable,
      stretch,
    };
  }, [inputs]);

  const chartData = useMemo(() => {
    return Array.from({ length: inputs.horizonYears + 1 }, (_, year) => {
      const months = year * 12;
      const homeValue =
        year === inputs.horizonYears
          ? inputs.terminalHomePrice
          : inputs.housePrice *
            Math.pow(1 + results.impliedHomeAppreciationPercent / 100, year);
      const balance = remainingBalance(
        results.loanAmount,
        inputs.mortgageRate,
        inputs.loanYears,
        months
      );
      const sellingCost = homeValue * (inputs.sellingCostPercent / 100);
      const transferTax = inputs.includeTaxAnalysis
        ? homeValue * (inputs.transferTaxPercent / 100)
        : 0;
      const preTaxHomeEquity = Math.max(homeValue - balance - sellingCost, 0);
      const homeSaleGain = Math.max(
        homeValue - inputs.housePrice - sellingCost - transferTax,
        0
      );
      const taxableHomeSaleGain = inputs.includeTaxAnalysis
        ? Math.max(homeSaleGain - inputs.primaryResidenceExclusion, 0)
        : 0;
      const homeSaleTax =
        taxableHomeSaleGain * (inputs.homeSaleGainTaxRate / 100);
      const interestPaid = totalInterestPaid(
        results.loanAmount,
        inputs.mortgageRate,
        inputs.loanYears,
        months
      );
      const qualifiedDebtRatio =
        results.loanAmount > 0
          ? Math.min(
              inputs.mortgageInterestDeductionCap / results.loanAmount,
              1
            )
          : 0;
      const deductibleMortgageInterest = inputs.includeTaxAnalysis
        ? interestPaid * qualifiedDebtRatio
        : 0;
      const availableSaltAnnual = Math.max(
        inputs.saltDeductionCap - inputs.otherSaltUsedAnnual,
        0
      );
      const deductiblePropertyTax = inputs.includeTaxAnalysis
        ? Math.min(results.propertyTax * 12, availableSaltAnnual) * year
        : 0;
      const ownerTaxSavings =
        (deductibleMortgageInterest + deductiblePropertyTax) *
        (inputs.marginalTaxRate / 100);
      const homeEquity = Math.max(
        preTaxHomeEquity - homeSaleTax - transferTax + ownerTaxSavings,
        0
      );
      const monthlyContributions =
        results.monthlyInvestmentContributions.slice(0, months);
      const investmentPreTaxValue = futureValueFromMonthlyContributions(
        results.cashNeeded,
        monthlyContributions,
        inputs.expectedAnnualReturn,
      );
      const investmentPrincipal =
        results.cashNeeded + sumMonthlyContributions(monthlyContributions);
      const taxableInvestmentGain = inputs.includeTaxAnalysis
        ? Math.max(investmentPreTaxValue - investmentPrincipal, 0)
        : 0;
      const investmentTax =
        taxableInvestmentGain * (inputs.investmentGainTaxRate / 100);
      const investmentValue = investmentPreTaxValue - investmentTax;

      return {
        year,
        homeEquity,
        investmentValue,
      };
    });
  }, [inputs, results]);

  const buyingLeads = results.advantage >= 0;
  const betterPath = buyingLeads
    ? "Buying builds more projected value"
    : "Renting and investing leads";
  const winnerName = buyingLeads ? "Buying" : `Renting + ${inputs.investmentName}`;
  const loserName = buyingLeads ? `Renting + ${inputs.investmentName}` : "Buying";
  const difference = Math.abs(results.advantage);
  const holdingPeriodLabel = `${inputs.horizonYears} ${
    inputs.horizonYears === 1 ? "year" : "years"
  }`;
  const decisionSentence = (
    <>
      {winnerName} is ahead of {loserName} by{" "}
      <span className="font-semibold text-stone-950">
        {formatCurrency(difference)}
      </span>{" "}
      after{" "}
      <span className="font-semibold text-stone-950">
        {holdingPeriodLabel}
      </span>
      .
    </>
  );
  const dtiTone =
    results.buyerDti < 33 ? "good" : results.buyerDti <= 45 ? "default" : "warn";

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-8 border-b border-stone-200 pb-8">
        <p className="text-sm font-semibold uppercase text-[#564B69]">
          Buy vs Rent + Invest
        </p>
        <h1 className="mt-3 max-w-4xl text-4xl font-semibold leading-tight text-stone-950">
          Find the home price range that makes sense before the open house.
        </h1>
        <p className="mt-4 max-w-3xl text-lg leading-8 text-stone-600">
          Compare the monthly reality of buying a first home against continuing
          to rent and investing the cash instead.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.1fr)_minmax(360px,0.9fr)]">
        <div className="space-y-6">
          <Section title="Current situation" eyebrow="Income and today">
            <div className="grid gap-4 sm:grid-cols-2">
              <MoneyField
                label="Annual pre-tax income"
                value={inputs.annualIncome}
                onChange={(value) => update("annualIncome", value)}
              />
              <MoneyField
                label="Monthly rent"
                value={inputs.monthlyRent}
                onChange={(value) => update("monthlyRent", value)}
              />
              <NumericField
                label="Annual rent increase"
                value={inputs.rentIncreasePercent}
                step={0.25}
                suffix="%"
                onChange={(value) => update("rentIncreasePercent", value)}
              />
              <MoneyField
                label="Other monthly debt"
                value={inputs.monthlyDebt}
                onChange={(value) => update("monthlyDebt", value)}
              />
              <MoneyField
                label="Cash available"
                value={inputs.cashAvailable}
                onChange={(value) => update("cashAvailable", value)}
              />
            </div>
          </Section>

          <Section title="Investment alternative" eyebrow="Rent and invest">
            <div className="grid gap-4 sm:grid-cols-3">
              <TextField
                label="Investment target"
                value={inputs.investmentName}
                onChange={(value) => update("investmentName", value)}
              />
              <NumericField
                label="Expected annual return"
                value={inputs.expectedAnnualReturn}
                step={0.25}
                suffix="%"
                onChange={(value) => update("expectedAnnualReturn", value)}
              />
              <MoneyField
                label="Extra monthly investing"
                value={inputs.monthlyInvestmentBudget}
                onChange={(value) => update("monthlyInvestmentBudget", value)}
              />
            </div>
          </Section>

          <Section title="Target home" eyebrow="Buy path">
            <div className="grid gap-4 sm:grid-cols-3">
              <MoneyField
                label="Target house price"
                value={inputs.housePrice}
                onChange={(value) => update("housePrice", value)}
              />
              <NumericField
                label="Down payment"
                value={inputs.downPaymentPercent}
                step={0.5}
                suffix="%"
                onChange={(value) => update("downPaymentPercent", value)}
              />
              <NumericField
                label="Loan term"
                value={inputs.loanYears}
                step={1}
                suffix="yrs"
                onChange={(value) => update("loanYears", value)}
              />
              <NumericField
                label="Mortgage rate"
                value={inputs.mortgageRate}
                step={0.125}
                suffix="%"
                onChange={(value) => update("mortgageRate", value)}
              />
              <NumericField
                label="Property tax"
                value={inputs.propertyTaxPercent}
                step={0.1}
                suffix="%"
                onChange={(value) => update("propertyTaxPercent", value)}
              />
              <MoneyField
                label="Terminal home price"
                value={inputs.terminalHomePrice}
                onChange={(value) => update("terminalHomePrice", value)}
              />
              <MoneyField
                label="Insurance monthly"
                value={inputs.insuranceMonthly}
                onChange={(value) => update("insuranceMonthly", value)}
              />
              <MoneyField
                label="HOA monthly"
                value={inputs.hoaMonthly}
                onChange={(value) => update("hoaMonthly", value)}
              />
              <NumericField
                label="Maintenance"
                value={inputs.maintenancePercent}
                step={0.1}
                suffix="%"
                onChange={(value) => update("maintenancePercent", value)}
              />
              <NumericField
                label="Closing cost"
                value={inputs.closingCostPercent}
                step={0.25}
                suffix="%"
                onChange={(value) => update("closingCostPercent", value)}
              />
              <NumericField
                label="Selling cost"
                value={inputs.sellingCostPercent}
                step={0.25}
                suffix="%"
                onChange={(value) => update("sellingCostPercent", value)}
              />
              <NumericField
                label="Time horizon"
                value={inputs.horizonYears}
                min={1}
                step={1}
                suffix="yrs"
                onChange={(value) => update("horizonYears", value)}
              />
            </div>
            <p className="mt-3 rounded-lg border border-[#E3DCE8] bg-[#FBFAFC] px-4 py-3 text-sm leading-6 text-stone-600">
              Implied appreciation is{" "}
              <span className="font-semibold text-stone-950">
                {formatPercent(results.impliedHomeAppreciationPercent)}% per
                year
              </span>{" "}
              from {formatCurrency(inputs.housePrice)} today to{" "}
              {formatCurrency(inputs.terminalHomePrice)} after{" "}
              <span className="font-semibold text-stone-950">
                {holdingPeriodLabel}
              </span>
              .
            </p>

            <div className="mt-5 border-t border-stone-100 pt-4">
              <p className="text-sm font-medium text-stone-700">
                Compare holding period
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                {HOLDING_PERIOD_OPTIONS.map((years) => {
                  const selected = inputs.horizonYears === years;

                  return (
                    <button
                      key={years}
                      type="button"
                      onClick={() => update("horizonYears", years)}
                      className={`rounded-lg border px-3 py-2 text-sm font-medium transition-colors ${
                        selected
                          ? "border-[#564B69] bg-[#EEE9F4] text-[#564B69]"
                          : "border-stone-300 bg-white text-stone-600 hover:bg-stone-50"
                      }`}
                    >
                      {years} years
                    </button>
                  );
                })}
              </div>
            </div>
          </Section>

          <Section title="US tax analysis" eyebrow="Optional">
            <SwitchField
              label="Include simplified US tax impact"
              helper="Apply estimated mortgage and property-tax deductions, home-sale gain tax, transfer tax, and taxable investment gain tax."
              checked={inputs.includeTaxAnalysis}
              onChange={(value) => update("includeTaxAnalysis", value)}
            />

            {inputs.includeTaxAnalysis && (
              <div className="mt-5 grid gap-4 border-t border-stone-100 pt-5 sm:grid-cols-3">
                <NumericField
                  label="Marginal income tax rate"
                  value={inputs.marginalTaxRate}
                  step={0.5}
                  suffix="%"
                  onChange={(value) => update("marginalTaxRate", value)}
                />
                <NumericField
                  label="Investment gain tax"
                  value={inputs.investmentGainTaxRate}
                  step={0.5}
                  suffix="%"
                  onChange={(value) => update("investmentGainTaxRate", value)}
                />
                <NumericField
                  label="Home sale gain tax"
                  value={inputs.homeSaleGainTaxRate}
                  step={0.5}
                  suffix="%"
                  onChange={(value) => update("homeSaleGainTaxRate", value)}
                />
                <MoneyField
                  label="Primary residence exclusion"
                  value={inputs.primaryResidenceExclusion}
                  onChange={(value) =>
                    update("primaryResidenceExclusion", value)
                  }
                />
                <MoneyField
                  label="Mortgage deduction cap"
                  value={inputs.mortgageInterestDeductionCap}
                  onChange={(value) =>
                    update("mortgageInterestDeductionCap", value)
                  }
                />
                <MoneyField
                  label="SALT deduction cap"
                  value={inputs.saltDeductionCap}
                  onChange={(value) => update("saltDeductionCap", value)}
                />
                <MoneyField
                  label="Other SALT used yearly"
                  value={inputs.otherSaltUsedAnnual}
                  onChange={(value) => update("otherSaltUsedAnnual", value)}
                />
                <NumericField
                  label="Transfer tax"
                  value={inputs.transferTaxPercent}
                  step={0.01}
                  suffix="%"
                  onChange={(value) => update("transferTaxPercent", value)}
                />
              </div>
            )}

            {inputs.includeTaxAnalysis && (
              <p className="mt-3 text-xs leading-5 text-stone-500">
                Tax estimates use user-entered rates. The default home-sale
                exclusion is for a single primary residence owner; use $500,000
                when married filing jointly and eligible.
              </p>
            )}
          </Section>
        </div>

        <aside className="space-y-6 lg:sticky lg:top-6 lg:self-start">
          <div className="rounded-xl border border-[#E3DCE8] bg-white p-6 shadow-[0_24px_70px_rgba(32,27,38,0.1)]">
            <p className="text-sm font-semibold uppercase text-stone-500">
              Decision read
            </p>
            <h2 className="mt-3 text-3xl font-semibold text-stone-950">
              {betterPath}
            </h2>
            <p className="mt-3 text-sm leading-6 text-stone-500">
              {decisionSentence}
            </p>

            <div className="mt-5 grid gap-3 sm:grid-cols-3 lg:grid-cols-1 xl:grid-cols-3">
              <div className="rounded-lg border border-stone-200 bg-[#F7F4F2] p-4">
                <p className="text-xs font-semibold uppercase text-stone-500">
                  Buy path value
                </p>
                <p className="mt-2 text-xl font-semibold text-stone-950">
                  {formatCurrency(results.projectedHomeEquity)}
                </p>
                <p className="mt-1 text-xs text-stone-500">
                  {inputs.includeTaxAnalysis
                    ? "After-tax net home value"
                    : "Projected net home equity"}
                </p>
              </div>
              <div className="rounded-lg border border-stone-200 bg-[#F7F4F2] p-4">
                <p className="text-xs font-semibold uppercase text-stone-500">
                  Rent + invest value
                </p>
                <p className="mt-2 text-xl font-semibold text-stone-950">
                  {formatCurrency(results.projectedInvestmentValue)}
                </p>
                <p className="mt-1 text-xs text-stone-500">
                  {inputs.includeTaxAnalysis
                    ? "After-tax market account"
                    : "Projected market account"}
                </p>
              </div>
              <div className="rounded-lg border border-stone-200 bg-[#F7F4F2] p-4">
                <p className="text-xs font-semibold uppercase text-stone-500">
                  Opportunity cost
                </p>
                <p
                  className={`mt-2 text-xl font-semibold ${
                    buyingLeads ? "text-[#477A87]" : "text-[#A3545C]"
                  }`}
                >
                  {formatCurrency(difference)}
                </p>
                <p className="mt-1 text-xs text-stone-500">
                  Lost by choosing {loserName.toLowerCase()}
                </p>
              </div>
            </div>

            <div className="mt-6 grid gap-3">
              <MetricCard
                label="Monthly ownership cost"
                value={formatCurrency(results.monthlyOwnerCost)}
                helper={`${formatCurrency(results.principalInterest)} principal + interest`}
              />
              <MetricCard
                label="Buy path debt-to-income"
                value={`${formatPercent(results.buyerDti)}%`}
                helper="Debt-to-income means monthly housing cost plus other monthly debt divided by gross monthly income."
                tone={dtiTone}
              />
              <MetricCard
                label="Cash needed to buy"
                value={formatCurrency(results.cashNeeded)}
                helper={
                  results.cashShortfall > 0
                    ? `${formatCurrency(results.cashShortfall)} more cash needed`
                    : "Covered by available cash"
                }
                tone={results.cashShortfall > 0 ? "warn" : "good"}
              />
              {inputs.includeTaxAnalysis && (
                <MetricCard
                  label="Buy path tax impact"
                  value={formatCurrency(
                    results.ownerTaxSavings -
                      results.homeSaleTax -
                      results.transferTax
                  )}
                  helper={`${formatCurrency(
                    results.ownerTaxSavings
                  )} deduction value minus ${formatCurrency(
                    results.homeSaleTax + results.transferTax
                  )} sale taxes and transfer tax`}
                  tone={
                    results.ownerTaxSavings >=
                    results.homeSaleTax + results.transferTax
                      ? "good"
                      : "warn"
                  }
                />
              )}
            </div>
          </div>

          <div className="rounded-xl border border-stone-200 bg-white p-6">
            <h2 className="text-lg font-semibold text-stone-950">
              Suggested target range
            </h2>
            <div className="mt-4 divide-y divide-stone-100">
              <div className="flex justify-between gap-4 py-3">
                <span className="text-sm text-stone-500">Comfortable</span>
                <span className="font-semibold text-[#477A87]">
                  {formatCurrency(targetRange.comfortable)}
                </span>
              </div>
              <div className="flex justify-between gap-4 py-3">
                <span className="text-sm text-stone-500">Stretch</span>
                <span className="font-semibold text-[#B6854E]">
                  {formatCurrency(targetRange.stretch)}
                </span>
              </div>
              <div className="flex justify-between gap-4 py-3">
                <span className="text-sm text-stone-500">Cash-limited</span>
                <span className="font-semibold text-stone-950">
                  {formatCurrency(targetRange.cashLimitedPrice)}
                </span>
              </div>
            </div>
            <p className="mt-3 text-xs leading-5 text-stone-500">
              Comfortable uses 33% gross-income debt-to-income. Stretch uses
              45%. Both are capped by cash available for down payment plus
              closing costs.
            </p>
          </div>
        </aside>
      </div>

      <section className="mt-8 rounded-xl border border-stone-200 bg-white p-6 shadow-[0_14px_40px_rgba(32,27,38,0.05)]">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase text-[#564B69]">
              Outcome comparison
            </p>
            <h2 className="mt-1 text-lg font-semibold text-stone-950">
              What each path is worth after{" "}
              <span className="font-semibold">{holdingPeriodLabel}</span>
            </h2>
          </div>
          <p className="text-sm text-stone-500">{decisionSentence}</p>
        </div>

        <div className="mt-6 grid gap-4 lg:grid-cols-2">
          <div className="rounded-xl border border-stone-200 bg-[#F7F4F2] p-5">
            <p className="text-sm font-medium text-stone-500">
              Buy path:{" "}
              {inputs.includeTaxAnalysis
                ? "after-tax net value"
                : "projected home equity"}
            </p>
            <p className="mt-2 text-3xl font-semibold text-stone-950">
              {formatCurrency(results.projectedHomeEquity)}
            </p>
            <div className="mt-4">
              {inputs.includeTaxAnalysis && (
                <ComparisonRow
                  label="Pretax home equity"
                  value={formatCurrency(results.preTaxHomeEquity)}
                />
              )}
              <ComparisonRow
                label="Future home value"
                value={formatCurrency(results.futureHomeValue)}
              />
              <ComparisonRow
                label="Implied appreciation"
                value={`${formatPercent(
                  results.impliedHomeAppreciationPercent
                )}% / year`}
              />
              <ComparisonRow
                label="Remaining mortgage"
                value={`-${formatCurrency(results.balance)}`}
              />
              <ComparisonRow
                label="Estimated sale cost"
                value={`-${formatCurrency(results.sellingCost)}`}
              />
              {inputs.includeTaxAnalysis && (
                <>
                  <ComparisonRow
                    label="Transfer tax"
                    value={`-${formatCurrency(results.transferTax)}`}
                  />
                  <ComparisonRow
                    label="Taxable home-sale gain"
                    value={formatCurrency(results.taxableHomeSaleGain)}
                  />
                  <ComparisonRow
                    label="Home-sale gain tax"
                    value={`-${formatCurrency(results.homeSaleTax)}`}
                  />
                  <ComparisonRow
                    label="Owner tax savings"
                    value={`+${formatCurrency(results.ownerTaxSavings)}`}
                  />
                </>
              )}
            </div>
          </div>

          <div className="rounded-xl border border-stone-200 bg-[#F7F4F2] p-5">
            <p className="text-sm font-medium text-stone-500">
              Rent path:{" "}
              {inputs.includeTaxAnalysis ? "after-tax" : "projected"}{" "}
              {inputs.investmentName} account
            </p>
            <p className="mt-2 text-3xl font-semibold text-stone-950">
              {formatCurrency(results.projectedInvestmentValue)}
            </p>
            <div className="mt-4">
              {inputs.includeTaxAnalysis && (
                <ComparisonRow
                  label="Pretax market account"
                  value={formatCurrency(results.preTaxInvestmentValue)}
                />
              )}
              <ComparisonRow
                label="Initial cash invested"
                value={formatCurrency(results.cashNeeded)}
              />
              <ComparisonRow
                label="Starting monthly contribution"
                value={formatCurrency(results.investedMonthly)}
              />
              <ComparisonRow
                label="Annual rent increase"
                value={`${formatPercent(inputs.rentIncreasePercent)}%`}
              />
              {inputs.includeTaxAnalysis && (
                <ComparisonRow
                  label="Investment gain tax"
                  value={`-${formatCurrency(results.investmentTax)}`}
                />
              )}
              <ComparisonRow
                label="Rent path debt-to-income"
                value={`${formatPercent(results.renterDti)}%`}
              />
            </div>
          </div>
        </div>
      </section>

      <section className="mt-8 rounded-xl border border-stone-200 bg-white p-6 shadow-[0_14px_40px_rgba(32,27,38,0.05)]">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase text-[#564B69]">
              Path over time
            </p>
            <h2 className="mt-1 text-lg font-semibold text-stone-950">
              {inputs.includeTaxAnalysis
                ? "After-tax home value vs market account"
                : "Home equity vs market investment"}
            </h2>
          </div>
          <p className="text-sm text-stone-500">
            Horizon:{" "}
            <span className="font-semibold text-stone-950">
              {holdingPeriodLabel}
            </span>
          </p>
        </div>

        <div className="mt-6">
          <ResponsiveContainer width="100%" height={320} minWidth={0}>
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="homeEquity" x1="0" x2="0" y1="0" y2="1">
                  <stop offset="5%" stopColor="#564B69" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#564B69" stopOpacity={0.02} />
                </linearGradient>
                <linearGradient id="investmentValue" x1="0" x2="0" y1="0" y2="1">
                  <stop offset="5%" stopColor="#477A87" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#477A87" stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e3dce8" />
              <XAxis
                dataKey="year"
                tick={{ fill: "#6f6578" }}
                tickFormatter={(value) => `${value}y`}
              />
              <YAxis
                width={84}
                tick={{ fill: "#6f6578" }}
                tickFormatter={(value) => formatCompactCurrency(Number(value))}
              />
              <Tooltip
                formatter={(value) => formatCurrency(Number(value))}
                labelFormatter={(value) => `Year ${value}`}
                contentStyle={{
                  borderRadius: "8px",
                  border: "1px solid #e3dce8",
                }}
              />
              <Area
                type="monotone"
                dataKey="homeEquity"
                name="Home equity"
                stroke="#564B69"
                fill="url(#homeEquity)"
                strokeWidth={2}
              />
              <Area
                type="monotone"
                dataKey="investmentValue"
                name="Rent + invest"
                stroke="#477A87"
                fill="url(#investmentValue)"
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </section>
    </div>
  );
}
