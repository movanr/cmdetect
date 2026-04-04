import type { ReactNode } from 'react'
import { Link } from '@tanstack/react-router'
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

type ResponsiveBreakpoint = 'sm' | 'md' | 'lg' | 'xl'

interface Column<T> {
  key: keyof T | 'actions'
  header: string
  width?: string
  render?: (value: any, row: T) => ReactNode
  /** Hide this column below the specified breakpoint */
  hideBelow?: ResponsiveBreakpoint
  /** If true, this column's content will NOT be wrapped in a row link */
  disableLink?: boolean
}

/** Maps breakpoint to Tailwind classes for hiding columns below that breakpoint */
function getHideClass(hideBelow?: ResponsiveBreakpoint): string {
  if (!hideBelow) return ''
  const classes: Record<ResponsiveBreakpoint, string> = {
    sm: 'hidden sm:table-cell',
    md: 'hidden md:table-cell',
    lg: 'hidden lg:table-cell',
    xl: 'hidden xl:table-cell',
  }
  return classes[hideBelow]
}

interface DataTableProps<T> {
  data: T[]
  columns: Column<T>[]
  loading?: boolean
  emptyState?: ReactNode
  actions?: (row: T) => ReactNode
  /** @deprecated Use rowLink instead for accessible navigation */
  onRowClick?: (row: T) => void
  /** Returns TanStack Router Link props for a row, enabling accessible ctrl+click, right-click, and keyboard navigation */
  rowLink?: (row: T) => { to: string; params?: Record<string, string> }
}

export function DataTable<T extends Record<string, any>>({
  data,
  columns,
  loading = false,
  emptyState,
  actions,
  onRowClick,
  rowLink,
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
                  <TableHead
                    key={String(column.key)}
                    className={getHideClass(column.hideBelow)}
                  >
                    {column.header}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {Array.from({ length: 5 }).map((_, index) => (
                <TableRow key={index}>
                  {columns.map((column) => (
                    <TableCell
                      key={String(column.key)}
                      className={getHideClass(column.hideBelow)}
                    >
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

  // Determine which columns should be wrapped in links
  const isRowLinked = !!rowLink
  const isClickable = isRowLinked || !!onRowClick

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
                <TableHead
                  key={String(column.key)}
                  className={getHideClass(column.hideBelow)}
                >
                  {column.header}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((row, index) => {
              const linkProps = isRowLinked ? rowLink(row) : undefined
              let isFirstLinkedCell = true

              return (
                <TableRow
                  key={row.id || index}
                  onClick={!isRowLinked && onRowClick ? () => onRowClick(row) : undefined}
                  className={isClickable ? "cursor-pointer hover:bg-muted/50" : undefined}
                >
                  {columns.map((column) => {
                    const isActions = column.key === 'actions'
                    const shouldLink = linkProps && !isActions && !column.disableLink

                    const cellContent = isActions && actions
                      ? actions(row)
                      : column.render
                        ? column.render(row[column.key], row)
                        : row[column.key]

                    if (shouldLink) {
                      const tabIndex = isFirstLinkedCell ? undefined : -1
                      isFirstLinkedCell = false

                      return (
                        <TableCell
                          key={String(column.key)}
                          className={`${getHideClass(column.hideBelow)} p-0`}
                        >
                          <Link
                            {...(linkProps as any)}
                            tabIndex={tabIndex}
                            className="block px-2 py-2 text-inherit no-underline"
                          >
                            {cellContent}
                          </Link>
                        </TableCell>
                      )
                    }

                    return (
                      <TableCell
                        key={String(column.key)}
                        className={getHideClass(column.hideBelow)}
                      >
                        {cellContent}
                      </TableCell>
                    )
                  })}
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}

export function ActionButtons({ children }: { children: ReactNode }) {
  return <div className="flex items-center space-x-2">{children}</div>
}
