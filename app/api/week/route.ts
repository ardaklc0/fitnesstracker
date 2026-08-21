import { NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

function addDays(dateString: string, days: number) {
    const [year, month, day] = dateString.split('-').map(Number)
    const date = new Date(Date.UTC(year, month - 1, day + days))
    return date.toISOString().slice(0, 10)
}

function getMonday(dateString: string) {
    const [year, month, day] = dateString.split('-').map(Number)
    const weekday = new Date(Date.UTC(year, month - 1, day)).getUTCDay()
    const daysSinceMonday = (weekday + 6) % 7
    return addDays(dateString, -daysSinceMonday)
}

export async function GET(req: Request) {
    const cookieStore = cookies()
    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL || '',
        process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || '',
        {
            cookies: {
                getAll() {
                    return cookieStore.getAll()
                },
                setAll(cookiesToSet) {
                    cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options))
                }
            }
        }
    )

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
        return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    const url = new URL(req.url)
    const startParam = url.searchParams.get('start')
    const today = new Date().toISOString().slice(0, 10)
    const start = getMonday(startParam ?? today)

    // compute dates for the week (Mon..Sun)
    const dates: string[] = []
    for (let i = 0; i < 7; i++) {
        dates.push(addDays(start, i))
    }

    const { data: workouts, error: workoutsErr } = await supabase
        .from('workouts')
        .select('date,program_id,status,programs(name)')
        .eq('user_id', user.id)
        .gte('date', dates[0])
        .lte('date', dates[6])

    if (workoutsErr) {
        return NextResponse.json({ error: workoutsErr.message }, { status: 500 })
    }

    const days = dates.map((dateStr, idx) => {
        const weekday = idx + 1 // 1 = Monday
        const workout = workouts?.find((w: any) => w.date === dateStr)
        return {
            date: dateStr,
            weekday,
            program: workout?.programs?.name ?? null,
            completed: workout?.status === 'completed'
        }
    })

    return NextResponse.json({ start, days })
}
