import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { sql } from "@/lib/db"

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth()
    if (!session?.user?.id || session.user.role !== "teacher") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id: submissionId } = params
    const { marks, feedback } = await request.json()

    if (marks === undefined) {
      return NextResponse.json({ error: "Marks are required" }, { status: 400 })
    }

    await sql`
      UPDATE assignment_submissions
      SET marks = ${marks}, feedback = ${feedback}, status = 'checked'
      WHERE id = ${submissionId}
    `

    return NextResponse.json({ success: true, message: "Submission graded successfully!" })
  } catch (error) {
    console.error("Teacher Grading API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
