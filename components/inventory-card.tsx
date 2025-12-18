"use client"

import { InventoryItem } from "@/types"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Edit, TrendingUp, Package, Eye, X } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogClose,
} from "@/components/ui/dialog"

import { useAuth } from "@/components/auth-provider"

interface InventoryCardProps {
    item: InventoryItem
    priority?: boolean
}

export function InventoryCard({ item, priority = false }: InventoryCardProps) {
    const { isAdmin } = useAuth()
    const totalValue = (item.weight_ct || 0) * (item.predict_val_per_ct_lkr || 0)
    const profit = totalValue - ((item.buying_price || 0) + (item.predict_total_cost_lkr || 0))
    const hasImage = item.image_urls && item.image_urls.length > 0
    const imageUrl = item.image_urls?.[0];

    return (
        <div className="glass-card rounded-xl p-4 transition-glass hover:scale-[1.02]">
            <div className="flex gap-4">
                {/* Image Section - Larger and more prominent */}
                <div className="flex-shrink-0">
                    {hasImage ? (
                        <div className="relative w-24 h-24 sm:w-32 sm:h-32 rounded-lg overflow-hidden ring-2 ring-white/30">
                            <Image
                                src={imageUrl!}
                                alt={item.gem_type || "Gem"}
                                fill
                                sizes="(max-width: 640px) 96px, 128px"
                                priority={priority}
                                className="object-cover"
                            />
                        </div>
                    ) : (
                        <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-lg bg-gradient-to-br from-purple-400/20 to-blue-400/20 flex items-center justify-center ring-2 ring-white/30">
                            <Package className="w-12 h-12 text-white/60" />
                        </div>
                    )}
                </div>

                {/* Content Section */}
                <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-2">
                        <div>
                            <h3 className="font-bold text-lg text-white truncate">
                                {item.gem_type}
                            </h3>
                            <p className="text-sm text-white/70">
                                {item.weight_ct} ct • {item.shape}
                            </p>
                        </div>
                        <Badge
                            variant={item.status === 'Sold' ? 'secondary' : 'default'}
                            className={item.status === 'Sold'
                                ? 'bg-gray-500/30 text-white border-white/20'
                                : 'bg-emerald-500/30 text-emerald-100 border-emerald-300/30'
                            }
                        >
                            {item.status}
                        </Badge>
                    </div>

                    {/* Value and Profit */}
                    <div className="grid grid-cols-2 gap-2 mb-3">
                        <div className="glass-dark rounded-lg p-2">
                            <p className="text-xs text-white/60">Value</p>
                            <p className="font-bold text-white gradient-text-blue">
                                Rs {totalValue.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                            </p>
                        </div>
                        <div className="glass-dark rounded-lg p-2">
                            <p className="text-xs text-white/60">Profit</p>
                            <p className={`font-bold ${profit >= 0 ? 'text-emerald-300' : 'text-red-300'}`}>
                                Rs {profit.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                            </p>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-2">
                        {/* VIEW Item Modal Button */}
                        <Dialog>
                            <DialogTrigger asChild>
                                <Button
                                    size="sm"
                                    className="flex-1 glass hover:glass-card text-white border-white/20 bg-white/5"
                                    variant="outline"
                                >
                                    <Eye className="w-3 h-3 h-full" />
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="glass-modal border-white/20 text-white max-w-4xl w-[95vw] overflow-y-auto max-h-[90vh] p-0 gap-0">
                                <DialogHeader className="p-6 border-b border-white/10 flex flex-row items-center justify-between sticky top-0 bg-[#2e1065]/80 backdrop-blur-xl z-10">
                                    <DialogTitle className="text-2xl font-bold flex items-center gap-3">
                                        <span className="text-white">
                                            {item.gem_type}
                                            <span className="text-base font-normal text-white/50 ml-2">L{String(item.lot_number || 0).padStart(3, '0')}</span>
                                        </span>
                                        <Badge
                                            className={item.status === 'Sold'
                                                ? 'bg-gray-500/30 text-white border-white/20 ml-2'
                                                : 'bg-emerald-500/30 text-emerald-100 border-emerald-300/30 ml-2'
                                            }
                                        >
                                            {item.status}
                                        </Badge>
                                    </DialogTitle>
                                    {/* Accessibility Requirement */}
                                    <p className="sr-only">Detailed view of {item.gem_type} including weight, shape, treatment, and financial information.</p>
                                </DialogHeader>

                                <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-8">
                                    {/* Modal Image Section */}
                                    <div className="flex flex-col gap-4">
                                        <div className="relative aspect-square w-full rounded-2xl overflow-hidden glass-dark ring-1 ring-white/10 shadow-2xl">
                                            {hasImage ? (
                                                <Image
                                                    src={imageUrl!}
                                                    alt={item.gem_type || "Gem"}
                                                    fill
                                                    className="object-cover"
                                                    sizes="(max-width: 768px) 100vw, 500px"
                                                    priority
                                                />
                                            ) : (
                                                <div className="w-full h-full bg-gradient-to-br from-purple-400/20 to-blue-400/20 flex items-center justify-center">
                                                    <Package className="w-24 h-24 text-white/30" />
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Modal Details Section */}
                                    <div className="space-y-6">
                                        <div className="grid grid-cols-2 gap-x-4 gap-y-6">
                                            <div>
                                                <p className="text-white/40 text-xs uppercase tracking-wider mb-1">Weight</p>
                                                <p className="text-2xl font-bold text-white">{item.weight_ct} <span className="text-lg font-normal text-white/50">ct</span></p>
                                            </div>
                                            <div>
                                                <p className="text-white/40 text-xs uppercase tracking-wider mb-1">Shape</p>
                                                <p className="text-xl font-medium text-white">{item.shape}</p>
                                            </div>
                                            <div>
                                                <p className="text-white/40 text-xs uppercase tracking-wider mb-1">Treatment</p>
                                                <p className="text-lg text-white">{item.treatment}</p>
                                            </div>
                                            <div>
                                                <p className="text-white/40 text-xs uppercase tracking-wider mb-1">Clarity</p>
                                                <p className="text-lg text-white">{item.clarity}</p>
                                            </div>
                                            <div>
                                                <p className="text-white/40 text-xs uppercase tracking-wider mb-1">Color</p>
                                                <p className="text-lg text-white">{item.color || '-'}</p>
                                            </div>
                                            <div>
                                                <p className="text-white/40 text-xs uppercase tracking-wider mb-1">Pieces</p>
                                                <p className="text-lg text-white">{item.number_of_pieces}</p>
                                            </div>
                                        </div>

                                        <div className="h-px bg-white/10 my-4" />

                                        <div className="space-y-4">
                                            <h3 className="font-semibold text-white/90">Financials</h3>
                                            <div className="glass-dark rounded-xl p-4 border border-white/5 space-y-3">
                                                <div className="flex justify-between items-center">
                                                    <span className="text-white/60 text-sm">Value / Ct</span>
                                                    <span className="text-white font-mono">Rs {(item.predict_val_per_ct_lkr || 0).toLocaleString()}</span>
                                                </div>
                                                <div className="flex justify-between items-center">
                                                    <span className="text-white/60 text-sm">Processing Expenses</span>
                                                    <span className="text-white font-mono">Rs {((item.buying_price || 0) + (item.predict_total_cost_lkr || 0)).toLocaleString()}</span>
                                                </div>
                                                <div className="h-px bg-white/10" />
                                                <div className="flex justify-between items-center">
                                                    <span className="text-emerald-300 font-medium">Estimated Profit</span>
                                                    <span className="text-emerald-300 font-bold text-lg">Rs {profit.toLocaleString()}</span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="pt-4 flex justify-end">
                                            {isAdmin && (
                                                <Link href={`/edit/${item.id}`} className="w-full">
                                                    <Button className="w-full bg-white text-indigo-950 font-bold hover:bg-white/90">
                                                        <Edit className="w-4 h-4 mr-2" />
                                                        Edit Full Details
                                                    </Button>
                                                </Link>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </DialogContent>
                        </Dialog>

                        {isAdmin && (
                            <Link href={`/edit/${item.id}`} className="flex-[3]">
                                <Button
                                    size="sm"
                                    className="w-full glass hover:glass-card text-white border-white/20"
                                    variant="outline"
                                >
                                    <Edit className="w-3 h-3 mr-1" />
                                    Edit
                                </Button>
                            </Link>
                        )}
                    </div>
                </div>
            </div>

            {/* Additional Info - Expandable on mobile */}
            <div className="mt-3 pt-3 border-t border-white/10 grid grid-cols-4 gap-2 text-xs">
                <div>
                    <p className="text-white/50">Lot</p>
                    <p className="text-white font-medium">
                        L{String(item.lot_number || 0).padStart(3, '0')}
                    </p>
                </div>
                <div>
                    <p className="text-white/50">Treatment</p>
                    <p className="text-white font-medium truncate" title={item.treatment}>{item.treatment}</p>
                </div>
                <div>
                    <p className="text-white/50">Clarity</p>
                    <p className="text-white font-medium truncate" title={item.clarity}>{item.clarity}</p>
                </div>
                <div>
                    <p className="text-white/50">Pieces</p>
                    <p className="text-white font-medium">{item.number_of_pieces}</p>
                </div>
            </div>
        </div>
    )
}
