import { requireAuth } from "@/lib/auth";
import { store } from "@/lib/store";
import { propertySchema } from "@/lib/validations";

export const runtime = "nodejs";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireAuth();
    const { id } = await params;
    const property = await store.findPropertyWithTransactions(
      session.userId,
      id
    );

    if (!property) {
      return Response.json({ error: "Property not found" }, { status: 404 });
    }

    return Response.json({ property });
  } catch {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireAuth();
    const { id } = await params;
    const body = await request.json();
    const parsed = propertySchema.safeParse(body);

    if (!parsed.success) {
      return Response.json(
        { error: parsed.error.issues[0].message },
        { status: 400 }
      );
    }

    const property = await store.updateProperty(session.userId, id, parsed.data);

    if (!property) {
      return Response.json({ error: "Property not found" }, { status: 404 });
    }

    return Response.json({ property });
  } catch (e) {
    if (e instanceof Error && e.message === "Unauthorized") {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireAuth();
    const { id } = await params;

    const deleted = await store.deleteProperty(session.userId, id);

    if (!deleted) {
      return Response.json({ error: "Property not found" }, { status: 404 });
    }

    return Response.json({ success: true });
  } catch (e) {
    if (e instanceof Error && e.message === "Unauthorized") {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
