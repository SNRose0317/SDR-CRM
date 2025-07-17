# Composite Components

Complex reusable components built from UI primitives.

## Guidelines

### What Goes Here
- Components that combine multiple UI primitives
- Highly configurable and reusable components
- Components used across multiple features

### Examples
- DataTable (combines Table, Input, Select, Button)
- SearchableSelect (combines Select, Input, Search)
- DateRangePicker (combines Calendar, Popover, Input)
- FormBuilder (combines Form, various inputs)

### Best Practices
1. **Composition over Configuration**: Use children and render props
2. **Flexible Props**: Support various use cases through props
3. **Accessible**: Follow ARIA guidelines
4. **Performant**: Use React.memo when appropriate
5. **Typed**: Strong TypeScript interfaces

### Component Structure
```typescript
interface ComponentProps {
  // Core data
  data: DataType;
  
  // Behavior
  onChange?: (value: DataType) => void;
  onAction?: (action: ActionType) => void;
  
  // UI Configuration
  variant?: 'default' | 'compact' | 'detailed';
  size?: 'sm' | 'md' | 'lg';
  
  // State
  loading?: boolean;
  error?: string;
  
  // Accessibility
  'aria-label'?: string;
  
  // Styling
  className?: string;
}
```