const fs = require('fs')
const path = require('path')
const { Client } = require('pg')

async function main() {
    const databaseUrl = process.env.DATABASE_URL
    if (!databaseUrl) {
        console.error('Error: Set DATABASE_URL environment variable to your Postgres connection string.')
        process.exit(1)
    }

    const client = new Client({ connectionString: databaseUrl })
    await client.connect()

    const migrationsDir = path.join(__dirname, '..', 'supabase', 'migrations')
    const files = fs.readdirSync(migrationsDir).filter((f) => f.endsWith('.sql')).sort()

    for (const file of files) {
        const full = path.join(migrationsDir, file)
        console.log('Applying', file)
        const sql = fs.readFileSync(full, 'utf8')
        try {
            await client.query('BEGIN')
            await client.query(sql)
            await client.query('COMMIT')
            console.log('Applied', file)
        } catch (err) {
            await client.query('ROLLBACK')
            console.error('Failed to apply', file, err.message)
            await client.end()
            process.exit(1)
        }
    }

    console.log('All migrations applied successfully.')
    await client.end()
}

main().catch((err) => {
    console.error(err)
    process.exit(1)
})
