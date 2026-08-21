'use client'

import { useEffect, useState } from 'react'

export default function ThemeToggle() {
    const [dark, setDark] = useState(false)

    useEffect(() => {
        const savedTheme = window.localStorage.getItem('theme')
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
        const isDark = savedTheme ? savedTheme === 'dark' : prefersDark
        document.documentElement.classList.toggle('dark', isDark)
        setDark(isDark)
    }, [])

    function toggleTheme() {
        const nextDark = !dark
        document.documentElement.classList.toggle('dark', nextDark)
        window.localStorage.setItem('theme', nextDark ? 'dark' : 'light')
        setDark(nextDark)
    }

    return (
        <button
            type="button"
            onClick={toggleTheme}
            aria-label={dark ? 'Switch to light mode' : 'Switch to dark mode'}
            className="w-auto whitespace-nowrap rounded border px-3 py-2 text-left text-sm text-slate-600 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
        >
            {dark ? 'Light mode' : 'Dark mode'}
        </button>
    )
}
