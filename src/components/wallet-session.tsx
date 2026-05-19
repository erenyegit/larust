"use client";

import { useState } from "react";
import { useCurrentAccount, useSignPersonalMessage } from "@mysten/dapp-kit";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { WalletConnectInline } from "@/components/providers";
import { Button } from "@/components/ui/button";

export function WalletSession() {
  const account = useCurrentAccount();
  const queryClient = useQueryClient();
  const signMutation = useSignPersonalMessage();
  const [error, setError] = useState<string | null>(null);

  const sessionQuery = useQuery({
    queryKey: ["wallet-session"],
    queryFn: async () => {
      const response = await fetch("/api/auth/session");
      return (await response.json()) as { address: string | null };
    },
  });
  const sessionAddress = sessionQuery.data?.address ?? null;

  async function authenticate() {
    if (!account?.address) return;
    setError(null);
    try {
      const challengeResponse = await fetch("/api/auth/challenge", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ address: account.address }),
      });
      const challenge = (await challengeResponse.json()) as { message: string; token: string };
      const signatureResult = await signMutation.mutateAsync({
        message: new TextEncoder().encode(challenge.message),
      });
      const response = await fetch("/api/auth/verify", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          address: account.address,
          challengeToken: challenge.token,
          signature: signatureResult.signature,
        }),
      });
      if (!response.ok) {
        throw new Error(await response.text());
      }
      await queryClient.invalidateQueries({ queryKey: ["wallet-session"] });
    } catch (authError) {
      setError(authError instanceof Error ? authError.message : "Could not authenticate");
    }
  }

  async function logout() {
    await fetch("/api/auth/session", { method: "DELETE" });
    await queryClient.invalidateQueries({ queryKey: ["wallet-session"] });
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <WalletConnectInline />
      {account ? (
        sessionAddress === account.address ? (
          <Button variant="secondary" onClick={logout}>
            Admin verified
          </Button>
        ) : (
          <Button variant="secondary" onClick={authenticate}>
            Verify admin session
          </Button>
        )
      ) : null}
      {error ? <p className="text-xs text-rose-600">{error}</p> : null}
    </div>
  );
}
