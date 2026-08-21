import Link from 'next/link'
import React from 'react'

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
    return (
        <aside className="hidden md:flex md:flex-col md:w-60 md:gap-4 md:pt-6 md:pb-6 md:px-4 bg-white border-r">
            <div className="mb-6 px-2">
                <Link href="/" className="text-lg font-semibold">Fitness Tracker</Link>
            </div>
            <nav className="flex-1 px-2 space-y-1">
                {items.map((it) => (
                    <Link key={it.href} href={it.href} className="block rounded px-3 py-2 text-slate-700 hover:bg-slate-100">{it.label}</Link>
                ))}
            </nav>
            <div className="px-2">
                <Link href="/login" className="block text-sm text-slate-500 hover:underline">Sign in / out</Link>
            </div>
        </aside>
    )
}
