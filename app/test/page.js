'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function TestPage() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [formattedDate, setFormattedDate] = useState('')
  const router = useRouter()

  useEffect(() => {
    checkUser()
  }, [])

  useEffect(() => {
    if (user?.last_sign_in_at) {
      setFormattedDate(new Date(user.last_sign_in_at).toLocaleString('fr-FR'))
    }
  }, [user])

  const checkUser = async () => {
    try {
      const response = await fetch('/api/auth/user')
      const data = await response.json()

      if (response.ok) {
        setUser(data.user)
      } else {
        setError(data.error || 'Erreur de vérification')
      }
    } catch (err) {
      setError('Erreur de connexion au serveur')
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = async () => {
    try {
      const response = await fetch('/api/auth/logout', {
        method: 'POST',
      })

      if (response.ok) {
        router.push('/login')
      } else {
        const data = await response.json()
        setError(data.error || 'Erreur de déconnexion')
      }
    } catch (err) {
      setError('Erreur de déconnexion')
    }
  }

  const goToDashboard = () => {
    router.push('/dashboard/portfolio')
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-dark-bg">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-dark-text-secondary">Vérification de la connexion...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-dark-bg py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          {user ? (
            // Connexion réussie
            <div className="space-y-6">
              <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-success-900/50 border border-success-700">
                <svg
                  className="h-8 w-8 text-success-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
              <h2 className="text-3xl font-extrabold text-dark-text">
                Connexion réussie !
              </h2>
              <div className="bg-dark-card shadow-2xl rounded-2xl p-8 border border-dark-border">
                <h3 className="text-lg font-medium text-dark-text mb-6 flex items-center">
                  <svg className="w-5 h-5 mr-2 text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  Informations utilisateur
                </h3>
                <div className="space-y-3 text-sm text-dark-text-secondary">
                  <p><strong className="text-dark-text">Email :</strong> {user.email}</p>
                  <p><strong className="text-dark-text">ID :</strong> {user.id}</p>
                  <p><strong className="text-dark-text">Dernière connexion :</strong> {formattedDate || 'Chargement...'}</p>
                </div>
              </div>
              <div className="space-y-4">
                <button
                  onClick={goToDashboard}
                  className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-lg text-sm font-medium text-dark-text bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-all duration-200 hover:shadow-primary-600/25"
                >
                  Accéder au Dashboard
                </button>
                <button
                  onClick={handleLogout}
                  className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-lg text-sm font-medium text-dark-text bg-danger-600 hover:bg-danger-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-danger-500 transition-all duration-200 hover:shadow-danger-600/25"
                >
                  Se déconnecter
                </button>
                <Link
                  href="/"
                  className="w-full flex justify-center py-3 px-4 border border-dark-border rounded-xl shadow-lg text-sm font-medium text-dark-text-secondary bg-dark-card hover:bg-dark-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-all duration-200"
                >
                  Retour à l'accueil
                </Link>
              </div>
            </div>
          ) : (
            // Connexion échouée
            <div className="space-y-6">
              <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-danger-900/50 border border-danger-700">
                <svg
                  className="h-8 w-8 text-danger-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </div>
              <h2 className="text-3xl font-extrabold text-dark-text">
                Connexion échouée
              </h2>
              <div className="bg-danger-900/50 border border-danger-700 rounded-xl p-6">
                <p className="text-sm text-danger-300">
                  {error || 'Vous devez être connecté pour accéder à cette page.'}
                </p>
              </div>
              <div className="space-y-4">
                <Link
                  href="/login"
                  className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-lg text-sm font-medium text-dark-text bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-all duration-200 hover:shadow-primary-600/25"
                >
                  Se connecter
                </Link>
                <Link
                  href="/"
                  className="w-full flex justify-center py-3 px-4 border border-dark-border rounded-xl shadow-lg text-sm font-medium text-dark-text-secondary bg-dark-card hover:bg-dark-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-all duration-200"
                >
                  Retour à l'accueil
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
} 