const required = ["DATABASE_URL"] as const;

for (const key of required) {
  if (!process.env[key]) {
    throw new Error(`Missing required env var: ${key}`);
  }
}

function resolveAuthSessionSecret(): string {
  const raw = process.env.AUTH_SESSION_SECRET;
  if (raw && raw.length >= 16) return raw;
  if (process.env.NODE_ENV === "production") {
    throw new Error(
      "AUTH_SESSION_SECRET is required in production and must be at least 16 chars. Generate one with: openssl rand -hex 32",
    );
  }
  console.warn(
    "[env] AUTH_SESSION_SECRET missing or weak — generating an ephemeral dev secret. Sessions will not survive a restart. Set AUTH_SESSION_SECRET in .env for stable dev sessions.",
  );
  return `dev-ephemeral-${Math.random().toString(36).slice(2)}${Date.now().toString(36)}`;
}

export const env = {
  DATABASE_URL: process.env.DATABASE_URL!,
  NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",
  AUTH_SESSION_SECRET: resolveAuthSessionSecret(),
  NEXT_PUBLIC_SUI_NETWORK: process.env.NEXT_PUBLIC_SUI_NETWORK ?? "testnet",
  NEXT_PUBLIC_SUI_RPC_URL:
    process.env.NEXT_PUBLIC_SUI_RPC_URL ?? "https://fullnode.testnet.sui.io:443",
  WALRUS_NETWORK: process.env.WALRUS_NETWORK ?? "testnet",
  WALRUS_FULLNODE_URL:
    process.env.WALRUS_FULLNODE_URL ?? "https://fullnode.testnet.sui.io:443",
  WALRUS_UPLOAD_RELAY_URL:
    process.env.WALRUS_UPLOAD_RELAY_URL ?? "https://upload-relay.testnet.walrus.space",
  WALRUS_PUBLISHER_URL:
    process.env.WALRUS_PUBLISHER_URL ?? "https://publisher.walrus-testnet.walrus.space",
  WALRUS_AGGREGATOR_URL:
    process.env.WALRUS_AGGREGATOR_URL ?? "https://aggregator.walrus-testnet.walrus.space",
  WALRUS_STORAGE_EPOCHS: Number(process.env.WALRUS_STORAGE_EPOCHS ?? 3),
  WALRUS_SERVICE_PRIVATE_KEY: process.env.WALRUS_SERVICE_PRIVATE_KEY,
  SEAL_PACKAGE_ID: process.env.SEAL_PACKAGE_ID,
  SEAL_THRESHOLD: Number(process.env.SEAL_THRESHOLD ?? 2),
  SEAL_KEY_SERVERS: process.env.SEAL_KEY_SERVERS,
  NEXT_PUBLIC_SEAL_PACKAGE_ID: process.env.NEXT_PUBLIC_SEAL_PACKAGE_ID,
  NEXT_PUBLIC_SEAL_THRESHOLD: Number(process.env.NEXT_PUBLIC_SEAL_THRESHOLD ?? 2),
  NEXT_PUBLIC_SEAL_KEY_SERVERS: process.env.NEXT_PUBLIC_SEAL_KEY_SERVERS,
};

export const hasWalrusSigner = Boolean(env.WALRUS_SERVICE_PRIVATE_KEY);
export const hasSealConfig = Boolean(env.SEAL_PACKAGE_ID && env.SEAL_KEY_SERVERS);
