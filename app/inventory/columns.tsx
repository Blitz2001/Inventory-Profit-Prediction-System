"use client"

import Link from "next/link"
import { ColumnDef } from "@tanstack/react-table"
import { InventoryItem } from "@/types"
import { Badge } from "@/components/ui/badge"
import { useAuth } from "@/components/auth-provider"

const GemNameCell = ({ row }: { row: any }) => {
    const { isAdmin } = useAuth() // Now we can use hooks!
    const gemType = row.getValue("gem_type") as string
    const id = row.original.id

    if (isAdmin) {
        return (
            <Link href={`/edit/${id}`} className="font-medium text-blue-600 hover:underline hover:text-blue-800">
                {gemType}
            </Link>
        )
    }
    return <span className="font-medium text-slate-700">{gemType}</span>
}

export const columns: ColumnDef<InventoryItem>[] = [
    {
        accessorKey: "lot_number",
        header: "ID",
        cell: ({ row }) => (
            <span className="font-mono text-xs font-bold text-slate-500">
                L{String(row.getValue("lot_number")).padStart(3, '0')}
            </span>
        ),
    },
    {
        accessorKey: "image_urls",
        header: "Image",
        cell: ({ row }) => {
            const urls = row.getValue("image_urls") as string[]
            if (!urls || urls.length === 0) return <div className="w-10 h-10 bg-slate-100 rounded-md" />

            return (
                <div className="relative w-10 h-10 group">
                    <img
                        src={urls[0]}
                        alt="Gem"
                        className="w-full h-full object-cover rounded-md border border-slate-200 shadow-sm"
                    />
                </div>
            )
        },
    },
    {
        accessorKey: "gem_type",
        header: "Gem",
        cell: ({ row }) => <GemNameCell row={row} />,
    },
    {
        accessorKey: "lot_type",
        header: "Lot",
        cell: ({ row }) => <span className="text-slate-500 text-xs">{row.getValue("lot_type") || "-"}</span>,
    },
    {
        accessorKey: "treatment",
        header: "Treat",
        cell: ({ row }) => <span className="text-slate-500 text-xs">{row.getValue("treatment") || "-"}</span>,
    },
    {
        accessorKey: "shape",
        header: "Shape",
    },
    {
        accessorKey: "clarity",
        header: "Clarity",
        cell: ({ row }) => <span className="text-slate-500 text-xs">{row.getValue("clarity") || "-"}</span>,
    },
    {
        accessorKey: "color",
        header: "Color",
        cell: ({ row }) => <span className="text-slate-500 text-xs">{row.getValue("color") || "-"}</span>,
    },
    {
        accessorKey: "number_of_pieces",
        header: "Pcs",
        cell: ({ row }) => <div className="text-center">{row.getValue("number_of_pieces") || 1}</div>,
    },
    {
        accessorKey: "weight_ct",
        header: "Weight (Ct)",
        cell: ({ row }) => {
            const val = row.getValue<number>("weight_ct")
            return <div className="font-mono font-medium">{val ? val.toFixed(2) : "-"}</div>
        },
    },
    // NEW: Profit Prediction Columns
    {
        accessorKey: "predict_val_per_ct_lkr",
        header: () => <div className="text-right text-xs">Predict Val/Ct</div>,
        cell: ({ row }) => {
            const val = parseFloat(row.getValue("predict_val_per_ct_lkr")) || 0
            return <div className="text-right text-xs text-slate-600">{val.toLocaleString()}</div>
        },
    },
    {
        id: "total_value",
        header: () => <div className="text-right text-xs">Est. Total Value</div>,
        cell: ({ row }) => {
            const weight = parseFloat(row.getValue("weight_ct")) || 0
            const valPerCt = row.original.predict_val_per_ct_lkr || 0
            const total = weight * valPerCt
            return <div className="text-right text-xs font-medium">{total.toLocaleString()}</div>
        },
    },
    {
        id: "profit",
        header: () => <div className="text-right font-bold text-emerald-600">Est. Profit</div>,
        cell: ({ row }) => {
            const weight = parseFloat(row.getValue("weight_ct")) || 0
            const valPerCt = row.original.predict_val_per_ct_lkr || 0
            const totalCost = row.original.predict_total_cost_lkr || 0

            const totalValue = weight * valPerCt
            const profit = totalValue - totalCost

            return (
                <div className={`text-right font-bold ${profit >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>
                    {profit.toLocaleString()}
                </div>
            )
        },
    },
    // Legacy / Admin
    {
        accessorKey: "email",
        header: "Added By",
        cell: ({ row }) => <div className="text-[10px] text-slate-400 truncate max-w-[80px]">{row.getValue("email") || "-"}</div>
    },
    {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => {
            const status = row.getValue("status") as string
            return (
                <Badge variant="outline" className="text-[10px] h-5 px-1">
                    {status || 'Unknown'}
                </Badge>
            )
        },
    },
]
