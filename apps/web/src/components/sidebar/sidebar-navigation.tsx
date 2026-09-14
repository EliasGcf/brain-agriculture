import { BarChart3, Building2, LayoutDashboard } from 'lucide-react'
import { NavLink, useLocation } from 'react-router'

import {
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@components/ui/sidebar'

const navigationItems = [
  { label: 'Dashboard', to: '/', icon: LayoutDashboard },
  { label: 'Produtores', to: '/produtores', icon: Building2 },
  { label: 'Fazendas', to: '/farms', icon: BarChart3 },
]

export function SidebarNavigation() {
  const location = useLocation()

  return (
    <SidebarContent>
      <SidebarGroup>
        <SidebarGroupLabel>Navegação principal</SidebarGroupLabel>
        <SidebarGroupContent>
          <SidebarMenu>
            {navigationItems.map((item) => {
              const isActive =
                item.to === '/' ? location.pathname === '/' : location.pathname.startsWith(item.to)

              return (
                <SidebarMenuItem key={item.to}>
                  <SidebarMenuButton
                    render={<NavLink to={item.to} end={item.to === '/'} />}
                    isActive={isActive}
                    tooltip={item.label}
                  >
                    <item.icon />
                    <span>{item.label}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              )
            })}
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>
    </SidebarContent>
  )
}
