/** S14: skeleton trasy — bento-karty w pulsie zamiast flasha pustki. */
export function RouteSkeleton() {
  return (
    <div className="mx-auto min-h-dvh max-w-md animate-pulse space-y-md p-md pt-16">
      <div className="h-28 rounded-xl bg-muted" />
      <div className="h-40 rounded-xl bg-muted" />
      <div className="grid grid-cols-3 gap-sm">
        <div className="h-16 rounded-xl bg-muted" />
        <div className="h-16 rounded-xl bg-muted" />
        <div className="h-16 rounded-xl bg-muted" />
      </div>
      <div className="h-56 rounded-xl bg-muted" />
    </div>
  );
}
