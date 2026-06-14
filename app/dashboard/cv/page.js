'use client'

import AuthGuard from '@/app/components/AuthGuard'
import CVEditor from '@/app/components/CVEditor'

export default function CVPage() {
  return (
    <AuthGuard>
      <CVEditor />
    </AuthGuard>
  )
}
