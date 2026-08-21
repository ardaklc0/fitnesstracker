'use client'

import React, { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabaseClient'

export default function WeightPage() {
    const [date, setDate] = useState('')
    const [weight, setWeight] = useState('')
    const [entries, setEntries] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [deletingId, setDeletingId] = useState<string | null>(null)
    const [error, setError] = useState<string | null>(null)

    async function load() {
        setLoading(true)
        const { data, error } = await supabase.from('weight_logs').select('*').order('date', { ascending: false }).limit(50)
        if (error) setError(error.message)
        else setEntries(data ?? [])
        setLoading(false)
    }

    useEffect(() => {
        setDate(new Date().toISOString().slice(0, 10))
        load()
    }, [])

    async function handleSave(e: React.FormEvent) {
        e.preventDefault()
        setError(null)
        const w = parseFloat(weight)
        if (Number.isNaN(w) || w <= 0) {
            setError('Enter a valid weight')
            return
        }
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
            setError('You must be signed in to save your weight')
            return
        }
        const { error } = await supabase.from('weight_logs').insert([{ user_id: user.id, date, weight_kg: w }])
        if (error) setError(error.message)
        else {
            setWeight('')
            load()
        }
    }

    async function handleDelete(entryId: string) {
        if (!window.confirm('Delete this weight record?')) return

        setDeletingId(entryId)
        setError(null)
        const { error: deleteError } = await supabase.from('weight_logs').delete().eq('id', entryId)
        if (deleteError) {
            setError(deleteError.message)
        } else {
            setEntries((current) => current.filter((entry) => entry.id !== entryId))
        }
        setDeletingId(null)
    }

    return (
        <div>
            <h1 className="text-2xl font-semibold mb-4">Body Weight</h1>
            <form onSubmit={handleSave} className="mb-6 space-y-3">
                {error && <div className="text-sm text-red-600">{error}</div>}
                <div className="flex flex-col sm:flex-row gap-2">
                    <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="border rounded p-2 w-full sm:w-auto" />
                    <input type="number" step="0.1" placeholder="kg" value={weight} onChange={(e) => setWeight(e.target.value)} className="border rounded p-2 w-full sm:w-32" />
                    <button className="bg-slate-900 text-white px-4 py-2 rounded w-full sm:w-auto">Save</button>
                </div>
            </form>

            <h2 className="text-lg font-medium mb-2">Recent</h2>
            {loading ? (
                <div className="text-sm text-slate-500">Loading...</div>
            ) : entries.length === 0 ? (
                <div className="text-sm text-slate-500">No weight entries yet.</div>
            ) : (
                <ul className="space-y-2">
                    {entries.map((e) => (
                        <li key={e.id} className="bg-white border rounded p-3 flex justify-between items-center gap-3">
                            <div>
                                <div className="font-medium">{new Date(e.date).toLocaleDateString()}</div>
                                <div className="text-sm text-slate-500">{e.weight_kg} kg</div>
                            </div>
                            <button
                                type="button"
                                onClick={() => handleDelete(e.id)}
                                disabled={deletingId === e.id}
                                className="text-sm px-3 py-2 border border-red-200 text-red-600 rounded disabled:opacity-50"
                            >
                                {deletingId === e.id ? 'Deleting...' : 'Delete'}
                            </button>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    )
}
