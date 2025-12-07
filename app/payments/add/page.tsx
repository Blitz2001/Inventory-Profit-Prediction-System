"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"
import { useAuth } from "@/components/auth-provider"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loader2, ChevronLeft } from "lucide-react"
import Link from "next/link"

export default function AddPaymentPage() {
    const router = useRouter()
    const { user } = useAuth()
    const [loading, setLoading] = useState(false)

    const [formData, setFormData] = useState({
        person: '',
        description: '',
        amount: '',
        type: 'Expense',
        date: new Date().toISOString().split('T')[0]
    })

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)

        try {
            const { error } = await supabase.from('transactions').insert([
                {
                    user_id: user?.id,
                    email: user?.email,
                    person: formData.person || user?.email || 'Unknown', // Default to logged in user if empty
                    description: formData.description,
                    amount: parseFloat(formData.amount),
                    type: formData.type,
                    date: formData.date
                }
            ])

            if (error) throw error
            router.push('/payments')
            router.refresh()
        } catch (error: any) {
            console.error('Error adding payment:', error)
            alert('Failed to add payment: ' + error.message)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="container max-w-md mx-auto py-6 px-4">
            <Link href="/payments" className="flex items-center text-slate-500 mb-4 hover:text-slate-900">
                <ChevronLeft className="w-4 h-4 mr-1" /> Back to Payments
            </Link>

            <Card className="border-slate-200 shadow-md">
                <CardHeader className="bg-slate-50 border-b border-slate-100">
                    <CardTitle>Record Transaction</CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                    <form onSubmit={handleSubmit} className="space-y-4">

                        <div className="space-y-2">
                            <Label>Transaction Type</Label>
                            <Select onValueChange={(v) => setFormData({ ...formData, type: v })} defaultValue={formData.type}>
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Expense">Expense (Money Out)</SelectItem>
                                    <SelectItem value="Income">Income (Money In)</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label>Who Paid? (Person)</Label>
                            <Input
                                placeholder="e.g. Kasun"
                                value={formData.person}
                                onChange={(e) => setFormData({ ...formData, person: e.target.value })}
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <Label>Description</Label>
                            <Input
                                placeholder="e.g. Tea & Shortcuts"
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <Label>Amount (LKR)</Label>
                            <Input
                                type="number"
                                placeholder="0.00"
                                value={formData.amount}
                                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <Label>Date</Label>
                            <Input
                                type="date"
                                value={formData.date}
                                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                                required
                            />
                        </div>

                        <Button type="submit" className="w-full bg-slate-900 mt-4" disabled={loading}>
                            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Save Record
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    )
}
