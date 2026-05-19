import { NextResponse } from "next/server";
import { clearWalletSession, getSessionAddress } from "@/lib/auth";

export async function GET() {
  const address = await getSessionAddress();
  return NextResponse.json({ address });
}

export async function DELETE() {
  await clearWalletSession();
  return NextResponse.json({ ok: true });
}
