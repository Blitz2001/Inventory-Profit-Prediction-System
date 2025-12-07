"use client"

import { ColumnDef } from "@tanstack/react-table"
import { Transaction } from "@/types"
import { Badge } from "@/components/ui/badge"

export const columns: ColumnDef<Transaction>[] = [
    {
        accessorKey: "date",
        header: "Date",
        cell: ({ row }) => {
            const dateStr = row.getValue("date") as string
            return <div className="text-xs text-slate-500">{new Date(dateStr).toLocaleDateString()}</div>
        },
    },
    {
        accessorKey: "person",
        header: "Person",
        cell: ({ row }) => <div className="font-medium text-slate-900">{row.getValue("person")}</div>,
    },
    {
        accessorKey: "description",
        header: "Description",
        cell: ({ row }) => <div className="text-sm text-slate-600 max-w-[200px] truncate">{row.getValue("description")}</div>,
    },
    {
        accessorKey: "type",
        header: "Type",
        cell: ({ row }) => {
            const type = row.getValue("type") as string
            return (
                <Badge variant="outline" className={type === 'Income' ? 'text-emerald-600 border-emerald-200 bg-emerald-50' : 'text-slate-600 border-slate-200 bg-slate-50'}>
                    {type}
                </Badge>
            )
        },
    },
    {
        accessorKey: "amount",
        header: () => <div className="text-right">Amount (LKR)</div>,
        cell: ({ row }) => {
            const amount = parseFloat(row.getValue("amount"))
            const formatted = new Intl.NumberFormat("en-US").format(amount)
            return <div className="text-right font-bold text-slate-900">{formatted}</div>
        },
    },
]
