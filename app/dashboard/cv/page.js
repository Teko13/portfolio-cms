'use client'

import AuthGuard from '@/app/components/AuthGuard'
import Sidebar from '@/app/components/Sidebar'
import CVEditor from '@/app/components/CVEditor'

export default function CVPage() {
  return (
    <AuthGuard>
      <div className="min-h-screen bg-black">
        <Sidebar />
        
        {/* Contenu principal */}
        <div className="ml-20 p-6">
          <CVEditor />
        </div>
      </div>
    </AuthGuard>
  )
} 