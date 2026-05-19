import crypto from "crypto";
import { cookies } from "next/headers";
import { verifyPersonalMessageSignature } from "@mysten/sui/verify";
import { env } from "@/lib/env";

type WalletChallengePayload = {
  address: string;
  nonce: string;
  exp: number;
};

const SESSION_COOKIE = "larust_session";

function signPayload(value: string) {
  return crypto.createHmac("sha256", env.AUTH_SESSION_SECRET).update(value).digest("hex");
}

function encode(data: object) {
  const value = Buffer.from(JSON.stringify(data)).toString("base64url");
  return `${value}.${signPayload(value)}`;
}

function decode<T>(token: string): T | null {
  const [value, signature] = token.split(".");
  if (!value || !signature) return null;
  if (signPayload(value) !== signature) return null;
  try {
    return JSON.parse(Buffer.from(value, "base64url").toString("utf8")) as T;
  } catch {
    return null;
  }
}

export function createWalletChallenge(address: string) {
  const payload: WalletChallengePayload = {
    address,
    nonce: crypto.randomBytes(16).toString("hex"),
    exp: Date.now() + 10 * 60 * 1000,
  };
  return {
    message: `Larust wallet login\nAddress: ${address}\nNonce: ${payload.nonce}`,
    token: encode(payload),
  };
}

export async function verifyWalletChallenge({
  address,
  challengeToken,
  signature,
}: {
  address: string;
  challengeToken: string;
  signature: string;
}) {
  const decoded = decode<WalletChallengePayload>(challengeToken);
  if (!decoded || decoded.exp < Date.now() || decoded.address !== address) {
    throw new Error("Invalid or expired wallet challenge");
  }
  const message = `Larust wallet login\nAddress: ${address}\nNonce: ${decoded.nonce}`;
  await verifyPersonalMessageSignature(new TextEncoder().encode(message), signature, { address });
}

export async function setWalletSession(address: string) {
  const cookieStore = await cookies();
  cookieStore.set(
    SESSION_COOKIE,
    encode({
      address,
      exp: Date.now() + 1000 * 60 * 60 * 24 * 7,
    }),
    {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    },
  );
}

export async function clearWalletSession() {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE);
}

export async function getSessionAddress() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (!token) return null;
  const decoded = decode<{ address: string; exp: number }>(token);
  if (!decoded || decoded.exp < Date.now()) return null;
  return decoded.address;
}
