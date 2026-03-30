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
import { ArrowUpDown, ChevronDown, MoreHorizontal, Search, ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from './button'
import { TableSkeleton } from './skeleton'
import { EmptyTableState } from './empty-table-state'
import { Input } from './input'

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
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-tertiary" />
            <Input
              type="search"
              placeholder={searchPlaceholder || 'Cari...'}
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
      <div className="rounded-md border border-slate-200 bg-white">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 border-b border-slate-200">
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <th
                      key={header.id}
                      className="h-12 px-4 text-left align-middle font-medium text-text-primary [&:has([role=checkbox])]:pr-0"
                    >
                      {header.isPlaceholder ? null : (
                        <div
                          className={cn(
                            "flex items-center gap-2",
                            header.column.getCanSort() && "cursor-pointer select-none hover:bg-slate-100 -mx-2 px-2 py-1 rounded transition-colors"
                          )}
                          onClick={header.column.getToggleSortingHandler()}
                        >
                          {flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                          {header.column.getCanSort() && (
                            <ArrowUpDown className="ml-2 h-4 w-4 text-text-tertiary" />
                          )}
                        </div>
                      )}
                    </th>
                  )
                })}
              </tr>
            ))}
          </thead>
          <tbody className="divide-y divide-slate-100">
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <tr
                  key={row.id}
                  data-state={row.getIsSelected() && 'selected'}
                  className="hover:bg-slate-50/50 transition-colors"
                >
                  {row.getVisibleCells().map((cell) => (
                    <td
                      key={cell.id}
                      className="p-4 align-middle [&:has([role=checkbox])]:pr-0"
                    >
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={columns.length}
                  className="h-24 text-center text-text-secondary"
                >
                  Tidak ada hasil.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-end space-x-2 py-4">
        <div className="text-sm text-text-secondary flex-1">
          Halaman {table.getState().pagination.pageIndex + 1} dari{' '}
          {table.getPageCount()} ({table.getFilteredRowModel().rows.length} data)
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            <ChevronLeft className="w-4 h-4" />
            Sebelumnya
          </Button>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            Selanjutnya
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
  const [isOpen, setIsOpen] = React.useState(false)

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="h-8 w-8 flex items-center justify-center rounded-md hover:bg-slate-100 transition-colors cursor-pointer"
      >
        <MoreHorizontal className="h-4 w-4" />
      </button>
      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 z-20 w-48 rounded-md border border-slate-200 bg-white shadow-lg">
            <div className="py-1">
              {children}
            </div>
          </div>
        </>
      )}
    </div>
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
    <button
      onClick={onClick}
      className={cn(
        "w-full text-left px-4 py-2 text-sm transition-colors cursor-pointer",
        variant === 'default' && 'hover:bg-slate-50',
        variant === 'danger' && 'hover:bg-error-50 text-error-600'
      )}
    >
      {children}
    </button>
  )
}
