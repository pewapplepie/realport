import { requireAuth } from "@/lib/auth";
import { store } from "@/lib/store";

export const runtime = "nodejs";

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireAuth();
    const { id } = await params;

    const deleted = await store.deleteTransaction(session.userId, id);

    if (!deleted) {
      return Response.json(
        { error: "Transaction not found" },
        { status: 404 }
      );
    }

    return Response.json({ success: true });
  } catch (e) {
    if (e instanceof Error && e.message === "Unauthorized") {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
