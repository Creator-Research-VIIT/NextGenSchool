"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { BookOpen, Users, Clock, PlusCircle, Edit, Trash2, Rocket, MoreVertical, CheckCircle, AlertCircle } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { toast } from "sonner"

interface Course {
  id: string
  title: string
  description: string
  status: string
  total_enrolled: number
  approved_enrolled: number
  modules_count: number
  created_at: string
  class?: number
}

export default function TeacherCoursesPage() {
  const [courses, setCourses] = useState<Course[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedClass, setSelectedClass] = useState("all")

  useEffect(() => {
    fetchCourses()
  }, [])

  async function fetchCourses() {
    try {
      const res = await fetch("/api/teacher/courses")
      if (res.ok) {
        const data = await res.json()
        setCourses(data)
      }
    } catch (error) {
      console.error("Failed to fetch courses:", error)
      toast.error("Failed to load courses")
    } finally {
      setLoading(false)
    }
  }

  async function handleDelete(courseId: string) {
    if (!confirm("Are you sure you want to delete this course? This action cannot be undone.")) return
    
    try {
      const res = await fetch(`/api/course/${courseId}`, {
        method: "DELETE",
      })
      if (res.ok) {
        toast.success("Course deleted successfully")
        fetchCourses()
      } else {
        toast.error("Failed to delete the course")
      }
    } catch (error) {
      console.error("Failed to delete course:", error)
      toast.error("An error occurred during deletion")
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "approved":
        return <Badge className="bg-emerald-500/90 text-white border-0 backdrop-blur"><CheckCircle className="mr-1 h-3 w-3" />Published</Badge>
      case "pending":
        return <Badge className="bg-amber-500/90 text-white border-0 backdrop-blur"><Clock className="mr-1 h-3 w-3" />Pending</Badge>
      default:
        return <Badge className="bg-gray-500/90 text-white border-0 backdrop-blur"><AlertCircle className="mr-1 h-3 w-3" />Draft</Badge>
    }
  }

  // Filter Logic
  const filteredCourses = selectedClass === "all" 
    ? courses 
    : courses.filter(c => {
        // Strip non-numeric characters (like "Class ") for reliable comparison
        const cClass = String(c.class || "").replace(/\D/g, "");
        return Number(cClass) === Number(selectedClass);
      });

  // Grouping Logic
  const groupedCourses = filteredCourses.reduce((acc, course) => {
    // Normalize: remove "Class " prefix if it already exists in the data
    const rawClass = String(course.class || "").replace(/^Class\s+/i, "");
    const cls = rawClass ? `Class ${rawClass}` : "Uncategorized";
    
    if (!acc[cls]) acc[cls] = [];
    acc[cls].push(course);
    return acc;
  }, {} as Record<string, Course[]>);

  // Sorting Logic
  const sortedClasses = Object.keys(groupedCourses).sort((a, b) => {
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
      {/* Header Container */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-800 tracking-tight">My Courses</h1>
          <p className="text-gray-500 font-medium">Create and manage your academic curriculum</p>
        </div>
        
        <div className="flex items-center gap-3">
          <select
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
            className="h-10 px-4 py-2 rounded-xl border-2 border-gray-100 bg-white text-sm font-bold text-gray-700 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 outline-none transition-all shadow-sm cursor-pointer"
          >
            <option value="all">All Grades</option>
            <option value="4">Class 4</option>
            <option value="6">Class 6</option>
            <option value="7">Class 7</option>
            <option value="8">Class 8</option>
            <option value="9">Class 9</option>
          </select>

          <Link href="/dashboard/teacher/courses/new">
            <Button className="gap-2 bg-gradient-to-r from-cyan-500 to-blue-500 shadow-lg shadow-cyan-500/25 transition-all hover:scale-105 active:scale-95">
              <PlusCircle className="h-5 w-5" />
              New Course
            </Button>
          </Link>
        </div>
      </div>

      {filteredCourses.length > 0 ? (
        <div className="space-y-12">
          {sortedClasses.map((cls) => (
            <div key={cls} className="space-y-6">
              <div className="flex items-center gap-4">
                <h2 className="text-2xl font-black text-gray-800">{cls}</h2>
                <div className="h-1.5 flex-1 bg-gradient-to-r from-gray-100 to-transparent rounded-full" />
                <Badge variant="outline" className="text-gray-400 border-gray-100 bg-white px-3 font-bold">
                  {groupedCourses[cls].length} Courses
                </Badge>
              </div>

              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {groupedCourses[cls].map((course, index) => (
                  <motion.div
                    key={course.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Card className="h-full border-0 bg-white/80 shadow-xl backdrop-blur-sm overflow-hidden transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 group">
                      <CardContent className="p-0">
                        {/* Artwork Area */}
                        <div className="relative h-40 overflow-hidden bg-gradient-to-br from-cyan-500 to-blue-600">
                          <div className="absolute inset-0 flex items-center justify-center transition-transform duration-500 group-hover:scale-110">
                            <BookOpen className="h-16 w-16 text-white/20" />
                          </div>
                          
                          <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                          
                          <div className="absolute right-3 top-3 z-10">
                            {getStatusBadge(course.status)}
                          </div>
                          
                          <div className="absolute left-3 top-3 z-10">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-9 w-9 bg-white/20 text-white backdrop-blur hover:bg-white/40 border-0">
                                  <MoreVertical className="h-5 w-5" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="start" className="rounded-xl border-0 shadow-2xl">
                                <DropdownMenuItem asChild className="focus:bg-cyan-50 cursor-pointer">
                                  <Link href={`/dashboard/teacher/courses/${course.id}/edit`} className="flex w-full items-center font-semibold">
                                    <Edit className="mr-2 h-4 w-4" />
                                    Edit Course
                                  </Link>
                                </DropdownMenuItem>
                                <DropdownMenuItem 
                                  className="text-rose-600 focus:bg-rose-50 font-semibold cursor-pointer"
                                  onClick={() => handleDelete(course.id)}
                                >
                                  <Trash2 className="mr-2 h-4 w-4" />
                                  Delete Course
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>

                          <div className="absolute left-4 bottom-4">
                            <Badge className="bg-black/20 text-white border-0 backdrop-blur font-bold uppercase tracking-widest text-[10px]">
                              {String(course.class || "").toLowerCase().includes("class") ? course.class : `Grade ${course.class || "?"}`}
                            </Badge>
                          </div>
                        </div>

                        {/* Content Area */}
                        <div className="p-6">
                          <h3 className="mb-2 line-clamp-1 text-xl font-black text-gray-800 group-hover:text-cyan-600 transition-colors">
                            {course.title}
                          </h3>
                          <p className="mb-6 line-clamp-2 text-sm text-gray-500 leading-relaxed min-h-[40px]">
                            {course.description || "Empowering students with knowledge through this tailored curriculum."}
                          </p>
                          
                          <div className="mb-6 grid grid-cols-2 gap-4">
                            <div className="bg-gray-50/50 rounded-2xl p-3 text-center border border-gray-100">
                                <Users className="h-4 w-4 mx-auto mb-1 text-gray-400" />
                                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Students</p>
                                <p className="text-sm font-black text-gray-700">{course.total_enrolled}</p>
                            </div>
                            <div className="bg-gray-50/50 rounded-2xl p-3 text-center border border-gray-100">
                                <BookOpen className="h-4 w-4 mx-auto mb-1 text-gray-400" />
                                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Modules</p>
                                <p className="text-sm font-black text-gray-700">{course.modules_count}</p>
                            </div>
                          </div>

                          <Link href={`/dashboard/teacher/courses/${course.id}`}>
                            <Button className="w-full h-12 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 font-bold text-lg shadow-lg shadow-cyan-500/10 hover:shadow-cyan-500/30">
                              Manage Content
                            </Button>
                          </Link>
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
          <motion.div initial={{ scale: 0.8 }} animate={{ scale: 1 }} className="mb-8 flex h-28 w-28 items-center justify-center rounded-[2.5rem] bg-gray-50 text-gray-200">
            <BookOpen className="h-14 w-14" />
          </motion.div>
          <h3 className="mb-2 text-2xl font-black text-gray-800">
            {courses.length === 0 ? "No Courses Found" : "No Matches for Filter"}
          </h3>
          <p className="mb-8 text-gray-500 max-w-xs mx-auto font-medium">
            {courses.length === 0 
              ? "Start by building your first academic course today." 
              : "Try switching to 'All Grades' or selecting a different class level."}
          </p>
          <Link href="/dashboard/teacher/courses/new">
            <Button className="h-12 px-8 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 font-bold shadow-lg shadow-cyan-500/20">
              <PlusCircle className="mr-2 h-5 w-5" />
              Build Course
            </Button>
          </Link>
        </div>
      )}
    </div>
  )
}
