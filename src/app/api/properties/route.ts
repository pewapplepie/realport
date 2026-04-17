import { requireAuth } from "@/lib/auth";
import { store } from "@/lib/store";
import { propertySchema } from "@/lib/validations";

export const runtime = "nodejs";

export async function GET() {
  try {
    const session = await requireAuth();
    const properties = await store.listProperties(session.userId);
    return Response.json({ properties });
  } catch {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await requireAuth();
    const body = await request.json();
    const parsed = propertySchema.safeParse(body);

    if (!parsed.success) {
      return Response.json(
        { error: parsed.error.issues[0].message },
        { status: 400 }
      );
    }

    const property = await store.createProperty(session.userId, parsed.data);

    return Response.json({ property }, { status: 201 });
  } catch (e) {
    if (e instanceof Error && e.message === "Unauthorized") {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
