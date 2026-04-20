"use client";

import { useState } from "react";
import { formatMoneyInput, parseMoneyInput } from "@/lib/money-input";
import type { PropertyStage } from "@/lib/types";

interface PropertyFormProps {
  initialData?: {
    portfolioStage: PropertyStage;
    name: string;
    address: string;
    city: string;
    state: string;
    zipCode: string;
    propertyType: string;
    purchasePrice: number;
    currentValue: number;
    purchaseDate: string;
    bedrooms: number;
    bathrooms: number;
    squareFeet: number;
    monthlyRent: number;
    downPaymentPercent: number;
    includeClosingFeeInEquityLoan: boolean;
    closingFeePercent: number;
    includeMansionTaxInEquityLoan: boolean;
    mansionTaxPercent: number;
    mortgageRate: number;
    mortgageYears: number;
    monthlyHoa: number;
    monthlyTax: number;
    equityLoanRate: number;
    equityLoanYears: number;
    notes: string;
  };
  portfolioStage?: PropertyStage;
  onSubmit: (data: Record<string, unknown>) => Promise<void>;
  submitLabel?: string;
}

function MoneyInput({
  name,
  label,
  value,
  onChange,
  required = false,
}: {
  name: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-slate-700 mb-1">
        {label}
      </label>
      <input
        name={name}
        type="text"
        inputMode="decimal"
        value={value}
        onChange={(event) => {
          const nextValue = event.target.value;
          const formattedValue =
            nextValue.trim() === ""
              ? ""
              : formatMoneyInput(parseMoneyInput(nextValue));
          event.target.value = formattedValue;
          onChange(formattedValue);
        }}
        onFocus={(event) => {
          if (!value || parseMoneyInput(value) === 0) {
            event.target.select();
          }
        }}
        required={required}
        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-slate-900"
      />
    </div>
  );
}

function Toggle({
  checked,
  label,
  helper,
  onChange,
}: {
  checked: boolean;
  label: string;
  helper?: string;
  onChange: (checked: boolean) => void;
}) {
  return (
    <label className="flex items-start gap-3 rounded-lg border border-slate-200 px-3 py-3">
      <input
        type="checkbox"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
        className="mt-1 h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
      />
      <span>
        <span className="block text-sm font-medium text-slate-900">{label}</span>
        {helper ? (
          <span className="mt-1 block text-xs leading-5 text-slate-500">
            {helper}
          </span>
        ) : null}
      </span>
    </label>
  );
}

export default function PropertyForm({
  initialData,
  portfolioStage,
  onSubmit,
  submitLabel = "Add Property",
}: PropertyFormProps) {
  const stage = portfolioStage ?? initialData?.portfolioStage ?? "owned";
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [purchasePriceInput, setPurchasePriceInput] = useState(
    initialData?.purchasePrice ? formatMoneyInput(initialData.purchasePrice) : ""
  );
  const [currentValueInput, setCurrentValueInput] = useState(
    initialData?.currentValue ? formatMoneyInput(initialData.currentValue) : ""
  );
  const [monthlyRentInput, setMonthlyRentInput] = useState(
    initialData?.monthlyRent ? formatMoneyInput(initialData.monthlyRent) : ""
  );
  const [monthlyHoaInput, setMonthlyHoaInput] = useState(
    initialData?.monthlyHoa ? formatMoneyInput(initialData.monthlyHoa) : ""
  );
  const [monthlyTaxInput, setMonthlyTaxInput] = useState(
    initialData?.monthlyTax ? formatMoneyInput(initialData.monthlyTax) : ""
  );
  const [includeClosingFee, setIncludeClosingFee] = useState(
    initialData?.includeClosingFeeInEquityLoan ?? false
  );
  const [includeMansionTax, setIncludeMansionTax] = useState(
    initialData?.includeMansionTaxInEquityLoan ?? false
  );

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const formData = new FormData(e.currentTarget);
    const purchasePrice = parseMoneyInput(formData.get("purchasePrice") as string);
    const data = {
      portfolioStage: stage,
      name: formData.get("name") as string,
      address: formData.get("address") as string,
      city: formData.get("city") as string,
      state: formData.get("state") as string,
      zipCode: formData.get("zipCode") as string,
      propertyType: formData.get("propertyType") as string,
      purchasePrice,
      currentValue:
        stage === "target"
          ? purchasePrice
          : parseMoneyInput(formData.get("currentValue") as string),
      purchaseDate: formData.get("purchaseDate") as string,
      bedrooms:
        stage === "owned"
          ? parseInt(formData.get("bedrooms") as string) || 0
          : 0,
      bathrooms:
        stage === "owned"
          ? parseFloat(formData.get("bathrooms") as string) || 0
          : 0,
      squareFeet:
        stage === "owned"
          ? parseInt(formData.get("squareFeet") as string) || 0
          : 0,
      monthlyRent:
        stage === "owned"
          ? parseMoneyInput(formData.get("monthlyRent") as string)
          : 0,
      downPaymentPercent:
        stage === "target"
          ? parseFloat(formData.get("downPaymentPercent") as string) || 0
          : 0,
      includeClosingFeeInEquityLoan:
        stage === "target" ? includeClosingFee : false,
      closingFeePercent:
        stage === "target"
          ? parseFloat(formData.get("closingFeePercent") as string) || 0
          : 0,
      includeMansionTaxInEquityLoan:
        stage === "target" ? includeMansionTax : false,
      mansionTaxPercent:
        stage === "target"
          ? parseFloat(formData.get("mansionTaxPercent") as string) || 0
          : 0,
      mortgageRate:
        stage === "target"
          ? parseFloat(formData.get("mortgageRate") as string) || 0
          : 0,
      mortgageYears:
        stage === "target"
          ? parseInt(formData.get("mortgageYears") as string) || 0
          : 0,
      monthlyHoa:
        stage === "target"
          ? parseMoneyInput(formData.get("monthlyHoa") as string)
          : 0,
      monthlyTax:
        stage === "target"
          ? parseMoneyInput(formData.get("monthlyTax") as string)
          : 0,
      equityLoanRate:
        stage === "target"
          ? parseFloat(formData.get("equityLoanRate") as string) || 0
          : 0,
      equityLoanYears:
        stage === "target"
          ? parseInt(formData.get("equityLoanYears") as string) || 0
          : 0,
      notes: formData.get("notes") as string,
    };

    try {
      await onSubmit(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const isTarget = stage === "target";

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
          {error}
        </div>
      )}

      <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
          {isTarget ? "Target deal" : "Current owned property"}
        </p>
        <p className="mt-1 text-sm text-slate-600">
          {isTarget
            ? "Track a possible purchase with the full financing stack so you can compare deals side by side."
            : "Track a property you already own and its current portfolio profile."}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            {isTarget ? "Deal Name" : "Property Name"}
          </label>
          <input
            name="name"
            defaultValue={initialData?.name}
            required
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-slate-900"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Property Type
          </label>
          <select
            name="propertyType"
            defaultValue={initialData?.propertyType || "residential"}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-slate-900"
          >
            <option value="residential">Residential</option>
            <option value="commercial">Commercial</option>
            <option value="land">Land</option>
            <option value="multi-family">Multi-Family</option>
          </select>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">
          Address
        </label>
        <input
          name="address"
          defaultValue={initialData?.address}
          required
          className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-slate-900"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            City
          </label>
          <input
            name="city"
            defaultValue={initialData?.city}
            required
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-slate-900"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            State
          </label>
          <input
            name="state"
            defaultValue={initialData?.state}
            required
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-slate-900"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Zip Code
          </label>
          <input
            name="zipCode"
            defaultValue={initialData?.zipCode}
            required
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-slate-900"
          />
        </div>
      </div>

      {isTarget ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <MoneyInput
              name="purchasePrice"
              label="Target Price ($)"
              value={purchasePriceInput}
              onChange={setPurchasePriceInput}
              required
            />
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Down Payment (%)
              </label>
              <input
                name="downPaymentPercent"
                type="number"
                min={0}
                step="0.1"
                defaultValue={initialData?.downPaymentPercent ?? 10}
                required
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-slate-900"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Target Close Date
              </label>
              <input
                name="purchaseDate"
                type="date"
                defaultValue={initialData?.purchaseDate}
                required
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-slate-900"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Mortgage Rate (%)
              </label>
              <input
                name="mortgageRate"
                type="number"
                min={0}
                step="0.01"
                defaultValue={initialData?.mortgageRate ?? 6}
                required
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-slate-900"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Mortgage Term (years)
              </label>
              <input
                name="mortgageYears"
                type="number"
                min={1}
                step="1"
                defaultValue={initialData?.mortgageYears ?? 30}
                required
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-slate-900"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <MoneyInput
              name="monthlyHoa"
              label="Monthly HOA ($)"
              value={monthlyHoaInput}
              onChange={setMonthlyHoaInput}
            />
            <MoneyInput
              name="monthlyTax"
              label="Monthly Tax ($)"
              value={monthlyTaxInput}
              onChange={setMonthlyTaxInput}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Equity Loan Rate (%)
              </label>
              <input
                name="equityLoanRate"
                type="number"
                min={0}
                step="0.01"
                defaultValue={initialData?.equityLoanRate ?? 5}
                required
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-slate-900"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Equity Loan Term (years)
              </label>
              <input
                name="equityLoanYears"
                type="number"
                min={1}
                step="1"
                defaultValue={initialData?.equityLoanYears ?? 30}
                required
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-slate-900"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Toggle
              checked={includeClosingFee}
              onChange={setIncludeClosingFee}
              label="Finance closing fee into equity loan"
              helper="Roll estimated closing costs into the synced equity loan."
            />
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Closing Fee (%)
              </label>
              <input
                name="closingFeePercent"
                type="number"
                min={0}
                step="0.1"
                defaultValue={initialData?.closingFeePercent ?? 3}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-slate-900"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Toggle
              checked={includeMansionTax}
              onChange={setIncludeMansionTax}
              label="Finance mansion tax into equity loan"
              helper="Only applies when the target price is above $1,000,000."
            />
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Mansion Tax (%)
              </label>
              <input
                name="mansionTaxPercent"
                type="number"
                min={0}
                step="0.1"
                defaultValue={initialData?.mansionTaxPercent ?? 1}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-slate-900"
              />
            </div>
          </div>
        </>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <MoneyInput
              name="purchasePrice"
              label="Purchase Price ($)"
              value={purchasePriceInput}
              onChange={setPurchasePriceInput}
              required
            />
            <MoneyInput
              name="currentValue"
              label="Current Value ($)"
              value={currentValueInput}
              onChange={setCurrentValueInput}
              required
            />
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Purchase Date
              </label>
              <input
                name="purchaseDate"
                type="date"
                defaultValue={initialData?.purchaseDate}
                required
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-slate-900"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Bedrooms
              </label>
              <input
                name="bedrooms"
                type="number"
                defaultValue={initialData?.bedrooms ?? 0}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-slate-900"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Bathrooms
              </label>
              <input
                name="bathrooms"
                type="number"
                step="0.5"
                defaultValue={initialData?.bathrooms ?? 0}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-slate-900"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Square Feet
              </label>
              <input
                name="squareFeet"
                type="number"
                defaultValue={initialData?.squareFeet ?? 0}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-slate-900"
              />
            </div>
            <MoneyInput
              name="monthlyRent"
              label="Monthly Rent ($)"
              value={monthlyRentInput}
              onChange={setMonthlyRentInput}
            />
          </div>
        </>
      )}

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">
          Notes
        </label>
        <textarea
          name="notes"
          rows={3}
          defaultValue={initialData?.notes}
          className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-slate-900"
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50"
      >
        {loading ? "Saving..." : submitLabel}
      </button>
    </form>
  );
}
