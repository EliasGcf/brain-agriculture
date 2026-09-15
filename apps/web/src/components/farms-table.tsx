import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@components/ui/table';
import type { FarmResponse } from '@store/api.generated';

type FarmsTableProps = {
  farms: FarmResponse[];
  isFetching?: boolean;
};

function formatArea(value: number) {
  return `${new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 2 }).format(value)} ha`;
}

export function FarmsTable({ farms, isFetching }: FarmsTableProps) {
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
        <div className="overflow-hidden rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Localização</TableHead>
                <TableHead>Área total</TableHead>
                <TableHead>Agricultável</TableHead>
                <TableHead>Vegetação</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {farms.map((farm) => (
                <TableRow key={farm.id}>
                  <TableCell className="font-medium">{farm.name}</TableCell>
                  <TableCell>
                    {farm.city}, {farm.state}
                  </TableCell>
                  <TableCell>{formatArea(farm.totalArea)}</TableCell>
                  <TableCell>{formatArea(farm.arableArea)}</TableCell>
                  <TableCell>{formatArea(farm.vegetationArea)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
