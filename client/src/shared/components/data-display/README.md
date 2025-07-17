# Data Display Components

Components for displaying and interacting with data.

## Guidelines

### What Goes Here
- Tables with sorting/filtering
- Lists and grids
- Cards and tiles
- Charts and graphs
- Data visualization components

### Examples
- DataTable
- DataList
- DataCard
- StatCard
- Chart

### Best Practices
1. **Performance**: Handle large datasets efficiently
2. **Responsive**: Work on all screen sizes
3. **Sortable/Filterable**: Provide data manipulation
4. **Accessible**: Proper table headers and ARIA labels
5. **Loading States**: Show skeleton loading

### Component Structure
```typescript
interface DataDisplayProps<T> {
  // Data
  data: T[];
  columns?: Column<T>[];
  
  // Behavior
  onSort?: (column: string, direction: 'asc' | 'desc') => void;
  onFilter?: (filters: FilterType) => void;
  onSelect?: (items: T[]) => void;
  
  // UI
  variant?: 'table' | 'grid' | 'list';
  density?: 'compact' | 'comfortable' | 'spacious';
  
  // State
  loading?: boolean;
  error?: string;
  
  // Pagination
  pagination?: PaginationProps;
}
```