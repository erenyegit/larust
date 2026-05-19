import { FormBuilderShell } from "@/components/forms/form-builder-shell";

export default function CreatePage() {
  return (
    <div className="mx-auto max-w-7xl space-y-6 px-4 py-8 md:py-10">
      <header className="space-y-1.5">
        <h1 className="text-3xl font-semibold tracking-tight text-slate-900">Create form</h1>
        <p className="max-w-2xl text-sm text-slate-600">
          Pick a template and adjust fields. Public submissions don&apos;t need a wallet.
        </p>
      </header>
      <FormBuilderShell />
    </div>
  );
}
