import { ArrowLeft } from 'lucide-react'
import { useLocation, useNavigate } from 'react-router'

import { Button } from '@components/ui/button'
import { SidebarTrigger } from '@components/ui/sidebar'

export function Header() {
  const location = useLocation()
  const navigate = useNavigate()
  const isInternalPage = location.pathname !== '/'

  return (
    <header className="flex h-14 items-center gap-2 border-b px-4 sm:h-16 sm:px-6">
      <SidebarTrigger aria-label="Abrir ou recolher navegação" />
      {isInternalPage && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate(-1)}
          aria-label="Voltar"
        >
          <ArrowLeft />
          Voltar
        </Button>
      )}
      <span className="sr-only">Navegação da página</span>
      <div className="ml-auto flex items-center gap-2 text-sm text-muted-foreground">
        <span>Área interna</span>
      </div>
    </header>
  )
}
