import "server-only";

import { SuiJsonRpcClient } from "@mysten/sui/jsonRpc";
import { Ed25519Keypair } from "@mysten/sui/keypairs/ed25519";
import { walrus } from "@mysten/walrus";
import { env, hasWalrusSigner } from "@/lib/env";

type WalrusWriteResult = {
  blobId: string;
  url: string;
  bytes: number;
};

const client = new SuiJsonRpcClient({
  url: env.WALRUS_FULLNODE_URL,
  network: env.WALRUS_NETWORK as "testnet" | "mainnet" | "localnet",
}).$extend(
  walrus({
    uploadRelay: {
      host: env.WALRUS_UPLOAD_RELAY_URL,
      sendTip: { max: 1_000 },
    },
  }),
);

function getWalrusBlobUrl(blobId: string) {
  return `${env.WALRUS_AGGREGATOR_URL}/v1/blobs/${blobId}`;
}

async function publishViaHttp(blob: Uint8Array, contentType = "application/json") {
  const response = await fetch(`${env.WALRUS_PUBLISHER_URL}/v1/blobs`, {
    method: "PUT",
    headers: {
      "content-type": contentType,
    },
    body: Buffer.from(blob),
  });
  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Walrus publisher upload failed: ${response.status} ${text}`);
  }
  const data = (await response.json()) as {
    newlyCreated?: { blobObject: { blobId: string } };
    alreadyCertified?: { blobId: string };
  };
  const blobId = data.newlyCreated?.blobObject.blobId ?? data.alreadyCertified?.blobId;
  if (!blobId) {
    throw new Error("Could not derive blobId from Walrus publisher response");
  }
  return {
    blobId,
    url: getWalrusBlobUrl(blobId),
    bytes: blob.byteLength,
  } satisfies WalrusWriteResult;
}

async function publishViaSdk(blob: Uint8Array) {
  if (!env.WALRUS_SERVICE_PRIVATE_KEY) {
    throw new Error("WALRUS_SERVICE_PRIVATE_KEY missing");
  }
  const signer = Ed25519Keypair.fromSecretKey(env.WALRUS_SERVICE_PRIVATE_KEY);
  const result = await client.walrus.writeBlob({
    blob,
    deletable: true,
    epochs: env.WALRUS_STORAGE_EPOCHS,
    signer,
  });
  return {
    blobId: result.blobId,
    url: getWalrusBlobUrl(result.blobId),
    bytes: blob.byteLength,
  } satisfies WalrusWriteResult;
}

export async function uploadToWalrus({
  data,
  contentType,
}: {
  data: Uint8Array;
  contentType?: string;
}): Promise<WalrusWriteResult> {
  try {
    if (hasWalrusSigner) {
      return await publishViaSdk(data);
    }
    return await publishViaHttp(data, contentType);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown Walrus error";
    throw new Error(`Walrus upload failed: ${message}`);
  }
}

export { getWalrusBlobUrl };
