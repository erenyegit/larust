import crypto from "crypto";

const BASE_URL = process.env.VERIFY_BASE_URL ?? "http://localhost:3000";
const SECRET = process.env.AUTH_SESSION_SECRET ?? "dev-secret";
const OWNER =
  process.env.SEED_OWNER_ADDRESS ??
  "0x1111111111111111111111111111111111111111111111111111111111111111";

function createSessionCookie(address) {
  const payload = Buffer.from(
    JSON.stringify({
      address,
      exp: Date.now() + 60 * 60 * 1000,
    }),
  ).toString("base64url");
  const signature = crypto.createHmac("sha256", SECRET).update(payload).digest("hex");
  return `${payload}.${signature}`;
}

async function request(path, init = {}) {
  const response = await fetch(`${BASE_URL}${path}`, init);
  const text = await response.text();
  return { response, text };
}

async function run() {
  const cookie = `larust_session=${createSessionCookie(OWNER)}`;
  const schema = {
    version: 1,
    fields: [
      { id: "title", type: "short_text", label: "Title", required: true, sensitive: false, helperText: "Short summary" },
      { id: "details", type: "long_rich_text", label: "Details", required: true, sensitive: false },
      { id: "area", type: "dropdown", label: "Area", required: true, sensitive: false, options: ["Billing", "Auth"] },
      { id: "tags", type: "multi_select", label: "Tags", required: true, sensitive: false, options: ["Regression", "UX"] },
      { id: "impact", type: "rating", label: "Impact", required: true, sensitive: false },
      { id: "url", type: "url", label: "URL", required: false, sensitive: false },
      { id: "screenshot", type: "image_upload", label: "Screenshot", required: false, sensitive: false },
      { id: "clip", type: "video_upload", label: "Clip", required: false, sensitive: true },
    ],
  };

  const createForm = await request("/api/forms", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      cookie,
    },
    body: JSON.stringify({
      title: "Runtime Verification Form",
      description: "Verifies every field type and storage path",
      template: "survey",
      owner: OWNER,
      schema,
    }),
  });
  if (!createForm.response.ok) throw new Error(`Create form failed: ${createForm.response.status} ${createForm.text}`);
  const createdForm = JSON.parse(createForm.text);

  const bySlug = await request(`/api/forms/slug/${createdForm.slug}`);
  if (!bySlug.response.ok) throw new Error("Slug fetch failed");
  const slugForm = JSON.parse(bySlug.text);

  const imageUpload = await request("/api/assets", {
    method: "POST",
    headers: {
      "content-type": "application/json",
    },
    body: JSON.stringify({
      fieldId: "screenshot",
      mimeType: "image/png",
      filename: "runtime-image.png",
      dataBase64: Buffer.from("fake-image-content").toString("base64"),
    }),
  });
  if (!imageUpload.response.ok) throw new Error(`Image upload failed: ${imageUpload.text}`);
  const imageAsset = JSON.parse(imageUpload.text);

  const videoUpload = await request("/api/assets", {
    method: "POST",
    headers: {
      "content-type": "application/json",
    },
    body: JSON.stringify({
      fieldId: "clip",
      mimeType: "video/mp4",
      filename: "runtime-video.mp4",
      dataBase64: Buffer.from("fake-video-content").toString("base64"),
    }),
  });
  if (!videoUpload.response.ok) throw new Error(`Video upload failed: ${videoUpload.text}`);
  const videoAsset = JSON.parse(videoUpload.text);

  const submit = await request("/api/submissions", {
    method: "POST",
    headers: {
      "content-type": "application/json",
    },
    body: JSON.stringify({
      formId: createdForm.id,
      values: {
        title: "Bug in billing retry",
        details: "<p>Retries loop for 60 seconds after timeout.</p>",
        area: "Billing",
        tags: ["Regression", "UX"],
        impact: 4,
        url: "https://example.com/repro",
        screenshot: imageAsset.url,
        clip: videoAsset.url,
      },
      assets: [imageAsset, videoAsset],
    }),
  });
  if (!submit.response.ok) throw new Error(`Submission failed: ${submit.text}`);
  const submission = JSON.parse(submit.text);

  const listUnauthorized = await request(`/api/forms/${createdForm.id}/submissions`);
  const exportUnauthorized = await request(`/api/forms/${createdForm.id}/export?format=json`);
  const listAuthorized = await request(`/api/forms/${createdForm.id}/submissions`, {
    headers: { cookie },
  });
  if (listAuthorized.response.status !== 200) throw new Error("Authorized submissions list failed");
  const listData = JSON.parse(listAuthorized.text);

  const patchUnauthorized = await request(`/api/submissions/${submission.submissionId}`, {
    method: "PATCH",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ status: "reviewing" }),
  });

  const patch = await request(`/api/submissions/${submission.submissionId}`, {
    method: "PATCH",
    headers: { "content-type": "application/json", cookie },
    body: JSON.stringify({ status: "reviewing", priority: "urgent" }),
  });
  if (!patch.response.ok) throw new Error(`Patch failed: ${patch.text}`);

  const note = await request(`/api/submissions/${submission.submissionId}/notes`, {
    method: "POST",
    headers: { "content-type": "application/json", cookie },
    body: JSON.stringify({ author: "Verifier", body: "Runtime check note persistence." }),
  });
  if (!note.response.ok) throw new Error(`Note failed: ${note.text}`);

  const exportJson = await request(`/api/forms/${createdForm.id}/export?format=json`, { headers: { cookie } });
  const exportCsv = await request(`/api/forms/${createdForm.id}/export?format=csv`, { headers: { cookie } });

  const walrusBlobCheck = await fetch(imageAsset.url, { method: "GET" });

  const summary = {
    baseUrl: BASE_URL,
    formCreated: createdForm,
    slugLookupMatches: slugForm.id === createdForm.id,
    imageAssetBlobId: imageAsset.blobId,
    videoAssetBlobId: videoAsset.blobId,
    submission,
    unauthorizedSubmissionListStatus: listUnauthorized.response.status,
    unauthorizedExportStatus: exportUnauthorized.response.status,
    unauthorizedPatchStatus: patchUnauthorized.response.status,
    authorizedSubmissionCount: listData.length,
    jsonExportStatus: exportJson.response.status,
    csvExportStatus: exportCsv.response.status,
    walrusBlobFetchStatus: walrusBlobCheck.status,
    walrusBlobFetchOk: walrusBlobCheck.ok,
  };
  console.log(JSON.stringify(summary, null, 2));
}

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
