"use client"

import { Button } from "@/components/ui/button"
import { Download } from "lucide-react"
import * as XLSX from "xlsx"
import { InventoryItem } from "@/types"

interface ExportButtonProps {
    data: InventoryItem[]
}

export function ExportButton({ data }: ExportButtonProps) {
    const handleExport = () => {
        // 1. Format data for Excel (select specific columns)
        const exportData = data.map(item => ({
            "Gem Type": item.gem_type,
            "Shape": item.shape,
            "Weight (ct)": item.weight_ct,
            "Color": item.color,
            "Clarity": item.clarity,
            "Cost (LKR)": item.cost_per_ct_lkr,
            "Total Value (LKR)": (item.weight_ct || 0) * (item.predict_val_per_ct_lkr || 0),
            "Status": item.status,
        }))

        // 2. Create worksheet
        const ws = XLSX.utils.json_to_sheet(exportData)

        // 3. Create workbook
        const wb = XLSX.utils.book_new()
        XLSX.utils.book_append_sheet(wb, ws, "Inventory")

        // 4. Generate file download
        XLSX.writeFile(wb, `Gem_Inventory_${new Date().toISOString().split('T')[0]}.xlsx`)
    }

    return (
        <Button variant="outline" size="sm" onClick={handleExport} className="gap-2">
            <Download className="w-4 h-4" />
            Export Excel
        </Button>
    )
}
