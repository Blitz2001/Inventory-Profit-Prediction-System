"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import { InventoryItem } from "@/types"
import { columns } from "./inventory/columns"
import { DataTable } from "@/components/data-table"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Plus, History, TrendingUp, LogOut, Wallet, DollarSign } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { useAuth } from "@/components/auth-provider"
import { InventoryCard } from "@/components/inventory-card"

export default function Dashboard() {
  const [data, setData] = useState<InventoryItem[]>([])
  const [totalCapital, setTotalCapital] = useState(0)
  const [loading, setLoading] = useState(true)
  const { user, signOut, isAdmin } = useAuth()

  // Derived state for filters
  const [activeStock, setActiveStock] = useState<InventoryItem[]>([])
  const [soldStock, setSoldStock] = useState<InventoryItem[]>([])
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    const fetchData = async () => {
      const { data: inventory, error } = await supabase
        .from('inventory')
        .select('*')
        .order('created_at', { ascending: false })

      // Fetch Capital
      const { data: capitalData, error: capitalError } = await supabase
        .from('capital_investments')
        .select('amount')

      if (!capitalError && capitalData) {
        const total = capitalData.reduce((sum, item) => sum + (item.amount || 0), 0)
        setTotalCapital(total)
      }

      if (error) console.error('Error fetching inventory:', error)
      else {
        setData(inventory || [])
      }
      setLoading(false)
    }

    fetchData()
  }, [])

  // Filter data based on search query
  useEffect(() => {
    if (!data) return;

    const query = searchQuery.toLowerCase().trim();
    const filtered = data.filter(item => {
      const gemType = (item.gem_type || '').toLowerCase();
      const lotNumber = String(item.lot_number || '').toLowerCase();
      const lotString = `l${String(item.lot_number || '').toLowerCase()}`; // Allows searching "L001" or "001"

      return !query || gemType.includes(query) || lotNumber.includes(query) || lotString.includes(query);
    });

    setActiveStock(filtered.filter(i => i.status !== 'Sold'))
    setSoldStock(filtered.filter(i => i.status === 'Sold'))
  }, [data, searchQuery])

  return (
    <div className="container mx-auto py-4 sm:py-8 px-4 max-w-7xl">
      {/* Header with Glassmorphism */}
      <div className="glass-header rounded-2xl p-4 sm:p-6 mb-6 sm:mb-8 transition-glass">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
          <div className="flex-1">
            <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2">
              💎 Gem Tracker
            </h1>
            <p className="text-white/80 text-sm sm:text-base">Inventory & Profit Prediction System</p>
            {user && <p className="text-xs text-white/60 mt-1 glass-dark px-3 py-1 rounded-full inline-block">{user.email}</p>}
          </div>

          <div className="flex flex-wrap gap-2 sm:gap-3 w-full lg:w-auto">
            {/* Search Input */}
            <div className="w-full sm:w-64">
              <input
                type="text"
                placeholder="Search Lot # or Gem Type..."
                className="w-full px-4 py-2 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/30 transition-all text-sm"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <Link href="/capital" className="flex-1 sm:flex-none">
              <Button variant="outline" className="glass text-white border-white/30 hover:glass-card w-full">
                <Wallet className="w-4 h-4 mr-2" />
                <span className="hidden sm:inline">Capital</span>
                <span className="sm:hidden">Cap</span>
              </Button>
            </Link>
            <Link href="/logs" className="flex-1 sm:flex-none">
              <Button variant="outline" className="glass text-white border-white/30 hover:glass-card w-full">
                <History className="w-4 h-4 mr-2" />
                <span className="hidden sm:inline">Audit Log</span>
                <span className="sm:hidden">Logs</span>
              </Button>
            </Link>
            {user && (
              isAdmin && (
                <Link href="/add" className="flex-1 sm:flex-none">
                  <Button className="glass-card text-white border-white/30 hover:bg-white/20 w-full">
                    <Plus className="w-4 h-4 mr-2" />
                    <span className="hidden sm:inline">Add New Stock</span>
                    <span className="sm:hidden">Add</span>
                  </Button>
                </Link>
              )
            )}
            {user && (
              <Button
                variant="outline"
                className="glass text-red-200 border-red-300/30 hover:bg-red-500/20 flex-1 sm:flex-none"
                onClick={signOut}
              >
                <LogOut className="w-4 h-4 mr-2" />
                <span className="hidden sm:inline">Logout</span>
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Metrics with Glassmorphism */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6 sm:mb-8">
        <div className="glass-card rounded-xl p-4 sm:p-6 transition-glass">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-white/70 font-medium">Total Capital</p>
            <DollarSign className="w-5 h-5 text-white/50" />
          </div>
          <p className="text-2xl sm:text-3xl font-bold text-white">
            Rs {totalCapital.toLocaleString()}
          </p>
        </div>
        <div className="glass-card rounded-xl p-4 sm:p-6 transition-glass">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-white/70 font-medium">Total Active Value</p>
            <TrendingUp className="w-5 h-5 text-emerald-300" />
          </div>
          <p className="text-2xl sm:text-3xl font-bold gradient-text-blue">
            Rs {activeStock.reduce((sum, item) => sum + ((item.weight_ct || 0) * (item.predict_val_per_ct_lkr || 0)), 0).toLocaleString()}
          </p>
        </div>

        <div className="glass-card rounded-xl p-4 sm:p-6 transition-glass">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-white/70 font-medium">Projected Profit</p>
            <TrendingUp className="w-5 h-5 text-emerald-300" />
          </div>
          <p className="text-2xl sm:text-3xl font-bold text-emerald-300">
            Rs {activeStock.reduce((sum, item) => sum + (((item.weight_ct || 0) * (item.predict_val_per_ct_lkr || 0)) - ((item.buying_price || 0) + (item.predict_total_cost_lkr || 0))), 0).toLocaleString()}
          </p>
        </div>

        <div className="glass-card rounded-xl p-4 sm:p-6 transition-glass">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-white/70 font-medium">Realized Profit</p>
            <TrendingUp className="w-5 h-5 text-blue-300" />
          </div>
          <p className="text-2xl sm:text-3xl font-bold text-blue-300">
            Rs {soldStock.reduce((sum, item) => sum + (((item.weight_ct || 0) * (item.predict_val_per_ct_lkr || 0)) - ((item.buying_price || 0) + (item.predict_total_cost_lkr || 0))), 0).toLocaleString()}
          </p>
        </div>
      </div>

      {/* Main Content Areas with Glassmorphism */}
      <Tabs defaultValue="active" className="w-full">
        <TabsList className="glass-header mb-4 sm:mb-6 p-1 rounded-xl w-full sm:w-auto">
          <TabsTrigger
            value="active"
            className="flex-1 sm:flex-none px-4 sm:px-8 data-[state=active]:glass-card data-[state=active]:text-white text-white/70 rounded-lg"
          >
            <span className="hidden sm:inline">Current Stock ({activeStock.length})</span>
            <span className="sm:hidden">Active ({activeStock.length})</span>
          </TabsTrigger>
          <TabsTrigger
            value="sold"
            className="flex-1 sm:flex-none px-4 sm:px-8 data-[state=active]:glass-card data-[state=active]:text-white text-white/70 rounded-lg"
          >
            <span className="hidden sm:inline">Sold History ({soldStock.length})</span>
            <span className="sm:hidden">Sold ({soldStock.length})</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="active">
          {loading ? (
            <div className="glass-card rounded-xl p-8 text-center text-white/70">Loading inventory...</div>
          ) : (
            <div className="space-y-4">
              {activeStock.length === 0 ? (
                <div className="glass-card rounded-xl p-8 text-center text-white/70">
                  No active inventory items
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {activeStock.map((item, index) => (
                    <InventoryCard key={item.id} item={item} priority={index < 6} />
                  ))}
                </div>
              )}
            </div>
          )}
        </TabsContent>

        <TabsContent value="sold" className="space-y-4 sm:space-y-6">
          {soldStock.length > 0 && (
            <div className="glass-dark rounded-xl p-4 sm:p-6 border border-white/10">
              <div className="flex items-start gap-3 sm:gap-4 mb-4 sm:mb-6">
                <span className="p-2 sm:p-3 glass-card text-emerald-300 rounded-xl">
                  <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6" />
                </span>
                <div className="flex-1">
                  <h3 className="text-lg sm:text-xl font-bold text-white">Buying Guide</h3>
                  <p className="text-white/60 text-xs sm:text-sm mt-1">
                    Based on past sales • Use these averages for your next purchase
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                {Object.entries(soldStock.reduce((acc, item) => {
                  const type = item.gem_type;
                  if (!acc[type]) acc[type] = { weight: 0, buyingCost: 0, processingCost: 0, val: 0, count: 0 };
                  acc[type].weight += (item.weight_ct || 0);
                  acc[type].buyingCost += (item.buying_price || 0);
                  acc[type].processingCost += (item.predict_total_cost_lkr || 0);
                  acc[type].val += ((item.weight_ct * (item.predict_val_per_ct_lkr || 0)) || 0);
                  acc[type].count += 1;
                  return acc;
                }, {} as Record<string, any>)).map(([type, stats]) => {
                  const avgBuyingCost = stats.buyingCost / (stats.weight || 1);
                  const avgProcessing = stats.processingCost / (stats.weight || 1);
                  const avgTotalCost = avgBuyingCost + avgProcessing;
                  const avgVal = stats.val / (stats.weight || 1);
                  const avgProfit = avgVal - avgTotalCost;

                  return (
                    <div key={type} className="glass-card p-4 sm:p-5 rounded-xl transition-glass">
                      <div className="flex justify-between items-start mb-3 sm:mb-4">
                        <div>
                          <div className="text-sm font-bold text-white uppercase tracking-wider">{type}</div>
                          <div className="text-xs text-white/50 mt-1">{stats.count} items sold</div>
                        </div>
                        <div className="glass-dark text-emerald-300 px-2 py-1 rounded-lg text-xs font-bold">
                          {(avgProfit > 0 ? '+' : '') + Math.round((avgProfit / avgTotalCost) * 100)}% ROI
                        </div>
                      </div>

                      <div className="space-y-2 sm:space-y-3">
                        <div className="flex justify-between items-baseline">
                          <span className="text-white/60 text-xs sm:text-sm">Avg Sold Price:</span>
                          <span className="text-white font-medium text-sm sm:text-base">
                            Rs {avgVal.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                            <span className="text-xs text-white/40">/ct</span>
                          </span>
                        </div>

                        <div className="flex justify-between items-baseline">
                          <span className="text-white/60 text-xs sm:text-sm">Avg Buy Cost:</span>
                          <span className="text-orange-300 font-medium text-sm sm:text-base">
                            Rs {avgBuyingCost.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                            <span className="text-xs text-white/40">/ct</span>
                          </span>
                        </div>

                        <div className="flex justify-between items-baseline">
                          <span className="text-white/40 text-xs">Avg Processing:</span>
                          <span className="text-white/40 text-xs">
                            Rs {avgProcessing.toLocaleString(undefined, { maximumFractionDigits: 0 })}/ct
                          </span>
                        </div>

                        <div className="h-px bg-white/10 my-2" />

                        <div className="flex justify-between items-center">
                          <span className="text-white/80 font-medium text-sm">Avg Profit:</span>
                          <span className={`${avgProfit >= 0 ? 'text-emerald-300' : 'text-red-300'} font-bold text-base`}>
                            Rs {avgProfit.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                            <span className="text-xs font-normal opacity-70 ml-1">/ct</span>
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Sold Items Table */}
          {/* Sold Items Section */}
          <div className="glass-header p-4 rounded-xl border border-white/10 mb-4">
            <h3 className="text-lg font-semibold text-white">Sold Items History</h3>
          </div>
          <div className="space-y-4">
            {soldStock.length === 0 ? (
              <div className="glass-card rounded-xl p-8 text-center text-white/70">
                No sold items recorded
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {soldStock.map((item, index) => (
                  <InventoryCard key={item.id} item={item} priority={index < 6} />
                ))}
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
