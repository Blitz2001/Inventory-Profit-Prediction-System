"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"
import { useAuth } from "@/components/auth-provider"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loader2, Upload, ChevronLeft, Calculator, TrendingUp, Plus, Trash2 } from "lucide-react"
import Link from "next/link"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { logChanges } from "@/lib/logger"

export default function AddGemPage() {
    const router = useRouter()
    const { user, isAdmin, loading: authLoading } = useAuth()
    const [loading, setLoading] = useState(false)

    // Admin Guard
    if (!authLoading && !isAdmin) {
        router.push('/')
    }

    // Form State
    const [formData, setFormData] = useState({
        gem_type: 'Blue Sapphire',
        lot_type: 'Lot',
        treatment: 'Heated',
        cut_grade: 'Calibrated',
        shape: 'Oval',
        color: '',
        clarity: 'VVS',
        number_of_pieces: '1',
        weight_ct: '',

        // Detailed Costs
        weight_post_cut: '',
        cost_cut: '',
        cost_polish: '',
        cost_burn: '',

        predict_val_per_ct: '',
        // predict_total_cost removed from direct input, now calculated
        buying_price: '',

        usd_rate: '293',
        status: 'In Stock'
    })

    // Dynamic Extra Costs
    const [extraCosts, setExtraCosts] = useState<{ label: string; amount: string; type: string }[]>([])
    const [newCostLabel, setNewCostLabel] = useState('')
    const [newCostAmount, setNewCostAmount] = useState('')

    // Currencies
    const [valCurrency, setValCurrency] = useState<'LKR' | 'USD'>('USD')
    const [costCurrency, setCostCurrency] = useState<'LKR' | 'USD'>('LKR')

    // Custom Gem Type Logic
    const [isCustomGem, setIsCustomGem] = useState(false)
    const predefinedGems = ["Blue Sapphire", "Yellow Sapphire", "White Sapphire", "Ruby", "Pink Sapphire", "Geuda"]

    const [imgUrl, setImgUrl] = useState<string | null>(null)
    const [uploading, setUploading] = useState(false)

    // Computed Values
    const [calculations, setCalculations] = useState({
        totalValueLkr: 0,
        amountCostLkr: 0,
        profitLkr: 0,
        totalValueUsd: 0,
        amountCostUsd: 0,
        profitUsd: 0
    })

    // Real-time Calculation
    // Real-time Calculation
    useEffect(() => {
        const weight = parseFloat(formData.weight_ct) || 0
        const rate = parseFloat(formData.usd_rate) || 293

        let valPerCtInput = parseFloat(formData.predict_val_per_ct) || 0
        let buyingPriceInput = parseFloat(formData.buying_price) || 0

        // Detailed Costs
        let costCutInput = parseFloat(formData.cost_cut) || 0
        let costPolishInput = parseFloat(formData.cost_polish) || 0
        let costBurnInput = parseFloat(formData.cost_burn) || 0

        let extraCostsTotal = extraCosts.reduce((sum, item) => sum + (parseFloat(item.amount) || 0), 0)

        // Convert all to LKR for standardization
        let valPerCtLkr = valCurrency === 'LKR' ? valPerCtInput : valPerCtInput * rate
        let buyingPriceLkr = buyingPriceInput // Assumed LKR based on UI label

        // Costs are usually in LKR locally, but let's respect currency toggle if we want (simplifying to LKR for inputs as per previous code structure implies mixed, but let's stick to base logic)
        // Actually, previous code had costCurrency toggle. Let volume costs follow that.
        const getCostInLkr = (val: number) => costCurrency === 'LKR' ? val : val * rate

        let expensesLkr = getCostInLkr(costCutInput + costPolishInput + costBurnInput + extraCostsTotal)

        const totalValueLkr = weight * valPerCtLkr
        const totalCostLkr = buyingPriceLkr + expensesLkr
        const profitLkr = totalValueLkr - totalCostLkr

        setCalculations({
            totalValueLkr,
            amountCostLkr: expensesLkr,
            profitLkr,
            totalValueUsd: totalValueLkr / rate,
            amountCostUsd: expensesLkr / rate,
            profitUsd: profitLkr / rate
        })
    }, [formData, extraCosts, valCurrency, costCurrency])

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        try {
            setUploading(true)
            if (!e.target.files || e.target.files.length === 0) return
            const file = e.target.files[0]
            const filePath = `${Math.random()}.${file.name.split('.').pop()}`
            const { error: uploadError } = await supabase.storage.from('gems').upload(filePath, file)
            if (uploadError) throw uploadError
            const { data } = supabase.storage.from('gems').getPublicUrl(filePath)
            setImgUrl(data.publicUrl)
        } catch (error: any) {
            alert('Upload failed: ' + error.message)
        } finally {
            setUploading(false)
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

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)

        try {
            const { error } = await supabase.from('inventory').insert([
                {
                    user_id: user?.id,
                    email: user?.email,
                    gem_type: formData.gem_type,
                    lot_type: formData.lot_type,
                    treatment: formData.treatment,
                    cut_grade: formData.cut_grade,
                    shape: formData.shape,
                    color: formData.color,
                    clarity: formData.clarity,
                    number_of_pieces: parseInt(formData.number_of_pieces) || 1,
                    weight_ct: parseFloat(formData.weight_ct),

                    // Detailed Costs
                    weight_post_cut: parseFloat(formData.weight_post_cut) || null,
                    cost_cut: parseFloat(formData.cost_cut) || 0,
                    cost_polish: parseFloat(formData.cost_polish) || 0,
                    cost_burn: parseFloat(formData.cost_burn) || 0,
                    extra_costs: extraCosts,

                    predict_val_per_ct_lkr: calculations.totalValueLkr / (parseFloat(formData.weight_ct) || 1),
                    predict_total_cost_lkr: calculations.amountCostLkr, // Sum of all detailed costs
                    buying_price: parseFloat(formData.buying_price) || 0,
                    budget_per_ct_usd: calculations.amountCostUsd,

                    status: formData.status,
                    image_urls: imgUrl ? [imgUrl] : []
                }
            ]).select().single()

            if (error) throw error

            const { data: insertedData } = await supabase
                .from('inventory')
                .select()
                .eq('id', (await supabase.from('inventory').select('id').order('created_at', { ascending: false }).limit(1).single()).data?.id)
                .single()

            await logChanges(user, insertedData?.id, null, insertedData, "Initial Stock Entry")

            router.push('/')
            router.refresh()
        } catch (error: any) {
            console.error('Error adding gem:', error)
            alert('Failed to add gem: ' + error.message)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="container max-w-2xl mx-auto py-6 px-4 pb-20">
            <Link href="/" className="flex items-center text-white/50 mb-4 hover:text-white transition-colors">
                <ChevronLeft className="w-4 h-4 mr-1" /> Back to Dashboard
            </Link>

            <div className="glass-card rounded-xl overflow-hidden border border-white/10">
                <div className="glass-header p-6 border-b border-white/10">
                    <h2 className="text-xl font-bold text-white">Add New Stock</h2>
                </div>
                <div className="p-6">
                    <form onSubmit={handleSubmit} className="space-y-6">

                        {/* Top Config Row */}
                        <div className="flex gap-4 p-4 glass-dark rounded-xl border border-white/5">
                            <div className="w-full">
                                <Label className="text-xs text-white/50">Current USD Rate</Label>
                                <div className="relative mt-1">
                                    <span className="absolute left-3 top-2.5 text-white/40 text-sm">Rs</span>
                                    <Input
                                        type="number"
                                        value={formData.usd_rate}
                                        onChange={(e) => setFormData({ ...formData, usd_rate: e.target.value })}
                                        className="pl-8 bg-white/5 border-white/10 text-white placeholder:text-white/20 focus:bg-white/10"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Basic Info */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label className="text-white/70">Gem Type</Label>
                                {isCustomGem ? (
                                    <div className="flex gap-2">
                                        <Input
                                            placeholder="Type custom gem name..."
                                            value={formData.gem_type}
                                            onChange={(e) => setFormData({ ...formData, gem_type: e.target.value })}
                                            className="bg-white/5 border-white/10 text-white placeholder:text-white/20"
                                            autoFocus
                                        />
                                        <Button variant="ghost" size="icon" onClick={() => setIsCustomGem(false)} type="button" className="text-white/70 hover:text-white hover:bg-white/10">
                                            <ChevronLeft className="w-4 h-4" />
                                        </Button>
                                    </div>
                                ) : (
                                    <Select
                                        onValueChange={(v) => {
                                            if (v === 'OTHER_CUSTOM') {
                                                setIsCustomGem(true)
                                                setFormData({ ...formData, gem_type: '' })
                                            } else {
                                                setFormData({ ...formData, gem_type: v })
                                            }
                                        }}
                                        value={predefinedGems.includes(formData.gem_type) ? formData.gem_type : 'OTHER_CUSTOM'}
                                    >
                                        <SelectTrigger className="bg-white/5 border-white/10 text-white"><SelectValue placeholder={formData.gem_type || "Select Gem"} /></SelectTrigger>
                                        <SelectContent>
                                            {predefinedGems.map(g => (
                                                <SelectItem key={g} value={g}>{g}</SelectItem>
                                            ))}
                                            <SelectItem value="OTHER_CUSTOM" className="font-semibold text-blue-400">
                                                + Add Other Type...
                                            </SelectItem>
                                        </SelectContent>
                                    </Select>
                                )}
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

                        {/* Weight (Critical for Calc) */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label className="text-blue-300 font-semibold">Weight (Ct)</Label>
                                <Input
                                    type="number"
                                    step="0.01"
                                    required
                                    className="bg-white/5 border-blue-500/30 text-white focus:ring-blue-500 focus:border-blue-500 placeholder:text-white/20"
                                    value={formData.weight_ct}
                                    onChange={(e) => setFormData({ ...formData, weight_ct: e.target.value })}
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

                        <div className="h-px bg-white/10" />

                        {/* Acquisition Cost Section */}
                        <div className="glass-dark p-4 rounded-xl border border-white/5 space-y-3">
                            <h3 className="text-sm font-medium text-white/70 uppercase tracking-wider">Acquisition Cost</h3>
                            <div className="space-y-2">
                                <Label className="text-white/70">Buying Price (LKR)</Label>
                                <Input
                                    type="number"
                                    placeholder="Cost of rough stone"
                                    value={formData.buying_price}
                                    onChange={(e) => setFormData({ ...formData, buying_price: e.target.value })}
                                    className="bg-white/5 border-white/10 text-white placeholder:text-white/20"
                                />
                            </div>
                        </div>

                        {/* Calculator Section */}
                        <div className="space-y-4">
                            <h3 className="text-sm font-semibold text-white flex items-center">
                                <Calculator className="w-4 h-4 mr-2 text-indigo-300" /> Profit Calculator
                            </h3>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-indigo-900/20 p-4 rounded-xl border border-indigo-500/20">
                                {/* Input 1: Value Per Ct */}
                                <div className="space-y-2">
                                    <div className="flex justify-between items-center mb-1">
                                        <Label className="text-indigo-200 text-xs font-bold uppercase">Predict Value / Ct</Label>
                                        <Tabs value={valCurrency} onValueChange={(v) => setValCurrency(v as 'LKR' | 'USD')} className="h-6">
                                            <TabsList className="h-6 p-0 bg-white/5 border border-white/10">
                                                <TabsTrigger value="USD" className="h-full px-2 text-[10px] data-[state=active]:bg-indigo-500 data-[state=active]:text-white text-white/50">USD</TabsTrigger>
                                                <TabsTrigger value="LKR" className="h-full px-2 text-[10px] data-[state=active]:bg-indigo-500 data-[state=active]:text-white text-white/50">LKR</TabsTrigger>
                                            </TabsList>
                                        </Tabs>
                                    </div>
                                    <Input
                                        type="number"
                                        className="bg-white/5 border-indigo-500/30 text-white placeholder:text-white/20"
                                        placeholder="0.00"
                                        value={formData.predict_val_per_ct}
                                        onChange={(e) => setFormData({ ...formData, predict_val_per_ct: e.target.value })}
                                    />
                                </div>

                                {/* Input 2: Total Cost */}
                                {/* Detailed Expenses */}
                                <div className="space-y-2">
                                    <div className="flex justify-between items-center mb-1">
                                        <Label className="text-indigo-200 text-xs font-bold uppercase">Expenses</Label>
                                        <Tabs value={costCurrency} onValueChange={(v) => setCostCurrency(v as 'LKR' | 'USD')} className="h-6">
                                            <TabsList className="h-6 p-0 bg-white/5 border border-white/10">
                                                <TabsTrigger value="USD" className="h-full px-2 text-[10px] data-[state=active]:bg-indigo-500 data-[state=active]:text-white text-white/50">USD</TabsTrigger>
                                                <TabsTrigger value="LKR" className="h-full px-2 text-[10px] data-[state=active]:bg-indigo-500 data-[state=active]:text-white text-white/50">LKR</TabsTrigger>
                                            </TabsList>
                                        </Tabs>
                                    </div>
                                    <div className="grid grid-cols-3 gap-2">
                                        <Input
                                            type="number"
                                            className="bg-white/5 border-indigo-500/30 text-white placeholder:text-white/20 text-xs px-2"
                                            placeholder="Cut Cost"
                                            title="Cutting Cost"
                                            value={formData.cost_cut}
                                            onChange={(e) => setFormData({ ...formData, cost_cut: e.target.value })}
                                        />
                                        <Input
                                            type="number"
                                            className="bg-white/5 border-indigo-500/30 text-white placeholder:text-white/20 text-xs px-2"
                                            placeholder="Polish Cost"
                                            title="Polishing Cost"
                                            value={formData.cost_polish}
                                            onChange={(e) => setFormData({ ...formData, cost_polish: e.target.value })}
                                        />
                                        <Input
                                            type="number"
                                            className="bg-white/5 border-indigo-500/30 text-white placeholder:text-white/20 text-xs px-2"
                                            placeholder="Burn Cost"
                                            title="Burning Cost"
                                            value={formData.cost_burn}
                                            onChange={(e) => setFormData({ ...formData, cost_burn: e.target.value })}
                                        />
                                    </div>

                                    {/* Extra Costs List */}
                                    <div className="mt-4 space-y-2">
                                        <Label className="text-[10px] text-white/50 uppercase">Additional Costs (Transport, etc.)</Label>
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
                                            <Button type="button" size="icon" className="h-7 w-7 bg-indigo-500 hover:bg-indigo-600" onClick={addExtraCost}>
                                                <Plus className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Dual Currency Results */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                {/* LKR Card */}
                                <div className="glass-dark p-3 rounded-lg border border-white/5 space-y-2">
                                    <div className="text-xs font-bold text-white/40 uppercase tracking-wider">In Rupees (LKR)</div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-white/60">Total Value:</span>
                                        <span className="font-mono text-white">Rs {calculations.totalValueLkr.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
                                    </div>
                                    <div className="flex justify-between text-sm font-semibold pt-2 border-t border-white/10">
                                        <span className="text-white/80">Profit:</span>
                                        <span className={`${calculations.profitLkr >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                                            Rs {calculations.profitLkr.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                                        </span>
                                    </div>
                                </div>

                                {/* USD Card */}
                                <div className="glass-dark p-3 rounded-lg border border-white/5 space-y-2">
                                    <div className="text-xs font-bold text-white/40 uppercase tracking-wider">In Dollars (USD)</div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-white/60">Total Value:</span>
                                        <span className="font-mono text-white">${calculations.totalValueUsd.toLocaleString(undefined, { maximumFractionDigits: 2 })}</span>
                                    </div>
                                    <div className="flex justify-between text-sm font-semibold pt-2 border-t border-white/10">
                                        <span className="text-white/80">Profit:</span>
                                        <span className={`${calculations.profitUsd >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                                            ${calculations.profitUsd.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Extra Details */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
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
                                <Label className="text-white/70">Clarity</Label>
                                <Input
                                    value={formData.clarity}
                                    onChange={(e) => setFormData({ ...formData, clarity: e.target.value })}
                                    placeholder="VVS"
                                    className="bg-white/5 border-white/10 text-white placeholder:text-white/20"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label className="text-white/70">Color</Label>
                                <Input
                                    value={formData.color}
                                    onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                                    placeholder="Color"
                                    className="bg-white/5 border-white/10 text-white placeholder:text-white/20"
                                />
                            </div>
                            {/* Image Upload */}
                            <div className="flex flex-col items-center justify-center border-2 border-dashed border-white/10 rounded-lg p-2 hover:bg-white/5 transition-colors h-full min-h-[80px]">
                                {imgUrl ? (
                                    <img src={imgUrl} alt="Preview" className="h-10 object-cover rounded-md mb-1 shadow-sm" />
                                ) : (
                                    <Upload className="w-5 h-5 text-white/30 mb-1" />
                                )}
                                <Label htmlFor="picture" className="cursor-pointer text-[10px] text-blue-300 font-medium hover:underline hover:text-blue-200">
                                    {uploading ? '...' : imgUrl ? 'Change' : 'Upload Photo'}
                                </Label>
                                <Input id="picture" type="file" className="hidden" accept="image/*" onChange={handleImageUpload} disabled={uploading} />
                            </div>
                        </div>

                        <Button type="submit" className="w-full bg-white text-indigo-950 hover:bg-white/90 font-bold h-12 text-base shadow-lg shadow-indigo-500/20" disabled={loading || uploading}>
                            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Save Prediction
                        </Button>

                    </form>
                </div>
            </div>
        </div>
    )
}
