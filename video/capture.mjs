// Playwright-based site capture for the promo video.
// Run once after `npm run dev` is up:
//   cd ~/Larust && npx -y -p playwright playwright install --with-deps chromium && node video/capture.mjs
//
// Forges an HMAC-signed admin cookie (mirrors scripts/runtime-verify.mjs) so the
// dashboard and form-admin pages render with seeded data instead of the "verify
// wallet" empty state.

import crypto from "node:crypto";
import { promises as fs } from "node:fs";
import path from "node:path";
import { chromium } from "playwright";
import { PrismaClient } from "@prisma/client";

const BASE = process.env.CAPTURE_BASE_URL ?? "http://localhost:3000";
const SECRET = process.env.AUTH_SESSION_SECRET ?? "dev-only-secret";
function makeSessionCookie(address) {
  const payload = Buffer.from(
    JSON.stringify({ address, exp: Date.now() + 60 * 60 * 1000 }),
  ).toString("base64url");
  const signature = crypto.createHmac("sha256", SECRET).update(payload).digest("hex");
  return `${payload}.${signature}`;
}

async function run() {
  const outDir = path.join(process.cwd(), "video", "captures");
  await fs.mkdir(outDir, { recursive: true });

  const prisma = new PrismaClient();
  const bugForm = await prisma.form.findFirst({
    where: { template: "bug-report" },
    include: { submissions: { take: 1, orderBy: { submittedAt: "desc" } } },
  });
  await prisma.$disconnect();
  if (!bugForm) {
    console.error("No seeded bug-report form found. Run `npm run db:seed` first.");
    process.exit(1);
  }
  const OWNER = bugForm.owner;
  console.log("auth as owner:", OWNER);
  const firstSubmissionId = bugForm.submissions[0]?.id;

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1280, height: 800 },
    deviceScaleFactor: 2,
  });
  await context.addCookies([
    {
      name: "larust_session",
      value: makeSessionCookie(OWNER),
      url: BASE,
      httpOnly: true,
      sameSite: "Lax",
    },
  ]);

  const page = await context.newPage();
  const shots = [];

  async function shoot(name, url, prep) {
    await page.goto(`${BASE}${url}`, { waitUntil: "networkidle" });
    if (prep) await prep(page);
    await page.waitForTimeout(800);
    const file = path.join(outDir, `${name}.png`);
    await page.screenshot({ path: file, fullPage: false });
    shots.push({ name, url, file });
    console.log("captured", name);
  }

  // 01: hero
  await shoot("01_landing_hero", "/");

  // 02: landing scrolled to recent submissions
  await shoot("02_landing_recent", "/", async (p) => {
    await p.evaluate(() => window.scrollBy({ top: 520, behavior: "instant" }));
  });

  // 03: landing scrolled to how-it-works
  await shoot("03_landing_how", "/", async (p) => {
    await p.evaluate(() => window.scrollBy({ top: 1180, behavior: "instant" }));
  });

  // 04: /create with bug-report selected (default)
  await shoot("04_create_templates", "/create");

  // 05: /create scrolled to show fields + live preview
  await shoot("05_create_fields", "/create", async (p) => {
    await p.evaluate(() => window.scrollBy({ top: 520, behavior: "instant" }));
  });

  // 06: /create with a Sensitive toggle visible (open advanced on first field)
  await shoot("06_create_sensitive", "/create", async (p) => {
    await p.evaluate(() => window.scrollBy({ top: 760, behavior: "instant" }));
    const buttons = await p.locator("button:has-text('Show advanced')").all();
    if (buttons[0]) await buttons[0].click();
    await p.waitForTimeout(400);
  });

  // 07: /dashboard
  await shoot("07_dashboard", "/dashboard");

  // 08: /dashboard/forms/{bug-report id}
  await shoot("08_dashboard_form", `/dashboard/forms/${bugForm.id}`);

  // 09: open submission drawer
  if (firstSubmissionId) {
    await shoot("09_submission_drawer", `/dashboard/forms/${bugForm.id}`, async (p) => {
      const openButton = p.locator("table button:has-text('Open')").first();
      if (await openButton.count()) await openButton.click();
      await p.waitForTimeout(600);
    });
  }

  // 10: public form
  await shoot("10_public_form", `/f/${bugForm.slug}`);

  // 11: success page
  await shoot(
    "11_success",
    `/f/success?submissionId=demo123&blobId=8deRM5Bl_SsRI_4tCNYTQ_iEnK0v`,
  );

  await browser.close();
  console.log(`\nWrote ${shots.length} screenshots to ${outDir}`);
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
