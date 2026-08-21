'use client'

import React, { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { getWorkout, addSet, finishWorkout, updateSet, updateWorkout } from '../../../lib/supabase/workouts'
import { supabase } from '../../../lib/supabaseClient'

export default function WorkoutPage() {
    const params = useParams()
    const rawWorkoutId = params?.id
    const workoutId = Array.isArray(rawWorkoutId) ? rawWorkoutId[0] : rawWorkoutId
    const [workout, setWorkout] = useState<any | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [addingSetFor, setAddingSetFor] = useState<string | null>(null)
    const [setWeight, setSetWeight] = useState('')
    const [setReps, setSetReps] = useState('')
    const [setRir, setSetRir] = useState('')
    const [setFailure, setSetFailure] = useState(false)
    const [bodyWeight, setBodyWeight] = useState<string>('')
    const [activeCalories, setActiveCalories] = useState<string>('')
    const [notesText, setNotesText] = useState<string>('')
    const router = useRouter()

    useEffect(() => {
        if (!workoutId) return
        setLoading(true)
        getWorkout(workoutId)
            .then(async (w) => {
                // fetch exercise names
                const exIds = (w.workout_exercises ?? []).map((e: any) => e.exercise_id)
                let exercisesMap: Record<string, any> = {}
                if (exIds.length > 0) {
                    const { data: ex } = await supabase.from('exercises').select('id,name').in('id', exIds)
                    exercisesMap = (ex ?? []).reduce((acc: any, cur: any) => ({ ...acc, [cur.id]: cur }), {})
                }
                // attach names
                w.workout_exercises = (w.workout_exercises ?? []).map((we: any) => ({ ...we, exercise: exercisesMap[we.exercise_id] ?? null }))
                setWorkout(w)
                setBodyWeight(w.body_weight_kg ?? '')
                setActiveCalories(w.active_calories ?? '')
                setNotesText(w.notes ?? '')
            })
            .catch((err) => setError(err?.message ?? 'Failed to load workout'))
            .finally(() => setLoading(false))
    }, [workoutId])

    async function handleAddSet(workoutExerciseId: string) {
        setError(null)
        const weight = setWeight ? parseFloat(setWeight) : null
        const reps = setReps ? parseInt(setReps) : null
        const rir = setRir ? parseInt(setRir) : null
        try {
            const nextSetNumber = ((workout?.workout_exercises?.find((we: any) => we.id === workoutExerciseId)?.sets?.length) ?? 0) + 1
            await addSet(workoutExerciseId, nextSetNumber, weight, reps, rir, setFailure)
            // refresh
            const w = await getWorkout(workoutId!)
            const exIds = (w.workout_exercises ?? []).map((e: any) => e.exercise_id)
            let exercisesMap: Record<string, any> = {}
            if (exIds.length > 0) {
                const { data: ex } = await supabase.from('exercises').select('id,name').in('id', exIds)
                exercisesMap = (ex ?? []).reduce((acc: any, cur: any) => ({ ...acc, [cur.id]: cur }), {})
            }


            w.workout_exercises = (w.workout_exercises ?? []).map((we: any) => ({ ...we, exercise: exercisesMap[we.exercise_id] ?? null }))
            setWorkout(w)
            setBodyWeight(w.body_weight_kg ?? '')
            setActiveCalories(w.active_calories ?? '')
            setNotesText(w.notes ?? '')
            // reset inputs
            setSetWeight('')
            setSetReps('')
            setSetRir('')
            setSetFailure(false)
            setAddingSetFor(null)
        } catch (err: any) {
            setError(err?.message ?? 'Failed to add set')
        }
    }

    async function handleFinish() {
        try {
            await finishWorkout(workoutId!)
            router.push('/history')
        } catch (err: any) {
            setError(err?.message ?? 'Failed to finish workout')
        }
    }

    async function handleUpdateSet(setId: string, weightStr: string, repsStr: string, rirStr: string, reachedFailure: boolean) {
        setError(null)
        try {
            const weight = weightStr ? parseFloat(weightStr) : null
            const reps = repsStr ? parseInt(repsStr) : null
            const rir = rirStr ? parseInt(rirStr) : null
            await updateSet(setId, { weight_kg: weight, reps, rir: rir ?? null, reached_failure: reachedFailure })
            const w = await getWorkout(workoutId!)
            const exIds = (w.workout_exercises ?? []).map((e: any) => e.exercise_id)
            let exercisesMap: Record<string, any> = {}
            if (exIds.length > 0) {
                const { data: ex } = await supabase.from('exercises').select('id,name').in('id', exIds)
                exercisesMap = (ex ?? []).reduce((acc: any, cur: any) => ({ ...acc, [cur.id]: cur }), {})
            }
            w.workout_exercises = (w.workout_exercises ?? []).map((we: any) => ({ ...we, exercise: exercisesMap[we.exercise_id] ?? null }))
            setWorkout(w)
            setBodyWeight(w.body_weight_kg ?? '')
            setActiveCalories(w.active_calories ?? '')
            setNotesText(w.notes ?? '')
        } catch (err: any) {
            setError(err?.message ?? 'Failed to update set')
        }
    }

    async function handleSaveWorkout() {
        setError(null)
        try {
            const bw = bodyWeight ? parseFloat(bodyWeight) : null
            const ac = activeCalories ? parseInt(activeCalories) : null
            await updateWorkout(workoutId!, { body_weight_kg: bw, active_calories: ac, notes: notesText })
            const w = await getWorkout(workoutId!)
            const exIds = (w.workout_exercises ?? []).map((e: any) => e.exercise_id)
            let exercisesMap: Record<string, any> = {}
            if (exIds.length > 0) {
                const { data: ex } = await supabase.from('exercises').select('id,name').in('id', exIds)
                exercisesMap = (ex ?? []).reduce((acc: any, cur: any) => ({ ...acc, [cur.id]: cur }), {})
            }
            w.workout_exercises = (w.workout_exercises ?? []).map((we: any) => ({ ...we, exercise: exercisesMap[we.exercise_id] ?? null }))
            setWorkout(w)
        } catch (err: any) {
            setError(err?.message ?? 'Failed to save workout')
        }
    }

    if (loading) return <div className="text-sm text-slate-500">Loading workout...</div>
    if (error) return <div className="text-sm text-red-600">{error}</div>
    if (!workout) return <div className="text-sm text-slate-500">Workout not found.</div>

    return (
        <div>
            <h1 className="text-2xl font-semibold mb-4">Workout</h1>
            <div className="space-y-4">
                {workout.workout_exercises.map((we: any) => (
                    <div key={we.id} className="bg-white border rounded p-4">
                        <div className="flex justify-between items-center">
                            <div>
                                <div className="font-medium">{we.exercise?.name ?? 'Exercise'}</div>
                                <div className="text-sm text-slate-500">Planned sets: {we.target_sets ?? '-'}</div>
                            </div>
                            <div>
                                <button className="text-sm text-slate-700 hover:underline" onClick={() => setAddingSetFor(we.id)}>
                                    Add Set
                                </button>
                            </div>
                        </div>

                        <div className="mt-3 space-y-2">
                            {(we.sets ?? []).map((s: any) => (
                                <SetRow
                                    key={s.id}
                                    setItem={s}
                                    onSave={(weight, reps, rir, reached) => handleUpdateSet(s.id, weight, reps, rir, reached)}
                                />
                            ))}

                            {addingSetFor === we.id && (
                                <div className="mt-2 grid grid-cols-1 sm:grid-cols-6 gap-2">
                                    <input type="number" step="0.5" placeholder="weight" value={setWeight} onChange={(e) => setSetWeight(e.target.value)} className="border rounded p-2 col-span-2" />
                                    <input type="number" placeholder="reps" value={setReps} onChange={(e) => setSetReps(e.target.value)} className="border rounded p-2 col-span-1" />
                                    <input type="number" placeholder="rir" value={setRir} onChange={(e) => setSetRir(e.target.value)} className="border rounded p-2 col-span-1" />
                                    <label className="flex items-center gap-2 col-span-1"><input type="checkbox" checked={setFailure} onChange={(e) => setSetFailure(e.target.checked)} /> Failure</label>
                                    <div className="col-span-1 flex gap-2">
                                        <button className="bg-slate-900 text-white px-3 py-2 rounded" onClick={() => handleAddSet(we.id)}>Save Set</button>
                                        <button className="px-3 py-2 rounded border" onClick={() => setAddingSetFor(null)}>Cancel</button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>
            <div className="mt-4 bg-white border rounded p-4">
                <div className="text-sm text-slate-500 mb-2">Workout details</div>
                <div className="flex gap-2 flex-col sm:flex-row items-start">
                    <input type="number" step="0.1" placeholder="Body weight (kg)" value={bodyWeight} onChange={(e) => setBodyWeight(e.target.value)} className="border rounded p-2 w-40" />
                    <input type="number" placeholder="Active calories" value={activeCalories} onChange={(e) => setActiveCalories(e.target.value)} className="border rounded p-2 w-40" />
                    <textarea placeholder="Notes" value={notesText} onChange={(e) => setNotesText(e.target.value)} className="border rounded p-2 flex-1" />
                    <div>
                        <button className="bg-slate-900 text-white px-4 py-2 rounded" onClick={handleSaveWorkout}>Save</button>
                    </div>
                </div>
            </div>

            <div className="mt-6 flex gap-3">
                <button className="bg-green-600 text-white px-4 py-2 rounded" onClick={handleFinish}>Finish Workout</button>
                <button className="px-4 py-2 rounded border" onClick={() => router.push('/')}>Cancel</button>
            </div>
        </div>
    )
}

function SetRow({ setItem, onSave }: { setItem: any; onSave: (weight: string, reps: string, rir: string, reached: boolean) => void }) {
    const [editing, setEditing] = useState(false)
    const [w, setW] = useState(setItem.weight_kg ?? '')
    const [r, setR] = useState(setItem.reps ?? '')
    const [rir, setRir] = useState(setItem.rir ?? '')
    const [rf, setRf] = useState(!!setItem.reached_failure)

    return (
        <div className="flex flex-wrap justify-between items-center gap-2 text-sm bg-slate-50 p-2 rounded">
            <div>Set {setItem.set_number}</div>
            <div className="flex flex-wrap items-center gap-2 max-w-full">
                {editing ? (
                    <>
                        <input className="border rounded px-2 py-1 w-20" value={w} onChange={(e) => setW(e.target.value)} />
                        <input className="border rounded px-2 py-1 w-14" value={r} onChange={(e) => setR(e.target.value)} />
                        <input className="border rounded px-2 py-1 w-14" value={rir} onChange={(e) => setRir(e.target.value)} />
                        <label className="flex items-center gap-2"><input type="checkbox" checked={rf} onChange={(e) => setRf(e.target.checked)} />F</label>
                        <button className="px-2 py-1 bg-slate-900 text-white rounded" onClick={() => { onSave(String(w), String(r), String(rir), rf); setEditing(false) }}>Save</button>
                        <button className="px-2 py-1 border rounded" onClick={() => setEditing(false)}>Cancel</button>
                    </>
                ) : (
                    <>
                        <div>{setItem.weight_kg ?? '-'} kg × {setItem.reps ?? '-'} reps {setItem.reached_failure ? ' (F)' : ''}</div>
                        <button className="text-xs text-slate-700 hover:underline" onClick={() => setEditing(true)}>Edit</button>
                    </>
                )}
            </div>
        </div>
    )
}
