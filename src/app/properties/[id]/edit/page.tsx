"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import PropertyForm from "@/components/PropertyForm";
import { use } from "react";

interface PropertyData {
  id: string;
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
}

export default function EditPropertyPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const [property, setProperty] = useState<PropertyData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/properties/${id}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.property) {
          const p = data.property;
          setProperty({
            ...p,
            purchaseDate: new Date(p.purchaseDate).toISOString().split("T")[0],
          });
        }
        setLoading(false);
      });
  }, [id]);

  const handleSubmit = async (data: Record<string, unknown>) => {
    const res = await fetch(`/api/properties/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error);
    }

    router.push(`/properties/${id}`);
  };

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-12">
        <div className="animate-pulse h-96 bg-slate-200 rounded-xl" />
      </div>
    );
  }

  if (!property) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-12 text-center">
        <p className="text-slate-500">Property not found.</p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-bold text-slate-900 mb-8">
        Edit Property
      </h1>
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <PropertyForm
          initialData={property}
          onSubmit={handleSubmit}
          submitLabel="Save Changes"
        />
      </div>
    </div>
  );
}
