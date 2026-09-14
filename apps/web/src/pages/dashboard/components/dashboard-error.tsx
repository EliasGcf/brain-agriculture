import { Alert, AlertDescription, AlertTitle } from '@components/ui/alert'
import { Button } from '@components/ui/button'

export function DashboardError({ onRetry }: { onRetry?: () => void }) {
  return (
    <Alert variant="destructive">
      <AlertTitle>Não foi possível carregar o dashboard.</AlertTitle>
      <AlertDescription className="flex items-center justify-between gap-4">
        <span>Verifique sua conexão e tente novamente.</span>
        <Button variant="outline" onClick={onRetry}>Tentar novamente</Button>
      </AlertDescription>
    </Alert>
  )
}
