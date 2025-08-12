"use client"

import { ColumnDef } from "@tanstack/react-table"
import { MoreHorizontal } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Transaction, TransactionStatus } from "@/types/transaction"
import { Badge } from "@/components/ui/badge"
import { format } from "date-fns"

export type TransactionWithActions = Transaction & {
  onApprove: (id: number) => void;
  onReject: (id: number) => void;
};

const getStatusVariant = (status: TransactionStatus) => {
    switch (status) {
      case TransactionStatus.APPROVED: return 'success';
      case TransactionStatus.PENDING_APPROVAL: return 'secondary';
      case TransactionStatus.REJECTED: return 'destructive';
      case TransactionStatus.RETURNED: return 'default';
      default: return 'outline';
    }
};

export const columns: ColumnDef<TransactionWithActions>[] = [
  {
    accessorKey: "tool",
    header: "Tool",
    cell: ({ row }) => {
        const tool = row.original.tool;
        return <div className="font-medium">{tool.name}</div>
    },
  },
  {
    accessorKey: "user",
    header: "User",
    cell: ({ row }) => {
        const user = row.original.user;
        return <div>{user.full_name}</div>
    },
  },
  {
    accessorKey: "start_date",
    header: "Start Date",
    cell: ({ row }) => format(new Date(row.getValue("start_date")), "dd LLL yyyy"),
  },
  {
    accessorKey: "end_date",
    header: "End Date",
    cell: ({ row }) => format(new Date(row.getValue("end_date")), "dd LLL yyyy"),
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
        const status = row.getValue("status") as TransactionStatus;
        return <Badge variant={getStatusVariant(status)} className="capitalize">{status.replace(/_/g, " ")}</Badge>
    }
  },
  {
    id: "actions",
    enableHiding: false,
    cell: ({ row }) => {
      const transaction = row.original

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
                {transaction.status === TransactionStatus.PENDING_APPROVAL && (
                    <>
                        <DropdownMenuItem onClick={() => transaction.onApprove(transaction.id)}>
                            Approve
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => transaction.onReject(transaction.id)} className="text-destructive">
                            Reject
                        </DropdownMenuItem>
                    </>
                )}
                <DropdownMenuItem>View Details</DropdownMenuItem>
            </DropdownMenuContent>
            </DropdownMenu>
        </div>
      )
    },
  },
]
