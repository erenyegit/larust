"use client";

import { ReactNode, useMemo } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  createNetworkConfig,
  SuiClientProvider,
  WalletProvider,
  ConnectButton,
} from "@mysten/dapp-kit";
import "@mysten/dapp-kit/dist/index.css";
import { Toaster } from "sonner";

const { networkConfig } = createNetworkConfig({
  testnet: {
    url: process.env.NEXT_PUBLIC_SUI_RPC_URL ?? "https://fullnode.testnet.sui.io:443",
    network: "testnet",
  },
  mainnet: { url: "https://fullnode.mainnet.sui.io:443", network: "mainnet" },
});

export function AppProviders({ children }: { children: ReactNode }) {
  const queryClient = useMemo(() => new QueryClient(), []);
  return (
    <QueryClientProvider client={queryClient}>
      <SuiClientProvider
        networks={networkConfig}
        defaultNetwork={(process.env.NEXT_PUBLIC_SUI_NETWORK as "testnet" | "mainnet") ?? "testnet"}
      >
        <WalletProvider autoConnect>{children}</WalletProvider>
      </SuiClientProvider>
      <Toaster richColors theme="dark" />
    </QueryClientProvider>
  );
}

export function WalletConnectInline() {
  return (
    <div className="wallet-connect-inline">
      <ConnectButton />
    </div>
  );
}
