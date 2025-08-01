"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import {
  Home,
  Users,
  Calendar,
  Megaphone,
  Briefcase,
  Settings,
  FileText,
  CreditCard,
  Bell,
  HelpCircle,
  LogOut,
  Menu,
  User,
  MessageSquare,
  ChevronRight,
  GraduationCap,
  Network,
  BookOpen,
} from "lucide-react"
import { useSelector, useDispatch } from "react-redux"
import type { RootState } from "@/lib/store"
import { logout } from "@/lib/slices/authSlice"
import { Badge } from "@/components/ui/badge"

interface SidebarItem {
  title: string
  href: string
  icon: React.ComponentType<{ className?: string }>
  badge?: string
  children?: SidebarItem[]
  isAction?: boolean
  gradient?: string
}

const sidebarItems: SidebarItem[] = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: Home,
    gradient: "from-blue-500 to-purple-600",
  },
  {
    title: "Alumni Network",
    href: "/alumni",
    icon: Users,
    gradient: "from-green-500 to-emerald-600",
    children: [
      {
        title: "All Alumni",
        href: "/alumni",
        icon: Users,
      },
      {
        title: "My Connections",
        href: "/alumni/connections",
        icon: Network,
      },
      {
        title: "Find Alumni",
        href: "/alumni/search",
        icon: User,
      },
    ],
  },
  {
    title: "Events",
    href: "/events",
    icon: Calendar,
    gradient: "from-orange-500 to-red-600",
    children: [
      {
        title: "All Events",
        href: "/events",
        icon: Calendar,
      },
      {
        title: "My Events",
        href: "/events/my-events",
        icon: Calendar,
      },
      {
        title: "Register for Events",
        href: "/events/register",
        icon: Calendar,
      },
    ],
  },
  {
    title: "Announcements",
    href: "/announcements",
    icon: Megaphone,
    gradient: "from-purple-500 to-pink-600",
    children: [
      {
        title: "All Announcements",
        href: "/announcements",
        icon: Megaphone,
      },
      {
        title: "My Announcements",
        href: "/announcements/my",
        icon: Megaphone,
      },
    ],
  },
  {
    title: "Job Board",
    href: "/jobs",
    icon: Briefcase,
    gradient: "from-indigo-500 to-blue-600",
    children: [
      {
        title: "All Jobs",
        href: "/jobs",
        icon: Briefcase,
      },
      {
        title: "My Applications",
        href: "/jobs/applications",
        icon: FileText,
      },
      {
        title: "Post a Job",
        href: "/jobs/post",
        icon: Briefcase,
      },
    ],
  },
  {
    title: "Payments",
    href: "/payments",
    icon: CreditCard,
    gradient: "from-emerald-500 to-teal-600",
    children: [
      {
        title: "My Payments",
        href: "/payments",
        icon: CreditCard,
      },
      {
        title: "Payment History",
        href: "/payments/history",
        icon: FileText,
      },
      {
        title: "Donate",
        href: "/payments/donate",
        icon: CreditCard,
      },
    ],
  },
  {
    title: "Resources",
    href: "/resources",
    icon: BookOpen,
    gradient: "from-rose-500 to-pink-600",
    children: [
      {
        title: "Library",
        href: "/resources/library",
        icon: BookOpen,
      },
      {
        title: "Career Resources",
        href: "/resources/career",
        icon: Briefcase,
      },
      {
        title: "Mentorship",
        href: "/resources/mentorship",
        icon: Users,
      },
    ],
  },
]

interface UserSidebarProps {
  className?: string
}

export function UserSidebar({ className }: UserSidebarProps) {
  const pathname = usePathname()
  const dispatch = useDispatch()
  const { user } = useSelector((state: RootState) => state.auth)
  const [expandedItems, setExpandedItems] = useState<string[]>([])

  const toggleExpanded = (href: string) => {
    setExpandedItems(prev =>
      prev.includes(href)
        ? prev.filter(item => item !== href)
        : [...prev, href]
    )
  }

  const handleLogout = () => {
    dispatch(logout())
  }

  const SidebarContent = () => (
    <div className="flex h-full flex-col bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm border-r border-slate-200 dark:border-slate-800">
      {/* Enhanced Header */}
      <div className="flex h-20 items-center border-b border-slate-200 dark:border-slate-800 px-6 bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-900">
        <Link href="/dashboard" className="flex items-center space-x-3 group">
          <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-105">
            <GraduationCap className="h-6 w-6 text-white" />
          </div>
          <div>
            <span className="font-bold text-lg bg-gradient-to-r from-slate-900 to-slate-600 dark:from-white dark:to-slate-300 bg-clip-text text-transparent">
              Alumni Network
            </span>
            <p className="text-xs text-slate-500 dark:text-slate-400">Connect & Grow</p>
          </div>
        </Link>
      </div>

      {/* Enhanced User Info */}
      <div className="border-b border-slate-200 dark:border-slate-800 p-6 bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-900">
        <div className="flex items-center space-x-4">
          <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg">
            <User className="h-6 w-6 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">
              {user?.firstName} {user?.lastName}
            </p>
            <p className="text-xs text-slate-600 dark:text-slate-400 truncate">
              {user?.role} • {user?.email}
            </p>
            <Badge variant="secondary" className="mt-1 bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400 text-xs">
              <div className="w-2 h-2 rounded-full bg-green-500 mr-1" />
              Online
            </Badge>
          </div>
        </div>
      </div>

      {/* Enhanced Navigation */}
      <ScrollArea className="flex-1 px-4">
        <div className="space-y-2 py-6">
          {sidebarItems.map((item) => (
            <div key={item.href}>
              {item.children ? (
                <Button
                  variant={pathname === item.href ? "default" : "ghost"}
                  className={cn(
                    "w-full justify-between h-12 group relative overflow-hidden",
                    pathname === item.href 
                      ? `bg-gradient-to-r ${item.gradient} text-white shadow-lg` 
                      : "hover:bg-slate-100 dark:hover:bg-slate-800"
                  )}
                  onClick={() => toggleExpanded(item.href)}
                >
                  <div className="flex items-center">
                    <div className={cn(
                      "h-8 w-8 rounded-lg flex items-center justify-center mr-3 transition-all duration-300",
                      pathname === item.href 
                        ? "bg-white/20" 
                        : "bg-slate-100 dark:bg-slate-800 group-hover:bg-slate-200 dark:group-hover:bg-slate-700"
                    )}>
                      <item.icon className={cn(
                        "h-4 w-4 transition-all duration-300",
                        pathname === item.href 
                          ? "text-white" 
                          : "text-slate-600 dark:text-slate-400 group-hover:text-slate-900 dark:group-hover:text-white"
                      )} />
                    </div>
                    <span className="font-medium">{item.title}</span>
                  </div>
                  <ChevronRight className={cn(
                    "h-4 w-4 transition-transform duration-300",
                    expandedItems.includes(item.href) && "rotate-90"
                  )} />
                </Button>
              ) : (
                <Button
                  variant={pathname === item.href ? "default" : "ghost"}
                  className={cn(
                    "w-full justify-start h-12 group relative overflow-hidden",
                    pathname === item.href 
                      ? `bg-gradient-to-r ${item.gradient} text-white shadow-lg` 
                      : "hover:bg-slate-100 dark:hover:bg-slate-800"
                  )}
                  asChild
                >
                  <Link href={item.href} className="flex items-center w-full">
                    <div className={cn(
                      "h-8 w-8 rounded-lg flex items-center justify-center mr-3 transition-all duration-300",
                      pathname === item.href 
                        ? "bg-white/20" 
                        : "bg-slate-100 dark:bg-slate-800 group-hover:bg-slate-200 dark:group-hover:bg-slate-700"
                    )}>
                      <item.icon className={cn(
                        "h-4 w-4 transition-all duration-300",
                        pathname === item.href 
                          ? "text-white" 
                          : "text-slate-600 dark:text-slate-400 group-hover:text-slate-900 dark:group-hover:text-white"
                      )} />
                    </div>
                    <span className="font-medium">{item.title}</span>
                    {item.badge && (
                      <Badge className="ml-auto bg-primary text-primary-foreground text-xs px-2 py-0.5 rounded-full">
                        {item.badge}
                      </Badge>
                    )}
                  </Link>
                </Button>
              )}

              {/* Enhanced Submenu */}
              {item.children && expandedItems.includes(item.href) && (
                <div className="ml-4 mt-2 space-y-1 pl-4 border-l-2 border-slate-200 dark:border-slate-700">
                  {item.children.map((child) => (
                    child.isAction ? (
                      <Button
                        key={child.title}
                        variant="ghost"
                        size="sm"
                        className="w-full justify-start h-10 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800"
                      >
                        <child.icon className="mr-3 h-4 w-4" />
                        <span className="text-sm">{child.title}</span>
                      </Button>
                    ) : (
                      <Button
                        key={child.href}
                        variant={pathname === child.href ? "secondary" : "ghost"}
                        size="sm"
                        className={cn(
                          "w-full justify-start h-10 transition-all duration-200",
                          pathname === child.href 
                            ? "bg-slate-200 dark:bg-slate-700 text-slate-900 dark:text-white" 
                            : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800"
                        )}
                        asChild
                      >
                        <Link href={child.href}>
                          <child.icon className="mr-3 h-4 w-4" />
                          <span className="text-sm">{child.title}</span>
                        </Link>
                      </Button>
                    )
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </ScrollArea>

      {/* Enhanced Footer */}
      <div className="border-t border-slate-200 dark:border-slate-800 p-4 space-y-2 bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-900">
        <Button 
          variant="ghost" 
          size="sm" 
          className="w-full justify-start h-10 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800"
        >
          <HelpCircle className="mr-3 h-4 w-4" />
          <span className="text-sm">Help & Support</span>
        </Button>
        <Button 
          variant="ghost" 
          size="sm" 
          className="w-full justify-start h-10 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/20 transition-all duration-200"
          onClick={handleLogout}
        >
          <LogOut className="mr-3 h-4 w-4" />
          <span className="text-sm">Logout</span>
        </Button>
      </div>
    </div>
  )

  return (
    <>
      {/* Desktop Sidebar */}
      <div className={cn("hidden lg:block w-72", className)}>
        <SidebarContent />
      </div>

      {/* Mobile Sidebar */}
      <Sheet>
        <SheetTrigger asChild className="lg:hidden">
          <Button variant="outline" size="icon" className="fixed top-4 left-4 z-40 shadow-lg">
            <Menu className="h-4 w-4" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-72 p-0">
          <SidebarContent />
        </SheetContent>
      </Sheet>
    </>
  )
} 