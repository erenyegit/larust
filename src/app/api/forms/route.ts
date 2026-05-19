import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSessionAddress } from "@/lib/auth";
import { createFormInputSchema } from "@/lib/validation";
import { slugify } from "@/lib/utils";

export async function GET() {
  const sessionAddress = await getSessionAddress();
  if (!sessionAddress) {
    return new NextResponse("Admin wallet session required", { status: 401 });
  }
  const forms = await prisma.form.findMany({
    where: { owner: sessionAddress },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(forms);
}

export async function POST(request: NextRequest) {
  try {
    const sessionAddress = await getSessionAddress();
    if (!sessionAddress) {
      return new NextResponse("Admin wallet session required", { status: 401 });
    }
    const body = await request.json();
    const parsed = createFormInputSchema.parse(body);
    const owner = sessionAddress;
    const base = slugify(parsed.title) || "form";
    const slug = `${base}-${Math.random().toString(36).slice(2, 7)}`;
    const created = await prisma.form.create({
      data: {
        title: parsed.title,
        description: parsed.description,
        owner,
        template: parsed.template,
        schema: parsed.schema,
        slug,
        theme: {
          palette: "marine-tech",
        },
      },
    });
    return NextResponse.json({ id: created.id, slug: created.slug });
  } catch (error) {
    console.error("[api/forms POST]", error);
    return new NextResponse("Invalid request", { status: 400 });
  }
}
