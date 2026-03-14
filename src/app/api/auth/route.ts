import { NextResponse } from "next/server";

type Role = "daughter" | "dad" | "mom";

const ROLE_MAP: { envKey: string; role: Role }[] = [
  { envKey: "DAUGHTER_PASSPHRASE", role: "daughter" },
  { envKey: "DAD_PASSPHRASE", role: "dad" },
  { envKey: "MOM_PASSPHRASE", role: "mom" },
];

export async function POST(request: Request) {
  // Anti-brute-force: enforce 2-second delay on every attempt
  await new Promise((resolve) => setTimeout(resolve, 2000));

  try {
    const { passphrase } = await request.json();

    if (!passphrase || typeof passphrase !== "string") {
      return NextResponse.json({ error: "Bad request" }, { status: 400 });
    }

    for (const { envKey, role } of ROLE_MAP) {
      const secret = process.env[envKey];
      if (secret && passphrase === secret) {
        return NextResponse.json({ ok: true, role });
      }
    }

    return NextResponse.json({ error: "密码错误" }, { status: 401 });
  } catch {
    return NextResponse.json({ error: "Bad request" }, { status: 400 });
  }
}
