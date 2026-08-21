import { describe, it, expect } from 'vitest'
import { setVolume, workoutVolume, totalSetsCount, detectSimplePR, weeklySummaryFromWorkouts } from '../lib/calculations'

describe('calculations', () => {
    it('calculates set volume correctly', () => {
        expect(setVolume({ weight_kg: 80, reps: 6 })).toBe(480)
        expect(setVolume({ weight_kg: null, reps: 6 })).toBe(0)
        expect(setVolume({ weight_kg: 82.5, reps: 5 })).toBeCloseTo(412.5)
    })

    it('calculates workout volume', () => {
        const w = [
            { sets: [{ weight_kg: 80, reps: 6 }, { weight_kg: 80, reps: 5 }] },
            { sets: [{ weight_kg: 60, reps: 8 }] }
        ]
        expect(workoutVolume(w)).toBe(480 + 400 + 480)
    })

    it('counts total sets', () => {
        const w = [{ sets: [{ weight_kg: 80, reps: 6 }, { weight_kg: 80, reps: 5 }] }, { sets: [{ weight_kg: 60, reps: 8 }] }]
        expect(totalSetsCount(w)).toBe(3)
    })

    it('detects simple PRs', () => {
        expect(detectSimplePR(null, 80)).toBe(true)
        expect(detectSimplePR(80, 85)).toBe(true)
        expect(detectSimplePR(85, 85)).toBe(false)
        expect(detectSimplePR(90, 85)).toBe(false)
    })

    it('computes weekly summary', () => {
        const workouts = [
            { date: '2026-08-18', status: 'completed', workout_exercises: [{ sets: [{ weight_kg: 80, reps: 6 }] }] },
            { date: '2026-08-17', status: 'planned', workout_exercises: [{ sets: [{ weight_kg: 60, reps: 8 }] }] },
            { date: '2026-08-16', status: 'completed', workout_exercises: [{ sets: [{ weight_kg: 100, reps: 5 }] }] }
        ]
        const summary = weeklySummaryFromWorkouts(workouts)
        expect(summary.workoutsCompleted).toBe(2)
        expect(summary.trainingVolumeKg).toBe(480 + 500)
        expect(summary.totalSets).toBe(2)
    })
})
