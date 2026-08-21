'use client'

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import { getWeeklyStatistics } from '../../lib/supabase/stats'

type Stats = Awaited<ReturnType<typeof getWeeklyStatistics>>

export default function StatsCards() {
    const [stats, setStats] = useState<Stats | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        setLoading(true)
        getWeeklyStatistics()
            .then((s) => setStats(s))
            .catch((err) => setError(err?.message ?? 'Failed to load stats'))
            .finally(() => setLoading(false))
    }, [])

    if (loading) return <div className="text-sm text-slate-500">Loading statistics...</div>
    if (error) return <div className="text-sm text-red-600">{error}</div>
    if (!stats) return <div className="text-sm text-slate-500">No statistics available.</div>

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
            <div className="bg-white border rounded p-4">
                <div className="text-xs text-slate-500">Workouts</div>
                <div className="text-2xl font-semibold">{stats.workoutsCompleted} / 3</div>
            </div>
            <div className="bg-white border rounded p-4">
                <div className="text-xs text-slate-500">Active Calories</div>
                <div className="text-2xl font-semibold">{stats.totalActiveCalories.toLocaleString()} kcal</div>
            </div>
            <div className="bg-white border rounded p-4">
                <div className="text-xs text-slate-500">Weight</div>
                <div className="text-2xl font-semibold">{stats.currentWeightKg ?? '-'} kg</div>
                <div className="text-sm text-slate-500">Weekly: {stats.weeklyWeightChange != null ? `${stats.weeklyWeightChange > 0 ? '+' : ''}${stats.weeklyWeightChange} kg` : '-'}</div>
            </div>
            <div className="bg-white border rounded p-4">
                <div className="text-xs text-slate-500">Training Volume</div>
                <div className="text-2xl font-semibold">{stats.trainingVolumeKg.toLocaleString()} kg</div>
            </div>
            <div className="bg-white border rounded p-4">
                <div className="text-xs text-slate-500">Total Sets</div>
                <div className="text-2xl font-semibold">{stats.totalSets}</div>
            </div>
            <div className="bg-white border rounded p-4">
                <div className="text-xs text-slate-500">Notes</div>
                {stats.latestNote ? (
                    <>
                        <div className="mt-1 text-sm text-slate-600 break-words">{stats.latestNote}</div>
                        {stats.latestNoteWorkoutId && (
                            <Link href={`/workout/${stats.latestNoteWorkoutId}`} className="mt-2 inline-block text-xs text-slate-700 hover:underline">
                                View workout
                            </Link>
                        )}
                    </>
                ) : (
                    <div className="mt-1 text-sm text-slate-600">No notes this week.</div>
                )}
            </div>
        </div>
    )
}
