import React from 'react'
import Link from 'next/link'

export const metadata = {
    title: 'Auth - Fitness Tracker'
}

export default function AuthLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
            <div className="w-full max-w-md bg-white rounded-lg shadow-sm p-6">
                <header className="mb-4">
                    <Link href="/" className="text-xl font-semibold">Fitness Tracker</Link>
                </header>
                {children}
            </div>
        </div>
    )
}
