import { NextResponse } from 'next/server'

// Temporary placeholder API returning example weekly statistics.
// Will be replaced with real per-user calculations using Supabase.
export async function GET() {
    const data = {
        workoutsCompleted: 3,
        totalActiveCalories: 2184,
        currentWeightKg: 86.4,
        weeklyWeightChange: -0.6,
        trainingVolumeKg: 18420,
        totalSets: 48
    }
    return NextResponse.json(data)
}
