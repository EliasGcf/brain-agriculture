export function DashboardEmptyChart({ label }: { label: string }) {
  return (
    <div className="flex min-h-56 items-center justify-center rounded-lg border border-dashed bg-muted/20 p-6 text-center text-sm text-muted-foreground">
      <p>Nenhum dado disponível para {label.toLowerCase()}.</p>
    </div>
  )
}
