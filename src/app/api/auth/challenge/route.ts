import { NextRequest, NextResponse } from "next/server";
import { createWalletChallenge } from "@/lib/auth";

export async function POST(request: NextRequest) {
  const body = (await request.json()) as { address?: string };
  if (!body.address) return new NextResponse("Missing address", { status: 400 });
  return NextResponse.json(createWalletChallenge(body.address));
}
