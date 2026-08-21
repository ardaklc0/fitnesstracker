import Link from 'next/link'
import React from 'react'

const items = [
    { href: '/', label: 'Home', icon: 'home' },
    { href: '/calendar', label: 'Calendar', icon: 'calendar' },
    { href: '/programs', label: 'Programs', icon: 'list' },
    { href: '/progress', label: 'Progress', icon: 'chart' }
]

function Icon({ name }: { name: string }) {
    switch (name) {
        case 'home':
            return (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M3 11.5L12 4l9 7.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M5 21V12h14v9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
            )
        case 'calendar':
            return (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <rect x="3" y="5" width="18" height="16" rx="2" stroke="currentColor" strokeWidth="1.5" />
                    <path d="M16 3v4M8 3v4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
            )
        default:
            return (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.5" />
                </svg>
            )
    }
}

export default function MobileNav() {
    return (
        <nav className="fixed bottom-0 left-0 right-0 block md:hidden bg-white border-t">
            <div className="max-w-4xl mx-auto flex justify-center overflow-x-auto px-2 py-2">
                {items.map((it) => (
                    <Link key={it.href} href={it.href} className="flex min-w-[72px] flex-1 shrink-0 flex-col items-center justify-center text-xs text-slate-700 px-2 py-1">
                        <span className="flex h-5 w-5 items-center justify-center">
                            <Icon name={it.icon} />
                        </span>
                        <span className="mt-1">{it.label}</span>
                    </Link>
                ))}
            </div>
        </nav>
    )
}
