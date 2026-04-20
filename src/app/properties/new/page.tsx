"use client";

import { Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import PropertyForm from "@/components/PropertyForm";
import { useAuth } from "@/components/AuthProvider";
import { createProperty } from "@/lib/client-store";
import type { PropertyInput, PropertyStage } from "@/lib/types";

export default function NewPropertyPage() {
  return (
    <Suspense
      fallback={
        <div className="max-w-3xl mx-auto px-4 py-12">
          <div className="animate-pulse h-96 bg-slate-200 rounded-xl" />
        </div>
      }
    >
      <NewPropertyContent />
    </Suspense>
  );
}

function NewPropertyContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { firebaseUser } = useAuth();
  const stage = (searchParams.get("stage") === "target"
    ? "target"
    : "owned") as PropertyStage;

  const handleSubmit = async (data: Record<string, unknown>) => {
    if (!firebaseUser) {
      router.push("/login");
      return;
    }

    await createProperty(firebaseUser.uid, data as PropertyInput);
    router.push("/properties");
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-bold text-slate-900 mb-8">
        {stage === "target" ? "Add Target Deal" : "Add Current Property"}
      </h1>
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <PropertyForm
          portfolioStage={stage}
          onSubmit={handleSubmit}
          submitLabel={stage === "target" ? "Add Target Deal" : "Add Property"}
        />
      </div>
    </div>
  );
}
