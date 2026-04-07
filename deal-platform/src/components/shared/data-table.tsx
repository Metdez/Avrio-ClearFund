"use client";

import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";

export interface ColumnDef<T> {
  key: string;
  header: string;
  sortable?: boolean;
  className?: string;
  render?: (item: T) => React.ReactNode;
  accessor?: (item: T) => string | number | boolean | null | undefined;
  /** 1 = always show on mobile, 2 = show as secondary detail. Omit to hide on mobile. */
  mobilePriority?: 1 | 2;
  /** Label shown on mobile card view for this field. Defaults to header. */
  mobileLabel?: string;
}

interface DataTableProps<T> {
  columns: ColumnDef<T>[];
  data: T[];
  onRowClick?: (item: T) => void;
  keyField?: keyof T;
  className?: string;
}

export function DataTable<T extends object>({
  columns,
  data,
  onRowClick,
  keyField = "id" as keyof T,
  className,
}: DataTableProps<T>) {
  const [sortColumn, setSortColumn] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const isMobile = useIsMobile();

  function handleSort(key: string) {
    if (sortColumn === key) {
      setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortColumn(key);
      setSortDirection("asc");
    }
  }

  const sortedData = (() => {
    if (!sortColumn) return data;
    const col = columns.find((c) => c.key === sortColumn);
    if (!col) return data;

    return [...data].sort((a, b) => {
      const aVal = col.accessor
        ? col.accessor(a)
        : ((a as Record<string, unknown>)[sortColumn] as string | number);
      const bVal = col.accessor
        ? col.accessor(b)
        : ((b as Record<string, unknown>)[sortColumn] as string | number);

      if (aVal == null && bVal == null) return 0;
      if (aVal == null) return 1;
      if (bVal == null) return -1;

      const cmp = aVal < bVal ? -1 : aVal > bVal ? 1 : 0;
      return sortDirection === "asc" ? cmp : -cmp;
    });
  })();

  const sortableColumns = columns.filter((c) => c.sortable);

  // --- Mobile card view ---
  if (isMobile) {
    const primaryCols = columns.filter((c) => c.mobilePriority === 1);
    const secondaryCols = columns.filter((c) => c.mobilePriority === 2);
    // If no priorities are set, fall back: first column = primary, rest = secondary
    const hasPriorities = primaryCols.length > 0;
    const headingCol = hasPriorities ? primaryCols[0] : columns[0];
    const metaCols = hasPriorities ? primaryCols.slice(1) : [];
    const detailCols = hasPriorities ? secondaryCols : columns.slice(1, 4);

    return (
      <div className={cn("space-y-3", className)}>
        {/* Mobile sort control */}
        {sortableColumns.length > 0 && (
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground shrink-0">Sort by:</span>
            <Select
              value={sortColumn ?? ""}
              onValueChange={(val) => {
                if (val) {
                  handleSort(val);
                }
              }}
            >
              <SelectTrigger className="h-8 text-xs w-full">
                <SelectValue placeholder="Default" />
              </SelectTrigger>
              <SelectContent>
                {sortableColumns.map((col) => (
                  <SelectItem key={col.key} value={col.key}>
                    {col.header} {sortColumn === col.key ? (sortDirection === "asc" ? "↑" : "↓") : ""}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {sortedData.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted-foreground">
            No results.
          </p>
        ) : (
          sortedData.map((item) => {
            const key = String(
              (item as Record<string, unknown>)[keyField as string]
            );
            return (
              <div
                key={key}
                className={cn(
                  "rounded-lg border bg-card p-3 space-y-1.5",
                  onRowClick && "cursor-pointer active:bg-muted/50"
                )}
                onClick={onRowClick ? () => onRowClick(item) : undefined}
              >
                {/* Heading row */}
                <div className="flex items-start justify-between gap-2">
                  <div className="font-medium text-sm leading-tight min-w-0 flex-1">
                    {headingCol.render
                      ? headingCol.render(item)
                      : String(
                          (item as Record<string, unknown>)[headingCol.key] ?? ""
                        )}
                  </div>
                  {/* Show first meta col as a chip on the right */}
                  {metaCols.length > 0 && (
                    <div className="shrink-0">
                      {metaCols[0].render
                        ? metaCols[0].render(item)
                        : String(
                            (item as Record<string, unknown>)[metaCols[0].key] ?? ""
                          )}
                    </div>
                  )}
                </div>

                {/* Remaining meta cols inline */}
                {metaCols.length > 1 && (
                  <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                    {metaCols.slice(1).map((col) => (
                      <span key={col.key}>
                        {col.render
                          ? col.render(item)
                          : String(
                              (item as Record<string, unknown>)[col.key] ?? ""
                            )}
                      </span>
                    ))}
                  </div>
                )}

                {/* Detail rows */}
                {detailCols.length > 0 && (
                  <div className="space-y-1 pt-1 border-t text-xs">
                    {detailCols.map((col) => (
                      <div
                        key={col.key}
                        className="flex items-center justify-between gap-2"
                      >
                        <span className="text-muted-foreground">
                          {col.mobileLabel ?? col.header}
                        </span>
                        <span className="text-right">
                          {col.render
                            ? col.render(item)
                            : String(
                                (item as Record<string, unknown>)[col.key] ?? ""
                              )}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    );
  }

  // --- Desktop table view ---
  return (
    <div className={cn("rounded-md border", className)}>
      <Table>
        <TableHeader>
          <TableRow>
            {columns.map((col) => (
              <TableHead
                key={col.key}
                className={cn(
                  col.sortable && "cursor-pointer select-none",
                  col.className
                )}
                onClick={col.sortable ? () => handleSort(col.key) : undefined}
              >
                <div className="flex items-center gap-1">
                  {col.header}
                  {col.sortable && (
                    sortColumn === col.key ? (
                      sortDirection === "asc" ? (
                        <ArrowUp className="h-3.5 w-3.5" />
                      ) : (
                        <ArrowDown className="h-3.5 w-3.5" />
                      )
                    ) : (
                      <ArrowUpDown className="h-3.5 w-3.5 text-muted-foreground/50" />
                    )
                  )}
                </div>
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedData.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={columns.length}
                className="h-24 text-center text-muted-foreground"
              >
                No results.
              </TableCell>
            </TableRow>
          ) : (
            sortedData.map((item) => (
              <TableRow
                key={String((item as Record<string, unknown>)[keyField as string])}
                className={cn(onRowClick && "cursor-pointer")}
                onClick={onRowClick ? () => onRowClick(item) : undefined}
              >
                {columns.map((col) => (
                  <TableCell key={col.key} className={col.className}>
                    {col.render
                      ? col.render(item)
                      : String((item as Record<string, unknown>)[col.key] ?? "")}
                  </TableCell>
                ))}
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
