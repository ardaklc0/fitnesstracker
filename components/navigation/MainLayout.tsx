'use client'

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { supabase } from '../../lib/supabaseClient'
import Sidebar from './Sidebar'
import MobileNav from './MobileNav'

export default function MainLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname()
    const router = useRouter()
    const isAuthPage = pathname === '/login' || pathname === '/register'
    const [ready, setReady] = useState(false)
    const [menuOpen, setMenuOpen] = useState(false)

    useEffect(() => {
        setMenuOpen(false)
    }, [pathname])

    useEffect(() => {
        if (isAuthPage) {
            setReady(true)
            return
        }

        let active = true
        setReady(false)

        async function checkSession() {
            const { data } = await supabase.auth.getSession()
            if (!active) return
            if (!data.session) {
                router.replace('/login')
                return
            }
            setReady(true)
        }

        checkSession()
        const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
            if (!session) router.replace('/login')
        })

        return () => {
            active = false
            listener.subscription.unsubscribe()
        }
    }, [isAuthPage, router])

    if (isAuthPage) return <>{children}</>
    if (!ready) return <div className="min-h-screen grid place-items-center text-sm text-slate-500">Checking your session...</div>

    return (
        <div className="min-h-screen flex bg-slate-50">
            <Sidebar />
            <div className="flex-1 min-h-screen min-w-0">
                <div className="md:hidden sticky top-0 z-30 flex items-center justify-between border-b bg-white px-4 py-3">
                    <Link href="/" className="font-semibold">Fitness Tracker</Link>
                    <button
                        type="button"
                        aria-label={menuOpen ? 'Close menu' : 'Open menu'}
                        aria-expanded={menuOpen}
                        onClick={() => setMenuOpen((open) => !open)}
                        className="flex h-10 w-10 flex-col items-center justify-center rounded border p-2 text-slate-700"
                    >
                        <span className="sr-only">{menuOpen ? 'Close menu' : 'Open menu'}</span>
                        <span className="block w-5 border-t-2" />
                        <span className="mt-1 block w-5 border-t-2" />
                        <span className="mt-1 block w-5 border-t-2" />
                    </button>
                    {menuOpen && (
                        <>
                            <button
                                type="button"
                                aria-label="Close menu overlay"
                                onClick={() => setMenuOpen(false)}
                                className="fixed inset-0 top-[57px] bg-slate-900/20"
                            />
                            <nav className="absolute right-4 top-14 z-40 w-56 rounded border bg-white p-2 shadow-lg">
                                {[
                                    ['/', 'Dashboard'],
                                    ['/calendar', 'Calendar'],
                                    ['/programs', 'Programs'],
                                    ['/exercises', 'Exercises'],
                                    ['/history', 'History'],
                                    ['/progress', 'Progress'],
                                    ['/settings', 'Settings']
                                ].map(([href, label]) => (
                                    <Link key={href} href={href} className="block rounded px-3 py-2 text-slate-700 hover:bg-slate-100">
                                        {label}
                                    </Link>
                                ))}
                            </nav>
                        </>
                    )}
                </div>
                <div className="max-w-5xl mx-auto p-4 pb-24 md:p-6 md:pb-6">
                    {children}
                </div>
            </div>
            <MobileNav />
        </div>
    )
}
