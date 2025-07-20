"use client"

import { Loader2, Users, Calendar, Briefcase, Mail } from "lucide-react"
import { motion } from "motion/react"

export default function Loading() {
  const loadingItems = [
    { icon: Users, text: "Loading alumni data..." },
    { icon: Calendar, text: "Fetching events..." },
    { icon: Briefcase, text: "Loading job opportunities..." },
    { icon: Mail, text: "Checking messages..." },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-100 flex items-center justify-center p-4">
      <div className="max-w-md mx-auto text-center">
        {/* Logo/Brand */}
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <div className="w-20 h-20 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <Users className="h-10 w-10 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Alumni Network</h1>
          <p className="text-gray-600">Connecting alumni worldwide</p>
        </motion.div>

        {/* Loading Animation */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mb-8"
        >
          <div className="relative">
            <Loader2 className="h-12 w-12 text-blue-600 animate-spin mx-auto" />
            <div className="absolute inset-0 bg-blue-200/30 rounded-full blur-xl"></div>
          </div>
        </motion.div>

        {/* Loading Items */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="space-y-4"
        >
          {loadingItems.map((item, index) => (
            <motion.div
              key={index}
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.3, delay: 0.6 + index * 0.1 }}
              className="flex items-center justify-center space-x-3 text-gray-600"
            >
              <item.icon className="h-5 w-5" />
              <span className="text-sm">{item.text}</span>
            </motion.div>
          ))}
        </motion.div>

        {/* Progress Bar */}
        <motion.div
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: 2, ease: "easeInOut" }}
          className="mt-8"
        >
          <div className="w-full bg-gray-200 rounded-full h-2">
            <motion.div
              className="bg-gradient-to-r from-blue-600 to-purple-600 h-2 rounded-full"
              initial={{ width: "0%" }}
              animate={{ width: "100%" }}
              transition={{ duration: 2, ease: "easeInOut" }}
            />
          </div>
        </motion.div>

        {/* Loading Text */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 1 }}
          className="mt-4 text-sm text-gray-500"
        >
          Please wait while we prepare your experience...
        </motion.p>

        {/* Floating Elements */}
        <div className="fixed inset-0 pointer-events-none overflow-hidden">
          <motion.div
            animate={{ 
              y: [0, -30, 0],
              opacity: [0.3, 0.6, 0.3]
            }}
            transition={{ 
              duration: 3,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            className="absolute top-1/4 left-1/4 w-16 h-16 bg-blue-200/40 rounded-full blur-xl"
          />
          <motion.div
            animate={{ 
              y: [0, 30, 0],
              opacity: [0.3, 0.6, 0.3]
            }}
            transition={{ 
              duration: 4,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            className="absolute bottom-1/4 right-1/4 w-20 h-20 bg-purple-200/40 rounded-full blur-xl"
          />
        </div>
      </div>
    </div>
  )
} 