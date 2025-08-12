"use client"

import { ColumnDef } from "@tanstack/react-table"
import { MoreHorizontal, ArrowUpDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { MaintenanceReport, MaintenanceStatus } from "@/types/maintenance"
import { Badge } from "@/components/ui/badge"
import { format } from "date-fns"

export type MaintenanceReportWithActions = MaintenanceReport & {
  onAssign: (reportId: number) => void;
  onResolve: (reportId: number) => void;
};

const getStatusVariant = (status: MaintenanceStatus) => {
    switch (status) {
      case MaintenanceStatus.OPEN: return 'secondary';
      case MaintenanceStatus.IN_PROGRESS: return 'warning';
      case MaintenanceStatus.RESOLVED: return 'success';
      case MaintenanceStatus.CLOSED: return 'default';
      default: return 'outline';
    }
};

export const columns: ColumnDef<MaintenanceReportWithActions>[] = [
  {
    accessorKey: "tool",
    header: "Tool",
    cell: ({ row }) => row.original.tool.name,
  },
  {
    accessorKey: "reporter",
    header: "Reported By",
    cell: ({ row }) => row.original.reporter.full_name,
  },
    {
    accessorKey: "description",
    header: "Description",
    cell: ({ row }) => <div className="truncate max-w-xs">{row.original.description}</div>
  },
  {
    accessorKey: "assignee",
    header: "Assigned To",
    cell: ({ row }) => row.original.assignee?.full_name || <span className="text-muted-foreground">Unassigned</span>,
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
        const status = row.getValue("status") as MaintenanceStatus;
        return <Badge variant={getStatusVariant(status)} className="capitalize">{status.replace(/_/g, " ")}</Badge>
    }
  },
  {
    accessorKey: "created_at",
    header: ({ column }) => {
      return (
        <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
          Reported On
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => format(new Date(row.getValue("created_at")), "dd LLL yyyy"),
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const report = row.original

      return (
        <div className="text-right">
            <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                {report.status === MaintenanceStatus.OPEN && (
                    <DropdownMenuItem onClick={() => report.onAssign(report.id)}>
                        Assign Technician
                    </DropdownMenuItem>
                )}
                {report.status === MaintenanceStatus.IN_PROGRESS && (
                     <DropdownMenuItem onClick={() => report.onResolve(report.id)}>
                        Mark as Resolved
                    </DropdownMenuItem>
                )}
                <DropdownMenuItem>View Details</DropdownMenuItem>
            </DropdownMenuContent>
            </DropdownMenu>
        </div>
      )
    },
  },
]
