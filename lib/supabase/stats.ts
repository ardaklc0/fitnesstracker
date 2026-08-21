import { supabase } from '../supabaseClient'

function addDays(dateString: string, days: number) {
    const [year, month, day] = dateString.split('-').map(Number)
    const date = new Date(Date.UTC(year, month - 1, day + days))
    return date.toISOString().slice(0, 10)
}

function getMonday(dateString: string) {
    const [year, month, day] = dateString.split('-').map(Number)
    const weekday = new Date(Date.UTC(year, month - 1, day)).getUTCDay()
    return addDays(dateString, -((weekday + 6) % 7))
}

export async function getWeeklyStatistics() {
    const now = new Date()
    const offset = now.getTimezoneOffset()
    const localNow = new Date(now.getTime() - offset * 60 * 1000)
    const today = localNow.toISOString().slice(0, 10)
    const startStr = getMonday(today)
    const endStr = addDays(startStr, 6)

    // Workouts completed this week
    const { data: workouts, error: workoutsErr } = await supabase
        .from('workouts')
        .select('id,date,status,active_calories,notes,workout_exercises(id,sets(id,weight_kg,reps))')
        .gte('date', startStr)
        .lte('date', endStr)
        .eq('status', 'completed')
        .order('date', { ascending: false })

    if (workoutsErr) {
        throw workoutsErr
    }

    let workoutsCompleted = 0
    let trainingVolumeKg = 0
    let totalSets = 0
    let workoutActiveCalories = 0
    let latestNote: string | null = null
    let latestNoteWorkoutId: string | null = null

    if (workouts && Array.isArray(workouts)) {
        workoutsCompleted = workouts.length
        for (const w of workouts as any[]) {
            if (w.notes?.trim() && !latestNote) {
                latestNote = w.notes.trim()
                latestNoteWorkoutId = w.id
            }
            workoutActiveCalories += Number(w.active_calories ?? 0)
            const exercises = w.workout_exercises ?? []
            for (const ex of exercises) {
                const sets = ex.sets ?? []
                totalSets += sets.length
                for (const s of sets) {
                    const weight = parseFloat(s.weight_kg ?? 0)
                    const reps = parseInt(s.reps ?? 0)
                    if (!Number.isNaN(weight) && !Number.isNaN(reps)) {
                        trainingVolumeKg += weight * reps
                    }
                }
            }
        }
    }

    // Active calories this week
    const { data: cals, error: calsErr } = await supabase
        .from('calorie_logs')
        .select('active_calories')
        .gte('date', startStr)
        .lte('date', endStr)

    if (calsErr) throw calsErr
    const loggedActiveCalories = (cals ?? []).reduce((sum: number, r: any) => sum + Number(r.active_calories ?? 0), 0)
    const totalActiveCalories = loggedActiveCalories + workoutActiveCalories

    // Current weight and weekly change
    const { data: latestWeight } = await supabase
        .from('weight_logs')
        .select('weight_kg,date')
        .order('date', { ascending: false })
        .limit(1)

    const currentWeightKg = latestWeight && latestWeight[0] ? parseFloat(latestWeight[0].weight_kg) : null

    // Weight at start of week (closest entry on or before start)
    const { data: startWeekWeight } = await supabase
        .from('weight_logs')
        .select('weight_kg,date')
        .lte('date', startStr)
        .order('date', { ascending: false })
        .limit(1)

    const startWeight = startWeekWeight && startWeekWeight[0] ? parseFloat(startWeekWeight[0].weight_kg) : null
    const weeklyWeightChange = currentWeightKg != null && startWeight != null ? +(currentWeightKg - startWeight).toFixed(2) : null

    return {
        workoutsCompleted,
        totalActiveCalories,
        currentWeightKg,
        weeklyWeightChange,
        trainingVolumeKg: Math.round(trainingVolumeKg),
        totalSets,
        latestNote,
        latestNoteWorkoutId
    }
}
