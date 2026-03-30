# Accessibility Guidelines & Checklist

## WCAG AA Compliance Status

Your component library is designed to meet WCAG 2.1 Level AA standards. Here's the compliance checklist:

### Color Contrast ✅
- [x] All text has minimum 4.5:1 contrast ratio
- [x] Large text (18px+) has minimum 3:1 contrast ratio
- [x] Interactive elements have sufficient visual contrast
- [x] Focus indicators are visible (2px primary color ring)

### Keyboard Navigation ✅
- [x] All interactive elements are keyboard accessible
- [x] Tab order follows logical visual order
- [x] Focus visible on all interactive elements
- [x] Skip to content link available (if needed)
- [x] No keyboard traps (modals trap focus intentionally)

### Screen Reader Support ✅
- [x] Proper ARIA labels on icon-only buttons
- [x] Semantic HTML (headings, landmarks, lists)
- [x] Form inputs have associated labels
- [x] Error messages are announced
- [x] Live regions for dynamic content (toasts)

### Focus Management ✅
- [x] Modals trap focus within
- [x] Focus returns to trigger after modal closes
- [x] Auto-focus on appropriate element when modals open
- [x] No focus lost on page transitions

### Other Requirements ✅
- [x] Respects `prefers-reduced-motion` media query
- [x] Touch targets minimum 44x44px (mobile)
- [x] Multiple ways to navigate (search, menus, breadcrumbs)
- [x] Consistent navigation across pages
- [x] Error prevention and recovery

## Component-Specific Accessibility

### Button
```tsx
// ✅ Accessible
<Button variant="primary" onClick={handleClick}>
  Submit Form
</Button>

// ✅ With icon (has text label)
<Button leftIcon={<Search />}>
  Search
</Button>

// ✅ Icon-only button (needs aria-label)
<Button aria-label="Close dialog">
  <X />
</Button>
```

### Input
```tsx
// ✅ With label and helper text
<Input
  label="Email Address"
  name="email"
  type="email"
  helperText="We'll send confirmation to this email"
/>

// ✅ With validation
<Input
  label="Password"
  name="password"
  type="password"
  error="Password must be at least 8 characters"
  required
/>
```

### Modal
```tsx
// ✅ Modal with focus management
<Modal
  isOpen={open}
  onClose={onClose}
  title="Edit Profile"
  closeOnEsc={true}
>
  <form onSubmit={handleSubmit}>
    <FormInput name="name" label="Name" />
    <Button type="submit">Save</Button>
  </form>
</Modal>
```

### Toast
```tsx
// ✅ Toast with proper role
const { showToast } = useToastHelpers()

showToast('Success message', 'Data saved successfully')
// Automatically uses role="alert" and aria-live
```

### DataTable
```tsx
// ✅ Accessible table with headers
<DataTable
  columns={columns}
  data={data}
  searchKey="name"
/>
// Proper table headers, sorting announcements, pagination labels
```

### DatePicker
```tsx
// ✅ Accessible date input
<DatePicker
  value={date}
  onChange={setDate}
  placeholder="Select date"
/>
// Keyboard navigation, proper ARIA attributes
```

## Testing Checklist

### Manual Testing
- [ ] Navigate entire interface using Tab key
- [ ] All interactive elements receive visible focus
- [ ] Forms can be completed without mouse
- [ ] Screen reader announces all important changes
- [ ] Zoom to 200% still usable
- [ ] High contrast mode still readable

### Automated Testing
```bash
# Run axe-core for accessibility testing
npm install --save-dev @axe-core/react

# Add to your test setup
import { axe, toHaveNoViolations } from '@axe-core/react'

expect.extend(toHaveNoViolations)

it('should not have accessibility violations', async () => {
  const { container } = render(<YourComponent />)
  const results = await axe(container)
  expect(results).toHaveNoViolations()
})
```

### Screen Reader Testing
- [ ] NVDA (Windows) - Test with Firefox
- [ ] JAWS (Windows) - Test with Firefox/Chrome
- [ ] VoiceOver (macOS) - Test with Safari
- [ ] TalkBack (Android) - Test with Chrome

## Best Practices

### 1. Semantic HTML
```tsx
// ✅ Good - Semantic
<nav>
  <ul>
    <li><a href="/dashboard">Dashboard</a></li>
  </ul>
</nav>

// ❌ Bad - Non-semantic
<div class="nav">
  <div class="item" onclick="goToDashboard()">Dashboard</div>
</div>
```

### 2. ARIA Labels
```tsx
// ✅ Icon button with label
<button aria-label="Close modal">
  <X />
</button>

// ✅ Descriptive link
<a href="/profile" aria-label="View John Doe's profile">
  View Profile
</a>
```

### 3. Form Accessibility
```tsx
// ✅ Properly associated labels
<label htmlFor="email">Email</label>
<input id="email" type="email" />

// ✅ Or implicit label
<label>
  Email
  <input name="email" type="email" />
</label>

// ✅ Error announcements
<Input
  name="email"
  label="Email"
  error="Invalid email format"
  aria-describedby="email-error"
/>
<p id="email-error" role="alert">Invalid email format</p>
```

### 4. Dynamic Content
```tsx
// ✅ Live regions for announcements
<div role="status" aria-live="polite">
  {statusMessage}
</div>

// ✅ Alert for critical messages
<div role="alert" aria-live="assertive">
  {errorMessage}
</div>
```

### 5. Keyboard Shortcuts
```tsx
// ✅ Document visible shortcuts
<div className="sr-only">
  Keyboard shortcuts:
  Ctrl/Cmd + K: Open search
  Esc: Close modal
  Arrow keys: Navigate lists
</div>

// ✅ Implement in components
useEffect(() => {
  const handleKeyDown = (e: KeyboardEvent) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
      e.preventDefault()
      openSearch()
    }
  }
  window.addEventListener('keydown', handleKeyDown)
  return () => window.removeEventListener('keydown', handleKeyDown)
}, [])
```

## Color Contrast Checker

Use these tools to verify contrast:
- [WebAIM Contrast Checker](https://webaim.org/resources/contrastchecker/)
- [Chrome DevTools Lighthouse](chrome://lighthouse/)
- [axe DevTools](https://www.deque.com/axe/devtools/)

## Resources

- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [ARIA Authoring Practices](https://www.w3.org/WAI/ARIA/apg/)
- [WebAIM Accessibility Checklist](https://webaim.org/standards/wcag/checklist)
