'use client'

import React, { useEffect, useState } from 'react'
import { DayPicker } from 'react-day-picker'
import Link from 'next/link'
import { supabase } from '../../lib/supabaseClient'
import WeekOverview from '../../components/dashboard/WeekOverview'

export default function CalendarPage() {
    const [month, setMonth] = useState(new Date())
    const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date())
    const [workouts, setWorkouts] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        let active = true
        const monthStart = formatDate(new Date(month.getFullYear(), month.getMonth(), 1))
        const monthEnd = formatDate(new Date(month.getFullYear(), month.getMonth() + 1, 0))

        async function loadWorkouts() {
            setLoading(true)
            const { data, error: fetchError } = await supabase
                .from('workouts')
                .select('id,date,status,programs(name)')
                .gte('date', monthStart)
                .lte('date', monthEnd)
                .order('date', { ascending: true })

            if (!active) return
            if (fetchError) setError(fetchError.message)
            else setWorkouts(data ?? [])
            setLoading(false)
        }

        loadWorkouts()
        return () => {
            active = false
        }
    }, [month])

    const completedDates = workouts
        .filter((workout) => workout.status === 'completed')
        .map((workout) => parseDate(workout.date))
    const activeDates = workouts
        .filter((workout) => workout.status !== 'completed')
        .map((workout) => parseDate(workout.date))
    const selectedWorkouts = selectedDate
        ? workouts.filter((workout) => workout.date === formatDate(selectedDate))
        : []
    const groupedWorkouts = groupWorkouts(selectedWorkouts)

    return (
        <div>
            <h1 className="text-2xl font-semibold mb-4">Calendar</h1>
            <div className="bg-white border rounded p-3 sm:p-4 mb-6 w-full overflow-hidden">
                <DayPicker
                    mode="single"
                    month={month}
                    onMonthChange={setMonth}
                    selected={selectedDate}
                    onSelect={setSelectedDate}
                    showOutsideDays
                    modifiers={{ completed: completedDates, active: activeDates }}
                    modifiersClassNames={{
                        completed: 'bg-emerald-100 text-emerald-900 font-semibold',
                        active: 'bg-amber-100 text-amber-900'
                    }}
                    classNames={{
                        caption: 'flex justify-between items-center px-2 mb-3',
                        caption_label: 'font-semibold',
                        nav: 'flex gap-1',
                        nav_button: 'border rounded px-2 py-1 hover:bg-slate-100',
                        table: 'w-full border-collapse',
                        head_cell: 'text-xs font-medium text-slate-500 p-2',
                        cell: 'p-1 text-center',
                        day: 'w-8 h-8 sm:w-10 sm:h-10 rounded hover:bg-slate-100',
                        day_selected: 'bg-slate-900 text-white hover:bg-slate-800',
                        day_today: 'border border-slate-900',
                        day_outside: 'text-slate-300'
                    }}
                />
                <div className="flex gap-4 text-xs text-slate-600 mt-3">
                    <span><span className="inline-block w-3 h-3 rounded bg-emerald-100 mr-1" />Completed</span>
                    <span><span className="inline-block w-3 h-3 rounded bg-amber-100 mr-1" />In progress</span>
                </div>
            </div>

            <section className="mb-6">
                <h2 className="text-lg font-medium mb-2">
                    {selectedDate ? selectedDate.toLocaleDateString() : 'Selected day'}
                </h2>
                {loading && <div className="text-sm text-slate-500">Loading workouts...</div>}
                {error && <div className="text-sm text-red-600">{error}</div>}
                {!loading && !error && selectedWorkouts.length === 0 && (
                    <div className="text-sm text-slate-500">No workouts on this day.</div>
                )}
                <ul className="space-y-2">
                    {groupedWorkouts.map((workout) => (
                        <li key={`${workout.name}-${workout.status}`} className="bg-white border rounded p-3 flex items-center justify-between gap-3">
                            <div>
                                <div className="font-medium">{workout.name}</div>
                                <div className="text-sm text-slate-500">
                                    {workout.count === 1 ? '1 workout' : `${workout.count} workouts`}
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <span className={`text-sm px-2 py-1 rounded ${statusClasses(workout.status)}`}>
                                    {statusLabel(workout.status)}
                                </span>
                                <Link href={`/workout/${workout.latestId}`} className="text-sm text-slate-700 hover:underline">
                                    Open
                                </Link>
                            </div>
                        </li>
                    ))}
                </ul>
            </section>

            <h2 className="text-lg font-medium mb-2">Current Week</h2>
            <WeekOverview />
        </div>
    )
}

function formatDate(date: Date) {
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
}

function parseDate(value: string) {
    const [year, month, day] = value.split('-').map(Number)
    return new Date(year, month - 1, day)
}

function groupWorkouts(workouts: any[]) {
    const groups = new Map<string, { name: string; status: string; count: number; latestId: string }>()

    workouts.forEach((workout) => {
        const name = workout.programs?.name ?? 'Workout'
        const key = `${name}-${workout.status}`
        const current = groups.get(key)
        groups.set(key, {
            name,
            status: workout.status,
            count: (current?.count ?? 0) + 1,
            latestId: workout.id
        })
    })

    return Array.from(groups.values())
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
