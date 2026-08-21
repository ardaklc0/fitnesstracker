'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../../../lib/supabaseClient'

export default function RegisterPage() {
    const router = useRouter()
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault()
        setLoading(true)
        setError(null)
        try {
            const res = await supabase.auth.signUp({ email, password })
            if (res.error) {
                setError(res.error.message)
            } else {
                // On successful sign up, redirect to dashboard (email confirmation may be required)
                router.push('/')
            }
        } catch (err: any) {
            setError(err?.message ?? 'An error occurred')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div>
            <h2 className="text-2xl font-semibold mb-4">Create Account</h2>
            {error && <div className="text-sm text-red-600 mb-2">{error}</div>}
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-sm mb-1">Email</label>
                    <input
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        type="email"
                        required
                        className="w-full border rounded px-3 py-2"
                    />
                </div>
                <div>
                    <label className="block text-sm mb-1">Password</label>
                    <input
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        type="password"
                        required
                        minLength={6}
                        className="w-full border rounded px-3 py-2"
                    />
                </div>
                <div className="flex items-center justify-between">
                    <button
                        type="submit"
                        className="bg-slate-900 text-white px-4 py-2 rounded disabled:opacity-50"
                        disabled={loading}
                    >
                        {loading ? 'Creating...' : 'Create account'}
                    </button>
                    <a href="/login" className="text-sm text-slate-600 hover:underline">
                        Already have an account?
                    </a>
                </div>
            </form>
        </div>
    )
}
