'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function AuthGuard({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    try {
      const response = await fetch('/api/auth/user')
      const data = await response.json()

      if (response.ok && data.user) {
        setUser(data.user)
      } else {
        // Redirection vers la page de connexion si non authentifié
        router.push('/login')
        return
      }
    } catch (error) {
      console.error('Erreur de vérification d\'authentification:', error)
      router.push('/login')
      return
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Vérification de l'authentification...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return null // Ne rien afficher pendant la redirection
  }

  return children
} 