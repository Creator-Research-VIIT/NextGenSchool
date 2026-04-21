"use client"

import { useEffect, useState, useRef } from "react"
import Link from "next/link"
import html2canvas from "html2canvas"
import jsPDF from "jspdf"
import { CertificateTemplate } from "@/components/certificate-template"
import { motion, AnimatePresence } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { toast } from "sonner"
import confetti from "canvas-confetti"
import { 
  Award, Download, Share2, ExternalLink, Rocket, 
  Trophy, Star, Sparkles, CheckCircle, ShieldCheck, 
  ArrowRight, Loader2, AlertCircle 
} from "lucide-react"

interface Certificate {
  id: string
  course_title: string
  course_id: string
  issued_at: string
  certificate_number: string
  student_name: string
  institution_name?: string
}

interface completableCourse {
  id: string
  title: string
  progress: number
}

export default function StudentCertificatesPage() {
  const [certificates, setCertificates] = useState<Certificate[]>([])
  const [completable, setCompletable] = useState<completableCourse[]>([])
  const [loading, setLoading] = useState(true)
  const [applyingId, setApplyingId] = useState<string | null>(null)
  const [downloadingId, setDownloadingId] = useState<string | null>(null)
  const certRefs = useRef<{ [key: string]: HTMLDivElement | null }>({})

  useEffect(() => {
    fetchData()
  }, [])

  async function fetchData() {
    try {
      const [certsRes, completionsRes] = await Promise.all([
        fetch("/api/student/certificates"),
        fetch("/api/student/enrollments")
      ])
      
      if (certsRes.ok) setCertificates(await certsRes.json())
      
      if (completionsRes.ok) {
        const enrollments = await completionsRes.json()
        // Filter courses that are 100% but don't have a certificate yet
        const ready = enrollments.filter((e: any) => 
          e.progress === 100 && !certificates.some(c => c.course_id === e.id)
        )
        setCompletable(ready)
      }
    } catch (error) {
      toast.error("Failed to load achievement data.")
    } finally {
      setLoading(false)
    }
  }

  async function handleApply(courseId: string) {
    setApplyingId(courseId)
    try {
      const res = await fetch("/api/student/certificates/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ courseId })
      })
      if (res.ok) {
        confetti({ particleCount: 200, spread: 80, origin: { y: 0.6 } })
        toast.success("Certificate issued successfully!")
        fetchData() // Refresh
      } else {
        const err = await res.json()
        toast.error(err.error || "Failed to issue certificate.")
      }
    } catch (e) {
      toast.error("An unexpected error occurred.")
    } finally {
      setApplyingId(null)
    }
  }

  async function handleDownloadPDF(cert: Certificate) {
    console.log("Certificate Data:", cert)
    console.log("Institution Name:", cert.institution_name)
    
    const element = certRefs.current[cert.id]
    if (!element) {
      console.error("Certificate element not found")
      toast.error("Template not ready")
      return
    }

    setDownloadingId(cert.id)
    try {
      // Small delay to ensure the off-screen template is fully rendered
      await new Promise(resolve => setTimeout(resolve, 500))

      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        backgroundColor: "#ffffff",
        onclone: (clonedDoc) => {
          // Prevent html2canvas from parsing global stylesheets that contain oklch
          const head = clonedDoc.getElementsByTagName("head")[0];
          if (head) {
            const styles = head.getElementsByTagName("style");
            const links = head.getElementsByTagName("link");
            
            // Remove all style tags
            while (styles.length > 0) {
              styles[0].parentNode?.removeChild(styles[0]);
            }
            
            // Remove all stylesheet links
            for (let i = links.length - 1; i >= 0; i--) {
              if (links[i].rel === "stylesheet") {
                links[i].parentNode?.removeChild(links[i]);
              }
            }
          }

          // Force all elements in the clone to avoid any inherited oklch vars
          const elements = clonedDoc.getElementsByTagName("*");
          for (let i = 0; i < elements.length; i++) {
            const el = elements[i] as HTMLElement;
            if (el.style) {
              el.style.borderColor = "#c084fc";
              el.style.outlineColor = "transparent";
              el.style.color = el.style.color || "#1f2937";
            }
          }
        }
      })

      const imgData = canvas.toDataURL("image/png")
      const pdf = new jsPDF("landscape", "mm", "a4")
      
      pdf.addImage(imgData, "PNG", 0, 0, 297, 210)
      pdf.save(`Certificate_${cert.course_title.replace(/\s+/g, "_")}.pdf`)
      
      toast.success("Certificate downloaded!")
    } catch (err) {
      console.error(err)
      toast.error("Failed to generate PDF")
    } finally {
      setDownloadingId(null)
    }
  }

  if (loading) {
    return (
      <div className="space-y-8">
        <Skeleton className="h-10 w-64" />
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map(i => <Skeleton key={i} className="h-64 rounded-3xl" />)}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-12 pb-20">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-4xl font-black text-gray-800 tracking-tight">Achievements</h1>
          <p className="text-gray-500 font-medium">Celebrate your hard work and verified skills</p>
        </div>
        <Badge className="bg-amber-100 text-amber-700 border-amber-200 px-4 py-1.5 rounded-full text-sm font-bold">
           <Trophy className="mr-2 h-4 w-4" /> {certificates.length} Certificates Earned
        </Badge>
      </div>

      {/* Ready to Claim Section */}
      <AnimatePresence>
        {completable.length > 0 && (
          <motion.section 
            initial={{ opacity: 0, height: 0 }} 
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="space-y-6"
          >
            <div className="flex items-center gap-2">
               <Sparkles className="h-6 w-6 text-violet-500" />
               <h2 className="text-2xl font-black text-gray-800">Ready to Claim</h2>
            </div>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
               {completable.map(course => (
                 <Card key={course.id} className="border-0 bg-violet-600 text-white shadow-2xl shadow-violet-200 overflow-hidden relative">
                    <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-white/10 blur-2xl" />
                    <CardHeader>
                       <CardTitle className="text-xl font-bold">{course.title}</CardTitle>
                       <CardDescription className="text-white/70">You've completed 100% of this course!</CardDescription>
                    </CardHeader>
                    <CardContent>
                       <div className="flex items-center gap-3 mb-6">
                          <div className="h-10 w-10 flex items-center justify-center rounded-xl bg-white/20">
                             <CheckCircle className="h-6 w-6 text-white" />
                          </div>
                          <p className="text-sm font-bold uppercase tracking-wider">Course Complete</p>
                       </div>
                       <Button 
                        onClick={() => handleApply(course.id)} 
                        disabled={applyingId === course.id}
                        className="w-full bg-white text-violet-600 font-black hover:bg-white/90"
                       >
                          {applyingId === course.id ? <Loader2 className="h-5 w-5 animate-spin" /> : <>Claim Certificate <ArrowRight className="ml-2 h-4 w-4" /></>}
                       </Button>
                    </CardContent>
                 </Card>
               ))}
            </div>
          </motion.section>
        )}
      </AnimatePresence>

      {/* Earned Certificates */}
      <section className="space-y-6">
        <div className="flex items-center gap-2">
           <ShieldCheck className="h-6 w-6 text-emerald-500" />
           <h2 className="text-2xl font-black text-gray-800">Verified Certificates</h2>
        </div>

        {certificates.length > 0 ? (
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {certificates.map((cert, index) => (
              <motion.div
                key={cert.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="group relative h-full overflow-hidden border-0 bg-white/80 shadow-xl backdrop-blur transition-all hover:shadow-2xl">
                  <div className="h-2 bg-gradient-to-r from-amber-400 to-yellow-500" />
                  <CardContent className="p-8">
                    <div className="mb-6 flex justify-center">
                      <div className="relative">
                        <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-amber-100 shadow-inner">
                          <Award className="h-10 w-10 text-amber-600" />
                        </div>
                        <motion.div animate={{ rotate: 360 }} transition={{ duration: 10, repeat: Infinity, ease: "linear" }} className="absolute -right-2 -top-2">
                           <Star className="h-6 w-6 fill-amber-400 text-amber-400" />
                        </motion.div>
                      </div>
                    </div>

                    <div className="text-center space-y-4">
                      <div>
                        <h3 className="text-lg font-black text-gray-800 line-clamp-1">{cert.course_title}</h3>
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1">Completion Certificate</p>
                      </div>

                      <div className="rounded-2xl bg-gray-50 p-3 text-left border border-gray-100">
                         <p className="text-[10px] font-bold text-gray-400 uppercase">Verification ID</p>
                         <p className="text-xs font-black text-gray-700 font-mono">{cert.certificate_number}</p>
                      </div>

                      <div className="pt-4 flex flex-col gap-2">
                        <Button asChild className="w-full bg-violet-600 font-bold">
                           <Link href={`/verify-certificate/${cert.certificate_number}`} target="_blank">
                              <ExternalLink className="mr-2 h-4 w-4" /> Verify Publicly
                           </Link>
                        </Button>
                        <div className="flex gap-2">
                           <Button 
                              variant="outline" 
                              className="flex-1 rounded-xl"
                              onClick={() => handleDownloadPDF(cert)}
                              disabled={downloadingId === cert.id}
                            >
                               {downloadingId === cert.id ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Download className="mr-2 h-4 w-4" />} PDF
                            </Button>
                           <Button variant="outline" className="flex-1 rounded-xl">
                              <Share2 className="mr-2 h-4 w-4" /> Share
                           </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-center bg-white/50 rounded-[40px] border-2 border-dashed border-gray-100">
            <div className="mb-6 flex h-24 w-24 items-center justify-center rounded-3xl bg-gray-50 text-gray-300">
              <Award className="h-12 w-12" />
            </div>
            <h3 className="text-xl font-black text-gray-800">No certificates earned yet</h3>
            <p className="mt-2 max-w-sm text-gray-500 font-medium">Complete your enrolled courses 100% to unlock your professional certifications.</p>
            <Button asChild className="mt-8 bg-violet-600 rounded-full px-8">
               <Link href="/dashboard/student/courses">Browse Courses</Link>
            </Button>
          </div>
        )}
      </section>

      {/* Hidden Certificate Templates for PDF Generation */}
      {certificates.map((cert) => (
        <CertificateTemplate
          key={cert.id}
          ref={(el) => {
            certRefs.current[cert.id] = el
          }}
          studentName={cert.student_name}
          courseTitle={cert.course_title}
          issuedAt={cert.issued_at}
          certificateNumber={cert.certificate_number}
          institutionName={cert.institution_name}
        />
      ))}
    </div>
  )
}
