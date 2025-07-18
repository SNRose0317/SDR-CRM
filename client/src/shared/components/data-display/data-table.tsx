import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/components/ui/table";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";
import { Search, ChevronUp, ChevronDown } from "lucide-react";
import { LoadingSpinner } from "@/shared/components/feedback";

/**
 * Column configuration for DataTable
 */
interface Column {
  /** Unique key for the column, used for sorting and data access */
  key: string;
  /** Display label for the column header */
  label: string;
  /** Whether the column can be sorted */
  sortable?: boolean;
  /** Custom render function for the column content */
  render?: (value: any, row: any) => React.ReactNode;
}

/**
 * Props for the DataTable component
 */
interface DataTableProps {
  /** Column configuration array */
  columns: Column[];
  /** Data array to display in the table */
  data: any[];
  /** Loading state indicator */
  loading?: boolean;
  /** Callback for sorting changes */
  onSort?: (column: string, direction: 'asc' | 'desc') => void;
  /** Callback for filter changes */
  onFilter?: (filters: any) => void;
  /** Custom filter components to display */
  filters?: React.ReactNode;
}

/**
 * DataTable component for displaying tabular data with sorting and filtering
 * 
 * Features:
 * - Sortable columns with visual indicators
 * - Search functionality
 * - Custom filter components
 * - Loading states with spinner
 * - Responsive design
 * - Custom column rendering
 * 
 * @param columns - Array of column configurations
 * @param data - Array of data objects to display
 * @param loading - Shows loading spinner when true
 * @param onSort - Callback for column sorting
 * @param onFilter - Callback for data filtering
 * @param filters - Custom filter components
 */
export default function DataTable({ 
  columns, 
  data, 
  loading, 
  onSort, 
  onFilter,
  filters 
}: DataTableProps) {
  const [sortColumn, setSortColumn] = useState<string>("");
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [searchTerm, setSearchTerm] = useState("");

  // Ensure data is always an array
  const safeData = Array.isArray(data) ? data : [];

  const handleSort = (column: string) => {
    if (!onSort) return;
    
    const newDirection = sortColumn === column && sortDirection === 'asc' ? 'desc' : 'asc';
    setSortColumn(column);
    setSortDirection(newDirection);
    onSort(column, newDirection);
  };

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    if (onFilter) {
      onFilter({ search: value });
    }
  };

  if (loading) {
    return (
      <div className="surface rounded-xl border border-border">
        <div className="p-8 text-center">
          <LoadingSpinner size="lg" className="mx-auto" />
          <p className="mt-2 text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="surface rounded-xl border border-border">
      {/* Search and Filters */}
      <div className="p-4 border-b border-border">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Search..."
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
              className="pl-10"
            />
          </div>
          {filters}
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              {columns.map((column) => (
                <TableHead key={column.key} className="font-medium text-foreground">
                  <div className="flex items-center space-x-2">
                    <span>{column.label}</span>
                    {column.sortable && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleSort(column.key)}
                        className="h-auto p-0"
                      >
                        {sortColumn === column.key ? (
                          sortDirection === 'asc' ? (
                            <ChevronUp className="w-4 h-4" />
                          ) : (
                            <ChevronDown className="w-4 h-4" />
                          )
                        ) : (
                          <ChevronUp className="w-4 h-4 opacity-30" />
                        )}
                      </Button>
                    )}
                  </div>
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {safeData.length === 0 ? (
              <TableRow>
                <TableCell colSpan={columns.length} className="text-center py-8">
                  <p className="text-muted-foreground">No data found</p>
                </TableCell>
              </TableRow>
            ) : (
              safeData.map((row, index) => (
                <TableRow key={index} className="hover:bg-muted/50">
                  {columns.map((column) => (
                    <TableCell key={column.key}>
                      {column.render ? column.render(row[column.key], row) : row[column.key]}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
