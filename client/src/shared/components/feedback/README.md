# Feedback Components

Components for user feedback and state indication.

## Guidelines

### What Goes Here
- Loading states and spinners
- Error messages and error boundaries
- Empty states and placeholders
- Success/info/warning notifications
- Progress indicators

### Examples
- LoadingSpinner
- ErrorMessage
- EmptyState
- ProgressBar
- StatusIndicator

### Best Practices
1. **Consistent Messaging**: Use standardized error/success messages
2. **Accessible**: Screen reader friendly
3. **Contextual**: Provide relevant information
4. **Actionable**: Include next steps when possible
5. **Branded**: Match application design system

### Component Structure
```typescript
interface FeedbackProps {
  // State
  type: 'loading' | 'error' | 'empty' | 'success' | 'info' | 'warning';
  
  // Content
  title?: string;
  message?: string;
  
  // Actions
  onRetry?: () => void;
  onDismiss?: () => void;
  
  // Appearance
  variant?: 'default' | 'compact' | 'inline';
  
  // Accessibility
  'aria-live'?: 'polite' | 'assertive';
}
```