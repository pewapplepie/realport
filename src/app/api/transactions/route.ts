import { requireAuth } from "@/lib/auth";
import { store } from "@/lib/store";
import { transactionSchema } from "@/lib/validations";

export const runtime = "nodejs";

export async function GET(request: Request) {
  try {
    const session = await requireAuth();
    const { searchParams } = new URL(request.url);
    const propertyId = searchParams.get("propertyId");

    const transactions = await store.listTransactions(
      session.userId,
      propertyId || undefined
    );

    return Response.json({ transactions });
  } catch {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await requireAuth();
    const body = await request.json();
    const parsed = transactionSchema.safeParse(body);

    if (!parsed.success) {
      return Response.json(
        { error: parsed.error.issues[0].message },
        { status: 400 }
      );
    }

    const transaction = await store.createTransaction(
      session.userId,
      parsed.data
    );

    if (!transaction) {
      return Response.json({ error: "Property not found" }, { status: 404 });
    }

    return Response.json({ transaction }, { status: 201 });
  } catch (e) {
    if (e instanceof Error && e.message === "Unauthorized") {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
