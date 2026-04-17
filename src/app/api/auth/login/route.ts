import { createToken } from "@/lib/auth";
import { store } from "@/lib/store";
import { loginSchema } from "@/lib/validations";
import bcrypt from "bcryptjs";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = loginSchema.safeParse(body);

    if (!parsed.success) {
      return Response.json(
        { error: parsed.error.issues[0].message },
        { status: 400 }
      );
    }

    const { email, password } = parsed.data;

    const user = await store.findUserByEmail(email);
    if (!user) {
      return Response.json(
        { error: "Invalid credentials" },
        { status: 401 }
      );
    }

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) {
      return Response.json(
        { error: "Invalid credentials" },
        { status: 401 }
      );
    }

    const token = await createToken({ userId: user.id, email: user.email });

    const response = Response.json({
      user: { id: user.id, name: user.name, email: user.email },
    });

    response.headers.set(
      "Set-Cookie",
      `token=${token}; HttpOnly; Path=/; SameSite=Lax; Max-Age=${7 * 24 * 60 * 60}`
    );

    return response;
  } catch {
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
