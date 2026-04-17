import { getSession } from "@/lib/auth";
import { store } from "@/lib/store";

export const runtime = "nodejs";

export async function GET() {
  const session = await getSession();
  if (!session) {
    return Response.json({ user: null }, { status: 401 });
  }

  const user = await store.findUserById(session.userId);

  return Response.json({
    user: user ? { id: user.id, name: user.name, email: user.email } : null,
  });
}
