"use client";

import { useState } from "react";
import { formatMoneyInput, parseMoneyInput } from "@/lib/money-input";

interface PropertyFormProps {
  initialData?: {
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
    notes: string;
  };
  onSubmit: (data: Record<string, unknown>) => Promise<void>;
  submitLabel?: string;
}

export default function PropertyForm({
  initialData,
  onSubmit,
  submitLabel = "Add Property",
}: PropertyFormProps) {
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

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const formData = new FormData(e.currentTarget);
    const data = {
      name: formData.get("name") as string,
      address: formData.get("address") as string,
      city: formData.get("city") as string,
      state: formData.get("state") as string,
      zipCode: formData.get("zipCode") as string,
      propertyType: formData.get("propertyType") as string,
      purchasePrice: parseMoneyInput(formData.get("purchasePrice") as string),
      currentValue: parseMoneyInput(formData.get("currentValue") as string),
      purchaseDate: formData.get("purchaseDate") as string,
      bedrooms: parseInt(formData.get("bedrooms") as string) || 0,
      bathrooms: parseFloat(formData.get("bathrooms") as string) || 0,
      squareFeet: parseInt(formData.get("squareFeet") as string) || 0,
      monthlyRent: parseMoneyInput(formData.get("monthlyRent") as string),
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

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Property Name
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

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Purchase Price ($)
          </label>
          <input
            name="purchasePrice"
            type="text"
            inputMode="decimal"
            value={purchasePriceInput}
            onChange={(event) => {
              const nextValue = event.target.value;
              const formattedValue =
                nextValue.trim() === ""
                  ? ""
                  : formatMoneyInput(parseMoneyInput(nextValue));
              event.target.value = formattedValue;
              setPurchasePriceInput(formattedValue);
            }}
            onFocus={(event) => {
              if (!purchasePriceInput || parseMoneyInput(purchasePriceInput) === 0) {
                event.target.select();
              }
            }}
            required
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-slate-900"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Current Value ($)
          </label>
          <input
            name="currentValue"
            type="text"
            inputMode="decimal"
            value={currentValueInput}
            onChange={(event) => {
              const nextValue = event.target.value;
              const formattedValue =
                nextValue.trim() === ""
                  ? ""
                  : formatMoneyInput(parseMoneyInput(nextValue));
              event.target.value = formattedValue;
              setCurrentValueInput(formattedValue);
            }}
            onFocus={(event) => {
              if (!currentValueInput || parseMoneyInput(currentValueInput) === 0) {
                event.target.select();
              }
            }}
            required
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-slate-900"
          />
        </div>
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
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Monthly Rent ($)
          </label>
          <input
            name="monthlyRent"
            type="text"
            inputMode="decimal"
            value={monthlyRentInput}
            onChange={(event) => {
              const nextValue = event.target.value;
              const formattedValue =
                nextValue.trim() === ""
                  ? ""
                  : formatMoneyInput(parseMoneyInput(nextValue));
              event.target.value = formattedValue;
              setMonthlyRentInput(formattedValue);
            }}
            onFocus={(event) => {
              if (!monthlyRentInput || parseMoneyInput(monthlyRentInput) === 0) {
                event.target.select();
              }
            }}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-slate-900"
          />
        </div>
      </div>

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
