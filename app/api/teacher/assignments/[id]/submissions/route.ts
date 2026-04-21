import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { sql } from "@/lib/db"

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth()
    if (!session?.user?.id || session.user.role !== "teacher") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id: assignmentId } = params

    const submissions = await sql`
      SELECT 
        s.*,
        u.name as student_name,
        u.email as student_email
      FROM assignment_submissions s
      JOIN users u ON s.student_id = u.id
      WHERE s.assignment_id = ${assignmentId}
      ORDER BY s.submitted_at DESC
    `

    return NextResponse.json(submissions)
  } catch (error) {
    console.error("Teacher Submissions API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
