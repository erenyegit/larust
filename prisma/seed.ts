import { Prisma, PrismaClient } from "@prisma/client";
import { templates } from "../src/lib/templates";

const prisma = new PrismaClient();

async function main() {
  const owner = process.env.SEED_OWNER_ADDRESS;
  if (!owner || !/^0x[0-9a-fA-F]{40,}$/.test(owner)) {
    throw new Error(
      "SEED_OWNER_ADDRESS env is required and must look like a Sui wallet address (0x + hex). Set it in .env before running `prisma db seed`.",
    );
  }
  await prisma.adminNote.deleteMany();
  await prisma.submission.deleteMany();
  await prisma.form.deleteMany();

  const createdForms = await Promise.all(
    templates.map((template, index) =>
      prisma.form.create({
        data: {
          owner,
          slug: `demo-${template.key}`,
          title: template.title,
          description: template.description,
          template: template.key,
          schema: template.schema,
          theme: { index },
        },
      }),
    ),
  );

  const demoByTemplate: Record<
    string,
    Array<{
      status: string;
      priority: string;
      rating: number;
      searchableText: string;
      response: Record<string, unknown>;
      note: string;
      encrypted?: boolean;
    }>
  > = {
    "bug-report": [
      {
        status: "reviewing",
        priority: "urgent",
        rating: 5,
        searchableText: "Checkout freezes after coupon apply in Safari 17.1, affects enterprise rollout.",
        response: {
          title: "Checkout spinner never resolves",
          impact_rating: 5,
          environment: "Production",
        },
        note: "Escalated to incident bridge. Repro confirmed on live tenant.",
        encrypted: true,
      },
      {
        status: "new",
        priority: "high",
        rating: 4,
        searchableText: "File upload silently fails on unstable mobile connection.",
        response: {
          title: "Attachment upload timeout not surfaced",
          impact_rating: 4,
          environment: "Production",
        },
        note: "Needs better retry messaging and telemetry coverage.",
      },
    ],
    "feature-request": [
      {
        status: "planned",
        priority: "high",
        rating: 4,
        searchableText: "Request for bulk priority editing in triage board to reduce ops overhead.",
        response: {
          request_title: "Bulk edit status and priority",
          impact_rating: 4,
          benefit: ["Speed", "Quality"],
        },
        note: "Strong signal from 5 design partners; candidate for next sprint.",
      },
      {
        status: "reviewing",
        priority: "normal",
        rating: 3,
        searchableText: "Need webhook on submission updates for external analytics pipeline.",
        response: {
          request_title: "Outbound webhook for submission lifecycle",
          impact_rating: 3,
          benefit: ["Retention", "Compliance"],
        },
        note: "Explore after export API rollout stabilizes.",
      },
    ],
    survey: [
      {
        status: "reviewing",
        priority: "high",
        rating: 4,
        searchableText: "Research respondent indicates onboarding confusion in first 10 minutes.",
        response: {
          role: "Product Operations Lead",
          company_size: "201-1000",
          satisfaction: 4,
        },
        note: "Sensitive goals section encrypted; insights align with support transcripts.",
        encrypted: true,
      },
      {
        status: "closed",
        priority: "low",
        rating: 5,
        searchableText: "Positive NPS trend in new navigation release.",
        response: {
          role: "Program Manager",
          company_size: "51-200",
          satisfaction: 5,
        },
        note: "Closed as positive signal; keep as benchmark evidence.",
      },
    ],
  };

  for (const form of createdForms) {
    const entries = demoByTemplate[form.template ?? "survey"] ?? [];
    for (const entry of entries) {
      const submission = await prisma.submission.create({
        data: {
          formId: form.id,
          walrusBlobId: `demo_walrus_blob_${Math.random().toString(36).slice(2, 11)}`,
          walrusUrl: "https://aggregator.walrus-testnet.walrus.space/v1/blobs/demo",
          walrusBytes: 1824,
          searchableText: entry.searchableText,
          status: entry.status,
          priority: entry.priority,
          rating: entry.rating,
          publicResponseJson: entry.response as Prisma.InputJsonValue,
          encryptedMeta: entry.encrypted
            ? {
                mode: "seal",
                identity: `demo:${form.id}:${Math.random().toString(36).slice(2, 6)}`,
              }
            : Prisma.JsonNull,
          assetRefsJson: [
            {
              fieldId: "screenshot",
              blobId: `demo_asset_${Math.random().toString(36).slice(2, 8)}`,
              url: "https://aggregator.walrus-testnet.walrus.space/v1/blobs/demo-asset",
              mimeType: "image/png",
            },
          ],
        },
      });
      await prisma.adminNote.create({
        data: {
          submissionId: submission.id,
          author: "Ops Lead",
          body: entry.note,
        },
      });
    }
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
