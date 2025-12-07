"use client"

import { useState } from "react"
import { supabase } from "@/lib/supabase"
import { INITIAL_INVENTORY, INITIAL_PAYMENTS } from "@/lib/seed-data"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2, Trash2, Database } from "lucide-react"

export default function SeedPage() {
    const [loading, setLoading] = useState(false)
    const [clearing, setClearing] = useState(false)
    const [logs, setLogs] = useState<string[]>([])

    const addLog = (msg: string) => setLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${msg}`])

    const handleClear = async () => {
        if (!confirm("Are you sure you want to delete ALL data? This cannot be undone.")) return
        setClearing(true)
        addLog("🧹 Clearing database...")

        try {
            const { error: invError } = await supabase.from('inventory').delete().neq('id', '00000000-0000-0000-0000-000000000000') // Deletes all valid UUIDs
            if (invError) throw invError

            const { error: transError } = await supabase.from('transactions').delete().neq('id', '00000000-0000-0000-0000-000000000000')
            if (transError) throw transError

            addLog("✅ Database cleared successfully!")
        } catch (error: any) {
            addLog(`❌ Error clearing data: ${error.message}`)
        } finally {
            setClearing(false)
        }
    }

    const handleSeed = async () => {
        setLoading(true)
        setLogs([]) // Clear logs on start
        addLog("🚀 Starting database seed...")

        try {
            // 1. Seed Inventory
            addLog(`📦 Seeding ${INITIAL_INVENTORY.length} inventory items...`)

            // Map data to match database columns
            const inventoryData = INITIAL_INVENTORY.map(item => ({
                gem_type: item.Gem_Type,
                weight_ct: item.Weight_Ct,
                cost_per_ct_lkr: item.Cost_Per_Ct_LKR,
                color: item.Color,
                status: 'In Stock',
                // Defaults for new fields if not in seed data
                lot_type: item.Lot_Type,
                number_of_pieces: 1,
                budget_per_ct_usd: item.Budget_Per_Ct_USD,
                treatment: item.Treatment,
                shape: item.Shape,
                cut_grade: item.Cut_Grade,
                clarity: item.Clarity
            }))

            const { error: invError } = await supabase.from('inventory').insert(inventoryData)

            if (invError) {
                console.error("Inventory Error:", invError)
                addLog(`❌ Failed to seed inventory: ${invError.message}`)
            } else {
                addLog("✅ Inventory seeded successfully!")
            }

            // 2. Seed Payments (Transactions)
            addLog(`💳 Seeding ${INITIAL_PAYMENTS.length} payments...`)

            const { error: payError } = await supabase.from('transactions').insert(INITIAL_PAYMENTS)

            if (payError) {
                console.error("Payment Error:", payError)
                addLog(`❌ Failed to seed payments: ${payError.message}`)
            } else {
                addLog("✅ Payments seeded successfully!")
            }

            addLog("✨ Seeding process completed!")

        } catch (error: any) {
            addLog(`🔥 Unexpected Error: ${error.message}`)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="container max-w-2xl mx-auto py-10 px-4">
            <Card>
                <CardHeader>
                    <CardTitle>Database Management</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <p className="text-sm text-slate-500">
                        Use these tools to manage your database content.
                        <strong> Seeding</strong> will add duplicate data if you don't clear first.
                    </p>

                    <div className="flex gap-4">
                        <Button
                            variant="destructive"
                            onClick={handleClear}
                            disabled={loading || clearing}
                            className="w-full"
                        >
                            {clearing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Trash2 className="mr-2 h-4 w-4" />}
                            Clear All Data
                        </Button>

                        <Button
                            onClick={handleSeed}
                            disabled={loading || clearing}
                            className="w-full bg-slate-900"
                        >
                            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Database className="mr-2 h-4 w-4" />}
                            Seed Default Data
                        </Button>
                    </div>

                    <div className="bg-slate-950 text-slate-300 p-4 rounded-md font-mono text-sm min-h-[200px] overflow-y-auto">
                        {logs.length === 0 ? (
                            <span className="text-slate-500 italic">Ready to run...</span>
                        ) : (
                            logs.map((log, i) => (
                                <div key={i} className="mb-1">{log}</div>
                            ))
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
