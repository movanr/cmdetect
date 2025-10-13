import type { ReactNode } from 'react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

interface Column<T> {
  key: keyof T | 'actions'
  header: string
  width?: string
  render?: (value: any, row: T) => ReactNode
}

interface DataTableProps<T> {
  data: T[]
  columns: Column<T>[]
  loading?: boolean
  emptyState?: ReactNode
  actions?: (row: T) => ReactNode
  onRowClick?: (row: T) => void
}

export function DataTable<T extends Record<string, any>>({
  data,
  columns,
  loading = false,
  emptyState,
  actions,
  onRowClick,
}: DataTableProps<T>) {
  if (loading) {
    return (
      <Card>
        <CardContent className="p-0">
          <Table>
            <colgroup>
              {columns.map((column) => (
                <col key={String(column.key)} style={{ width: column.width }} />
              ))}
            </colgroup>
            <TableHeader>
              <TableRow>
                {columns.map((column) => (
                  <TableHead key={String(column.key)}>
                    {column.header}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {Array.from({ length: 5 }).map((_, index) => (
                <TableRow key={index}>
                  {columns.map((column) => (
                    <TableCell key={String(column.key)}>
                      <Skeleton className="h-4 w-full" />
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    )
  }

  if (data.length === 0) {
    return emptyState || <div className="text-center py-8 text-muted-foreground">No data available</div>
  }

  return (
    <Card>
      <CardContent className="p-0">
        <Table>
          <colgroup>
            {columns.map((column) => (
              <col key={String(column.key)} style={{ width: column.width }} />
            ))}
          </colgroup>
          <TableHeader>
            <TableRow>
              {columns.map((column) => (
                <TableHead key={String(column.key)}>
                  {column.header}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((row, index) => (
              <TableRow
                key={row.id || index}
                onClick={() => onRowClick?.(row)}
                className={onRowClick ? "cursor-pointer hover:bg-muted/50" : undefined}
              >
                {columns.map((column) => (
                  <TableCell key={String(column.key)}>
                    {column.key === 'actions' && actions ? (
                      actions(row)
                    ) : column.render ? (
                      column.render(row[column.key], row)
                    ) : (
                      row[column.key]
                    )}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}

export function ActionButtons({ children }: { children: ReactNode }) {
  return <div className="flex items-center space-x-2">{children}</div>
}