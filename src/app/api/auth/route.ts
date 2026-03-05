import { NextResponse } from "next/server";

export async function POST(request: Request) {
  // Anti-brute-force: enforce 2-second delay on every attempt
  await new Promise((resolve) => setTimeout(resolve, 2000));

  try {
    const { passphrase } = await request.json();
    const correct = process.env.ADMIN_PASSPHRASE;

    if (!correct) {
      return NextResponse.json(
        { error: "Server misconfigured" },
        { status: 500 }
      );
    }

    if (passphrase === correct) {
      return NextResponse.json({ ok: true });
    }

    return NextResponse.json({ error: "密码错误" }, { status: 401 });
  } catch {
    return NextResponse.json({ error: "Bad request" }, { status: 400 });
  }
}
