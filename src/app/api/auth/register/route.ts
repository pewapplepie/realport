import { createToken } from "@/lib/auth";
import { store } from "@/lib/store";
import { registerSchema } from "@/lib/validations";
import bcrypt from "bcryptjs";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = registerSchema.safeParse(body);

    if (!parsed.success) {
      return Response.json(
        { error: parsed.error.issues[0].message },
        { status: 400 }
      );
    }

    const { name, email, password } = parsed.data;

    const existing = await store.findUserByEmail(email);
    if (existing) {
      return Response.json(
        { error: "Email already registered" },
        { status: 409 }
      );
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const user = await store.createUser({ name, email, passwordHash });

    const token = await createToken({ userId: user.id, email: user.email });

    const response = Response.json(
      { user: { id: user.id, name: user.name, email: user.email } },
      { status: 201 }
    );

    response.headers.set(
      "Set-Cookie",
      `token=${token}; HttpOnly; Path=/; SameSite=Lax; Max-Age=${7 * 24 * 60 * 60}`
    );

    return response;
  } catch {
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
