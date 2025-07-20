"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { 
  Home, 
  ArrowLeft, 
  Search, 
  Users, 
  Calendar,
  Briefcase,
  Mail,
  Settings,
  HelpCircle,
  MapPin,
  Globe,
  Zap
} from "lucide-react"
import { motion } from "framer-motion"

export default function NotFound() {
  const quickLinks = [
    { name: "Dashboard", href: "/admin/dashboard", icon: Home, color: "text-blue-600" },
    { name: "Events", href: "/events", icon: Calendar, color: "text-green-600" },
    { name: "Alumni", href: "/alumni", icon: Users, color: "text-purple-600" },
    { name: "Jobs", href: "/jobs", icon: Briefcase, color: "text-orange-600" },
    { name: "Contact", href: "/contact", icon: Mail, color: "text-red-600" },
    { name: "Help", href: "/help", icon: HelpCircle, color: "text-indigo-600" },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-4xl mx-auto text-center">
        {/* Animated 404 Number */}
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.8, type: "spring" }}
          className="mb-8"
        >
          <div className="relative">
            <h1 className="text-9xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
              404
            </h1>
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 via-purple-600/20 to-indigo-600/20 blur-3xl rounded-full"></div>
          </div>
        </motion.div>

        {/* Main Content */}
        <motion.div
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="space-y-6"
        >
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Oops! Page Not Found
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              The page you're looking for seems to have wandered off into the digital wilderness. 
              Don't worry, we'll help you find your way back!
            </p>
          </div>

          {/* Action Buttons */}
          <motion.div
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="flex flex-col sm:flex-row gap-4 justify-center items-center"
          >
            <Button asChild size="lg" className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
              <Link href="/admin/dashboard">
                <Home className="mr-2 h-5 w-5" />
                Go to Dashboard
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href="/">
                <ArrowLeft className="mr-2 h-5 w-5" />
                Back to Home
              </Link>
            </Button>
          </motion.div>

          {/* Quick Links Grid */}
          <motion.div
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="mt-12"
          >
            <h3 className="text-xl font-semibold text-gray-800 mb-6">
              Quick Navigation
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 max-w-4xl mx-auto">
              {quickLinks.map((link, index) => (
                <motion.div
                  key={link.name}
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.4, delay: 0.8 + index * 0.1 }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Card className="h-full hover:shadow-lg transition-all duration-300 border-0 bg-white/80 backdrop-blur-sm">
                    <CardContent className="p-4">
                      <Link href={link.href} className="block">
                        <div className="flex flex-col items-center space-y-2">
                          <div className={`p-3 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors`}>
                            <link.icon className={`h-6 w-6 ${link.color}`} />
                          </div>
                          <span className="text-sm font-medium text-gray-700">
                            {link.name}
                          </span>
                        </div>
                      </Link>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Search Section */}
          <motion.div
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6, delay: 1.0 }}
            className="mt-12"
          >
            <Card className="max-w-md mx-auto bg-white/80 backdrop-blur-sm border-0 shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-center space-x-2 mb-4">
                  <Search className="h-5 w-5 text-gray-500" />
                  <h4 className="font-semibold text-gray-800">Can't find what you're looking for?</h4>
                </div>
                <p className="text-sm text-gray-600 mb-4">
                  Try searching our site or contact our support team for assistance.
                </p>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" className="flex-1">
                    <Search className="mr-2 h-4 w-4" />
                    Search Site
                  </Button>
                  <Button variant="outline" size="sm" className="flex-1">
                    <Mail className="mr-2 h-4 w-4" />
                    Contact Support
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Fun Facts */}
          <motion.div
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6, delay: 1.2 }}
            className="mt-8"
          >
            <div className="flex items-center justify-center space-x-6 text-sm text-gray-500">
              <div className="flex items-center space-x-2">
                <Globe className="h-4 w-4" />
                <span>Global Alumni Network</span>
              </div>
              <div className="flex items-center space-x-2">
                <Zap className="h-4 w-4" />
                <span>Lightning Fast</span>
              </div>
              <div className="flex items-center space-x-2">
                <MapPin className="h-4 w-4" />
                <span>Worldwide</span>
              </div>
            </div>
          </motion.div>
        </motion.div>

        {/* Floating Elements */}
        <div className="fixed inset-0 pointer-events-none overflow-hidden">
          <motion.div
            animate={{ 
              y: [0, -20, 0],
              rotate: [0, 5, 0]
            }}
            transition={{ 
              duration: 6,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            className="absolute top-20 left-10 w-20 h-20 bg-blue-200/30 rounded-full blur-xl"
          />
          <motion.div
            animate={{ 
              y: [0, 20, 0],
              rotate: [0, -5, 0]
            }}
            transition={{ 
              duration: 8,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            className="absolute bottom-20 right-10 w-32 h-32 bg-purple-200/30 rounded-full blur-xl"
          />
          <motion.div
            animate={{ 
              x: [0, 30, 0],
              y: [0, -30, 0]
            }}
            transition={{ 
              duration: 10,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            className="absolute top-1/2 left-1/4 w-16 h-16 bg-indigo-200/30 rounded-full blur-xl"
          />
        </div>
      </div>
    </div>
  )
} 