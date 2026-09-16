import { ArrowLeft, LogOut } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router';

import { Button } from '@components/ui/button';
import { SidebarTrigger } from '@components/ui/sidebar';
import { Spinner } from '@components/ui/spinner';
import { useLogoutUserMutation } from '@store/api/api.generated';
import { api } from '@store/api/api.generated';
import { apiStore } from '@store/store';

export function Header() {
  const location = useLocation();
  const navigate = useNavigate();
  const [logout, logoutState] = useLogoutUserMutation();
  const isInternalPage = location.pathname !== '/';

  async function handleLogout() {
    await logout().unwrap();
    apiStore.dispatch(api.util.resetApiState());
  }

  function handleGoBack() {
    navigate(-1);
  }

  return (
    <header className="flex h-14 items-center gap-2 border-b px-4 sm:h-16 sm:px-6">
      <SidebarTrigger aria-label="Abrir ou recolher navegação" />
      {isInternalPage && (
        <Button variant="ghost" size="sm" onClick={handleGoBack} aria-label="Voltar">
          <ArrowLeft />
          Voltar
        </Button>
      )}
      <span className="sr-only">Navegação da página</span>
      <div className="ml-auto flex items-center gap-2 text-sm text-muted-foreground">
        <span>Área interna</span>
        <Button
          variant="ghost"
          size="sm"
          aria-label="Sair"
          disabled={logoutState.isLoading}
          onClick={handleLogout}
        >
          {logoutState.isLoading ? <Spinner /> : <LogOut />}
          Sair
        </Button>
      </div>
    </header>
  );
}
