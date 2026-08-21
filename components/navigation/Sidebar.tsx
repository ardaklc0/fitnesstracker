'use client'

import Link from 'next/link'
import React from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../../lib/supabaseClient'
import ThemeToggle from './ThemeToggle'

const items = [
    { href: '/', label: 'Dashboard' },
    { href: '/calendar', label: 'Calendar' },
    { href: '/programs', label: 'Programs' },
    { href: '/exercises', label: 'Exercises' },
    { href: '/history', label: 'History' },
    { href: '/progress', label: 'Progress' },
    { href: '/settings', label: 'Settings' }
]

export default function Sidebar() {
    const router = useRouter()

    async function handleSignOut() {
        await supabase.auth.signOut()
        router.replace('/login')
    }

    return (
        <aside className="hidden md:flex md:flex-col md:w-60 md:gap-4 md:pt-6 md:pb-6 md:px-4 bg-white border-r dark:border-slate-700 dark:bg-slate-900">
            <div className="mb-6 space-y-3 px-2">
                <Link href="/" className="text-lg font-semibold">Fitness Tracker</Link>
                <ThemeToggle />
            </div>
            <nav className="flex-1 px-2 space-y-1">
                {items.map((it) => (
                    <Link key={it.href} href={it.href} className="block rounded px-3 py-2 text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800">{it.label}</Link>
                ))}
            </nav>
            <div className="px-2">
                <button type="button" onClick={handleSignOut} className="text-sm text-slate-500 hover:underline">
                    Sign out
                </button>
            </div>
        </aside>
    )
}
