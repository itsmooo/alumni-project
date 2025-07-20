"use client"

import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  User,
  Phone,
  MapPin,
  Briefcase,
  GraduationCap,
  Shield,
  Eye,
  EyeOff,
  Plus,
  X,
  AlertCircle,
  CheckCircle,
  Loader2,
} from "lucide-react"
import type { User as UserType } from "@/types"
import type { CreateUserRequest, UpdateUserRequest } from "@/lib/api/adminApi"

// Validation schemas
const createUserSchema = z.object({
  firstName: z.string().min(2, "First name must be at least 2 characters"),
  lastName: z.string().min(2, "Last name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  phone: z.string().optional(),
  password: z.string().min(8, "Password must be at least 8 characters"),
  confirmPassword: z.string(),
  role: z.enum(["alumni", "moderator", "admin"]),
  profile: z.object({
    graduationYear: z.number().min(1950).max(new Date().getFullYear() + 10),
    degree: z.string().min(2, "Degree is required"),
    major: z.string().min(2, "Major is required"),
    profession: z.string().optional(),
    company: z.string().optional(),
    bio: z.string().optional(),
    location: z.object({
      city: z.string().optional(),
      country: z.string().optional(),
    }).optional(),
    skills: z.array(z.string()).optional(),
    socialLinks: z.object({
      linkedin: z.string().url().optional().or(z.literal("")),
      twitter: z.string().url().optional().or(z.literal("")),
      facebook: z.string().url().optional().or(z.literal("")),
      website: z.string().url().optional().or(z.literal("")),
    }).optional(),
  }),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
})

const updateUserSchema = z.object({
  firstName: z.string().min(2, "First name must be at least 2 characters"),
  lastName: z.string().min(2, "Last name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  phone: z.string().optional(),
  role: z.enum(["alumni", "moderator", "admin"]),
  profile: z.object({
    graduationYear: z.number().min(1950).max(new Date().getFullYear() + 10),
    degree: z.string().min(2, "Degree is required"),
    major: z.string().min(2, "Major is required"),
    profession: z.string().optional(),
    company: z.string().optional(),
    bio: z.string().optional(),
    location: z.object({
      city: z.string().optional(),
      country: z.string().optional(),
    }).optional(),
    skills: z.array(z.string()).optional(),
    socialLinks: z.object({
      linkedin: z.string().url().optional().or(z.literal("")),
      twitter: z.string().url().optional().or(z.literal("")),
      facebook: z.string().url().optional().or(z.literal("")),
      website: z.string().url().optional().or(z.literal("")),
    }).optional(),
  }),
})

type CreateUserFormData = z.infer<typeof createUserSchema>
type UpdateUserFormData = z.infer<typeof updateUserSchema>

interface UserFormProps {
  user?: UserType
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: CreateUserRequest | UpdateUserRequest) => Promise<void>
  isLoading?: boolean
  error?: string | null
}

export function UserForm({ user, isOpen, onClose, onSubmit, isLoading, error }: UserFormProps) {
  const [showPassword, setShowPassword] = useState(false)
  const [skills, setSkills] = useState<string[]>(user?.profile?.skills || [])
  const [newSkill, setNewSkill] = useState("")
  const [activeTab, setActiveTab] = useState("basic")

  const isEditMode = !!user

  const form = useForm<CreateUserFormData | UpdateUserFormData>({
    resolver: zodResolver(isEditMode ? updateUserSchema : createUserSchema),
    defaultValues: {
      firstName: user?.firstName || "",
      lastName: user?.lastName || "",
      email: user?.email || "",
      phone: user?.phone || "",
      password: "",
      confirmPassword: "",
      role: (user?.role as "alumni" | "moderator" | "admin") || "alumni",
      profile: {
        graduationYear: user?.profile?.graduationYear || new Date().getFullYear(),
        degree: user?.profile?.degree || "",
        major: user?.profile?.major || "",
        profession: user?.profile?.profession || "",
        company: user?.profile?.company || "",
        bio: user?.profile?.bio || "",
        location: {
          city: user?.profile?.location?.city || "",
          country: user?.profile?.location?.country || "",
        },
        socialLinks: {
          linkedin: user?.profile?.socialLinks?.linkedin || "",
          twitter: user?.profile?.socialLinks?.twitter || "",
          facebook: user?.profile?.socialLinks?.facebook || "",
          website: user?.profile?.socialLinks?.website || "",
        },
      },
    },
  })

  useEffect(() => {
    if (user?.profile?.skills) {
      setSkills(user.profile.skills)
    } else {
      setSkills([])
    }
  }, [user])

  // Reset form when user changes
  useEffect(() => {
    // Update the form resolver based on current mode
    form.clearErrors()
    
    if (user) {
      form.reset({
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        email: user.email || "",
        phone: user.phone || "",
        password: "",
        confirmPassword: "",
        role: (user.role as "alumni" | "moderator" | "admin") || "alumni",
        profile: {
          graduationYear: user.profile?.graduationYear || new Date().getFullYear(),
          degree: user.profile?.degree || "",
          major: user.profile?.major || "",
          profession: user.profile?.profession || "",
          company: user.profile?.company || "",
          bio: user.profile?.bio || "",
          location: {
            city: user.profile?.location?.city || "",
            country: user.profile?.location?.country || "",
          },
          socialLinks: {
            linkedin: user.profile?.socialLinks?.linkedin || "",
            twitter: user.profile?.socialLinks?.twitter || "",
            facebook: user.profile?.socialLinks?.facebook || "",
            website: user.profile?.socialLinks?.website || "",
          },
        },
      })
    } else {
      // Reset to empty values for create mode
      form.reset({
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        password: "",
        confirmPassword: "",
        role: "alumni",
        profile: {
          graduationYear: new Date().getFullYear(),
          degree: "",
          major: "",
          profession: "",
          company: "",
          bio: "",
          location: {
            city: "",
            country: "",
          },
          socialLinks: {
            linkedin: "",
            twitter: "",
            facebook: "",
            website: "",
          },
        },
      })
    }
  }, [user, form])

  const handleAddSkill = () => {
    if (newSkill.trim() && !skills.includes(newSkill.trim())) {
      setSkills([...skills, newSkill.trim()])
      setNewSkill("")
    }
  }

  const handleRemoveSkill = (skillToRemove: string) => {
    setSkills(skills.filter(skill => skill !== skillToRemove))
  }

  const handleFormSubmit = async (data: CreateUserFormData | UpdateUserFormData) => {
    try {
      const formattedData = {
        ...data,
        profile: {
          ...data.profile,
          skills,
        },
      }

      if (isEditMode) {
        // For update, we don't have password fields
        await onSubmit(formattedData as UpdateUserRequest)
      } else {
        // For create, we need to handle password confirmation
        const { confirmPassword, ...createData } = formattedData as CreateUserFormData
        await onSubmit(createData)
      }
    } catch (err) {
      console.error("Form submission error:", err)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto border-0 shadow-2xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-2xl p-0">
        <DialogHeader className="flex items-center gap-3 px-6 py-4 bg-gradient-to-r from-blue-500 to-purple-600 rounded-t-2xl">
          <DialogTitle className="text-lg font-bold text-white tracking-tight">
            {isEditMode ? (
              <>
                <User className="h-5 w-5" />
                Edit User - {user.firstName} {user.lastName}
              </>
            ) : (
              <>
                <Plus className="h-5 w-5" />
                Add New User
              </>
            )}
          </DialogTitle>
          <DialogDescription className="text-white/80">
            {isEditMode 
              ? "Update user information and settings."
              : "Create a new user account with profile information."
            }
          </DialogDescription>
        </DialogHeader>

        {error && (
          <Alert variant="destructive" className="mx-6 mt-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <Form {...form} key={user?._id || 'create'}>
          <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-6 px-6 pb-6 pt-2">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-3 mb-4">
                <TabsTrigger value="basic">Basic Info</TabsTrigger>
                <TabsTrigger value="profile">Profile</TabsTrigger>
                <TabsTrigger value="security">Security</TabsTrigger>
              </TabsList>

              <TabsContent value="basic" className="space-y-4">
                <Card className="bg-white/70 dark:bg-slate-800/70 backdrop-blur rounded-xl border-0">
                  <CardHeader className="flex flex-row items-center gap-2 pb-2 bg-gradient-to-r from-blue-500/80 to-purple-600/80 rounded-t-xl">
                    <CardTitle className="flex items-center gap-2 text-white text-base font-bold tracking-tight">
                      <User className="h-4 w-4" />
                      Personal Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="grid gap-4 md:grid-cols-2">
                    {/* Inputs with glassy/focus ring */}
                    <FormField
                      control={form.control}
                      name="firstName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>First Name *</FormLabel>
                          <FormControl>
                            <Input placeholder="John" {...field} className="bg-white/80 dark:bg-slate-900/60 border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-blue-400/30" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="lastName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Last Name *</FormLabel>
                          <FormControl>
                            <Input placeholder="Doe" {...field} className="bg-white/80 dark:bg-slate-900/60 border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-blue-400/30" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email Address *</FormLabel>
                          <FormControl>
                            <Input type="email" placeholder="john.doe@example.com" {...field} className="bg-white/80 dark:bg-slate-900/60 border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-blue-400/30" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="phone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Phone Number</FormLabel>
                          <FormControl>
                            <Input placeholder="+1 (555) 123-4567" {...field} className="bg-white/80 dark:bg-slate-900/60 border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-blue-400/30" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="role"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Role *</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger className="bg-white/80 dark:bg-slate-900/60 border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-blue-400/30">
                                <SelectValue placeholder="Select a role" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="alumni">Alumni</SelectItem>
                              <SelectItem value="moderator">Moderator</SelectItem>
                              <SelectItem value="admin">Administrator</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </CardContent>
                </Card>

                {!isEditMode && (
                  <Card className="bg-white/70 dark:bg-slate-800/70 backdrop-blur rounded-xl border-0">
                    <CardHeader className="flex flex-row items-center gap-2 pb-2 bg-gradient-to-r from-blue-500/80 to-purple-600/80 rounded-t-xl">
                      <CardTitle className="flex items-center gap-2 text-white text-base font-bold tracking-tight">
                        <Shield className="h-4 w-4" />
                        Password
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="grid gap-4 md:grid-cols-2">
                      <FormField
                        control={form.control}
                        name="password"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Password *</FormLabel>
                            <FormControl>
                              <div className="relative">
                                <Input
                                  type={showPassword ? "text" : "password"}
                                  placeholder="••••••••"
                                  {...field}
                                  className="bg-white/80 dark:bg-slate-900/60 border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-blue-400/30"
                                />
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                                  onClick={() => setShowPassword(!showPassword)}
                                >
                                  {showPassword ? (
                                    <EyeOff className="h-4 w-4" />
                                  ) : (
                                    <Eye className="h-4 w-4" />
                                  )}
                                </Button>
                              </div>
                            </FormControl>
                            <FormDescription>
                              Password must be at least 8 characters long
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="confirmPassword"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Confirm Password *</FormLabel>
                            <FormControl>
                              <Input
                                type={showPassword ? "text" : "password"}
                                placeholder="••••••••"
                                {...field}
                                className="bg-white/80 dark:bg-slate-900/60 border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-blue-400/30"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              <TabsContent value="profile" className="space-y-4">
                <Card className="bg-white/70 dark:bg-slate-800/70 backdrop-blur rounded-xl border-0">
                  <CardHeader className="flex flex-row items-center gap-2 pb-2 bg-gradient-to-r from-blue-500/80 to-purple-600/80 rounded-t-xl">
                    <CardTitle className="flex items-center gap-2 text-white text-base font-bold tracking-tight">
                      <GraduationCap className="h-4 w-4" />
                      Education & Career
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="grid gap-4 md:grid-cols-2">
                    <FormField
                      control={form.control}
                      name="profile.graduationYear"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Graduation Year *</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              min="1950"
                              max={new Date().getFullYear() + 10}
                              {...field}
                              onChange={(e) => field.onChange(parseInt(e.target.value))}
                              className="bg-white/80 dark:bg-slate-900/60 border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-blue-400/30"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="profile.degree"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Degree *</FormLabel>
                          <FormControl>
                            <Input placeholder="Bachelor of Science" {...field} className="bg-white/80 dark:bg-slate-900/60 border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-blue-400/30" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="profile.major"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Major *</FormLabel>
                          <FormControl>
                            <Input placeholder="Computer Science" {...field} className="bg-white/80 dark:bg-slate-900/60 border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-blue-400/30" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="profile.profession"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Current Profession</FormLabel>
                          <FormControl>
                            <Input placeholder="Software Engineer" {...field} className="bg-white/80 dark:bg-slate-900/60 border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-blue-400/30" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="profile.company"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Company</FormLabel>
                          <FormControl>
                            <Input placeholder="Tech Corp Inc." {...field} className="bg-white/80 dark:bg-slate-900/60 border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-blue-400/30" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="md:col-span-2">
                      <FormField
                        control={form.control}
                        name="profile.bio"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Bio</FormLabel>
                            <FormControl>
                              <Textarea
                                placeholder="Tell us about yourself..."
                                className="min-h-[100px] bg-white/80 dark:bg-slate-900/60 border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-blue-400/30"
                                {...field}
                              />
                            </FormControl>
                            <FormDescription>
                              A brief description about the user (optional)
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-white/70 dark:bg-slate-800/70 backdrop-blur rounded-xl border-0">
                  <CardHeader className="flex flex-row items-center gap-2 pb-2 bg-gradient-to-r from-blue-500/80 to-purple-600/80 rounded-t-xl">
                    <CardTitle className="flex items-center gap-2 text-white text-base font-bold tracking-tight">
                      <MapPin className="h-4 w-4" />
                      Location
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="grid gap-4 md:grid-cols-2">
                    <FormField
                      control={form.control}
                      name="profile.location.city"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>City</FormLabel>
                          <FormControl>
                            <Input placeholder="San Francisco" {...field} className="bg-white/80 dark:bg-slate-900/60 border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-blue-400/30" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="profile.location.country"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Country</FormLabel>
                          <FormControl>
                            <Input placeholder="United States" {...field} className="bg-white/80 dark:bg-slate-900/60 border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-blue-400/30" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </CardContent>
                </Card>

                <Card className="bg-white/70 dark:bg-slate-800/70 backdrop-blur rounded-xl border-0">
                  <CardHeader className="flex flex-row items-center gap-2 pb-2 bg-gradient-to-r from-blue-500/80 to-purple-600/80 rounded-t-xl">
                    <CardTitle className="flex items-center gap-2 text-white text-base font-bold tracking-tight">
                      <Briefcase className="h-4 w-4" />
                      Skills
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-4">
                      <div className="flex gap-2">
                        <Input
                          placeholder="Add a skill"
                          value={newSkill}
                          onChange={(e) => setNewSkill(e.target.value)}
                          onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleAddSkill())}
                          className="bg-white/80 dark:bg-slate-900/60 border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-blue-400/30"
                        />
                        <Button type="button" onClick={handleAddSkill} size="sm" className="bg-blue-500 hover:bg-blue-600 text-white rounded-lg">
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                      
                      <div className="flex flex-wrap gap-2">
                        {skills.map((skill) => (
                          <Badge key={skill} variant="secondary" className="pr-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200">
                            {skill}
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="ml-1 h-4 w-4 p-0 hover:bg-transparent"
                              onClick={() => handleRemoveSkill(skill)}
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-white/70 dark:bg-slate-800/70 backdrop-blur rounded-xl border-0">
                  <CardHeader className="flex flex-row items-center gap-2 pb-2 bg-gradient-to-r from-blue-500/80 to-purple-600/80 rounded-t-xl">
                    <CardTitle className="flex items-center gap-2 text-white text-base font-bold tracking-tight">
                      <Shield className="h-4 w-4" />
                      Social Links
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="grid gap-4 md:grid-cols-2">
                    <FormField
                      control={form.control}
                      name="profile.socialLinks.linkedin"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>LinkedIn</FormLabel>
                          <FormControl>
                            <Input placeholder="https://linkedin.com/in/username" {...field} className="bg-white/80 dark:bg-slate-900/60 border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-blue-400/30" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="profile.socialLinks.twitter"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Twitter</FormLabel>
                          <FormControl>
                            <Input placeholder="https://twitter.com/username" {...field} className="bg-white/80 dark:bg-slate-900/60 border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-blue-400/30" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="profile.socialLinks.facebook"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Facebook</FormLabel>
                          <FormControl>
                            <Input placeholder="https://facebook.com/username" {...field} className="bg-white/80 dark:bg-slate-900/60 border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-blue-400/30" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="profile.socialLinks.website"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Website</FormLabel>
                          <FormControl>
                            <Input placeholder="https://yourwebsite.com" {...field} className="bg-white/80 dark:bg-slate-900/60 border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-blue-400/30" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="security" className="space-y-4">
                <Card className="bg-white/70 dark:bg-slate-800/70 backdrop-blur rounded-xl border-0">
                  <CardHeader className="flex flex-row items-center gap-2 pb-2 bg-gradient-to-r from-blue-500/80 to-purple-600/80 rounded-t-xl">
                    <CardTitle className="flex items-center gap-2 text-white text-base font-bold tracking-tight">
                      <Shield className="h-4 w-4" />
                      Account Security
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label>Account Information</Label>
                      <div className="text-sm text-muted-foreground space-y-1">
                        {isEditMode && (
                          <>
                            <p>Created: {new Date(user.createdAt).toLocaleDateString()}</p>
                            <p>Last Login: {user.lastLogin ? new Date(user.lastLogin).toLocaleDateString() : "Never"}</p>
                            <p>Email Verified: {user.isEmailVerified ? "Yes" : "No"}</p>
                            <p>Phone Verified: {user.isPhoneVerified ? "Yes" : "No"}</p>
                          </>
                        )}
                      </div>
                    </div>

                    {isEditMode && (
                      <Alert className="bg-red-50 dark:bg-red-900/30 border-red-200 dark:border-red-700">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>
                          Security settings require additional verification. Password reset emails will be sent to the user's registered email address.
                        </AlertDescription>
                      </Alert>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>

            <DialogFooter className="gap-2 mt-4">
              <Button type="button" variant="outline" onClick={onClose} disabled={isLoading} className="rounded-lg">
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading} className="bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:from-blue-600 hover:to-purple-700">
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {isEditMode ? "Updating..." : "Creating..."}
                  </>
                ) : (
                  <>
                    {isEditMode ? (
                      <>
                        <CheckCircle className="mr-2 h-4 w-4" />
                        Update User
                      </>
                    ) : (
                      <>
                        <Plus className="mr-2 h-4 w-4" />
                        Create User
                      </>
                    )}
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
} 