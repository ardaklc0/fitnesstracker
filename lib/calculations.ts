export type SetRecord = { weight_kg: number | null; reps: number | null }

export function setVolume(s: SetRecord) {
    const weight = s.weight_kg ?? 0
    const reps = s.reps ?? 0
    const w = Number(weight)
    const r = Number(reps)
    if (isNaN(w) || isNaN(r)) return 0
    return w * r
}

export function workoutVolume(workoutExercises: Array<{ sets?: SetRecord[] }>) {
    let total = 0
    for (const we of workoutExercises) {
        const sets = we.sets ?? []
        for (const s of sets) total += setVolume(s)
    }
    return total
}

export function totalSetsCount(workoutExercises: Array<{ sets?: SetRecord[] }>) {
    let count = 0
    for (const we of workoutExercises) {
        count += (we.sets ?? []).length
    }
    return count
}

export function detectSimplePR(previousMaxWeight: number | null, newMaxWeight: number | null) {
    if (newMaxWeight == null) return false
    if (previousMaxWeight == null) return true
    return newMaxWeight > previousMaxWeight
}

export function weeklySummaryFromWorkouts(workouts: Array<{ date: string; status: string; workout_exercises?: Array<{ sets?: SetRecord[] }> }>) {
    const completed = workouts.filter((w) => w.status === 'completed')
    const workoutsCompleted = completed.length
    const trainingVolumeKg = completed.reduce((sum, w) => sum + workoutVolume(w.workout_exercises ?? []), 0)
    const totalSets = completed.reduce((sum, w) => sum + totalSetsCount(w.workout_exercises ?? []), 0)
    return { workoutsCompleted, trainingVolumeKg, totalSets }
}
