import "server-only";

import { SuiJsonRpcClient } from "@mysten/sui/jsonRpc";
import { DemType, SealClient, SessionKey } from "@mysten/seal";
import { env, hasSealConfig } from "@/lib/env";

type SensitiveEnvelope = {
  encryptedBase64: string;
  keyBase64: string;
  algorithm: "seal";
  identity: string;
};

function parseServerConfigs() {
  if (!env.SEAL_KEY_SERVERS) return [];
  return env.SEAL_KEY_SERVERS.split(",")
    .map((item) => item.trim())
    .filter(Boolean)
    .map((item) => {
      const [objectId, weightText, aggregatorUrl] = item.split("|");
      return {
        objectId,
        weight: Number(weightText ?? 1),
        aggregatorUrl,
      };
    });
}

function getSealClient() {
  const serverConfigs = parseServerConfigs();
  if (!env.SEAL_PACKAGE_ID || serverConfigs.length === 0) {
    return null;
  }
  const suiClient = new SuiJsonRpcClient({
    url: env.NEXT_PUBLIC_SUI_RPC_URL,
    network: env.NEXT_PUBLIC_SUI_NETWORK as "testnet" | "mainnet" | "localnet",
  });
  return new SealClient({
    suiClient,
    serverConfigs,
    verifyKeyServers: false,
    timeout: 20_000,
  });
}

export async function encryptSensitivePayload(
  formId: string,
  data: Record<string, unknown>,
): Promise<SensitiveEnvelope | null> {
  if (!hasSealConfig) return null;
  const client = getSealClient();
  if (!client || !env.SEAL_PACKAGE_ID) return null;
  const identity = `larust:${formId}:${Date.now()}`;
  const payload = new TextEncoder().encode(JSON.stringify(data));
  const { encryptedObject, key } = await client.encrypt({
    threshold: env.SEAL_THRESHOLD,
    packageId: env.SEAL_PACKAGE_ID,
    id: identity,
    data: payload,
    demType: DemType.AesGcm256,
  });
  return {
    encryptedBase64: Buffer.from(encryptedObject).toString("base64"),
    keyBase64: Buffer.from(key).toString("base64"),
    algorithm: "seal",
    identity,
  };
}

export async function decryptSensitivePayload(params: {
  encryptedBase64: string;
  txBytesBase64: string;
  exportedSessionKey: string;
}) {
  const client = getSealClient();
  if (!client) {
    throw new Error("Seal is not configured on this environment.");
  }
  const txBytes = Buffer.from(params.txBytesBase64, "base64");
  const sessionData = JSON.parse(params.exportedSessionKey);
  const session = SessionKey.import(
    sessionData,
    new SuiJsonRpcClient({
      url: env.NEXT_PUBLIC_SUI_RPC_URL,
      network: env.NEXT_PUBLIC_SUI_NETWORK as "testnet" | "mainnet" | "localnet",
    }),
  );
  const plain = await client.decrypt({
    data: Buffer.from(params.encryptedBase64, "base64"),
    txBytes,
    sessionKey: session,
  });
  return JSON.parse(Buffer.from(plain).toString("utf8"));
}
