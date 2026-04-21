"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { toast } from "sonner"
import { CheckSquare, PlusCircle, Loader2, Trash2, Users, Clock, Star, Rocket } from "lucide-react"

interface Quiz {
  id: string; title: string; course_title: string; course_id: string
  time_limit: number; passing_score: number; max_attempts: number
  question_count: number; submission_count: number; created_at: string; class?: number
  questions?: { id: string; question: string; options: string[] }[]
}

interface Course { id: string; title: string }
interface QuestionForm { question: string; option1: string; option2: string; option3: string; option4: string; correctAnswer: number }

const defaultQuestion = (): QuestionForm => ({ question: "", option1: "", option2: "", option3: "", option4: "", correctAnswer: 1 })

export default function TeacherQuizzesPage() {
  const [quizzes, setQuizzes] = useState<Quiz[]>([])
  const [courses, setCourses] = useState<Course[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [selectedClass, setSelectedClass] = useState("all")
  const [selectedQuizId, setSelectedQuizId] = useState<string | null>(null)
  
  const [form, setForm] = useState({ courseId: "", title: "", timeLimit: 30, passingScore: 70, maxAttempts: 3 })
  const [questions, setQuestions] = useState<QuestionForm[]>([defaultQuestion()])

  useEffect(() => { 
    fetchData() 
  }, [])

  async function fetchData() {
    try {
      const [qRes, cRes] = await Promise.all([
        fetch("/api/teacher/quizzes"), 
        fetch("/api/teacher/courses")
      ])
      if (qRes.ok) setQuizzes(await qRes.json())
      if (cRes.ok) setCourses(await cRes.json())
    } catch (error) {
      console.error("Fetch data error:", error)
      toast.error("Failed to load dashboard data")
    } finally {
      setLoading(false)
    }
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)

    try {
      const res = await fetch("/api/teacher/quizzes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, questions }),
      })

      const data = await res.json()

      if (res.ok) {
        setDialogOpen(false)
        setForm({ courseId: "", title: "", timeLimit: 30, passingScore: 70, maxAttempts: 3 })
        setQuestions([defaultQuestion()])
        fetchData()
        toast.success("Quiz created successfully!")
      } else {
        throw new Error(data.error || "Failed to create quiz")
      }
    } catch (error: any) {
      console.error("Create quiz error:", error)
      toast.error(error.message || "An unexpected error occurred")
    } finally {
      setSaving(false)
    }
  }

  // Filter Logic
  const filteredQuizzes = selectedClass === "all" 
    ? quizzes 
    : quizzes.filter(q => {
        // Strip "Class " prefix before converting to number for comparison
        const qClass = String(q.class || "").replace(/\D/g, "");
        return Number(qClass) === Number(selectedClass);
      });

  // Grouping Logic (Applied to FILTERED data)
  const groupedQuizzes = filteredQuizzes.reduce((acc, quiz) => {
    // Normalize: remove "Class " prefix if it already exists in the data
    const rawClass = String(quiz.class || "").replace(/^Class\s+/i, "");
    const cls = rawClass ? `Class ${rawClass}` : "Uncategorized";
    
    if (!acc[cls]) acc[cls] = [];
    acc[cls].push(quiz);
    return acc;
  }, {} as Record<string, Quiz[]>);

  // Sorting Logic
  const sortedClasses = Object.keys(groupedQuizzes).sort((a, b) => {
    if (a === "Uncategorized") return 1;
    if (b === "Uncategorized") return -1;
    // Extract numbers for reliable sorting (e.g., "Class 4" -> 4)
    const numA = parseInt(a.replace(/\D/g, "")) || 0;
    const numB = parseInt(b.replace(/\D/g, "")) || 0;
    return numA - numB;
  });

  if (loading) return (
    <div className="flex min-h-[50vh] items-center justify-center">
      <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }}>
        <Rocket className="h-12 w-12 text-cyan-500" />
      </motion.div>
    </div>
  )

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-800">Quizzes</h1>
          <p className="text-gray-500">Create and manage quizzes for your courses</p>
        </div>
        
        <div className="flex items-center gap-3">
          <select
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
            className="h-10 px-4 py-2 rounded-xl border-2 border-gray-100 bg-white text-sm font-bold text-gray-700 focus:border-cyan-500 outline-none transition-all shadow-sm"
          >
            <option value="all">All Classes</option>
            <option value="4">Class 4</option>
            <option value="6">Class 6</option>
            <option value="7">Class 7</option>
            <option value="8">Class 8</option>
            <option value="9">Class 9</option>
          </select>

          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2 bg-gradient-to-r from-cyan-500 to-blue-500 transition-all hover:scale-105 active:scale-95">
                <PlusCircle className="h-5 w-5" /> Create Quiz
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl border-0 shadow-2xl">
              <DialogHeader>
                <DialogTitle className="text-2xl font-black text-gray-800">Create New Quiz</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleCreate} className="space-y-6 pt-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2 space-y-2">
                    <Label className="font-bold text-gray-700">Select Course*</Label>
                    <Select value={form.courseId} onValueChange={v => setForm(p => ({ ...p, courseId: v }))}>
                      <SelectTrigger className="h-12 rounded-xl border-2 border-gray-100 bg-gray-50">
                        <SelectValue placeholder="Which course is this for?" />
                      </SelectTrigger>
                      <SelectContent>
                        {courses.map(c => <SelectItem key={c.id} value={String(c.id)}>{c.title}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="col-span-2 space-y-2">
                    <Label className="font-bold text-gray-700">Quiz Title*</Label>
                    <Input className="h-12 rounded-xl border-2 border-gray-100 bg-gray-50" value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} placeholder="e.g., Chapter 1 Quiz" required />
                  </div>
                  <div className="space-y-2">
                    <Label className="font-bold text-gray-700">Time Limit (mins)</Label>
                    <Input className="h-12 rounded-xl border-2 border-gray-100 bg-gray-50" type="number" value={form.timeLimit} onChange={e => setForm(p => ({ ...p, timeLimit: +e.target.value }))} min={5} max={120} />
                  </div>
                  <div className="space-y-2">
                    <Label className="font-bold text-gray-700">Passing Score (%)</Label>
                    <Input className="h-12 rounded-xl border-2 border-gray-100 bg-gray-50" type="number" value={form.passingScore} onChange={e => setForm(p => ({ ...p, passingScore: +e.target.value }))} min={1} max={100} />
                  </div>
                </div>

                <div className="space-y-5 pt-4 border-t-2 border-gray-50">
                  <div className="flex items-center justify-between">
                    <Label className="text-lg font-black text-gray-800">Questions</Label>
                    <Button type="button" size="sm" variant="outline" className="rounded-full border-2 border-cyan-100 text-cyan-600 font-bold hover:bg-cyan-50" onClick={() => setQuestions(q => [...q, defaultQuestion()])}>
                      <PlusCircle className="mr-2 h-4 w-4" /> Add Question
                    </Button>
                  </div>
                  
                  {questions.map((q, qi) => (
                    <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} key={qi} className="rounded-2xl border-2 border-gray-100 p-5 space-y-4 bg-white shadow-sm ring-1 ring-black/5">
                      <div className="flex items-center justify-between">
                        <Badge className="bg-cyan-50 text-cyan-600 border-0 text-sm font-bold">Question {qi + 1}</Badge>
                        {questions.length > 1 && (
                          <Button type="button" size="sm" variant="ghost" className="text-rose-500 hover:bg-rose-50 rounded-full h-8 w-8 p-0" onClick={() => setQuestions(qs => qs.filter((_, i) => i !== qi))}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                      <Input className="h-12 rounded-xl border-gray-100 bg-gray-50 font-medium" placeholder="Type your question here..." value={q.question} onChange={e => setQuestions(qs => qs.map((x, i) => i === qi ? { ...x, question: e.target.value } : x))} required />
                      <div className="grid grid-cols-2 gap-3 pt-2">
                        {(["option1", "option2", "option3", "option4"] as const).map((opt, oi) => (
                          <div key={opt} className="group flex items-center gap-3 bg-gray-50/50 p-2 rounded-xl transition-all hover:bg-white hover:ring-2 hover:ring-cyan-100">
                            <input
                              type="radio"
                              name={`correct-${qi}`}
                              checked={q.correctAnswer === oi + 1}
                              onChange={() => setQuestions(qs => qs.map((x, i) => i === qi ? { ...x, correctAnswer: oi + 1 } : x))}
                              className="h-5 w-5 accent-cyan-500 cursor-pointer"
                            />
                            <Input
                              placeholder={`Option ${String.fromCharCode(65 + oi)}`}
                              value={q[opt]}
                              onChange={e => setQuestions(qs => qs.map((x, i) => i === qi ? { ...x, [opt]: e.target.value } : x))}
                              required
                              className="h-10 border-0 bg-transparent text-sm focus-visible:ring-0 focus-visible:ring-offset-0 px-0"
                            />
                          </div>
                        ))}
                      </div>
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest pl-1">Choose the correct answer using the radio buttons</p>
                    </motion.div>
                  ))}
                </div>

                <div className="flex gap-4 pt-6">
                  <Button type="button" variant="ghost" className="flex-1 h-12 rounded-xl font-bold text-gray-500" onClick={() => setDialogOpen(false)}>Cancel</Button>
                  <Button type="submit" className="flex-1 h-12 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 font-bold text-lg shadow-lg shadow-cyan-500/20" disabled={saving || !form.courseId || !form.title}>
                    {saving ? <Loader2 className="h-5 w-5 animate-spin" /> : "Create Quiz Now"}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {filteredQuizzes.length > 0 ? (
        <div className="space-y-12">
          {sortedClasses.map((cls) => (
            <div key={cls} className="space-y-6">
              <div className="flex items-center gap-4">
                <h2 className="text-2xl font-black text-gray-800">{cls}</h2>
                <div className="h-1.5 flex-1 bg-gradient-to-r from-gray-100 to-transparent rounded-full" />
                <Badge variant="outline" className="text-gray-400 border-gray-100 bg-white">
                  {groupedQuizzes[cls].length} Quizzes
                </Badge>
              </div>

              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {groupedQuizzes[cls].map((quiz, index) => (
                  <motion.div 
                    key={quiz.id} 
                    initial={{ opacity: 0, y: 20 }} 
                    animate={{ opacity: 1, y: 0 }} 
                    transition={{ delay: index * 0.1 }}
                  >
                    <Card className="border-0 bg-white/80 shadow-xl backdrop-blur h-full overflow-hidden transition-all hover:shadow-2xl hover:-translate-y-1">
                      <CardContent className="p-0">
                        <div className="h-32 bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center relative">
                          <CheckSquare className="h-16 w-16 text-white/20" />
                          <div className="absolute right-4 top-4 flex flex-col gap-2 items-end">
                            <Badge className="bg-white/20 text-white backdrop-blur border-0 font-bold">{quiz.question_count} Qs</Badge>
                            <Badge className="bg-black/10 text-white backdrop-blur border-0 text-[10px] font-bold">
                              {String(quiz.class || "").toLowerCase().includes("class") ? quiz.class : `Class ${quiz.class || "?"}`}
                            </Badge>
                          </div>
                        </div>
                        <div className="p-6">
                          <p className="text-xs font-black text-cyan-600 uppercase tracking-widest mb-1">{quiz.course_title}</p>
                          <h3 className="text-lg font-bold text-gray-800 mb-4 line-clamp-1">{quiz.title}</h3>
                          
                          <div className="grid grid-cols-3 gap-2 mb-6 text-center">
                            <div className="bg-gray-50 rounded-xl p-2">
                              <p className="text-[10px] text-gray-400 font-bold uppercase">Time</p>
                              <p className="text-xs font-black text-gray-700">{quiz.time_limit}m</p>
                            </div>
                            <div className="bg-gray-50 rounded-xl p-2">
                              <p className="text-[10px] text-gray-400 font-bold uppercase">Pass</p>
                              <p className="text-xs font-black text-gray-700">{quiz.passing_score}%</p>
                            </div>
                            <div className="bg-gray-50 rounded-xl p-2">
                              <p className="text-[10px] text-gray-400 font-bold uppercase">Done</p>
                              <p className="text-xs font-black text-gray-700">{quiz.submission_count}</p>
                            </div>
                          </div>

                          <div className="flex flex-col gap-2">
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className={`w-full font-bold justify-between rounded-xl transition-all ${selectedQuizId === quiz.id ? 'bg-violet-50 text-violet-700' : 'text-violet-600 hover:bg-violet-50'}`}
                              onClick={() => setSelectedQuizId(prev => prev === quiz.id ? null : quiz.id)}
                            >
                              {selectedQuizId === quiz.id ? "Hide Details" : "View Questions"}
                              <PlusCircle className={`h-4 w-4 transition-transform duration-300 ${selectedQuizId === quiz.id ? "rotate-45" : ""}`} />
                            </Button>

                            {selectedQuizId === quiz.id && (
                              <motion.div 
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: "auto", opacity: 1 }}
                                className="mt-4 space-y-4 pt-4 border-t-2 border-dashed border-gray-100"
                              >
                                {quiz.questions && quiz.questions.length > 0 ? (
                                  quiz.questions.map((q, idx) => (
                                    <div key={q.id} className="space-y-3 bg-gray-50/50 p-3 rounded-2xl border border-gray-100">
                                      <p className="text-sm font-bold text-gray-700 leading-tight">
                                        <span className="text-cyan-500 mr-1">{idx + 1}.</span> {q.question}
                                      </p>
                                      <ul className="grid grid-cols-1 gap-1.5 ml-2">
                                        {q.options?.map((opt, i) => (
                                          <li key={i} className="text-[11px] bg-white p-2 rounded-lg border border-gray-100 text-gray-600 flex items-center transition-all hover:ring-1 hover:ring-cyan-200">
                                            <Badge variant="outline" className="h-5 w-5 p-0 flex items-center justify-center mr-2 bg-gray-50 text-[10px] font-black border-gray-200 text-gray-500">
                                              {String.fromCharCode(65 + i)}
                                            </Badge> 
                                            {opt}
                                          </li>
                                        ))}
                                      </ul>
                                    </div>
                                  ))
                                ) : (
                                  <div className="py-8 text-center bg-gray-50 rounded-2xl border-2 border-dashed border-gray-100">
                                    <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">No questions added</p>
                                  </div>
                                )}
                              </motion.div>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <motion.div initial={{ scale: 0.8 }} animate={{ scale: 1 }} className="mb-8 flex h-28 w-28 items-center justify-center rounded-[2.5rem] bg-gray-50 text-gray-200 shadow-inner">
            <CheckSquare className="h-14 w-14" />
          </motion.div>
          <h3 className="mb-2 text-2xl font-black text-gray-800">
            {quizzes.length === 0 ? "No Quizzes Found" : "No Matches for Filter"}
          </h3>
          <p className="text-gray-500 max-w-xs mx-auto font-medium">
            {quizzes.length === 0 
              ? "Start by creating your first quiz using the button above." 
              : "Try switching to 'All Classes' or selecting a different grade level."}
          </p>
        </div>
      )}
    </div>
  )
}
