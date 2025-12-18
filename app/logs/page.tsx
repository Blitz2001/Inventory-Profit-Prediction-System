"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { format } from "date-fns"
import Link from "next/link"
import { ChevronLeft, History, Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export default function LogsPage() {
    const [logs, setLogs] = useState<any[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetchLogs()
    }, [])

    const fetchLogs = async () => {
        const { data, error } = await supabase
            .from('activity_logs')
            .select(`
                *,
                *,
                inventory ( gem_type ),
                capital_investments ( amount, nickname, profiles ( full_name ) )
            `)
            .order('created_at', { ascending: false })
            .limit(200)

        if (error) console.error(error)
        else setLogs(data || [])
        setLoading(false)
    }

    const [searchTerm, setSearchTerm] = useState('')
    const [filterAction, setFilterAction] = useState('ALL')

    const filteredLogs = logs.filter(log => {
        const matchesSearch = (log.inventory?.gem_type || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
            (log.capital_investments?.nickname || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
            (log.note || '').toLowerCase().includes(searchTerm.toLowerCase())

        const matchesFilter = filterAction === 'ALL' || log.action_type === filterAction

        return matchesSearch && matchesFilter
    })

    return (
        <div className="container max-w-5xl mx-auto py-8 px-4">
            <div className="flex flex-col md:flex-row items-center justify-between mb-6 gap-4">
                <div className="flex items-center gap-2 self-start md:self-auto">
                    <Link href="/">
                        <div className="p-2 hover:bg-white/10 rounded-full transition-colors">
                            <ChevronLeft className="w-5 h-5 text-white" />
                        </div>
                    </Link>
                    <h1 className="text-2xl font-bold flex items-center text-white">
                        <History className="w-6 h-6 mr-2 text-indigo-300" />
                        Audit Log
                    </h1>
                </div>

                {/* Search & Filter Controls */}
                <div className="flex gap-2 w-full md:w-auto">
                    <div className="relative w-full md:w-64">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-white/50" />
                        <Input
                            placeholder="Search Gem or Note..."
                            className="pl-9 bg-white/5 border-white/10 text-white placeholder:text-white/30 focus:bg-white/10"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <Select value={filterAction} onValueChange={setFilterAction}>
                        <SelectTrigger className="w-[140px] bg-white/5 border-white/10 text-white">
                            <SelectValue placeholder="Action" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="ALL">All Actions</SelectItem>
                            <SelectItem value="CREATE">Created</SelectItem>
                            <SelectItem value="UPDATE">Updated</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            <div className="glass-card rounded-xl overflow-hidden border border-white/10">
                <div className="glass-header p-4 border-b border-white/10 flex flex-row justify-between items-center">
                    <h3 className="text-sm uppercase text-white/70 tracking-wider font-semibold">
                        Running History ({filteredLogs.length})
                    </h3>
                </div>
                <div className="p-0">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-white/5 text-white/60 font-medium border-b border-white/10">
                                <tr>
                                    <th className="p-4">Time</th>
                                    <th className="p-4">User</th>
                                    <th className="p-4">Action</th>
                                    <th className="p-4">Change Details (Old &rarr; New)</th>
                                    <th className="p-4">Note</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {filteredLogs.map((log) => (
                                    <tr key={log.id} className="hover:bg-white/5 transition-colors">
                                        <td className="p-4 whitespace-nowrap text-white/70">
                                            {format(new Date(log.created_at), 'MMM d, h:mm a')}
                                        </td>
                                        <td className="p-4 text-white font-medium">
                                            {log.email?.split('@')[0]}
                                        </td>
                                        <td className="p-4">
                                            <Badge variant="outline" className={
                                                log.action_type === 'CREATE' ? 'text-emerald-300 bg-emerald-500/20 border-emerald-500/30' :
                                                    log.action_type === 'UPDATE' ? 'text-blue-300 bg-blue-500/20 border-blue-500/30' :
                                                        'text-slate-300 border-white/20'
                                            }>
                                                {log.action_type}
                                            </Badge>
                                            <div className="text-xs text-white/40 mt-1 font-medium">
                                                {log.inventory?.gem_type || (log.capital_investments ? 'Capital Investment' : 'Unknown Item')}
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            {log.action_type === 'CREATE' ? (
                                                <span className="text-white/40 italic">
                                                    {log.capital_investments ? `Invested Rs ${log.capital_investments.amount?.toLocaleString()}` : 'Created new item'}
                                                </span>
                                            ) : (
                                                <div className="flex flex-wrap items-center gap-2">
                                                    <span className="font-mono text-xs text-red-200 bg-red-500/20 px-1.5 py-0.5 rounded border border-red-500/30">
                                                        {typeof log.old_value === 'string' && log.old_value.length > 20
                                                            ? log.old_value.substring(0, 20) + '...'
                                                            : (log.old_value || '(empty)')}
                                                    </span>
                                                    <span className="text-white/30">&rarr;</span>
                                                    <span className="font-mono text-xs text-emerald-200 bg-emerald-500/20 px-1.5 py-0.5 rounded border border-emerald-500/30">
                                                        {typeof log.new_value === 'string' && log.new_value.length > 20
                                                            ? log.new_value.substring(0, 20) + '...'
                                                            : log.new_value}
                                                    </span>
                                                    <span className="text-xs text-white/40 ml-1">({log.field_changed})</span>
                                                </div>
                                            )}
                                        </td>
                                        <td className="p-4 text-white/60 italic max-w-xs truncate">
                                            {log.note}
                                        </td>
                                    </tr>
                                ))}
                                {filteredLogs.length === 0 && !loading && (
                                    <tr>
                                        <td colSpan={5} className="p-8 text-center text-white/40">
                                            No matches found.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    )
}
