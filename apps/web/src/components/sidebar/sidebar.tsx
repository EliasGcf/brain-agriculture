import { Sidebar as UISidebar } from '@components/ui/sidebar'

import { SidebarBrand } from './sidebar-brand'
import { SidebarNavigation } from './sidebar-navigation'

export function Sidebar() {
  return (
    <UISidebar collapsible="icon" aria-label="Navegação da aplicação">
      <SidebarBrand />
      <SidebarNavigation />
    </UISidebar>
  )
}
