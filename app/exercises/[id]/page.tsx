'use client'

import React, { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { supabase } from '../../../lib/supabaseClient'
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    Tooltip,
    ResponsiveContainer,
    BarChart,
    Bar,
    CartesianGrid
} from 'recharts'

export default function ExerciseDetailPage() {
    const params = useParams()
    const id = params?.id
    const [name, setName] = useState('')
    const [loading, setLoading] = useState(true)
    const [dataPoints, setDataPoints] = useState<any[]>([])
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        if (!id) return
        setLoading(true)
            ; (async () => {
                try {
                    const { data: ex } = await supabase.from('exercises').select('id,name').eq('id', id).single()
                    setName(ex?.name ?? '')

                    const { data: wes } = await supabase.from('workout_exercises').select('id,workout_id').eq('exercise_id', id)
                    const weIds = (wes ?? []).map((w: any) => w.id)
                    const workoutIds = Array.from(new Set((wes ?? []).map((w: any) => w.workout_id)))

                    if (weIds.length === 0) {
                        setDataPoints([])
                        setLoading(false)
                        return
                    }

                    const { data: sets } = await supabase.from('sets').select('id,weight_kg,reps,workout_exercise_id').in('workout_exercise_id', weIds)
                    const { data: workouts } = await supabase.from('workouts').select('id,date').in('id', workoutIds).order('date', { ascending: true })

                    // Map workout id to date
                    const workoutDateMap: Record<string, string> = {}
                    for (const workout of workouts ?? []) {
                        workoutDateMap[workout.id] = workout.date
                    }

                    // Aggregate per workout date
                    const perDate: Record<string, { maxWeight: number; volume: number; totalSets: number }> = {}
                    for (const set of sets ?? []) {
                        const workoutExercise = (wes ?? []).find((item: any) => item.id === set.workout_exercise_id)
                        if (!workoutExercise) continue
                        const date = workoutDateMap[workoutExercise.workout_id]
                        if (!date) continue
                        const weight = parseFloat(set.weight_kg ?? 0)
                        const reps = parseInt(set.reps ?? 0)
                        if (!perDate[date]) perDate[date] = { maxWeight: 0, volume: 0, totalSets: 0 }
                        perDate[date].maxWeight = Math.max(perDate[date].maxWeight, weight)
                        perDate[date].volume += weight * reps
                        perDate[date].totalSets += 1
                    }

                    const points = Object.keys(perDate)
                        .sort()
                        .map((d) => ({ date: d, maxWeight: perDate[d].maxWeight, volume: perDate[d].volume, sets: perDate[d].totalSets }))

                    setDataPoints(points)
                } catch (err: any) {
                    setError(err?.message ?? 'Failed to load exercise history')
                } finally {
                    setLoading(false)
                }
            })()
    }, [id])

    if (loading) return <div className="text-sm text-slate-500">Loading exercise...</div>
    if (error) return <div className="text-sm text-red-600">{error}</div>

    return (
        <div>
            <h1 className="text-2xl font-semibold mb-4">{name}</h1>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white border rounded p-4">
                    <div className="text-sm text-slate-500 mb-2">Max weight over time</div>
                    {dataPoints.length === 0 ? (
                        <div className="text-sm text-slate-500">No history yet.</div>
                    ) : (
                        <ResponsiveContainer width="100%" height={250}>
                            <LineChart data={dataPoints}>
                                <XAxis dataKey="date" />
                                <YAxis />
                                <Tooltip />
                                <Line type="monotone" dataKey="maxWeight" stroke="#1f2937" />
                            </LineChart>
                        </ResponsiveContainer>
                    )}
                </div>

                <div className="bg-white border rounded p-4">
                    <div className="text-sm text-slate-500 mb-2">Volume per workout</div>
                    {dataPoints.length === 0 ? (
                        <div className="text-sm text-slate-500">No history yet.</div>
                    ) : (
                        <ResponsiveContainer width="100%" height={250}>
                            <BarChart data={dataPoints}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="date" />
                                <YAxis />
                                <Tooltip />
                                <Bar dataKey="volume" fill="#2563eb" />
                            </BarChart>
                        </ResponsiveContainer>
                    )}
                </div>
            </div>
        </div>
    )
}
