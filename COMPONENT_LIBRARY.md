# UI Component Library Documentation

Complete guide to using the school portal's component library.

## Table of Contents
1. [Getting Started](#getting-started)
2. [Foundational Components](#foundational-components)
3. [Feedback Components](#feedback-components)
4. [Data Display](#data-display)
5. [Form Components](#form-components)
6. [Overlay Components](#overlay-components)
7. [Advanced Components](#advanced-components)
8. [Utilities](#utilities)

---

## Getting Started

### Installation

All components are available in `@/components/ui`. Import them individually or use the index:

```tsx
// Import from index
import { Button, Input, Modal } from '@/components/ui'

// Or import directly
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
```

### Design Tokens

Access design tokens in your CSS:

```css
/* Colors */
var(--primary-500) /* #137fec */
var(--success-500) /* #22c55e */
var(--error-500)   /* #ef4444 */

/* Spacing */
var(--spacing-4) /* 16px */
var(--spacing-6) /* 24px */

/* Shadows */
var(--shadow-sm)
var(--shadow-md)
```

---

## Foundational Components

### Button

Primary action component with multiple variants.

```tsx
import { Button } from '@/components/ui'

// Basic usage
<Button onClick={handleClick}>
  Submit
</Button>

// With variants
<Button variant="primary">Primary</Button>
<Button variant="secondary">Secondary</Button>
<Button variant="ghost">Ghost</Button>
<Button variant="danger">Delete</Button>

// Sizes
<Button size="sm">Small</Button>
<Button size="md">Medium</Button>
<Button size="lg">Large</Button>

// With icons
<Button leftIcon={<Search />}>Search</Button>
<Button rightIcon={<ArrowRight />}>Continue</Button>

// Loading state
<Button loading={isLoading}>
  Processing...
</Button>

// Disabled
<Button disabled={isSubmitting}>
  Submit
</Button>
```

**Props:**
- `variant`: 'primary' | 'secondary' | 'ghost' | 'danger' | 'success'
- `size`: 'sm' (32px) | 'md' (40px) | 'lg' (48px)
- `loading`: boolean - shows spinner
- `leftIcon`, `rightIcon`: React.ReactNode
- `disabled`: boolean

### Input

Text input with validation states.

```tsx
import { Input } from '@/components/ui'

// Basic input
<Input
  placeholder="Enter your email"
  type="email"
/>

// With label and validation
<Input
  label="Email Address"
  name="email"
  type="email"
  error="Invalid email format"
  helperText="We'll send confirmation to this email"
  required
/>

// With icons
<Input
  leftIcon={<Mail />}
  rightIcon={<CheckCircle />}
  placeholder="Search..."
/>

// Password with toggle
<Input
  type="password"
  label="Password"
  showPasswordToggle={true}
/>

// Sizes
<Input size="sm" />
<Input size="md" />
<Input size="lg" />
```

**Props:**
- `label`: string
- `error`: string
- `success`: string
- `helperText`: string
- `required`: boolean
- `leftIcon`, `rightIcon`: React.ReactNode
- `showPasswordToggle`: boolean
- `size`: 'sm' | 'md' | 'lg'

### Card

Container component for grouping content.

```tsx
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui'

// Basic card
<Card>
  <CardContent>
    <p>Card content here</p>
  </CardContent>
</Card>

// Complete card with all sections
<Card variant="elevated" padding="comfortable">
  <CardHeader>
    <CardTitle>Card Title</CardTitle>
    <CardDescription>Optional description</CardDescription>
  </CardHeader>
  <CardContent>
    Main content goes here
  </CardContent>
  <CardFooter>
    <Button>Action</Button>
  </CardFooter>
</Card>

// Variants
<Card variant="default">Default border</Card>
<Card variant="elevated">With shadow</Card>
<Card variant="bordered">Thick border</Card>
<Card variant="ghost">No background</Card>

// Padding
<Card padding="compact">Compact (12px)</Card>
<Card padding="comfortable">Comfortable (16px)</Card>
<Card padding="spacious">Spacious (24px)</Card>
```

**Props:**
- `variant`: 'default' | 'elevated' | 'bordered' | 'ghost'
- `padding`: 'none' | 'compact' | 'comfortable' | 'spacious'

### Badge

Status indicators and labels.

```tsx
import { Badge, StatusIndicator } from '@/components/ui'

// Semantic badges
<Badge variant="success">Active</Badge>
<Badge variant="warning">Pending</Badge>
<Badge variant="error">Failed</Badge>
<Badge variant="info">Info</Badge>
<Badge variant="neutral">Draft</Badge>

// With dot indicator
<Badge showDot>Online</Badge>

// Dismissible
<Badge dismissible onDismiss={() => console.log('dismissed')}>
  Removable
</Badge>

// Status indicator
<StatusIndicator status="online" showLabel />
<StatusIndicator status="offline" />
<StatusIndicator status="away" />
<StatusIndicator status="busy" />
```

---

## Feedback Components

### Toast Notifications

Feedback for user actions.

```tsx
import { useToastHelpers } from '@/components/ui'

function MyComponent() {
  const { success, error, warning, info } = useToastHelpers()

  const handleSave = async () => {
    try {
      await saveData()
      success('Saved successfully', 'Your changes have been saved')
    } catch (err) {
      error('Failed to save', err.message)
    }
  }

  return <Button onClick={handleSave}>Save</Button>
}
```

**Methods:**
- `success(title, message?)`
- `error(title, message?)`
- `warning(title, message?)`
- `info(title, message?)`

### Alert

Inline alert messages.

```tsx
import { Alert, InlineAlert } from '@/components/ui'

// Full alert
<Alert
  variant="warning"
  title="Attention required"
  dismissible
  onDismiss={() => setShowAlert(false)}
>
  Please review your information before continuing.
</Alert>

// Inline alert
<InlineAlert variant="success" message="Changes saved successfully" />
<InlineAlert variant="error" message="Failed to save changes" />
```

### Empty State

Guides users when no data exists.

```tsx
import { EmptyState } from '@/components/ui'

<EmptyState
  icon={<Users className="w-16 h-16" />}
  title="No students found"
  description="Get started by adding your first student"
  actions={[
    {
      label: 'Add Student',
      variant: 'primary',
      onClick: handleAdd
    },
    {
      label: 'Import CSV',
      variant: 'secondary',
      onClick: handleImport
    }
  ]}
/>
```

### Skeleton

Loading placeholders.

```tsx
import { TableSkeleton, CardSkeleton, MetricSkeleton } from '@/components/ui'

// Table skeleton
{loading ? <TableSkeleton rows={5} columns={4} /> : <DataTable />}

// Card skeleton
{loading ? <CardSkeleton hasAvatar hasTitle linesOfText={3} /> : <ProfileCard />}

// Metric skeleton
{loading ? <MetricSkeleton /> : <MetricCard />}
```

---

## Data Display

### DataTable

Advanced data table with sorting, filtering, pagination.

```tsx
import { DataTable, TableRowActions, TableRowActionItem } from '@/components/ui'

const columns: ColumnDef<Student>[] = [
  {
    accessorKey: 'name',
    header: 'Name',
  },
  {
    accessorKey: 'email',
    header: 'Email',
  },
  {
    id: 'actions',
    cell: ({ row }) => (
      <TableRowActions>
        <TableRowActionItem onClick={() => edit(row.original)}>
          Edit
        </TableRowActionItem>
        <TableRowActionItem
          variant="danger"
          onClick={() => delete(row.original)}
        >
          Delete
        </TableRowActionItem>
      </TableRowActions>
    ),
  },
]

<DataTable
  columns={columns}
  data={students}
  searchKey="name"
  searchPlaceholder="Search students..."
  pageSize={10}
  loading={isLoading}
  emptyState={{
    title: 'No students found',
    description: 'Add your first student to get started',
    icon: <Users />
  }}
/>
```

### MetricCard

Display key metrics with trends.

```tsx
import { MetricCard, MetricCardCompact, StatCard } from '@/components/ui'

// Full metric card
<MetricCard
  title="Total Students"
  value={1234}
  trend={{ value: 12, period: 'last month' }}
  icon={<Users />}
  iconBg="bg-blue-50"
/>

// Compact variant
<MetricCardCompact
  label="Attendance"
  value="94%"
  change={2.5}
/>

// Simple stat card
<StatCard
  label="Pending Reviews"
  value="23"
  trend="High priority"
  trendColor="red"
/>
```

---

## Form Components

### FormInput

Integrated with react-hook-form and Zod.

```tsx
import { FormInput, FormSelect, FormCheckbox, FormTextarea } from '@/components/ui'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { studentSchema } from '@/lib/validations'

function StudentForm() {
  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm({
    resolver: zodResolver(studentSchema)
  })

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <FormInput
        name="full_name"
        label="Full Name"
        required
        helperText="Enter student's full name"
      />

      <FormInput
        name="email"
        label="Email"
        type="email"
        helperText="For sending notifications"
      />

      <FormSelect
        name="gender"
        label="Gender"
        required
        options={[
          { value: 'L', label: 'Laki-laki' },
          { value: 'P', label: 'Perempuan' }
        ]}
      />

      <FormCheckbox
        name="active"
        label="Active student"
        helperText="Only active students can login"
      />

      <FormTextarea
        name="notes"
        label="Notes"
        rows={4}
        maxLength={500}
        showCount
      />

      <Button type="submit">Submit</Button>
    </form>
  )
}
```

---

## Overlay Components

### Modal

Unified modal system.

```tsx
import { Modal, ConfirmDialog, FormModal } from '@/components/ui'

// Basic modal
<Modal
  isOpen={isOpen}
  onClose={() => setIsOpen(false)}
  title="Edit Profile"
  size="lg"
>
  <form>
    <FormInput name="name" label="Name" />
  </form>
</Modal>

// Confirmation dialog
<ConfirmDialog
  isOpen={showConfirm}
  onClose={() => setShowConfirm(false)}
  onConfirm={async () => await deleteItem()}
  title="Delete this item?"
  message="This action cannot be undone."
  variant="danger"
  confirmText="Delete"
  loading={isDeleting}
/>

// Form modal
<FormModal
  isOpen={isOpen}
  onClose={() => setIsOpen(false)}
  onSubmit={async () => await saveData()}
  title="New Student"
  submitText="Create"
  submitVariant="primary"
  loading={isSaving}
>
  <FormInput name="name" label="Name" />
</FormModal>
```

**Sizes:** 'sm' (400px) | 'md' (600px) | 'lg' (800px) | 'xl' (1000px) | 'full' (95vw)

### Tooltip

Informational tooltips.

```tsx
import { SimpleTooltip, WithTooltip } from '@/components/ui'

// Simple tooltip
<SimpleTooltip content="This field is required">
  <QuestionMarkIcon />
</SimpleTooltip>

// With wrapper
<WithTooltip tooltip="Click to view details">
  <Button>View</Button>
</WithTooltip>

// Custom variant
<SimpleTooltip
  content="Error occurred"
  variant="error"
  side="bottom"
>
  <AlertTriangle />
</SimpleTooltip>
```

### Popover

Dropdown menus and context menus.

```tsx
import { DropdownMenu, ContextMenu } from '@/components/ui'

// Dropdown menu
<DropdownMenu
  trigger={<Button>Options</Button>}
  items={[
    {
      label: 'Edit',
      icon: <Edit />,
      onClick: handleEdit
    },
    {
      label: 'Delete',
      icon: <Trash />,
      variant: 'danger',
      onClick: handleDelete
    }
  ]}
/>

// Context menu (right-click)
<ContextMenu
  items={[
    {
      label: 'Refresh',
      icon: <RefreshCw />,
      onClick: refresh
    }
  ]}
>
  <div>Right-click me</div>
</ContextMenu>
```

---

## Advanced Components

### DatePicker

Date selection components.

```tsx
import { DatePicker, DateRangePicker, DateRangePickerWithPresets } from '@/components/ui'

// Single date
<DatePicker
  value={date}
  onChange={setDate}
  placeholder="Select date"
  minDate={new Date()}
/>

// Date range
<DateRangePicker
  value={range}
  onChange={setRange}
  placeholder="Select range"
  numberOfMonths={2}
/>

// With presets
<DateRangePickerWithPresets
  value={range}
  onChange={setRange}
  presets={[
    {
      label: 'Today',
      range: { from: new Date(), to: new Date() }
    },
    {
      label: 'Last 7 days',
      range: {
        from: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        to: new Date()
      }
    }
  ]}
/>
```

### PageTransition

Smooth page transitions.

```tsx
import { PageTransition, StaggerChildren } from '@/components/ui'

// Page transition
<PageTransition variant="slide-up">
  <div>Your content</div>
</PageTransition>

// Variants: 'fade' | 'slide-up' | 'slide-down' | 'scale' | 'none'

// Stagger children
<StaggerChildren staggerDelay={0.1}>
  <div>Item 1</div>
  <div>Item 2</div>
  <div>Item 3</div>
</StaggerChildren>
```

---

## Utilities

### CSS Classes

Micro-interaction utilities:

```tsx
// Hover effects
<div className="hover-lift">Lifts on hover</div>
<div className="hover-scale">Scales on hover</div>
<div className="hover-glow">Glow effect</div>

// Focus
<button className="focus-ring">Custom focus ring</button>

// Button press
<button className="btn-press">Press effect</button>

// Card hover
<div className="card-hover">Card with hover effect</div>

// Transitions
<div className="transition-smooth">Smooth transition</div>
<div className="transition-colors-smooth">Color transition</div>

// Animations
<div className="animate-fade-in">Fade in</div>
<div className="animate-slide-up">Slide up</div>
<div className="animate-scale-in">Scale in</div>
<div className="animate-pulse-subtle">Subtle pulse</div>
<div className="animate-stagger-in">Stagger children</div>
```

---

## Best Practices

### 1. Always provide feedback

```tsx
// ✅ Good
const { success, error } = useToastHelpers()

const handleSave = async () => {
  try {
    await save()
    success('Saved!', 'Data saved successfully')
  } catch (err) {
    error('Error', err.message)
  }
}

// ❌ Bad - no feedback
const handleSave = async () => {
  await save()
}
```

### 2. Use proper loading states

```tsx
// ✅ Good
{isLoading ? (
  <TableSkeleton rows={5} columns={4} />
) : (
  <DataTable data={data} columns={columns} />
)}

// ❌ Bad - no loading indicator
<DataTable data={data} columns={columns} />
```

### 3. Handle empty states

```tsx
// ✅ Good
{data.length === 0 ? (
  <EmptyState
    title="No data found"
    description="Get started by adding your first item"
    actions={[{ label: 'Add Item', onClick: handleAdd }]}
  />
) : (
  <DataTable data={data} />
)}

// ❌ Bad - empty table
<DataTable data={data} /> {/* Shows nothing */}
```

### 4. Accessible forms

```tsx
// ✅ Good
<FormInput
  name="email"
  label="Email Address"
  required
  helperText="We'll send confirmation to this email"
/>

// ❌ Bad
<input placeholder="Email" /> {/* No label, no help text */}
```

### 5. Proper error handling

```tsx
// ✅ Good
try {
  await deleteUser(id)
  success('User deleted')
} catch (err) {
  error('Failed to delete', err.message)
  // Show specific error message
}

// ❌ Bad
try {
  await deleteUser(id)
} catch (err) {
  console.error(err)
  // User sees nothing
}
```

---

## Theming

### Custom Colors

Extend the color palette in `globals.css`:

```css
:root {
  --custom-color-500: #your-color;
  --custom-color-600: #your-darker-color;
}
```

### Custom Spacing

Use the 8px grid system:

```css
:root {
  --custom-spacing: 16px; /* Must be multiple of 4px */
}
```

---

## Type Safety

All components are fully typed with TypeScript:

```tsx
import type { ButtonProps } from '@/components/ui'

const CustomButton = (props: Omit<ButtonProps, 'variant'>) => {
  return <Button variant="primary" {...props} />
}
```

---

## Migration Guide

### From old buttons

```tsx
// ❌ Old
<button className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
  Click me
</button>

// ✅ New
<Button variant="primary">Click me</Button>
```

### From old inputs

```tsx
// ❌ Old
<input className="border rounded px-3 py-2" />

// ✅ New
<Input />
```

### From old toasts

```tsx
// ❌ Old
const [toast, setToast] = useState()
setToast({ message: 'Success', type: 'success' })

// ✅ New
const { success } = useToastHelpers()
success('Success!')
```

---

## Support

For issues or questions:
1. Check this documentation
2. Review component source code in `src/components/ui/`
3. Check ACCESSIBILITY.md for a11y guidelines
