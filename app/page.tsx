import React from 'react'
import WeekOverview from '../components/dashboard/WeekOverview'
import StatsCards from '../components/dashboard/StatsCards'

export default function DashboardPage() {
    return (
        <main>
            <div className="mb-6">
                <h1 className="text-2xl font-semibold">Dashboard</h1>
                <p className="mt-2 text-slate-600">Weekly overview and quick stats.</p>
            </div>

            <StatsCards />

            <h2 className="text-lg font-medium mb-2">This Week</h2>
            <WeekOverview />
        </main>
    )
}
