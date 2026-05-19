import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(_: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const form = await prisma.form.findUnique({ where: { slug } });
  if (!form) return new NextResponse("Form not found", { status: 404 });
  return NextResponse.json(form);
}
