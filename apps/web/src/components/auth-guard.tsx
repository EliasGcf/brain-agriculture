import { Navigate, Outlet } from 'react-router'
import { parseAsString, useQueryState } from 'nuqs'

import { Spinner } from '@components/ui/spinner'
import { useMeQuery } from '@store/api/api.generated'

export function AuthGuard() {
  const meQuery = useMeQuery()

  if (meQuery.isLoading) {
    return (
      <div className="flex min-h-svh items-center justify-center">
        <Spinner aria-label="Verificando autenticação" />
      </div>
    )
  }

  if (meQuery.isError || !meQuery.data?.ok) {
    const redirect = `${window.location.pathname}${window.location.search}`
    return <Navigate to={`/login?redirect=${encodeURIComponent(redirect)}`} replace />
  }

  return <Outlet />
}

export function PublicOnlyGuard() {
  const [redirect] = useQueryState('redirect', parseAsString.withDefault('/'))
  const meQuery = useMeQuery()

  if (meQuery.isLoading) {
    return (
      <div className="flex min-h-svh items-center justify-center">
        <Spinner aria-label="Verificando autenticação" />
      </div>
    )
  }

  if (meQuery.data?.ok) {
    return <Navigate to={redirect.startsWith('/') ? redirect : '/'} replace />
  }

  return <Outlet />
}
