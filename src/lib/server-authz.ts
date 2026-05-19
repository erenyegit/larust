import { getSessionAddress } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function requireFormAdmin(formId: string) {
  const sessionAddress = await getSessionAddress();
  if (!sessionAddress) {
    throw new Error("Admin wallet session required");
  }
  const form = await prisma.form.findUnique({
    where: { id: formId },
    select: { owner: true },
  });
  if (!form) throw new Error("Form not found");
  if (form.owner !== sessionAddress) {
    throw new Error("You do not own this form.");
  }
}
