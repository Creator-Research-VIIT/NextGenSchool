"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { toast } from "sonner"
import { 
  FileText, CheckCircle, Clock, AlertCircle, 
  ArrowLeft, Download, ExternalLink, Send, User, Mail
} from "lucide-react"

interface Submission {
  id: number
  student_id: number
  student_name: string
  student_email: string
  submission_text: string
  file_url: string
  submitted_at: string
  marks: number | null
  feedback: string | null
  status: string
}

export default function AssignmentGradingPage() {
  const { id } = useParams()
  const router = useRouter()
  const [submissions, setSubmissions] = useState<Submission[]>([])
  const [loading, setLoading] = useState(true)
  const [gradingId, setGradingId] = useState<number | null>(null)
  
  // Grading Form State
  const [marks, setMarks] = useState<string>("")
  const [feedback, setFeedback] = useState<string>("")
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    fetchSubmissions()
  }, [id])

  async function fetchSubmissions() {
    try {
      const res = await fetch(`/api/teacher/assignments/${id}/submissions`)
      if (res.ok) {
        setSubmissions(await res.json())
      }
    } catch (e) {
      toast.error("Failed to load submissions.")
    } finally {
      setLoading(false)
    }
  }

  const handleGrade = async (submissionId: number) => {
    if (!marks) {
      toast.warning("Please enter marks.")
      return
    }

    setSubmitting(true)
    try {
      const res = await fetch(`/api/teacher/submissions/${submissionId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ marks: Number(marks), feedback })
      })

      if (res.ok) {
        toast.success("Graded successfully!")
        setGradingId(null)
        setMarks("")
        setFeedback("")
        fetchSubmissions()
        router.refresh()
      } else {
        toast.error("Failed to save grade.")
      }
    } catch (e) {
      toast.error("Error saving grade.")
    } finally {
      setSubmitting(false)
    }
  }

  const openGrading = (s: Submission) => {
    setGradingId(s.id)
    setMarks(s.marks?.toString() || "")
    setFeedback(s.feedback || "")
  }

  if (loading) return <div className="p-8 space-y-4"><Skeleton className="h-10 w-48" /><Skeleton className="h-64" /><Skeleton className="h-64" /></div>

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.back()} className="rounded-full">
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-3xl font-black text-gray-800 tracking-tight">Submissions</h1>
          <p className="text-gray-500 font-medium">Review and grade student work</p>
        </div>
      </div>

      {submissions.length > 0 ? (
        <div className="grid gap-6">
          {submissions.map((s) => (
            <Card key={s.id} className="border-0 bg-white/80 shadow-xl backdrop-blur overflow-hidden group">
              <div className={`h-1.5 w-full ${s.status === 'checked' ? 'bg-emerald-500' : 'bg-amber-500'}`} />
              <CardContent className="p-6">
                <div className="grid md:grid-cols-[1fr_300px] gap-8">
                  <div className="space-y-6">
                    {/* Student Info */}
                    <div className="flex items-center gap-4">
                      <div className="h-12 w-12 rounded-2xl bg-violet-100 flex items-center justify-center text-violet-600">
                        <User className="h-6 w-6" />
                      </div>
                      <div>
                        <h3 className="text-lg font-black text-gray-800">{s.student_name}</h3>
                        <p className="text-sm text-gray-500 flex items-center gap-1">
                          <Mail className="h-3 w-3" /> {s.student_email}
                        </p>
                      </div>
                      <div className="ml-auto">
                        <Badge className={s.status === 'checked' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}>
                          {s.status === 'checked' ? 'Checked' : 'Submitted'}
                        </Badge>
                      </div>
                    </div>

                    {/* Submission Content */}
                    <div className="space-y-4">
                      <div className="rounded-2xl bg-gray-50 p-4 border border-gray-100">
                        <Label className="text-xs font-bold uppercase text-gray-400 mb-2 block">Submission Text</Label>
                        <p className="text-gray-700 whitespace-pre-wrap">{s.submission_text || "No text provided."}</p>
                      </div>

                      {s.file_url && (
                        <Button asChild variant="outline" className="rounded-xl border-violet-100 text-violet-600 hover:bg-violet-50">
                          <a href={s.file_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2">
                            <Download className="h-4 w-4" /> Download Attached File
                          </a>
                        </Button>
                      )}
                    </div>
                  </div>

                  {/* Grading Section */}
                  <div className="border-l border-gray-100 pl-8 space-y-6">
                    {gradingId === s.id ? (
                      <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
                        <div className="space-y-2">
                          <Label className="text-xs font-bold uppercase text-gray-400">Marks / Score</Label>
                          <Input 
                            type="number" 
                            placeholder="e.g. 85" 
                            value={marks} 
                            onChange={e => setMarks(e.target.value)}
                            className="rounded-xl border-gray-100 bg-gray-50"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-xs font-bold uppercase text-gray-400">Feedback</Label>
                          <Textarea 
                            placeholder="Great job! Keep it up..." 
                            value={feedback} 
                            onChange={e => setFeedback(e.target.value)}
                            className="rounded-xl border-gray-100 bg-gray-50 resize-none"
                            rows={4}
                          />
                        </div>
                        <div className="flex gap-2">
                          <Button onClick={() => handleGrade(s.id)} disabled={submitting} className="flex-1 bg-violet-600 font-bold">
                            {submitting ? "Saving..." : "Save Grade"}
                          </Button>
                          <Button variant="ghost" onClick={() => setGradingId(null)} className="font-bold">Cancel</Button>
                        </div>
                      </motion.div>
                    ) : (
                      <div className="space-y-6">
                        {s.status === 'checked' ? (
                          <div className="space-y-4">
                            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-100 text-center">
                              <p className="text-xs font-bold uppercase text-emerald-600 mb-1">Score</p>
                              <p className="text-3xl font-black text-emerald-700">{s.marks}</p>
                            </div>
                            <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100">
                              <p className="text-xs font-bold uppercase text-gray-400 mb-1">Feedback</p>
                              <p className="text-sm text-gray-600 italic">"{s.feedback || "No feedback provided."}"</p>
                            </div>
                            <Button variant="outline" onClick={() => openGrading(s)} className="w-full rounded-xl border-violet-100 text-violet-600 font-bold">
                              Edit Grade
                            </Button>
                          </div>
                        ) : (
                          <div className="flex flex-col items-center justify-center h-full py-8 text-center space-y-4">
                            <div className="h-16 w-16 rounded-full bg-amber-50 flex items-center justify-center text-amber-500">
                              <Clock className="h-8 w-8" />
                            </div>
                            <p className="text-gray-500 font-medium">Pending Review</p>
                            <Button onClick={() => openGrading(s)} className="w-full bg-violet-600 font-bold">
                              Grade Now
                            </Button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 bg-white/50 rounded-[40px] border-2 border-dashed border-gray-100">
          <FileText className="h-12 w-12 text-gray-300 mb-3" />
          <p className="text-gray-500 font-medium tracking-tight">No submissions yet for this assignment.</p>
        </div>
      )}
    </div>
  )
}
