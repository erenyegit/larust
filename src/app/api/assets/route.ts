import { NextRequest, NextResponse } from "next/server";
import { uploadAssetInputSchema } from "@/lib/validation";
import { uploadToWalrus } from "@/lib/services/walrus";

export async function POST(request: NextRequest) {
  try {
    const body = uploadAssetInputSchema.parse(await request.json());
    const data = Uint8Array.from(Buffer.from(body.dataBase64, "base64"));
    const uploaded = await uploadToWalrus({
      data,
      contentType: body.mimeType,
    });
    return NextResponse.json({
      fieldId: body.fieldId,
      blobId: uploaded.blobId,
      url: uploaded.url,
      mimeType: body.mimeType,
      filename: body.filename,
      size: data.byteLength,
    });
  } catch (error) {
    console.error("[api/assets POST]", error);
    return new NextResponse("Upload failed", { status: 400 });
  }
}
