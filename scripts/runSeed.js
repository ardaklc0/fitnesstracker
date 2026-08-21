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

    const seedFile = path.join(__dirname, '..', 'supabase', 'seed', 'seed.sql')
    if (!fs.existsSync(seedFile)) {
        console.error('Seed file not found:', seedFile)
        process.exit(1)
    }

    const sql = fs.readFileSync(seedFile, 'utf8')
    try {
        await client.query('BEGIN')
        await client.query(sql)
        await client.query('COMMIT')
        console.log('Seed applied successfully.')
    } catch (err) {
        await client.query('ROLLBACK')
        console.error('Failed to apply seed:', err.message)
        process.exit(1)
    } finally {
        await client.end()
    }
}

main().catch((err) => {
    console.error(err)
    process.exit(1)
})
