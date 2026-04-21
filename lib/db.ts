import { neon } from '@neondatabase/serverless'

const isPostgres = process.env.DATABASE_URL?.startsWith('postgres')

// Initialize Neon if in Postgres mode
const neonSql = isPostgres ? neon(process.env.DATABASE_URL!) : null

// SQLite connection state
let sqliteDb: any = null

const getSqliteDb = async () => {
  if (!sqliteDb) {
    // Dynamic import to avoid bundling native bindings on Vercel
    const Database = (await import('better-sqlite3')).default
    const path = (await import('path')).default
    const dbPath = path.join(process.cwd(), 'app.db')
    sqliteDb = new Database(dbPath)
    sqliteDb.pragma('foreign_keys = ON')
  }
  return sqliteDb
}

export const sql = async (
  strings: TemplateStringsArray,
  ...values: unknown[]
) => {
  if (isPostgres && neonSql) {
    try {
      // Neon/Postgres mode
      return await neonSql(strings, ...values)
    } catch (error) {
      console.error('Neon Database error:', error)
      throw error
    }
  } else {
    // SQLite mode
    const db = await getSqliteDb()
    const query = strings.join('?')
    try {
      const stmt = db.prepare(query)
      
      // SQLite doesn't natively support booleans, map to 1/0
      const mappedValues = values.map(v => typeof v === 'boolean' ? (v ? 1 : 0) : v)
      
      const trimmedQuery = query.trim().toUpperCase()
      
      if (trimmedQuery.startsWith('SELECT') || trimmedQuery.includes('RETURNING')) {
        return stmt.all(...mappedValues)
      } else if (trimmedQuery.startsWith('INSERT') || trimmedQuery.startsWith('UPDATE') || trimmedQuery.startsWith('DELETE')) {
        return stmt.run(...mappedValues) as any
      } else {
        return stmt.all(...mappedValues)
      }
    } catch (error) {
      console.error('SQLite Database error:', error)
      throw error
    }
  }
}

// Export a proxy for db to handle legacy direct usages if possible
export const db = new Proxy({} as any, {
  get(target, prop) {
    if (isPostgres) {
       // In Postgres mode, direct 'db' usage is not supported 
       // We should ideally remove all db.pragma/db.prepare calls
       return () => {
         console.warn(`Direct db.${String(prop)} called in Postgres mode. This is a no-op.`)
         return { all: () => [], run: () => ({}), get: () => ({}) }
       }
    }
    
    // In SQLite mode, we need to return the property from the actual db instance
    // Since this is a proxy and getSqliteDb is async, this is tricky.
    // However, for auth.ts initialization which is sync-ish, we might have issues.
    // We'll address this by refactoring auth.ts next.
    return (...args: any[]) => {
      throw new Error(`Direct db.${String(prop)} access is deprecated. Use the 'sql' template tag instead.`)
    }
  }
})

