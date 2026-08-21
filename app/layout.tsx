import './globals.css'
import React from 'react'
import MainLayout from '../components/navigation/MainLayout'

export const metadata = {
    title: 'Fitness Tracker',
    description: 'Personal fitness tracking PWA'
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="en">
            <head>
                <meta name="viewport" content="width=device-width,initial-scale=1" />
                <link rel="manifest" href="/manifest.json" />
            </head>
            <body>
                <MainLayout>{children}</MainLayout>
            </body>
        </html>
    )
}
