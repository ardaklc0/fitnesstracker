'use client'

import React, { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabaseClient'
import Link from 'next/link'

export default function HistoryPage() {
    const [workouts, setWorkouts] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [deletingId, setDeletingId] = useState<string | null>(null)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        let active = true

        async function loadHistory() {
            setLoading(true)
            const res = await supabase
                .from('workouts')
                .select('id,date,program_id,programs(name),status')
                .order('date', { ascending: false })

            if (!active) return
            if (res.error) setError(res.error.message)
            else setWorkouts(res.data ?? [])
            setLoading(false)
        }

        loadHistory()
        return () => {
            active = false
        }
    }, [])

    async function handleDelete(workoutId: string) {
        if (!window.confirm('Delete this workout?')) return

        setDeletingId(workoutId)
        setError(null)
        const { error: deleteError } = await supabase.from('workouts').delete().eq('id', workoutId)
        if (deleteError) {
            setError(deleteError.message)
        } else {
            setWorkouts((current) => current.filter((workout) => workout.id !== workoutId))
        }
        setDeletingId(null)
    }

    if (loading) return <div className="text-sm text-slate-500">Loading history...</div>
    if (error) return <div className="text-sm text-red-600">{error}</div>

    return (
        <div>
            <h1 className="text-2xl font-semibold mb-4">Workout History</h1>
            {workouts.length === 0 ? (
                <div className="text-sm text-slate-500">No workouts yet.</div>
            ) : (
                <ul className="space-y-3">
                    {workouts.map((w) => (
                        <li key={w.id} className="bg-white border rounded p-4 flex items-center justify-between">
                            <div>
                                <div className="font-medium">{w.programs?.name ?? 'Program'}</div>
                                <div className="text-sm text-slate-500">{new Date(w.date).toLocaleDateString()}</div>
                            </div>
                            <div className="flex gap-2">
                                <span className={`text-sm px-2 py-1 rounded ${statusClasses(w.status)}`}>
                                    {statusLabel(w.status)}
                                </span>
                                <Link href={`/workout/${w.id}`} className="text-sm px-3 py-2 border rounded">View</Link>
                                <button
                                    type="button"
                                    onClick={() => handleDelete(w.id)}
                                    disabled={deletingId === w.id}
                                    className="text-sm px-3 py-2 border border-red-200 text-red-600 rounded disabled:opacity-50"
                                >
                                    {deletingId === w.id ? 'Deleting...' : 'Delete'}
                                </button>
                            </div>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    )
}

function statusLabel(status: string) {
    if (status === 'completed') return 'Completed'
    if (status === 'in_progress') return 'In progress'
    if (status === 'planned') return 'Planned'
    return status
}

function statusClasses(status: string) {
    if (status === 'completed') return 'bg-emerald-100 text-emerald-800'
    if (status === 'in_progress') return 'bg-amber-100 text-amber-800'
    return 'bg-slate-100 text-slate-700'
}
