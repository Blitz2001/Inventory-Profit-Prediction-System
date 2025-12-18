"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { supabase } from "@/lib/supabase"
import { useAuth } from "@/components/auth-provider"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loader2, ArrowLeft, Save, Plus, Trash2 } from "lucide-react"
import Link from "next/link"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { logChanges } from "@/lib/logger"

export default function EditGemPage() {
    const router = useRouter()
    const params = useParams()
    const { user, isAdmin, loading: authLoading } = useAuth()

    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [initialData, setInitialData] = useState<any>(null)

    // Admin Guard
    useEffect(() => {
        if (!authLoading && !isAdmin) {
            router.push('/')
        }
    }, [authLoading, isAdmin, router])

    // Form State
    const [formData, setFormData] = useState({
        gem_type: '',
        lot_type: '',
        treatment: '',
        cut_grade: '',
        shape: '',
        color: '',
        clarity: '',
        number_of_pieces: '1',
        weight_ct: '',

        // Detailed Costs
        weight_post_cut: '',
        cost_cut: '',
        cost_polish: '',
        cost_burn: '',

        predict_val_per_ct: '',
        // predict_total_cost: '', // Removed from direct state, calculated or derived

        usd_rate: '293',
        status: '',
        note: '' // Reason for change
    })

    // Dynamic Extra Costs
    const [extraCosts, setExtraCosts] = useState<{ label: string; amount: string; type: string }[]>([])
    const [newCostLabel, setNewCostLabel] = useState('')
    const [newCostAmount, setNewCostAmount] = useState('')

    // Currencies
    const [valCurrency, setValCurrency] = useState<'LKR' | 'USD'>('USD')
    const [costCurrency, setCostCurrency] = useState<'LKR' | 'USD'>('LKR')

    const [imgUrl, setImgUrl] = useState<string | null>(null)

    // Fetch Data
    useEffect(() => {
        const fetchGem = async () => {
            if (!params.id) return

            const { data, error } = await supabase
                .from('inventory')
                .select('*')
                .eq('id', params.id)
                .single()

            if (error) {
                console.error(error)
                alert('Gem not found!')
                router.push('/')
                return
            }

            setInitialData(data)

            setFormData({
                gem_type: data.gem_type,
                lot_type: data.lot_type || 'Lot',
                treatment: data.treatment || 'Heated',
                cut_grade: data.cut_grade || 'Calibrated',
                shape: data.shape || 'Oval',
                color: data.color || '',
                clarity: data.clarity || 'VVS',
                number_of_pieces: String(data.number_of_pieces || 1),
                weight_ct: String(data.weight_ct || ''),

                weight_post_cut: String(data.weight_post_cut || ''),
                cost_cut: String(data.cost_cut || ''),
                cost_polish: String(data.cost_polish || ''),
                cost_burn: String(data.cost_burn || ''),

                predict_val_per_ct: String(data.predict_val_per_ct_lkr || 0),
                // predict_total_cost: String(data.predict_total_cost_lkr || 0),

                usd_rate: '293',
                status: data.status || 'In Stock',
                note: ''
            })

            // Set Extra Costs
            if (data.extra_costs && Array.isArray(data.extra_costs)) {
                // Ensure amounts are strings for input
                setExtraCosts(data.extra_costs.map((c: any) => ({ ...c, amount: String(c.amount) })))
            } else {
                setExtraCosts([])
            }

            if (data.image_urls && data.image_urls.length > 0) {
                setImgUrl(data.image_urls[0])
            }
            setLoading(false)
        }

        fetchGem()
    }, [params.id])


    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault()
        setSaving(true)

        try {
            // 1. Recalculate Logic
            const weight = parseFloat(formData.weight_ct) || 0
            const rate = parseFloat(formData.usd_rate) || 293

            let valPerCtInput = parseFloat(formData.predict_val_per_ct) || 0
            // Detailed Costs
            let costCutInput = parseFloat(formData.cost_cut) || 0
            let costPolishInput = parseFloat(formData.cost_polish) || 0
            let costBurnInput = parseFloat(formData.cost_burn) || 0
            let extraCostsTotal = extraCosts.reduce((sum, item) => sum + (parseFloat(item.amount) || 0), 0)

            // Total Expenses in LKR (Assuming inputs are LKR as per typical usage, or map by currency if needed)
            // Simplified: Treat inputs as LKR for detailed view default
            let totalExpensesLkr = costCutInput + costPolishInput + costBurnInput + extraCostsTotal

            let valPerCtLkr = valCurrency === 'LKR' ? valPerCtInput : valPerCtInput * rate
            // Note: If costCurrency is USD, we might need conversion, but sticking to logic that detailed breakdown usually implies local currency entry.
            // If user enters USD, we'd need to convert each. Let's assume LKR for simplicity in implementation unless strictly requested.
            // The previous code had `calculate` logic separated. Here we do it on save. 
            // We should use the same logic as Add Page if we want consistency.
            if (costCurrency === 'USD') {
                totalExpensesLkr = totalExpensesLkr * rate
            }

            // 2. Prepare Update Object
            const updates = {
                gem_type: formData.gem_type,
                lot_type: formData.lot_type,
                treatment: formData.treatment,
                shape: formData.shape,
                color: formData.color,
                clarity: formData.clarity,
                number_of_pieces: parseInt(formData.number_of_pieces) || 1,
                weight_ct: weight,

                weight_post_cut: parseFloat(formData.weight_post_cut) || null,
                cost_cut: parseFloat(formData.cost_cut) || 0,
                cost_polish: parseFloat(formData.cost_polish) || 0,
                cost_burn: parseFloat(formData.cost_burn) || 0,
                extra_costs: extraCosts,

                predict_val_per_ct_lkr: valPerCtLkr,
                predict_total_cost_lkr: totalExpensesLkr,

                status: formData.status,
            }

            // 3. Update DB
            const { error } = await supabase
                .from('inventory')
                .update(updates)
                .eq('id', params.id)

            if (error) throw error

            // 4. LOGGING!
            await logChanges(user, params.id as string, initialData, updates, formData.note)

            router.push('/')
            router.refresh()
        } catch (error: any) {
            alert('Error updating: ' + error.message)
        } finally {
            setSaving(false)
        }
    }

    const addExtraCost = () => {
        if (!newCostLabel || !newCostAmount) return
        setExtraCosts([...extraCosts, { label: newCostLabel, amount: newCostAmount, type: 'Other' }])
        setNewCostLabel('')
        setNewCostAmount('')
    }

    const removeExtraCost = (index: number) => {
        setExtraCosts(extraCosts.filter((_, i) => i !== index))
    }

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center">
            <Loader2 className="animate-spin text-white w-8 h-8" />
        </div>
    )

    return (
        <div className="container max-w-2xl mx-auto py-6 px-4 pb-20">
            <Link href="/" className="flex items-center text-white/50 mb-4 hover:text-white transition-colors">
                <ArrowLeft className="w-4 h-4 mr-1" /> Back to Dashboard
            </Link>

            <div className="glass-card rounded-xl overflow-hidden border border-white/10">
                <div className="glass-header p-6 border-b border-white/10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <h2 className="text-xl font-bold text-white">Edit Gem Details</h2>
                    <div className="flex gap-2 w-full sm:w-auto">
                        {formData.status !== 'Sold' && (
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                className="border-emerald-500/30 bg-emerald-500/10 text-emerald-300 hover:bg-emerald-500/20 w-full sm:w-auto"
                                onClick={() => setFormData({ ...formData, status: 'Sold', note: 'Marked as Sold' })}
                            >
                                Mark as Sold
                            </Button>
                        )}
                    </div>
                </div>
                <div className="p-6">
                    <form onSubmit={handleSave} className="space-y-6">

                        {/* Top Config Row */}
                        <div className="glass-dark p-4 rounded-xl border border-white/5">
                            <div className="w-full">
                                <Label className="text-xs text-white/50">Current USD Rate (for Calc)</Label>
                                <Input
                                    type="number"
                                    value={formData.usd_rate}
                                    onChange={(e) => setFormData({ ...formData, usd_rate: e.target.value })}
                                    className="bg-white/5 border-white/10 text-white placeholder:text-white/20 mt-1"
                                />
                            </div>
                        </div>

                        {/* Basic Info */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label className="text-white/70">Gem Type</Label>
                                <Input
                                    value={formData.gem_type}
                                    onChange={(e) => setFormData({ ...formData, gem_type: e.target.value })}
                                    className="bg-white/5 border-white/10 text-white placeholder:text-white/20"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-white/70">Lot / Type</Label>
                                <Select onValueChange={(v) => setFormData({ ...formData, lot_type: v })} defaultValue={formData.lot_type}>
                                    <SelectTrigger className="bg-white/5 border-white/10 text-white"><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Lot">Lot</SelectItem>
                                        <SelectItem value="Single">Single</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        {/* Weight */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label className="text-white/70">Weight (Ct)</Label>
                                <Input
                                    type="number" step="0.01"
                                    value={formData.weight_ct}
                                    onChange={(e) => setFormData({ ...formData, weight_ct: e.target.value })}
                                    className="bg-white/5 border-white/10 text-white placeholder:text-white/20"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-white/70">Weight After Cut</Label>
                                <Input
                                    type="number"
                                    step="0.01"
                                    placeholder="Optional"
                                    className="bg-white/5 border-white/10 text-white placeholder:text-white/20"
                                    value={formData.weight_post_cut}
                                    onChange={(e) => setFormData({ ...formData, weight_post_cut: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-white/70">No. Pieces</Label>
                                <Input
                                    type="number"
                                    value={formData.number_of_pieces}
                                    onChange={(e) => setFormData({ ...formData, number_of_pieces: e.target.value })}
                                    className="bg-white/5 border-white/10 text-white placeholder:text-white/20"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <div className="space-y-2">
                                <Label className="text-white/70">Treatment</Label>
                                <Select onValueChange={(v) => setFormData({ ...formData, treatment: v })} defaultValue={formData.treatment}>
                                    <SelectTrigger className="bg-white/5 border-white/10 text-white"><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Heated">Heated</SelectItem>
                                        <SelectItem value="Natural">Natural</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label className="text-white/70">Shape</Label>
                                <Select onValueChange={(v) => setFormData({ ...formData, shape: v })} defaultValue={formData.shape}>
                                    <SelectTrigger className="bg-white/5 border-white/10 text-white"><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Oval">Oval</SelectItem>
                                        <SelectItem value="Round">Round</SelectItem>
                                        <SelectItem value="Cushion">Cushion</SelectItem>
                                        <SelectItem value="Mix">Mix</SelectItem>
                                        <SelectItem value="Emerald">Emerald</SelectItem>
                                        <SelectItem value="Pear">Pear</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label className="text-white/70">Status</Label>
                                <Select onValueChange={(v) => setFormData({ ...formData, status: v })} value={formData.status}>
                                    <SelectTrigger className="bg-white/5 border-white/10 text-white"><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="In Stock">In Stock</SelectItem>
                                        <SelectItem value="Sold">Sold</SelectItem>
                                        <SelectItem value="Memo">Memo</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="h-px bg-white/10 my-4" />

                        {/* Financials (Editable) */}
                        <div className="space-y-4">
                            <h3 className="text-sm font-semibold text-white">Update Financials</h3>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-yellow-500/10 p-4 rounded-xl border border-yellow-500/20">
                                {/* Input 1: Value Per Ct */}
                                <div className="space-y-2">
                                    <div className="flex justify-between items-center mb-1">
                                        <Label className="text-yellow-200 text-xs font-bold uppercase">Val / Ct</Label>
                                        <Tabs value={valCurrency} onValueChange={(v) => setValCurrency(v as 'LKR' | 'USD')} className="h-6">
                                            <TabsList className="h-6 p-0 bg-white/5 border border-white/10">
                                                <TabsTrigger value="USD" className="h-full px-2 text-[10px] data-[state=active]:bg-yellow-500/40 text-white/50">USD</TabsTrigger>
                                                <TabsTrigger value="LKR" className="h-full px-2 text-[10px] data-[state=active]:bg-yellow-500/40 text-white/50">LKR</TabsTrigger>
                                            </TabsList>
                                        </Tabs>
                                    </div>
                                    <Input
                                        type="number"
                                        className="bg-white/5 border-yellow-500/30 text-white placeholder:text-white/20"
                                        value={formData.predict_val_per_ct}
                                        onChange={(e) => setFormData({ ...formData, predict_val_per_ct: e.target.value })}
                                    />
                                </div>

                                {/* Input 2: Total Cost */}
                                {/* Detailed Expenses */}
                                <div className="space-y-2">
                                    <div className="flex justify-between items-center mb-1">
                                        <Label className="text-yellow-200 text-xs font-bold uppercase">Processing Expenses (Cut/Polish/Burn)</Label>
                                        <Tabs value={costCurrency} onValueChange={(v) => setCostCurrency(v as 'LKR' | 'USD')} className="h-6">
                                            <TabsList className="h-6 p-0 bg-white/5 border border-white/10">
                                                <TabsTrigger value="USD" className="h-full px-2 text-[10px] data-[state=active]:bg-yellow-500/40 text-white/50">USD</TabsTrigger>
                                                <TabsTrigger value="LKR" className="h-full px-2 text-[10px] data-[state=active]:bg-yellow-500/40 text-white/50">LKR</TabsTrigger>
                                            </TabsList>
                                        </Tabs>
                                    </div>
                                    <div className="grid grid-cols-3 gap-2">
                                        <Input
                                            type="number"
                                            className="bg-white/5 border-yellow-500/30 text-white placeholder:text-white/20 text-xs px-2"
                                            placeholder="Cut"
                                            title="Cut Cost"
                                            value={formData.cost_cut}
                                            onChange={(e) => setFormData({ ...formData, cost_cut: e.target.value })}
                                        />
                                        <Input
                                            type="number"
                                            className="bg-white/5 border-yellow-500/30 text-white placeholder:text-white/20 text-xs px-2"
                                            placeholder="Polish"
                                            title="Polish Cost"
                                            value={formData.cost_polish}
                                            onChange={(e) => setFormData({ ...formData, cost_polish: e.target.value })}
                                        />
                                        <Input
                                            type="number"
                                            className="bg-white/5 border-yellow-500/30 text-white placeholder:text-white/20 text-xs px-2"
                                            placeholder="Burn"
                                            title="Burn Cost"
                                            value={formData.cost_burn}
                                            onChange={(e) => setFormData({ ...formData, cost_burn: e.target.value })}
                                        />
                                    </div>

                                    {/* Extra Costs List */}
                                    <div className="mt-4 space-y-2">
                                        <Label className="text-[10px] text-white/50 uppercase">Additional Costs</Label>
                                        {extraCosts.map((cost, idx) => (
                                            <div key={idx} className="flex items-center gap-2 text-xs bg-white/5 p-1.5 rounded border border-white/5">
                                                <span className="text-white/70 flex-1">{cost.label}</span>
                                                <span className="text-white font-mono">{cost.amount}</span>
                                                <Button type="button" variant="ghost" size="icon" className="h-4 w-4 text-red-400 hover:text-red-300" onClick={() => removeExtraCost(idx)}>
                                                    <Trash2 className="w-3 h-3" />
                                                </Button>
                                            </div>
                                        ))}

                                        <div className="flex gap-2">
                                            <Input
                                                placeholder="Cost Label"
                                                className="h-7 text-xs bg-white/5 border-white/10 text-white"
                                                value={newCostLabel}
                                                onChange={e => setNewCostLabel(e.target.value)}
                                            />
                                            <Input
                                                type="number"
                                                placeholder="Amount"
                                                className="h-7 w-20 text-xs bg-white/5 border-white/10 text-white"
                                                value={newCostAmount}
                                                onChange={e => setNewCostAmount(e.target.value)}
                                            />
                                            <Button type="button" size="icon" className="h-7 w-7 bg-yellow-500/50 hover:bg-yellow-500/70" onClick={addExtraCost}>
                                                <Plus className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* [MANDATORY] REASON FOR CHANGE */}
                        <div className="space-y-2">
                            <Label className="text-white/90 font-semibold">Reason for Update (For Log)</Label>
                            <Textarea
                                placeholder="e.g. Sold the lot for a better price, or Adjusted weight after recut..."
                                value={formData.note}
                                onChange={(e) => setFormData({ ...formData, note: e.target.value })}
                                required
                                className="bg-white/5 border-white/10 text-white placeholder:text-white/20 min-h-[100px]"
                            />
                        </div>

                        <Button type="submit" className="w-full bg-white text-indigo-950 hover:bg-white/90 font-bold h-12 text-base shadow-lg shadow-indigo-500/20" disabled={saving}>
                            {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                            Save & Log Changes
                        </Button>

                    </form>
                </div>
            </div>
        </div>
    )
}
