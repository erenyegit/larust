import { NextRequest, NextResponse } from "next/server";
import { setWalletSession, verifyWalletChallenge } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as {
      address: string;
      challengeToken: string;
      signature: string;
    };
    await verifyWalletChallenge(body);
    await setWalletSession(body.address);
    return NextResponse.json({ ok: true, address: body.address });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Authentication failed";
    return new NextResponse(message, { status: 401 });
  }
}
