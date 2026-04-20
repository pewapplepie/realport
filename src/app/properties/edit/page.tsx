"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import PropertyForm from "@/components/PropertyForm";
import { useAuth } from "@/components/AuthProvider";
import { getProperty, updateProperty } from "@/lib/client-store";
import type { PropertyInput, PropertyRecord } from "@/lib/types";

export default function EditPropertyPage() {
  return (
    <Suspense
      fallback={
        <div className="max-w-3xl mx-auto px-4 py-12">
          <div className="animate-pulse h-96 bg-slate-200 rounded-xl" />
        </div>
      }
    >
      <EditPropertyContent />
    </Suspense>
  );
}

function EditPropertyContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const id = searchParams.get("id");
  const { firebaseUser, loading: authLoading } = useAuth();
  const [property, setProperty] = useState<PropertyRecord | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return;
    if (!firebaseUser) {
      router.push("/login");
      return;
    }
    if (!id) return;

    getProperty(firebaseUser.uid, id)
      .then((nextProperty) => {
        if (nextProperty) {
          setProperty({
            ...nextProperty,
            purchaseDate: new Date(nextProperty.purchaseDate)
              .toISOString()
              .split("T")[0],
          });
        }
      })
      .finally(() => setLoading(false));
  }, [authLoading, firebaseUser, id, router]);

  const handleSubmit = async (data: Record<string, unknown>) => {
    if (!firebaseUser || !id) {
      router.push("/login");
      return;
    }

    await updateProperty(firebaseUser.uid, id, data as PropertyInput);
    router.push(`/properties/detail?id=${id}`);
  };

  if (!id) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-12 text-center">
        <p className="text-slate-500">Property not found.</p>
      </div>
    );
  }

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
        {property.portfolioStage === "target" ? "Edit Target Deal" : "Edit Property"}
      </h1>
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <PropertyForm
          initialData={property}
          portfolioStage={property.portfolioStage}
          onSubmit={handleSubmit}
          submitLabel="Save Changes"
        />
      </div>
    </div>
  );
}
