'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

export default function Sidebar() {
  const pathname = usePathname()

  const isActive = (path) => pathname === path

  return (
    <>
      {/* Bouton de déconnexion en haut à gauche */}
      <div className="fixed top-4 left-4 z-50">
        <button
          onClick={async () => {
            try {
              await fetch('/api/auth/logout', { method: 'POST' })
              window.location.href = '/login'
            } catch (error) {
              console.error('Erreur de déconnexion:', error)
            }
          }}
          className="w-12 h-12 bg-gray-300 text-gray-900 rounded-lg hover:bg-gray-400 transition-colors duration-200 flex items-center justify-center"
          title="Se déconnecter"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
        </button>
      </div>

      {/* Petit rectangle de navigation à gauche au centre */}
      <div className="fixed left-4 top-1/2 transform -translate-y-1/2 w-16 bg-gray-300 rounded-lg p-3 z-40">
        <div className="flex flex-col space-y-3">
          {/* Bouton Portfolio */}
          <Link
            href="/dashboard/portfolio"
            className={`w-10 h-10 rounded-lg flex items-center justify-center transition-all duration-200 ${
              isActive('/dashboard/portfolio')
                ? 'bg-white text-gray-900 shadow-lg'
                : 'bg-gray-800 text-white hover:bg-gray-700'
            }`}
            title="Portfolio"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
              />
            </svg>
          </Link>

          {/* Bouton CV */}
          <Link
            href="/dashboard/cv"
            className={`w-10 h-10 rounded-lg flex items-center justify-center transition-all duration-200 ${
              isActive('/dashboard/cv')
                ? 'bg-white text-gray-900 shadow-lg'
                : 'bg-gray-800 text-white hover:bg-gray-700'
            }`}
            title="CV"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
          </Link>
        </div>
      </div>
    </>
  )
} 