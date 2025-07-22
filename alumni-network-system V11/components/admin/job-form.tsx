"use client"

import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  Briefcase, 
  Building, 
  MapPin, 
  DollarSign, 
  Users, 
  Star,
  X, 
  Plus,
  Mail
} from "lucide-react"
import { toast } from "sonner"
import type { Job } from "@/lib/api/jobsApi"
import type { CreateJobRequest, UpdateJobRequest } from "@/lib/api/jobsApi"

const jobFormSchema = z.object({
  title: z.string().min(1, "Job title is required").max(200, "Title too long"),
  company: z.object({
    name: z.string().min(1, "Company name is required").max(100, "Company name too long"),
    website: z.string().url("Must be a valid URL").optional().or(z.literal("")).transform(val => val === "" ? undefined : val),
    logo: z.string().url("Must be a valid URL").optional().or(z.literal("")).transform(val => val === "" ? undefined : val),
    description: z.string().optional(),
    location: z.object({
      city: z.string().min(1, "City is required"),
      state: z.string().optional(),
      country: z.string().min(1, "Country is required"),
      isRemote: z.boolean(),
    }),
  }),
  description: z.string().min(1, "Job description is required").max(5000, "Description too long"),
  requirements: z.array(z.string()).optional(),
  responsibilities: z.array(z.string()).optional(),
  benefits: z.array(z.string()).optional(),
  type: z.enum(["full-time", "part-time", "contract", "internship", "volunteer"]),
  category: z.enum(["technology", "healthcare", "finance", "education", "marketing", "sales", "operations", "other"]),
  experienceLevel: z.enum(["entry", "mid", "senior", "executive"]),
  skills: z.array(z.string()).optional(),
  tags: z.array(z.string()).optional(),
  salary: z.object({
    min: z.number().min(0, "Minimum salary must be positive").optional(),
    max: z.number().min(0, "Maximum salary must be positive").optional(),
    currency: z.string().min(1, "Currency is required"),
    period: z.enum(["hourly", "monthly", "yearly"]),
    isNegotiable: z.boolean().optional(),
  }).optional().refine(
    (data) => {
      if (data && data.min && data.max) {
        return data.min <= data.max
      }
      return true
    },
    {
      message: "Minimum salary cannot be greater than maximum salary",
      path: ["min"],
    }
  ),
  applicationMethod: z.enum(["email", "website", "phone", "in_person"]),
  applicationEmail: z.string().email("Must be a valid email").optional().or(z.literal("")).transform(val => val === "" ? undefined : val),
  applicationUrl: z.string().url("Must be a valid URL").optional().or(z.literal("")).transform(val => val === "" ? undefined : val),
  applicationPhone: z.string().optional(),
  applicationDeadline: z.string().optional(),
  contactInfo: z.object({
    email: z.string().email("Must be a valid email").optional().or(z.literal("")).transform(val => val === "" ? undefined : val),
    phone: z.string().optional(),
    contactPerson: z.string().optional(),
  }).optional(),
  featured: z.boolean().optional(),
  status: z.enum(["active", "expired", "filled", "paused"]).optional(),
  expiresAt: z.string().optional(),
  questionnaire: z.array(z.string()).optional(),
}).refine(
  (data) => {
    // Validate application method requirements
    if (data.applicationMethod === "email" && (!data.applicationEmail || data.applicationEmail === "")) {
      return false
    }
    if (data.applicationMethod === "website" && (!data.applicationUrl || data.applicationUrl === "")) {
      return false
    }
    if (data.applicationMethod === "phone" && (!data.applicationPhone || data.applicationPhone === "")) {
      return false
    }
    return true
  },
  {
    message: "Please provide the required application contact information",
    path: ["applicationMethod"],
  }
)

type JobFormData = z.infer<typeof jobFormSchema>

interface JobFormProps {
  job?: Job
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: CreateJobRequest | UpdateJobRequest) => Promise<void>
  isLoading?: boolean
  error?: string
}

export function JobForm({ job, isOpen, onClose, onSubmit, isLoading, error }: JobFormProps) {
  const [currentSkill, setCurrentSkill] = useState("")
  const [skills, setSkills] = useState<string[]>([])
  const [currentRequirement, setCurrentRequirement] = useState("")
  const [requirements, setRequirements] = useState<string[]>([])
  const [currentResponsibility, setCurrentResponsibility] = useState("")
  const [responsibilities, setResponsibilities] = useState<string[]>([])
  const [currentBenefit, setCurrentBenefit] = useState("")
  const [benefits, setBenefits] = useState<string[]>([])
  const [currentTag, setCurrentTag] = useState("")
  const [tags, setTags] = useState<string[]>([])
  const [questionnaire, setQuestionnaire] = useState<string[]>([])
  const [currentQuestion, setCurrentQuestion] = useState("")

  const form = useForm<JobFormData>({
    resolver: zodResolver(jobFormSchema),
    defaultValues: {
      title: "",
      company: {
        name: "",
        website: "",
        logo: "",
        description: "",
        location: {
          city: "",
          state: "",
          country: "",
          isRemote: false,
        },
      },
      description: "",
      requirements: [],
      responsibilities: [],
      benefits: [],
      type: "full-time",
      category: "technology",
      experienceLevel: "mid",
      skills: [],
      tags: [],
      salary: {
        min: undefined,
        max: undefined,
        currency: "USD",
        period: "yearly",
        isNegotiable: false,
      },
      applicationMethod: "email",
      applicationEmail: "",
      applicationUrl: "",
      applicationPhone: "",
      applicationDeadline: "",
      contactInfo: {
        email: "",
        phone: "",
        contactPerson: "",
      },
      featured: false,
      status: "active",
      expiresAt: "",
      questionnaire: [],
    },
  })

  const applicationMethod = form.watch("applicationMethod")
  const hasSalary = form.watch("salary")

  // Reset form when job changes
  useEffect(() => {
    if (job) {
      form.reset({
        title: job.title || "",
        company: {
          name: job.company?.name || "",
          website: job.company?.website || "",
          logo: job.company?.logo || "",
          description: job.company?.description || "",
          location: {
            city: job.company?.location?.city || "",
            state: job.company?.location?.state || "",
            country: job.company?.location?.country || "",
            isRemote: job.company?.location?.isRemote || false,
          },
        },
        description: job.description || "",
        requirements: job.requirements || [],
        responsibilities: job.responsibilities || [],
        benefits: job.benefits || [],
        type: job.type || "full-time",
        category: job.category || "technology",
        experienceLevel: job.experienceLevel || "mid",
        skills: job.skills || [],
        tags: job.tags || [],
        salary: job.salary ? {
          min: job.salary.min,
          max: job.salary.max,
          currency: job.salary.currency || "USD",
          period: job.salary.period || "yearly",
          isNegotiable: job.salary.isNegotiable || false,
        } : undefined,
        applicationMethod: job.applicationMethod || "email",
        applicationEmail: job.applicationEmail || "",
        applicationUrl: job.applicationUrl || "",
        applicationPhone: job.applicationPhone || "",
        applicationDeadline: job.applicationDeadline ? new Date(job.applicationDeadline).toISOString().slice(0, 16) : "",
        contactInfo: job.contactInfo || {
          email: "",
          phone: "",
          contactPerson: "",
        },
        featured: job.featured || false,
        status: job.status || "active",
        expiresAt: job.expiresAt ? new Date(job.expiresAt).toISOString().slice(0, 16) : "",
        questionnaire: job.questionnaire || [],
      })
      setSkills(job.skills || [])
      setRequirements(job.requirements || [])
      setResponsibilities(job.responsibilities || [])
      setBenefits(job.benefits || [])
      setTags(job.tags || [])
      setQuestionnaire(job.questionnaire || [])
    } else {
      form.reset({
        title: "",
        company: {
          name: "",
          website: "",
          logo: "",
          description: "",
          location: {
            city: "",
            state: "",
            country: "",
            isRemote: false,
          },
        },
        description: "",
        requirements: [],
        responsibilities: [],
        benefits: [],
        type: "full-time",
        category: "technology",
        experienceLevel: "mid",
        skills: [],
        tags: [],
        salary: {
          min: undefined,
          max: undefined,
          currency: "USD",
          period: "yearly",
          isNegotiable: false,
        },
        applicationMethod: "email",
        applicationEmail: "",
        applicationUrl: "",
        applicationPhone: "",
        applicationDeadline: "",
        contactInfo: {
          email: "",
          phone: "",
          contactPerson: "",
        },
        featured: false,
        status: "active",
        expiresAt: "",
        questionnaire: [],
      })
      setSkills([])
      setRequirements([])
      setResponsibilities([])
      setBenefits([])
      setTags([])
      setQuestionnaire([])
    }
  }, [job, form])

  const handleSubmit = async (data: JobFormData) => {
    try {
      console.log("Form data received:", data)
      console.log("Skills:", skills)
      console.log("Requirements:", requirements)
      console.log("Responsibilities:", responsibilities)
      console.log("Benefits:", benefits)
      console.log("Tags:", tags)
      console.log("Questionnaire:", questionnaire)

      // Validate required fields that are managed separately
      if (skills.length === 0) {
        form.setError("skills", { message: "At least one skill is required" })
        toast.error("Please add at least one skill")
        return
      }

      // Validate application method requirements
      if (data.applicationMethod === "email" && !data.applicationEmail) {
        form.setError("applicationEmail", { message: "Email is required for email applications" })
        toast.error("Please provide an application email")
        return
      }
      if (data.applicationMethod === "website" && !data.applicationUrl) {
        form.setError("applicationUrl", { message: "URL is required for website applications" })
        toast.error("Please provide an application URL")
        return
      }
      if (data.applicationMethod === "phone" && !data.applicationPhone) {
        form.setError("applicationPhone", { message: "Phone is required for phone applications" })
        toast.error("Please provide an application phone number")
        return
      }

      const submitData = {
        ...data,
        skills,
        requirements: requirements.length > 0 ? requirements : undefined,
        responsibilities: responsibilities.length > 0 ? responsibilities : undefined,
        benefits: benefits.length > 0 ? benefits : undefined,
        tags: tags.length > 0 ? tags : undefined,
        questionnaire: questionnaire.length > 0 ? questionnaire : undefined,
        // Format dates properly
        applicationDeadline: data.applicationDeadline ? new Date(data.applicationDeadline).toISOString() : undefined,
        expiresAt: data.expiresAt ? new Date(data.expiresAt).toISOString() : undefined,
        // Handle salary properly
        salary: (data.salary?.min || data.salary?.max) ? data.salary : undefined,
        // Clean up contact info
        contactInfo: (data.contactInfo?.email || data.contactInfo?.phone || data.contactInfo?.contactPerson) ? data.contactInfo : undefined,
        // Add postedBy field - this should come from the current user
        postedBy: "64f5b8c123456789abcdef02", // TODO: Get from auth state
      }

      console.log("Final submit data:", submitData)
      
      await onSubmit(submitData)
      onClose()
    } catch (error) {
      console.error("Form submission error:", error)
      // Error handling is done in the parent component
    }
  }

  const addSkill = () => {
    if (currentSkill.trim() && !skills.includes(currentSkill.trim())) {
      setSkills([...skills, currentSkill.trim()])
      setCurrentSkill("")
    }
  }

  const removeSkill = (skillToRemove: string) => {
    setSkills(skills.filter(skill => skill !== skillToRemove))
  }

  const addRequirement = () => {
    if (currentRequirement.trim() && !requirements.includes(currentRequirement.trim())) {
      setRequirements([...requirements, currentRequirement.trim()])
      setCurrentRequirement("")
    }
  }

  const removeRequirement = (requirementToRemove: string) => {
    setRequirements(requirements.filter(req => req !== requirementToRemove))
  }

  const addResponsibility = () => {
    if (currentResponsibility.trim() && !responsibilities.includes(currentResponsibility.trim())) {
      setResponsibilities([...responsibilities, currentResponsibility.trim()])
      setCurrentResponsibility("")
    }
  }

  const removeResponsibility = (responsibilityToRemove: string) => {
    setResponsibilities(responsibilities.filter(resp => resp !== responsibilityToRemove))
  }

  const addBenefit = () => {
    if (currentBenefit.trim() && !benefits.includes(currentBenefit.trim())) {
      setBenefits([...benefits, currentBenefit.trim()])
      setCurrentBenefit("")
    }
  }

  const removeBenefit = (benefitToRemove: string) => {
    setBenefits(benefits.filter(benefit => benefit !== benefitToRemove))
  }

  const addTag = () => {
    if (currentTag.trim() && !tags.includes(currentTag.trim())) {
      setTags([...tags, currentTag.trim()])
      setCurrentTag("")
    }
  }

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove))
  }

  // Questionnaire handlers
  const addQuestion = () => {
    if (currentQuestion.trim() && !questionnaire.includes(currentQuestion.trim())) {
      setQuestionnaire([...questionnaire, currentQuestion.trim()])
      setCurrentQuestion("")
    }
  }
  const removeQuestion = (questionToRemove: string) => {
    setQuestionnaire(questionnaire.filter(q => q !== questionToRemove))
  }

  const jobTypeOptions = [
    { value: "full-time", label: "Full-time" },
    { value: "part-time", label: "Part-time" },
    { value: "contract", label: "Contract" },
    { value: "internship", label: "Internship" },
    { value: "volunteer", label: "Volunteer" },
  ]

  const categoryOptions = [
    { value: "technology", label: "Technology" },
    { value: "healthcare", label: "Healthcare" },
    { value: "finance", label: "Finance" },
    { value: "education", label: "Education" },
    { value: "marketing", label: "Marketing" },
    { value: "sales", label: "Sales" },
    { value: "operations", label: "Operations" },
    { value: "other", label: "Other" },
  ]

  const experienceLevelOptions = [
    { value: "entry", label: "Entry Level" },
    { value: "mid", label: "Mid Level" },
    { value: "senior", label: "Senior Level" },
    { value: "executive", label: "Executive" },
  ]

  const statusOptions = [
    { value: "active", label: "Active" },
    { value: "paused", label: "Paused" },
    { value: "filled", label: "Filled" },
    { value: "expired", label: "Expired" },
  ]

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto border-0 shadow-2xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-2xl p-0">
        <DialogHeader className="flex items-center gap-3 px-6 py-4 bg-gradient-to-r from-blue-500 to-purple-600 rounded-t-2xl">
          <DialogTitle className="text-lg font-bold text-white tracking-tight">
            {job ? "Edit Job" : "Create New Job"}
          </DialogTitle>
          <DialogDescription className="text-white/80">
            {job ? "Update the job details below." : "Fill in the job information to create a new job posting."}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6 px-6 pb-6 pt-2">
            <Tabs defaultValue="basic" className="w-full">
              <TabsList className="grid w-full grid-cols-5 mb-4">
                <TabsTrigger value="basic">Basic Info</TabsTrigger>
                <TabsTrigger value="company">Company</TabsTrigger>
                <TabsTrigger value="details">Job Details</TabsTrigger>
                <TabsTrigger value="application">Application</TabsTrigger>
                <TabsTrigger value="settings">Settings</TabsTrigger>
              </TabsList>

              {/* Basic Information Tab */}
              <TabsContent value="basic" className="space-y-4">
                <Card className="bg-white/70 dark:bg-slate-800/70 backdrop-blur rounded-xl border-0">
                  <CardHeader className="flex flex-row items-center gap-2 pb-2 bg-gradient-to-r from-blue-500/80 to-purple-600/80 rounded-t-xl">
                    <CardTitle className="flex items-center gap-2 text-white text-base font-bold tracking-tight">
                      <Briefcase className="h-5 w-5" />
                      Job Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <FormField
                      control={form.control}
                      name="title"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Job Title *</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g. Senior Software Engineer" {...field} className="bg-white/80 dark:bg-slate-900/60 border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-blue-400/30" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Job Description *</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Describe the job role, what the candidate will be doing..."
                              className="min-h-[120px] bg-white/80 dark:bg-slate-900/60 border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-blue-400/30"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="grid grid-cols-3 gap-4">
                      <FormField
                        control={form.control}
                        name="type"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Job Type *</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value || undefined}>
                              <FormControl>
                                <SelectTrigger className="bg-white/80 dark:bg-slate-900/60 border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-blue-400/30">
                                  <SelectValue placeholder="Select job type" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {jobTypeOptions.map((option) => (
                                  <SelectItem key={option.value} value={option.value}>
                                    {option.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="category"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Category *</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value || undefined}>
                              <FormControl>
                                <SelectTrigger className="bg-white/80 dark:bg-slate-900/60 border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-blue-400/30">
                                  <SelectValue placeholder="Select category" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {categoryOptions.map((option) => (
                                  <SelectItem key={option.value} value={option.value}>
                                    {option.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="experienceLevel"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Experience Level *</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value || undefined}>
                              <FormControl>
                                <SelectTrigger className="bg-white/80 dark:bg-slate-900/60 border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-blue-400/30">
                                  <SelectValue placeholder="Select experience level" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {experienceLevelOptions.map((option) => (
                                  <SelectItem key={option.value} value={option.value}>
                                    {option.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Company Tab */}
              <TabsContent value="company" className="space-y-4">
                <Card className="bg-white/70 dark:bg-slate-800/70 backdrop-blur rounded-xl border-0">
                  <CardHeader className="flex flex-row items-center gap-2 pb-2 bg-gradient-to-r from-blue-500/80 to-purple-600/80 rounded-t-xl">
                    <CardTitle className="flex items-center gap-2 text-white text-base font-bold tracking-tight">
                      <Building className="h-5 w-5" />
                      Company Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="company.name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Company Name *</FormLabel>
                            <FormControl>
                              <Input placeholder="e.g. Tech Corp Inc." {...field} className="bg-white/80 dark:bg-slate-900/60 border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-blue-400/30" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="company.website"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Company Website</FormLabel>
                            <FormControl>
                              <Input placeholder="https://company.com" {...field} className="bg-white/80 dark:bg-slate-900/60 border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-blue-400/30" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <Separator />

                    <div className="space-y-4">
                      <Label className="text-base font-medium flex items-center gap-2">
                        <MapPin className="h-4 w-4" />
                        Location
                      </Label>

                      <FormField
                        control={form.control}
                        name="company.location.isRemote"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center space-x-3 space-y-0">
                            <FormControl>
                              <Checkbox
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                            <div className="space-y-1 leading-none">
                              <FormLabel>Remote Work Available</FormLabel>
                              <FormDescription>
                                This position allows remote work
                              </FormDescription>
                            </div>
                          </FormItem>
                        )}
                      />

                      <div className="grid grid-cols-3 gap-4">
                        <FormField
                          control={form.control}
                          name="company.location.city"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>City *</FormLabel>
                              <FormControl>
                                <Input placeholder="San Francisco" {...field} className="bg-white/80 dark:bg-slate-900/60 border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-blue-400/30" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="company.location.state"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>State/Province</FormLabel>
                              <FormControl>
                                <Input placeholder="California" {...field} className="bg-white/80 dark:bg-slate-900/60 border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-blue-400/30" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="company.location.country"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Country *</FormLabel>
                              <FormControl>
                                <Input placeholder="United States" {...field} className="bg-white/80 dark:bg-slate-900/60 border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-blue-400/30" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Job Details Tab */}
              <TabsContent value="details" className="space-y-4">
                <Card className="bg-white/70 dark:bg-slate-800/70 backdrop-blur rounded-xl border-0">
                  <CardHeader className="flex flex-row items-center gap-2 pb-2 bg-gradient-to-r from-blue-500/80 to-purple-600/80 rounded-t-xl">
                    <CardTitle className="flex items-center gap-2 text-white text-base font-bold tracking-tight">
                      <Users className="h-5 w-5" />
                      Skills & Requirements
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Skills */}
                    <div className="space-y-2">
                      <Label>Required Skills *</Label>
                      <div className="flex gap-2">
                        <Input
                          placeholder="Add a skill..."
                          value={currentSkill}
                          onChange={(e) => setCurrentSkill(e.target.value)}
                          onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill())}
                          className="bg-white/80 dark:bg-slate-900/60 border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-blue-400/30"
                        />
                        <Button type="button" onClick={addSkill} size="sm" className="bg-blue-500 hover:bg-blue-600 text-white rounded-lg">
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {skills.map((skill) => (
                          <Badge key={skill} variant="secondary" className="gap-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200">
                            {skill}
                            <X
                              className="h-3 w-3 cursor-pointer"
                              onClick={() => removeSkill(skill)}
                            />
                          </Badge>
                        ))}
                      </div>
                      {skills.length === 0 && (
                        <p className="text-sm text-muted-foreground">Add at least one required skill</p>
                      )}
                    </div>

                    <Separator />

                    {/* Requirements */}
                    <div className="space-y-2">
                      <Label>Job Requirements</Label>
                      <div className="flex gap-2">
                        <Input
                          placeholder="Add a requirement..."
                          value={currentRequirement}
                          onChange={(e) => setCurrentRequirement(e.target.value)}
                          onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addRequirement())}
                          className="bg-white/80 dark:bg-slate-900/60 border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-blue-400/30"
                        />
                        <Button type="button" onClick={addRequirement} size="sm" className="bg-blue-500 hover:bg-blue-600 text-white rounded-lg">
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                      <div className="space-y-1">
                        {requirements.map((requirement, index) => (
                          <div key={index} className="flex items-center gap-2 p-2 bg-muted rounded">
                            <span className="flex-1 text-sm">{requirement}</span>
                            <X
                              className="h-4 w-4 cursor-pointer"
                              onClick={() => removeRequirement(requirement)}
                            />
                          </div>
                        ))}
                      </div>
                    </div>

                    <Separator />

                    {/* Responsibilities */}
                    <div className="space-y-2">
                      <Label>Job Responsibilities</Label>
                      <div className="flex gap-2">
                        <Input
                          placeholder="Add a responsibility..."
                          value={currentResponsibility}
                          onChange={(e) => setCurrentResponsibility(e.target.value)}
                          onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addResponsibility())}
                          className="bg-white/80 dark:bg-slate-900/60 border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-blue-400/30"
                        />
                        <Button type="button" onClick={addResponsibility} size="sm" className="bg-blue-500 hover:bg-blue-600 text-white rounded-lg">
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                      <div className="space-y-1">
                        {responsibilities.map((responsibility, index) => (
                          <div key={index} className="flex items-center gap-2 p-2 bg-muted rounded">
                            <span className="flex-1 text-sm">{responsibility}</span>
                            <X
                              className="h-4 w-4 cursor-pointer"
                              onClick={() => removeResponsibility(responsibility)}
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Salary Information */}
                <Card className="bg-white/70 dark:bg-slate-800/70 backdrop-blur rounded-xl border-0">
                  <CardHeader className="flex flex-row items-center gap-2 pb-2 bg-gradient-to-r from-blue-500/80 to-purple-600/80 rounded-t-xl">
                    <CardTitle className="flex items-center gap-2 text-white text-base font-bold tracking-tight">
                      <DollarSign className="h-5 w-5" />
                      Salary Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-4 gap-4">
                      <FormField
                        control={form.control}
                        name="salary.min"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Minimum Salary</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                placeholder="50000"
                                {...field}
                                onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)}
                                className="bg-white/80 dark:bg-slate-900/60 border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-blue-400/30"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="salary.max"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Maximum Salary</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                placeholder="80000"
                                {...field}
                                onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)}
                                className="bg-white/80 dark:bg-slate-900/60 border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-blue-400/30"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="salary.currency"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Currency</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value || undefined}>
                              <FormControl>
                                <SelectTrigger className="bg-white/80 dark:bg-slate-900/60 border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-blue-400/30">
                                  <SelectValue placeholder="Select currency" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="USD">USD ($)</SelectItem>
                                <SelectItem value="EUR">EUR (€)</SelectItem>
                                <SelectItem value="GBP">GBP (£)</SelectItem>
                                <SelectItem value="CAD">CAD (C$)</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="salary.period"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Period</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value || undefined}>
                              <FormControl>
                                <SelectTrigger className="bg-white/80 dark:bg-slate-900/60 border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-blue-400/30">
                                  <SelectValue placeholder="Select period" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="hourly">Hourly</SelectItem>
                                <SelectItem value="monthly">Monthly</SelectItem>
                                <SelectItem value="yearly">Yearly</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Application Tab */}
              <TabsContent value="application" className="space-y-4">
                <Card className="bg-white/70 dark:bg-slate-800/70 backdrop-blur rounded-xl border-0">
                  <CardHeader className="flex flex-row items-center gap-2 pb-2 bg-gradient-to-r from-blue-500/80 to-purple-600/80 rounded-t-xl">
                    <CardTitle className="flex items-center gap-2 text-white text-base font-bold tracking-tight">
                      <Mail className="h-5 w-5" />
                      Application Method
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <FormField
                      control={form.control}
                      name="applicationMethod"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>How should candidates apply? *</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value || undefined}>
                            <FormControl>
                              <SelectTrigger className="bg-white/80 dark:bg-slate-900/60 border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-blue-400/30">
                                <SelectValue placeholder="Select application method" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="email">Email</SelectItem>
                              <SelectItem value="website">Website/Online Form</SelectItem>
                              <SelectItem value="phone">Phone</SelectItem>
                              <SelectItem value="in_person">In Person</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {applicationMethod === "email" && (
                      <FormField
                        control={form.control}
                        name="applicationEmail"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Application Email *</FormLabel>
                            <FormControl>
                              <Input
                                type="email"
                                placeholder="hr@company.com"
                                {...field}
                                className="bg-white/80 dark:bg-slate-900/60 border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-blue-400/30"
                              />
                            </FormControl>
                            <FormDescription>
                              Candidates will send their applications to this email
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    )}

                    {applicationMethod === "website" && (
                      <FormField
                        control={form.control}
                        name="applicationUrl"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Application URL *</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="https://company.com/careers/apply"
                                {...field}
                                className="bg-white/80 dark:bg-slate-900/60 border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-blue-400/30"
                              />
                            </FormControl>
                            <FormDescription>
                              Link to your application form or career page
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    )}

                    {applicationMethod === "phone" && (
                      <FormField
                        control={form.control}
                        name="applicationPhone"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Application Phone *</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="+1 (555) 123-4567"
                                {...field}
                                className="bg-white/80 dark:bg-slate-900/60 border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-blue-400/30"
                              />
                            </FormControl>
                            <FormDescription>
                              Phone number for candidates to call
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    )}

                    <FormField
                      control={form.control}
                      name="applicationDeadline"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Application Deadline</FormLabel>
                          <FormControl>
                            <Input type="datetime-local" {...field} className="bg-white/80 dark:bg-slate-900/60 border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-blue-400/30" />
                          </FormControl>
                          <FormDescription>
                            Optional: Set a deadline for applications
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* --- Questionnaire Section --- */}
                    <Separator />
                    <div className="space-y-2">
                      <Label>Application Questionnaire</Label>
                      <p className="text-sm text-muted-foreground mb-2">Add questions for applicants to answer when applying for this job.</p>
                      <div className="flex gap-2">
                        <Input
                          placeholder="Add a question..."
                          value={currentQuestion}
                          onChange={(e) => setCurrentQuestion(e.target.value)}
                          onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addQuestion())}
                          className="bg-white/80 dark:bg-slate-900/60 border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-blue-400/30"
                        />
                        <Button type="button" onClick={addQuestion} size="sm" className="bg-blue-500 hover:bg-blue-600 text-white rounded-lg">
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {questionnaire.map((question, idx) => (
                          <Badge key={idx} variant="secondary" className="gap-1 bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200">
                            {question}
                            <X className="h-3 w-3 cursor-pointer" onClick={() => removeQuestion(question)} />
                          </Badge>
                        ))}
                      </div>
                      {questionnaire.length === 0 && (
                        <p className="text-sm text-muted-foreground">No questions added yet.</p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Settings Tab */}
              <TabsContent value="settings" className="space-y-4">
                <Card className="bg-white/70 dark:bg-slate-800/70 backdrop-blur rounded-xl border-0">
                  <CardHeader className="flex flex-row items-center gap-2 pb-2 bg-gradient-to-r from-blue-500/80 to-purple-600/80 rounded-t-xl">
                    <CardTitle className="flex items-center gap-2 text-white text-base font-bold tracking-tight">
                      Job Settings
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {job && (
                      <FormField
                        control={form.control}
                        name="status"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Job Status</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value || undefined}>
                              <FormControl>
                                <SelectTrigger className="bg-white/80 dark:bg-slate-900/60 border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-blue-400/30">
                                  <SelectValue placeholder="Select status" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {statusOptions.map((option) => (
                                  <SelectItem key={option.value} value={option.value}>
                                    {option.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    )}

                    <FormField
                      control={form.control}
                      name="featured"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center space-x-3 space-y-0">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel className="flex items-center gap-2">
                              <Star className="h-4 w-4" />
                              Featured Job
                            </FormLabel>
                            <FormDescription>
                              Featured jobs appear at the top of job listings
                            </FormDescription>
                          </div>
                        </FormItem>
                      )}
                    />
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>

            {error && (
              <div className="p-3 bg-destructive/10 border border-destructive rounded-md">
                <p className="text-sm text-destructive">{error}</p>
              </div>
            )}

            {/* Debug form errors */}
            {Object.keys(form.formState.errors).length > 0 && (
              <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                <p className="text-sm font-medium text-yellow-800 mb-2">Form Validation Errors:</p>
                <ul className="text-xs text-yellow-700 space-y-1">
                  {Object.entries(form.formState.errors).map(([field, error]) => (
                    <li key={field}>
                      <strong>{field}:</strong> {error?.message || 'Invalid value'}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <DialogFooter className="gap-2 mt-4">
              <Button type="button" variant="outline" onClick={onClose} className="rounded-lg">
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={isLoading}
                className="bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:from-blue-600 hover:to-purple-700"
                onClick={(e) => {
                  console.log("Submit button clicked")
                  console.log("Form is valid:", form.formState.isValid)
                  console.log("Form errors:", form.formState.errors)
                  console.log("Skills count:", skills.length)
                  // Don't prevent default - let form handle submission
                }}
              >
                {isLoading ? "Saving..." : job ? "Update Job" : "Create Job"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
} 