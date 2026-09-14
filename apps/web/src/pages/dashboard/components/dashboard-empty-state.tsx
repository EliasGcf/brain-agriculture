import { Sprout } from 'lucide-react'

import { Card, CardContent } from '@components/ui/card'

export function DashboardEmptyState() {
  return (
    <Card>
      <CardContent className="flex items-center gap-3 pt-6">
        <Sprout className="size-5 text-primary" aria-hidden="true" />
        <p className="text-sm text-muted-foreground">Ainda não há fazendas cadastradas.</p>
      </CardContent>
    </Card>
  )
}
