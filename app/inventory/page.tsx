"use client"

import { INITIAL_INVENTORY } from "@/lib/seed-data"
import { InventoryItem } from "@/types"
import { DataTable } from "@/components/data-table"
import { columns } from "@/app/inventory/columns"

// Mapping the raw seed data to our Type (just casting for preview)
const data: InventoryItem[] = INITIAL_INVENTORY.map(item => ({
    ...item,
    status: 'In Stock', // Default for now
    image_url: undefined
})) as unknown as InventoryItem[]

export default function InventoryPage() {
    return (
        <div className="container mx-auto py-10">
            <h1 className="text-2xl font-bold mb-5">Current Stock</h1>
            <DataTable columns={columns} data={data} />
        </div>
    )
}
