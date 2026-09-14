import { TractorIcon } from 'lucide-react'

import { SidebarHeader } from '@components/ui/sidebar'

export function SidebarBrand() {
  return (
    <SidebarHeader>
      <div className="flex items-center gap-2 py-1.5">
        <div className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground px-2">
          <TractorIcon className="size-4" aria-hidden="true" />
        </div>
        <div className="grid flex-1 text-left text-sm leading-tight group-data-[collapsible=icon]:hidden">
          <span className="truncate font-semibold">Agro Gestão</span>
          <span className="truncate text-xs text-muted-foreground">Operação agrícola</span>
        </div>
      </div>
    </SidebarHeader>
  )
}
