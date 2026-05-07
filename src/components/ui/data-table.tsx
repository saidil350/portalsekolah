'use client'

import * as React from 'react'
import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  PaginationState,
} from '@tanstack/react-table'
import { cn } from '@/lib/utils'
import { ArrowUpDown, MoreHorizontal, Search, ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from './button'
import { TableSkeleton } from './skeleton'
import { EmptyTableState } from './empty-table-state'
import { Input } from './input'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from './dropdown-menu'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from './table'
import { useLanguage } from '@/contexts/LanguageContext'

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[]
  data: TData[]
  searchKey?: string
  searchPlaceholder?: string
  pageSize?: number
  loading?: boolean
  emptyType?: 'classes' | 'students' | 'rooms' | 'subjects' | 'schedules' | 'teachers' | 'generic'
  emptyState?: {
    title: string
    description?: string
    icon?: React.ReactNode
  }
  hasFilters?: boolean
  hasSearch?: boolean
  onAdd?: () => void
  onClearFilters?: () => void
  addLabel?: string
}

export function DataTable<TData, TValue>({
  columns,
  data,
  searchKey,
  searchPlaceholder,
  pageSize = 10,
  loading = false,
  emptyType = 'generic',
  emptyState,
  hasFilters = false,
  hasSearch = false,
  onAdd,
  onClearFilters,
  addLabel,
}: DataTableProps<TData, TValue>) {
  const { t } = useLanguage()
  const [sorting, setSorting] = React.useState<SortingState>([])
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([])
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({})
  const [rowSelection, setRowSelection] = React.useState({})
  const [pagination, setPagination] = React.useState<PaginationState>({
    pageIndex: 0,
    pageSize,
  })

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    onPaginationChange: setPagination,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
      pagination,
    },
  })

  if (loading) {
    return <TableSkeleton rows={pageSize} columns={columns.length} />
  }

  if (data.length === 0) {
    return (
      <EmptyTableState
        type={emptyType}
        hasFilters={hasFilters}
        hasSearch={hasSearch}
        onAdd={onAdd}
        onClearFilters={onClearFilters}
        addLabel={addLabel}
      />
    )
  }

  return (
    <div className="w-full">
      {/* Search */}
      {searchKey && (
        <div className="flex items-center py-4 gap-2">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder={searchPlaceholder || t('common.search.placeholder')}
              value={(table.getColumn(searchKey)?.getFilterValue() as string) ?? ''}
              onChange={(event) =>
                table.getColumn(searchKey)?.setFilterValue(event.target.value)
              }
              className="pl-10"
            />
          </div>
        </div>
      )}

      {/* Table */}
      <div className="rounded-md border bg-card">
        <Table>
          <TableHeader className="bg-muted/50">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead
                      key={header.id}
                      className="h-12 px-4"
                    >
                      {header.isPlaceholder ? null : (
                        <div
                          className={cn(
                            "flex items-center gap-2",
                            header.column.getCanSort() && "cursor-pointer select-none hover:bg-accent -mx-2 px-2 py-1 rounded transition-colors"
                          )}
                          onClick={header.column.getToggleSortingHandler()}
                        >
                          {flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                          {header.column.getCanSort() && (
                            <ArrowUpDown className="ml-2 h-4 w-4 text-muted-foreground" />
                          )}
                        </div>
                      )}
                    </TableHead>
                  )
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && 'selected'}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell
                      key={cell.id}
                      className="p-4"
                    >
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center text-muted-foreground"
                >
                  {t('common.state.noResults')}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-end gap-2 py-4">
        <div className="text-sm text-muted-foreground flex-1">
          {t('common.pagination.pageInfo')
            .replace('{page}', String(table.getState().pagination.pageIndex + 1))
            .replace('{total}', String(table.getPageCount()))
            .replace('{count}', String(table.getFilteredRowModel().rows.length))}
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            <ChevronLeft className="w-4 h-4" />
            {t('common.action.previous')}
          </Button>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            {t('common.action.next')}
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}

// Action button for table rows
export interface TableRowActionsProps {
  children: React.ReactNode
}

export function TableRowActions({ children }: TableRowActionsProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="size-8">
          <MoreHorizontal />
          <span className="sr-only">Open menu</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        {children}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

// Action item for row actions
export interface TableRowActionItemProps {
  onClick: () => void
  children: React.ReactNode
  variant?: 'default' | 'danger'
}

export function TableRowActionItem({ onClick, children, variant = 'default' }: TableRowActionItemProps) {
  return (
    <DropdownMenuItem
      onClick={onClick}
      variant={variant === 'danger' ? 'destructive' : 'default'}
    >
      {children}
    </DropdownMenuItem>
  )
}
