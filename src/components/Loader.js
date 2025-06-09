import { Loader2 } from 'lucide-react'
import React from 'react'

export default function Loader() {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/50 dark:bg-black/50 backdrop-blur-sm">
      <Loader2 className="w-12 h-12 text-blue-600 animate-spin" />
    </div>
  )
}
