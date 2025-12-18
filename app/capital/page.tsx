"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"
import { CapitalInvestment, Profile } from "@/types" // Ensure these are exported from types/index.ts
import { useAuth } from "@/components/auth-provider"
import { logChanges } from "@/lib/logger"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { TrendingUp, DollarSign, Wallet, ArrowLeft } from "lucide-react"

export default function CapitalPage() {
    const router = useRouter()
    const { isAdmin, user } = useAuth()
    const [investments, setInvestments] = useState<CapitalInvestment[]>([])
    const [profiles, setProfiles] = useState<Profile[]>([])
    const [loading, setLoading] = useState(true)

    // Form State
    const [amount, setAmount] = useState('')
    const [selectedInvestor, setSelectedInvestor] = useState('')
    const [nickname, setNickname] = useState('') // New nickname state
    const [note, setNote] = useState('')

    const fetchData = async () => {
        setLoading(true)
        // Fetch Investments
        const { data: invData, error: invError } = await supabase
            .from('capital_investments')
            .select(`
                *,
                profiles (id, full_name, role)
            `)
            .order('investment_date', { ascending: false })

        if (invError) console.error("Error fetching investments:", invError)
        else setInvestments(invData as any || [])

        // Fetch Profiles (for Admin dropdown)
        if (isAdmin) {
            const { data: profData, error: profError } = await supabase
                .from('profiles')
                .select('*')

            if (profError) console.error("Error fetching profiles:", profError)
            else setProfiles(profData || [])
        }
        setLoading(false)
    }

    useEffect(() => {
        fetchData()
    }, [isAdmin])

    const handleAddInvestment = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!selectedInvestor || !amount) return

        const { data: insertedData, error } = await supabase
            .from('capital_investments')
            .insert({
                investor_id: selectedInvestor,
                amount: parseFloat(amount),
                note,
                nickname, // Insert nickname
                created_by: user?.id
            })
            .select()
            .single()

        if (error) {
            alert('Error adding investment: ' + error.message)
        } else {
            await logChanges(user, insertedData.id, null, insertedData, "Capital Injection", 'CAPITAL')

            setAmount('')
            setNote('')
            setNickname('') // Reset nickname
            fetchData() // Refresh list
        }
    }

    const totalCapital = investments.reduce((sum, item) => sum + (item.amount || 0), 0)

    return (
        <div className="container mx-auto py-8 px-4 max-w-7xl">
            {/* Header */}
            <div className="glass-header rounded-2xl p-6 mb-8 transition-glass">
                <div className="flex items-center gap-4">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => router.back()}
                        className="text-white/70 hover:text-white hover:bg-white/10"
                    >
                        <ArrowLeft className="w-6 h-6" />
                    </Button>
                    <div className="p-3 glass-card rounded-full text-emerald-300">
                        <Wallet className="w-8 h-8" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold text-white mb-1">Capital & Investments</h1>
                        <p className="text-white/70">Track funding and shared capital allocations.</p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column: Stats & Admin Form */}
                <div className="space-y-6">
                    {/* Summary Card */}
                    <div className="glass-card rounded-xl p-6">
                        <div className="flex items-center justify-between mb-4">
                            <p className="text-white/70 font-medium">Total Capital Raised</p>
                            <TrendingUp className="w-5 h-5 text-emerald-300" />
                        </div>
                        <p className="text-4xl font-bold text-emerald-300 mb-2">
                            Rs {totalCapital.toLocaleString()}
                        </p>
                        <p className="text-xs text-white/50">Total pooled funds</p>
                    </div>

                    {/* Admin Add Form */}
                    {isAdmin && (
                        <div className="glass-card rounded-xl p-6 border border-emerald-500/30">
                            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                                <DollarSign className="w-5 h-5 text-emerald-300" />
                                Add Investment
                            </h3>
                            <form onSubmit={handleAddInvestment} className="space-y-4">
                                <div className="space-y-2">
                                    <Label className="text-white">Investor</Label>
                                    <Select value={selectedInvestor} onValueChange={setSelectedInvestor}>
                                        <SelectTrigger className="bg-white/5 border-white/20 text-white">
                                            <SelectValue placeholder="Select investor..." />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {profiles.map(p => (
                                                <SelectItem key={p.id} value={p.id}>
                                                    {p.full_name || p.id} ({p.role})
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <Label className="text-white">Nickname (Optional)</Label>
                                    <Input
                                        value={nickname}
                                        onChange={e => setNickname(e.target.value)}
                                        className="bg-white/5 border-white/20 text-white"
                                        placeholder="e.g. John Doe (if different from profile)"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label className="text-white">Amount (LKR)</Label>
                                    <Input
                                        type="number"
                                        value={amount}
                                        onChange={e => setAmount(e.target.value)}
                                        className="bg-white/5 border-white/20 text-white"
                                        placeholder="0.00"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label className="text-white">Note (Optional)</Label>
                                    <Input
                                        value={note}
                                        onChange={e => setNote(e.target.value)}
                                        className="bg-white/5 border-white/20 text-white"
                                        placeholder="e.g. Initial Deposit"
                                    />
                                </div>

                                <Button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-700 text-white mt-2">
                                    Record Investment
                                </Button>
                            </form>
                        </div>
                    )}
                </div>

                {/* Right Column: List */}
                <div className="lg:col-span-2">
                    <div className="glass-card rounded-xl p-6 min-h-[500px]">
                        <h3 className="text-xl font-bold text-white mb-6">Investment Ledger</h3>

                        {loading ? (
                            <p className="text-white/50">Loading ledger...</p>
                        ) : investments.length === 0 ? (
                            <p className="text-white/50 text-center py-10">No investments recorded yet.</p>
                        ) : (
                            <div className="space-y-4">
                                {investments.map(inv => (
                                    <div key={inv.id} className="glass-dark p-4 rounded-lg flex justify-between items-center transition-all hover:bg-white/5">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-300 font-bold">
                                                {(inv as any).profiles?.full_name?.charAt(0) || '?'}
                                            </div>
                                            <div>
                                                <p className="text-white font-medium">{inv.nickname || (inv as any).profiles?.full_name || 'Unknown Investor'}</p>
                                                {inv.nickname && <p className="text-white/50 text-xs text-emerald-100/50">Via: {(inv as any).profiles?.full_name}</p>}
                                                <p className="text-white/50 text-xs text-emerald-100/50">{(inv as any).profiles?.role?.toUpperCase()}</p>
                                                <p className="text-white/40 text-[10px] mt-1">{new Date(inv.investment_date).toLocaleDateString()}</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-emerald-300 font-bold text-lg">
                                                + Rs {inv.amount.toLocaleString()}
                                            </p>
                                            {inv.note && <p className="text-white/40 text-xs">{inv.note}</p>}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}
