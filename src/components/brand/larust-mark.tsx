export function LarustMark() {
  return (
    <div className="inline-flex items-center gap-2">
      <span className="inline-flex h-7 w-7 items-center justify-center rounded-md bg-blue-600">
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="h-4 w-4 text-white"
          aria-hidden
        >
          <path d="M7 4c1.5 0 3 .5 4 2v14c-2.5 0-5-1.5-6-4-1-2.5 0-9 2-12Z" />
          <path d="M15 8c1 1.5 2 3.5 2 5.5" />
        </svg>
      </span>
      <span className="text-base font-semibold tracking-tight text-slate-900">Larust</span>
    </div>
  );
}
