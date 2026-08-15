import React from 'react';
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { CaretLeft, CaretRight } from '@phosphor-icons/react';

interface Column<T> {
  header: string;
  accessorKey?: keyof T | string;
  cell?: (row: T) => React.ReactNode;
  className?: string;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  loading?: boolean;
  emptyText?: string;
  // Pagination
  page?: number;
  limit?: number;
  totalPages?: number;
  totalItems?: number;
  onPageChange?: (page: number) => void;
}

export function DataTable<T>({
  columns: columnsProp,
  data: dataProp,
  loading = false,
  emptyText = 'No records found.',
  page,
  limit,
  totalPages,
  totalItems,
  onPageChange,
}: DataTableProps<T>) {
  const columns = columnsProp ?? [];
  const data = dataProp ?? [];

  const hasPagination =
    page !== undefined &&
    limit !== undefined &&
    totalPages !== undefined &&
    totalItems !== undefined &&
    onPageChange !== undefined;

  const startRecord = hasPagination ? (page! - 1) * limit! + 1 : 1;
  const endRecord = hasPagination ? Math.min(page! * limit!, totalItems!) : data.length;

  return (
    <div className="w-full space-y-4">
      <div className="rounded-2xl border border-border bg-card text-card-foreground overflow-hidden">
        <Table>
          <TableHeader className="bg-muted/50 border-b border-border">
            <TableRow>
              {columns.map((col, idx) => (
                <TableHead
                  key={idx}
                  className={`h-12 px-6 text-sm font-semibold text-muted-foreground ${col.className || ''}`}
                >
                  {col.header}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              Array.from({ length: limit || 5 }).map((_, rIdx) => (
                <TableRow key={rIdx} className="hover:bg-transparent border-b border-border/50">
                  {columns.map((_, cIdx) => (
                    <TableCell key={cIdx} className="px-6 py-4">
                      <Skeleton className="h-5 w-full max-w-[120px] rounded-lg" />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : data.length === 0 ? (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-32 text-center text-muted-foreground">
                  {emptyText}
                </TableCell>
              </TableRow>
            ) : (
              data.map((row, rIdx) => (
                <TableRow
                  key={rIdx}
                  className="border-b border-border/50 hover:bg-accent/50 transition-colors"
                >
                  {columns.map((col, cIdx) => {
                    const cellContent = col.cell
                      ? col.cell(row)
                      : col.accessorKey
                      ? (row[col.accessorKey as keyof T] as React.ReactNode)
                      : null;
                    return (
                      <TableCell
                        key={cIdx}
                        className={`px-6 py-4 text-base text-foreground ${col.className || ''}`}
                      >
                        {cellContent}
                      </TableCell>
                    );
                  })}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {hasPagination && totalItems! > 0 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-2">
          <div className="text-base text-muted-foreground">
            Showing <span className="font-semibold text-gray-700 text-foreground">{startRecord}</span> to{' '}
            <span className="font-semibold text-gray-700 text-foreground">{endRecord}</span> of{' '}
            <span className="font-semibold text-gray-700 text-foreground">{totalItems}</span> records
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              className="h-10 w-10 rounded-xl"
              onClick={() => onPageChange!(page! - 1)}
              disabled={page! <= 1 || loading}
            >
              <CaretLeft size={20} />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="h-10 w-10 rounded-xl"
              onClick={() => onPageChange!(page! + 1)}
              disabled={page! >= totalPages! || loading}
            >
              <CaretRight size={20} />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
