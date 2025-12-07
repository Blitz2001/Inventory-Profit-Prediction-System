"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import { Transaction } from "@/types"
import { columns } from "./columns"
import { DataTable } from "@/components/data-table"
import { Button } from "@/components/ui/button"
import { Plus, ChevronLeft, CreditCard } from "lucide-react"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function PaymentsPage() {
    const [data, setData] = useState<Transaction[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchData = async () => {
            const { data: transactions, error } = await supabase
                .from('transactions')
                .select('*')
                .order('date', { ascending: false })

            if (error) console.error('Error fetching transactions:', error)
            else setData(transactions || [])
            setLoading(false)
        }

        fetchData()
    }, [])

    return (
        <div className="container mx-auto py-6 px-4 pb-20 max-w-5xl">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                    <Link href="/">
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                            <ChevronLeft className="h-4 w-4" />
                        </Button>
                    </Link>
                    <h1 className="text-2xl font-bold tracking-tight text-slate-900">Payments Log</h1>
                </div>
                <Link href="/payments/add">
                    <Button className="bg-slate-900 text-white hover:bg-slate-800">
                        <Plus className="mr-2 h-4 w-4" /> Add Record
                    </Button>
                </Link>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-2 gap-4 mb-6">
                <Card className="bg-slate-50 border-slate-100">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-slate-500">Total Expenses</CardTitle>
                        <CreditCard className="h-4 w-4 text-slate-400" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-slate-900">
                            LKR {data.reduce((sum, item) => sum + (item.type === 'Expense' ? item.amount : 0), 0).toLocaleString()}
                        </div>
                    </CardContent>
                </Card>
                <Card className="bg-emerald-50 border-emerald-100">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-emerald-600">Total Income</CardTitle>
                        <CreditCard className="h-4 w-4 text-emerald-400" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-emerald-900">
                            LKR {data.reduce((sum, item) => sum + (item.type === 'Income' ? item.amount : 0), 0).toLocaleString()}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Data Table */}
            {loading ? (
                <div className="text-center py-10 text-slate-400">Loading payments...</div>
            ) : (
                <div className="bg-white rounded-lg border border-slate-100 shadow-sm overflow-hidden">
                    <DataTable columns={columns} data={data} />
                </div>
            )}
        </div>
    )
}
