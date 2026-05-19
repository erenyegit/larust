"use client";

import { useCurrentAccount } from "@mysten/dapp-kit";
import { useQuery } from "@tanstack/react-query";
import { FormBuilder } from "@/components/forms/form-builder";

export function FormBuilderShell() {
  const account = useCurrentAccount();
  const sessionQuery = useQuery({
    queryKey: ["wallet-session"],
    queryFn: async () => {
      const response = await fetch("/api/auth/session");
      return (await response.json()) as { address: string | null };
    },
  });
  const sessionAddress = sessionQuery.data?.address ?? null;

  const owner = sessionAddress ?? account?.address ?? "";

  if (!sessionAddress) {
    return (
      <div className="rounded-xl border border-amber-300 bg-amber-50 p-4 text-sm text-amber-800">
        Verify your wallet session in the header to create and publish forms. Public respondents still submit without wallets.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <p className="text-xs text-slate-600">
        Connected as <span className="font-mono text-slate-700">{owner}</span>
      </p>
      <FormBuilder owner={owner} />
    </div>
  );
}
