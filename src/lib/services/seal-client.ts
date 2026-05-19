"use client";

import { DemType, SealClient } from "@mysten/seal";
import { SuiJsonRpcClient } from "@mysten/sui/jsonRpc";

export type ClientSensitiveEnvelope = {
  encryptedBase64: string;
  algorithm: "seal";
  identity: string;
};

function parseClientKeyServers(value: string | undefined) {
  if (!value) return [];
  return value
    .split(",")
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

export function canUseClientSeal() {
  return Boolean(
    process.env.NEXT_PUBLIC_SEAL_PACKAGE_ID &&
      process.env.NEXT_PUBLIC_SEAL_KEY_SERVERS &&
      process.env.NEXT_PUBLIC_SUI_RPC_URL,
  );
}

export async function encryptSensitivePayloadClient(
  formId: string,
  data: Record<string, unknown>,
): Promise<ClientSensitiveEnvelope> {
  const packageId = process.env.NEXT_PUBLIC_SEAL_PACKAGE_ID;
  const serverConfigs = parseClientKeyServers(process.env.NEXT_PUBLIC_SEAL_KEY_SERVERS);
  if (!packageId || serverConfigs.length === 0 || !process.env.NEXT_PUBLIC_SUI_RPC_URL) {
    throw new Error("Client Seal configuration is incomplete.");
  }
  const client = new SealClient({
    suiClient: new SuiJsonRpcClient({
      url: process.env.NEXT_PUBLIC_SUI_RPC_URL,
      network: (process.env.NEXT_PUBLIC_SUI_NETWORK as "testnet" | "mainnet" | "localnet") ?? "testnet",
    }),
    serverConfigs,
    verifyKeyServers: false,
    timeout: 20_000,
  });
  const identity = `larust:${formId}:${Date.now()}`;
  const payload = new TextEncoder().encode(JSON.stringify(data));
  const { encryptedObject } = await client.encrypt({
    threshold: Number(process.env.NEXT_PUBLIC_SEAL_THRESHOLD ?? 2),
    packageId,
    id: identity,
    data: payload,
    demType: DemType.AesGcm256,
  });
  const encryptedBase64 = btoa(
    encryptedObject.reduce((acc, byte) => acc + String.fromCharCode(byte), ""),
  );
  return {
    encryptedBase64,
    algorithm: "seal",
    identity,
  };
}
