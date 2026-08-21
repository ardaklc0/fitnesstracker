'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabaseClient'

export default function ExercisesPage() {
    const [exercises, setExercises] = useState<{ id: string; name: string }[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        async function loadExercises() {
            const { data, error: fetchError } = await supabase
                .from('exercises')
                .select('id,name')
                .order('name')

            if (fetchError) setError(fetchError.message)
            else setExercises(data ?? [])
            setLoading(false)
        }

        loadExercises()
    }, [])

    return (
        <div>
            <h1 className="text-2xl font-semibold mb-4">Exercises</h1>
            {loading && <div className="text-sm text-slate-500">Loading exercises...</div>}
            {error && <div className="text-sm text-red-600">{error}</div>}
            {!loading && !error && exercises.length === 0 && (
                <div className="text-sm text-slate-500">No exercises found.</div>
            )}
            <ul className="space-y-2">
                {exercises.map((exercise) => (
                    <li key={exercise.id} className="bg-white border rounded p-3">
                        <Link href={`/exercises/${exercise.id}`} className="font-medium hover:underline">
                            {exercise.name}
                        </Link>
                    </li>
                ))}
            </ul>
        </div>
    )
}
