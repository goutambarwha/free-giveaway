import { NextResponse } from "next/server";
import { createSessionToken, hashPassword, setSessionCookie } from "@/lib/auth";
import { updateStore } from "@/lib/db";
import { randomUUID } from "crypto";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      name?: string;
      email?: string;
      password?: string;
    };

    const name = body.name?.trim() ?? "";
    const email = body.email?.trim().toLowerCase() ?? "";
    const password = body.password ?? "";

    if (name.length < 2) {
      return NextResponse.json({ error: "Name must be at least 2 characters." }, { status: 400 });
    }
    if (!email.includes("@")) {
      return NextResponse.json({ error: "Enter a valid email." }, { status: 400 });
    }
    if (password.length < 6) {
      return NextResponse.json({ error: "Password must be at least 6 characters." }, { status: 400 });
    }

    const passwordHash = await hashPassword(password);
    const userId = randomUUID();

    const result = await updateStore((store) => {
      if (store.users.some((u) => u.email === email)) {
        throw new Error("EMAIL_TAKEN");
      }
      return {
        ...store,
        users: [
          ...store.users,
          {
            id: userId,
            name,
            email,
            passwordHash,
            createdAt: new Date().toISOString(),
          },
        ],
      };
    });

    const user = result.users.find((u) => u.id === userId)!;
    const token = await createSessionToken({
      userId: user.id,
      email: user.email,
      name: user.name,
    });
    await setSessionCookie(token);

    return NextResponse.json({
      user: { id: user.id, name: user.name, email: user.email },
    });
  } catch (error) {
    if (error instanceof Error && error.message === "EMAIL_TAKEN") {
      return NextResponse.json({ error: "That email is already registered." }, { status: 409 });
    }
    return NextResponse.json({ error: "Could not create account." }, { status: 500 });
  }
}
