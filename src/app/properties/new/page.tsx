"use client";

import { useRouter } from "next/navigation";
import PropertyForm from "@/components/PropertyForm";

export default function NewPropertyPage() {
  const router = useRouter();

  const handleSubmit = async (data: Record<string, unknown>) => {
    const res = await fetch("/api/properties", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error);
    }

    router.push("/properties");
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-bold text-slate-900 mb-8">
        Add New Property
      </h1>
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <PropertyForm onSubmit={handleSubmit} />
      </div>
    </div>
  );
}
