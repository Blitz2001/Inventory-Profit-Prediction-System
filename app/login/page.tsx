"use client"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Lock, Mail, Loader2, Gem } from 'lucide-react'

export default function LoginPage() {
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [isSignUp, setIsSignUp] = useState(false)

    const handleAuth = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)

        try {
            if (isSignUp) {
                const { error } = await supabase.auth.signUp({
                    email,
                    password,
                    options: {
                        emailRedirectTo: window.location.origin,
                    }
                })
                if (error) throw error
                alert('Check your email for the confirmation link!')
            } else {
                const { error } = await supabase.auth.signInWithPassword({
                    email,
                    password,
                })
                if (error) throw error
                router.push('/')
                router.refresh()
            }
        } catch (error: any) {
            alert(error.message)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen flex flex-col items-center justify-center p-4">
            {/* Animated Logo/Icon */}
            <div className="mb-8 relative group">
                <div className="absolute inset-0 bg-indigo-500 blur-xl opacity-50 group-hover:opacity-75 transition-opacity duration-1000 animate-pulse"></div>
                <div className="glass-card p-4 rounded-2xl relative border-white/20">
                    <Gem className="w-12 h-12 text-white drop-shadow-[0_0_15px_rgba(255,255,255,0.5)]" />
                </div>
            </div>

            <div className="glass-card w-full max-w-md rounded-2xl border border-white/10 overflow-hidden shadow-2xl shadow-indigo-500/10">
                <div className="p-8 pb-6 text-center space-y-2">
                    <h1 className="text-2xl font-bold text-white tracking-tight">
                        {isSignUp ? 'Create Account' : 'Welcome Back'}
                    </h1>
                    <p className="text-sm text-white/50">
                        {isSignUp ? 'Enter your details to get started' : 'Sign in to access your inventory'}
                    </p>
                </div>

                <div className="p-8 pt-0">
                    <form onSubmit={handleAuth} className="space-y-6">
                        <div className="space-y-2">
                            <Label htmlFor="email" className="text-white/70">Email Address</Label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-3 h-4 w-4 text-white/40" />
                                <Input
                                    id="email"
                                    placeholder="name@example.com"
                                    type="email"
                                    className="pl-10 h-11 bg-white/5 border-white/10 text-white placeholder:text-white/20 focus:bg-white/10 focus:border-indigo-500/50 transition-all"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="password" className="text-white/70">Password</Label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-3 h-4 w-4 text-white/40" />
                                <Input
                                    id="password"
                                    type="password"
                                    className="pl-10 h-11 bg-white/5 border-white/10 text-white placeholder:text-white/20 focus:bg-white/10 focus:border-indigo-500/50 transition-all"
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                />
                            </div>
                        </div>

                        <Button
                            className="w-full h-11 bg-white text-indigo-950 hover:bg-white/90 font-bold shadow-lg shadow-indigo-500/20 transition-all hover:scale-[1.02]"
                            type="submit"
                            disabled={loading}
                        >
                            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            {isSignUp ? 'Sign Up' : 'Sign In'}
                        </Button>
                    </form>

                    <div className="mt-8 text-center">
                        <Button
                            variant="link"
                            className="text-white/40 hover:text-white text-xs"
                            onClick={() => setIsSignUp(!isSignUp)}
                        >
                            {isSignUp ? 'Already have an account? Sign In' : "Don't have an account? Sign Up"}
                        </Button>
                    </div>
                </div>
            </div>

            {/* Footer Text */}
            <div className="mt-8 text-center text-white/20 text-xs">
                © 2024 Gem Tracker ERP. Secure & Encrypted.
            </div>
        </div>
    )
}
