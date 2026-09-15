import { MoreHorizontal, Pencil, Trash2 } from 'lucide-react'

import { Button } from '@components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@components/ui/dropdown-menu'
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
} from '@components/ui/pagination'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@components/ui/table'

import type { Producer } from '../producer-fixtures'
import { maskDocument } from '../producer-validation'

type ProducersListProps = {
  producers: Producer[]
  page: number
  pageCount: number
  onPageChange: (page: number) => void
  onOpen: (producerId: string) => void
  onDelete: (producer: Producer) => void
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat('pt-BR').format(new Date(`${value}T12:00:00`))
}

export function ProducersList({
  producers,
  page,
  pageCount,
  onPageChange,
  onOpen,
  onDelete,
}: ProducersListProps) {
  return (
    <div className="space-y-4">
        {producers.length === 0 ? (
          <div className="rounded-lg border border-dashed p-8 text-center">
            <p className="font-medium">Nenhum produtor encontrado</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Tente ajustar sua busca ou cadastre um novo produtor.
            </p>
          </div>
        ) : (
          <>
            <div className="overflow-hidden rounded-lg border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Produtor</TableHead>
                    <TableHead>CPF/CNPJ</TableHead>
                    <TableHead>Fazendas</TableHead>
                    <TableHead>Cadastro</TableHead>
                    <TableHead className="w-12"><span className="sr-only">Ações</span></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {producers.map((producer) => (
                    <TableRow key={producer.id}>
                      <TableCell>
                        <button
                          type="button"
                          className="text-left font-medium hover:underline"
                          onClick={() => onOpen(producer.id)}
                        >
                          {producer.name}
                        </button>
                      </TableCell>
                      <TableCell>{maskDocument(producer.document)}</TableCell>
                      <TableCell>{producer.farms.length}</TableCell>
                      <TableCell>{formatDate(producer.createdAt)}</TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger
                            render={<Button variant="ghost" size="icon" aria-label={`Ações de ${producer.name}`} />}
                          >
                            <MoreHorizontal />
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => onOpen(producer.id)}>
                              <Pencil />
                              Editar
                            </DropdownMenuItem>
                            <DropdownMenuItem variant="destructive" onClick={() => onDelete(producer)}>
                              <Trash2 />
                              Excluir
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            {pageCount > 1 && (
              <div className="flex items-center justify-between gap-4">
                <p className="text-sm text-muted-foreground">Página {page} de {pageCount}</p>
                <Pagination className="mx-0 w-auto justify-end">
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious
                        text="Anterior"
                        href="#"
                        aria-disabled={page === 1}
                        className={page === 1 ? 'pointer-events-none opacity-50' : undefined}
                        onClick={(event) => {
                          event.preventDefault()
                          if (page > 1) onPageChange(page - 1)
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
                          event.preventDefault()
                          if (page < pageCount) onPageChange(page + 1)
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
  )
}
