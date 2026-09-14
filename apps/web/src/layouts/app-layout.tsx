import type { ReactNode } from 'react'
import { Outlet } from 'react-router'

import { SidebarInset, SidebarProvider } from '@components/ui/sidebar'

import { Header } from '@components/header'
import { Sidebar } from '@components/sidebar/sidebar'

export function AppLayout({ children }: { children?: ReactNode }) {
  return (
    <SidebarProvider>
      <Sidebar />
      <SidebarInset>
        <Header />
        <main className="flex flex-1 flex-col gap-6 p-4 sm:p-6">
          {children ?? <Outlet />}
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
}
