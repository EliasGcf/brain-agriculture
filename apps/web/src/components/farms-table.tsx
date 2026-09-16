import { MoreHorizontal, Pencil, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@components/ui/dropdown-menu';
import { Button } from '@components/ui/button';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
} from '@components/ui/pagination';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@components/ui/table';
import type { FarmResponse, ProducerResponse } from '@store/api/api.generated';
import { DeleteFarmAlertDialog } from '@pages/farms/components/delete-farm-alert-dialog';

type FarmWithOwner = FarmResponse & {
  owner?: ProducerResponse;
};

type FarmsTableProps = {
  farms: FarmWithOwner[];
  page?: number;
  pageCount?: number;
  isFetching?: boolean;
  onPageChange?: (page: number) => void;
  onDeleteSuccess: () => void | Promise<void>;
};

function formatArea(value: number) {
  return `${new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 2 }).format(value)} ha`;
}

export function FarmsTable({ farms, page = 1, pageCount = 1, isFetching, onPageChange, onDeleteSuccess }: FarmsTableProps) {
  const hasOwner = farms.some((farm) => farm.owner);
  const [farmToDelete, setFarmToDelete] = useState<FarmWithOwner | null>(null);

  return (
    <div
      className={isFetching ? 'flex flex-col gap-4 opacity-60' : 'flex flex-col gap-4'}
      aria-busy={isFetching}
    >
      {farms.length === 0 ? (
        <div className="rounded-lg border border-dashed p-8 text-center">
          <p className="font-medium">Nenhuma fazenda encontrada</p>
          <p className="mt-1 text-sm text-muted-foreground">
            As fazendas cadastradas aparecerão nesta lista.
          </p>
        </div>
      ) : (
        <>
        <div className="overflow-hidden rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                {hasOwner && <TableHead>Produtor</TableHead>}
                <TableHead>Localização</TableHead>
                <TableHead>Área total</TableHead>
                <TableHead>Agricultável</TableHead>
                <TableHead>Vegetação</TableHead>
                <TableHead className="w-12"><span className="sr-only">Ações</span></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {farms.map((farm) => (
                <TableRow key={farm.id}>
                  <TableCell className="font-medium">
                    <Link
                      className="hover:underline"
                      to={`/farms/${farm.id}`}
                    >
                      {farm.name}
                    </Link>
                  </TableCell>
                  {hasOwner && (
                    <TableCell>{farm.owner?.name ?? farm.producerId}</TableCell>
                  )}
                  <TableCell>
                    {farm.city}, {farm.state}
                  </TableCell>
                  <TableCell>{formatArea(farm.totalArea)}</TableCell>
                  <TableCell>{formatArea(farm.arableArea)}</TableCell>
                  <TableCell>{formatArea(farm.vegetationArea)}</TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger
                        render={
                          <Button
                            variant="ghost"
                            size="icon-xs"
                            className="mx-auto flex size-5"
                            aria-label={`Ações de ${farm.name}`}
                          />
                        }
                      >
                        <MoreHorizontal />
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          render={<Link to={`/farms/${farm.id}`} />}
                        >
                          <Pencil />
                          Editar
                        </DropdownMenuItem>
                        <DropdownMenuItem variant="destructive" onClick={() => setFarmToDelete(farm)}>
                          <Trash2 />
                          Excluir
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                    {farmToDelete?.id === farm.id && (
                      <DeleteFarmAlertDialog
                        farmId={farm.id}
                        farmName={farm.name}
                        open
                        onOpenChange={(open) => !open && setFarmToDelete(null)}
                        onSuccess={onDeleteSuccess}
                      />
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        {pageCount > 1 && onPageChange && (
          <div className="flex items-center justify-between gap-4">
            <p className="text-sm text-muted-foreground">Página {page} de {pageCount}</p>
            <Pagination className="mx-0 w-auto justify-end">
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    text="Anterior"
                    href="#"
                    aria-label="Página anterior"
                    aria-disabled={page === 1}
                    className={page === 1 ? 'pointer-events-none opacity-50' : undefined}
                    onClick={(event) => {
                      event.preventDefault();
                      if (page > 1) onPageChange(page - 1);
                    }}
                  />
                </PaginationItem>
                <PaginationItem>
                  <PaginationNext
                    text="Próxima"
                    href="#"
                    aria-label="Próxima página"
                    aria-disabled={page === pageCount}
                    className={page === pageCount ? 'pointer-events-none opacity-50' : undefined}
                    onClick={(event) => {
                      event.preventDefault();
                      if (page < pageCount) onPageChange(page + 1);
                    }}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        )}
        </>
      )}
    </div>
  );
}
