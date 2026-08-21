'use client'

import React, { useEffect, useState } from 'react'

type Day = {
    date: string
    weekday: number
    program: string | null
    completed: boolean
}

export default function WeekOverview() {
    const [days, setDays] = useState<Day[] | null>(null)
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        setLoading(true)
        fetch(`/api/week?start=${getLocalDate()}`, { cache: 'no-store' })
            .then((r) => r.json())
            .then((data) => {
                setDays(data.days)
            })
            .catch(() => setDays(null))
            .finally(() => setLoading(false))
    }, [])

    if (loading || !days) {
        return <div className="text-sm text-slate-500">Loading week...</div>
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-7 gap-3">
            {days.map((d) => (
                <div key={d.date} className="bg-white border rounded p-3 text-sm">
                    <div className="font-medium">{formatWeekday(d.weekday)}</div>
                    <div className="mt-2 text-slate-500 text-xs">{d.program ?? 'No workout'}</div>
                    <div className="mt-2 text-xs">
                        {d.program ? (d.completed ? <span className="text-green-600">Completed</span> : <span className="text-amber-600">Not completed</span>) : null}
                    </div>
                </div>
            ))}
        </div>
    )
}

function getLocalDate() {
    const now = new Date()
    const offset = now.getTimezoneOffset()
    const localDate = new Date(now.getTime() - offset * 60 * 1000)
    return localDate.toISOString().slice(0, 10)
}

function formatWeekday(weekday: number) {
    const names = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
    return names[weekday - 1] ?? 'Day'
}
