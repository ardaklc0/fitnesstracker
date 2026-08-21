import { supabase } from '../supabaseClient'

function getLocalDate() {
    const now = new Date()
    const offset = now.getTimezoneOffset()
    const localDate = new Date(now.getTime() - offset * 60 * 1000)
    return localDate.toISOString().slice(0, 10)
}

export async function createWorkoutFromProgram(programId: string) {
    // create workout row and copy program_exercises into workout_exercises
    const {
        data: userData
    } = await supabase.auth.getUser()
    const user = userData.user
    if (!user) throw new Error('Not authenticated')

    const date = getLocalDate()

    const { data: workoutData, error: wkErr } = await supabase
        .from('workouts')
        .insert([{ user_id: user.id, date, program_id: programId, status: 'in_progress' }])
        .select('id')
        .single()
    if (wkErr || !workoutData) throw wkErr ?? new Error('Failed to create workout')

    const workoutId = workoutData.id

    const { data: progExercises, error: peErr } = await supabase
        .from('program_exercises')
        .select('exercise_id, exercise_order, target_sets, min_reps, max_reps, rir_target, failure_target, superset_group, notes')
        .eq('program_id', programId)
        .order('exercise_order', { ascending: true })

    if (peErr) throw peErr

    // insert workout_exercises
    const inserts = (progExercises ?? []).map((pe: any) => ({
        workout_id: workoutId,
        exercise_id: pe.exercise_id,
        exercise_order: pe.exercise_order,
        notes: pe.notes
    }))

    if (inserts.length > 0) {
        const { error: weErr } = await supabase.from('workout_exercises').insert(inserts)
        if (weErr) throw weErr
    }

    return workoutId
}

export async function getWorkout(workoutId: string) {
    const { data, error } = await supabase
        .from('workouts')
        .select('*, workout_exercises(id,exercise_id,exercise_order,notes, sets(id,set_number,weight_kg,reps,rir,reached_failure))')
        .eq('id', workoutId)
        .single()
    if (error) throw error
    return data
}

export async function addSet(workoutExerciseId: string, setNumber: number, weightKg: number | null, reps: number | null, rir: number | null, reachedFailure: boolean) {
    const { error } = await supabase.from('sets').insert([
        {
            workout_exercise_id: workoutExerciseId,
            set_number: setNumber,
            weight_kg: weightKg,
            reps,
            rir: rir ?? null,
            reached_failure: reachedFailure
        }
    ])
    if (error) throw error
    return true
}

export async function updateSet(setId: string, fields: { weight_kg?: number | null; reps?: number | null; rir?: number | null; reached_failure?: boolean }) {
    const { error } = await supabase.from('sets').update(fields).eq('id', setId)
    if (error) throw error
    return true
}

export async function updateWorkout(workoutId: string, fields: { body_weight_kg?: number | null; active_calories?: number | null; notes?: string | null }) {
    const { error } = await supabase.from('workouts').update(fields).eq('id', workoutId)
    if (error) throw error
    return true
}

export async function finishWorkout(workoutId: string) {
    const { error } = await supabase
        .from('workouts')
        .update({ status: 'completed', completed_at: new Date().toISOString() })
        .eq('id', workoutId)
    if (error) throw error
    return true
}
