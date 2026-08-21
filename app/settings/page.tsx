'use client'

import { useRouter } from 'next/navigation'
import { supabase } from '../../lib/supabaseClient'

export default function SettingsPage() {
    const router = useRouter()

    async function handleSignOut() {
        await supabase.auth.signOut()
        router.replace('/login')
    }

    return (
        <div>
            <h1 className="text-2xl font-semibold mb-4">Settings</h1>
            <button onClick={handleSignOut} className="bg-slate-900 text-white px-4 py-2 rounded">
                Sign out
            </button>
        </div>
    )
}
