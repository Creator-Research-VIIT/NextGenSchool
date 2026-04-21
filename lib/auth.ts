import NextAuth from 'next-auth'
import Credentials from 'next-auth/providers/credentials'
import { compare, hashSync } from 'bcryptjs'
import { sql, db } from './db'
import type { UserRole } from './types'
import { authConfig } from './auth.config'

// Database initialization is now handled via the /api/migrate route or manual scripts
// This avoids issues with native bindings and provides better control over migrations.


export const { handlers, signIn, signOut, auth } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
        loginType: { label: 'Login Type', type: 'text' },
      },
      async authorize(credentials) {
        try {
          if (!credentials?.email || !credentials?.password) return null

          const users = await sql`
            SELECT id, email, name, password_hash, role, is_approved, institution_id, class
            FROM users
            WHERE email = ${credentials.email as string}
          ` as any[]

          const user = users[0]
          if (!user) return null

          // Strict role check for admin login
          if (credentials.loginType === "admin") {
            if (user.role !== "admin") return null
          }

          const isValid = await compare(credentials.password as string, user.password_hash)
          if (!isValid) return null

          return {
            id: String(user.id),
            email: user.email,
            name: user.name,
            role: user.role as UserRole,
            isApproved: user.is_approved === 1 || user.is_approved === true,
            institutionId: user.institution_id ? String(user.institution_id) : undefined,
            class: user.class ? Number(user.class) : undefined,
          }
        } catch (error) {
          console.error("❌ Auth error:", error)
          return null
        }
      },
    }),
  ],
})
