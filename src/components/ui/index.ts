// UI Components Library
// Export all components for easy importing

// Button
export { Button, buttonVariants } from './button'
export type { ButtonProps } from './button'

// Input
export { Input, inputVariants } from './input'
export type { InputProps } from './input'

// Card
export {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
  cardVariants
} from './card'
export type { CardProps } from './card'

// Badge
export { Badge, StatusIndicator } from './badge'
export type { BadgeProps, StatusIndicatorProps } from './badge'

// Skeleton
export {
  Skeleton,
  TableSkeleton,
  CardSkeleton,
  MetricSkeleton
} from './skeleton'
export type { SkeletonProps, TableSkeletonProps, CardSkeletonProps } from './skeleton'

// Toast
export { ToastProvider, useToast, useToastHelpers } from './toaster'
export type { Toast, ToastContextType, ToastProviderProps } from './toaster'

// Alert
export {
  Alert,
  AlertTitle,
  AlertDescription,
  InlineAlert
} from './alert'
export type { AlertProps, InlineAlertProps } from './alert'

// Empty State
export { EmptyState, EmptyStateCard } from './empty-state'
export { EmptyTableState } from './empty-table-state'
export type { EmptyStateProps, EmptyStateAction } from './empty-state'
export type { EmptyTableStateProps } from './empty-table-state'

// Metric Card
export { MetricCard, MetricCardCompact, StatCard } from './metric-card'
export type { MetricCardProps, MetricCardCompactProps, StatCardProps } from './metric-card'

// Data Table
export { DataTable, TableRowActions, TableRowActionItem } from './data-table'

// Form Inputs
export {
  FormInput,
  FormSelect,
  FormCheckbox,
  FormTextarea
} from './form-input'

// shadcn primitives
export {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSet,
} from './field'
export {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
  InputGroupTextarea,
} from './input-group'
export { Label } from './label'
export { Textarea } from './textarea'
export { Checkbox } from './checkbox'
export { Switch } from './switch'
export {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectScrollDownButton,
  SelectScrollUpButton,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from './select'
export {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogOverlay,
  DialogPortal,
  DialogTitle,
  DialogTrigger,
} from './dialog'
export {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogOverlay,
  AlertDialogPortal,
  AlertDialogTitle,
  AlertDialogTrigger,
} from './alert-dialog'
export {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from './table'
export { Tabs, TabsContent, TabsList, TabsTrigger } from './tabs'
export { Avatar, AvatarFallback, AvatarImage } from './avatar'
export {
  DropdownMenu as DropdownMenuRoot,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem as DropdownMenuPrimitiveItem,
  DropdownMenuLabel,
  DropdownMenuPortal,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from './dropdown-menu'
export { Separator } from './separator'
export type {
  FormInputProps,
  FormSelectProps,
  FormCheckboxProps,
  FormTextareaProps
} from './form-input'

// Modal
export { Modal, ConfirmDialog, FormModal } from './modal'
export type { ModalProps, ConfirmDialogProps, FormModalProps } from './modal'

// Tooltip
export { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider, SimpleTooltip, WithTooltip } from './tooltip'
export type { TooltipProps, WithTooltipProps } from './tooltip'

// Popover
export { Popover, PopoverTrigger, PopoverContent, PopoverAnchor, DropdownMenu, ContextMenu } from './popover'
export type { DropdownMenuItem, DropdownMenuProps, ContextMenuProps } from './popover'

// Date Picker
export { Calendar, DatePicker, DateRangePicker, DateRangePickerWithPresets, presetDateRanges } from './date-picker'
export type { CalendarProps, DatePickerProps, DateRangePickerProps, DateRangePickerWithPresetsProps, PresetDateRange } from './date-picker'

// Page Transitions
export { PageTransition, StaggerChildren, ViewTransition, LayoutTransition } from './page-transition'
export type { PageTransitionProps, StaggerChildrenProps, ViewTransitionProps } from './page-transition'
