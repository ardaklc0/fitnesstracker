'use client'

import React, { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabaseClient'

export default function CaloriesPage() {
    const [date, setDate] = useState('')
    const [calories, setCalories] = useState('')
    const [entries, setEntries] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    async function load() {
        setLoading(true)
        const { data, error } = await supabase.from('calorie_logs').select('*').order('date', { ascending: false }).limit(50)
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
        const c = parseInt(calories)
        if (Number.isNaN(c) || c < 0) {
            setError('Enter valid calories')
            return
        }
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
            setError('You must be signed in to save calories')
            return
        }
        const { error } = await supabase.from('calorie_logs').insert([{ user_id: user.id, date, active_calories: c }])
        if (error) setError(error.message)
        else {
            setCalories('')
            load()
        }
    }

    return (
        <div>
            <h1 className="text-2xl font-semibold mb-4">Active Calories</h1>
            <form onSubmit={handleSave} className="mb-6 space-y-3">
                {error && <div className="text-sm text-red-600">{error}</div>}
                <div className="flex flex-col sm:flex-row gap-2">
                    <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="border rounded p-2 w-full sm:w-auto" />
                    <input type="number" step="1" placeholder="kcal" value={calories} onChange={(e) => setCalories(e.target.value)} className="border rounded p-2 w-full sm:w-32" />
                    <button className="bg-slate-900 text-white px-4 py-2 rounded w-full sm:w-auto">Save</button>
                </div>
            </form>

            <h2 className="text-lg font-medium mb-2">Recent</h2>
            {loading ? (
                <div className="text-sm text-slate-500">Loading...</div>
            ) : entries.length === 0 ? (
                <div className="text-sm text-slate-500">No calorie entries yet.</div>
            ) : (
                <ul className="space-y-2">
                    {entries.map((e) => (
                        <li key={e.id} className="bg-white border rounded p-3 flex justify-between">
                            <div>
                                <div className="font-medium">{new Date(e.date).toLocaleDateString()}</div>
                                <div className="text-sm text-slate-500">{e.active_calories} kcal</div>
                            </div>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    )
}
