"use client";

import { useRouter } from "next/navigation";
import PropertyForm from "@/components/PropertyForm";
import { useAuth } from "@/components/AuthProvider";
import { createProperty } from "@/lib/client-store";
import type { PropertyInput } from "@/lib/types";

export default function NewPropertyPage() {
  const router = useRouter();
  const { firebaseUser } = useAuth();

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
        Add New Property
      </h1>
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <PropertyForm onSubmit={handleSubmit} />
      </div>
    </div>
  );
}
