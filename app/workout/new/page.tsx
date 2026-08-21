'use client'

import React, { useEffect, useState } from 'react'
import { supabase } from '../../../lib/supabaseClient'
import { createWorkoutFromProgram } from '../../../lib/supabase/workouts'
import { useRouter } from 'next/navigation'

export default function NewWorkoutPage() {
    const [programs, setPrograms] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const router = useRouter()

    useEffect(() => {
        let active = true

        async function loadPrograms() {
            setLoading(true)
            const res = await supabase.from('programs').select('id,name')
            if (!active) return
            if (res.error) setError(res.error.message)
            else setPrograms(res.data ?? [])
            setLoading(false)
        }

        loadPrograms()
        return () => {
            active = false
        }
    }, [])

    async function handleStart(programId: string) {
        setError(null)
        try {
            const id = await createWorkoutFromProgram(programId)
            router.push(`/workout/${id}`)
        } catch (err: any) {
            setError(err?.message ?? 'Failed to start workout')
        }
    }

    if (loading) return <div className="text-sm text-slate-500">Loading programs...</div>

    return (
        <div>
            <h1 className="text-2xl font-semibold mb-4">Start Workout</h1>
            {error && <div className="text-sm text-red-600 mb-2">{error}</div>}
            <div className="space-y-3">
                {programs.map((p) => (
                    <div key={p.id} className="bg-white border rounded p-4 flex items-center justify-between">
                        <div>{p.name}</div>
                        <button className="bg-slate-900 text-white px-4 py-2 rounded" onClick={() => handleStart(p.id)}>
                            Start
                        </button>
                    </div>
                ))}
            </div>
        </div>
    )
}
