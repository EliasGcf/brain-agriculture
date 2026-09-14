import type { ReactNode } from 'react'

export function DashboardChartAlternative({ children }: { children: ReactNode }) {
  return <div className="sr-only">{children}</div>
}
