import AuthGuard from '@/app/components/AuthGuard'
import Sidebar from '@/app/components/Sidebar'

export default function CVPage() {
  return (
    <AuthGuard>
      <div className="min-h-screen bg-black">
        <Sidebar />
        
        {/* Contenu principal centré */}
        <div className="flex items-center justify-center min-h-screen p-8">
          <div className="w-full max-w-4xl">
            {/* En-tête */}
            <div className="mb-8 text-center">
              <h1 className="text-4xl font-bold text-white mb-3">
                Édition du CV
              </h1>
              <p className="text-gray-400 text-lg">
                Gérez et modifiez les informations de votre CV
              </p>
            </div>

            {/* Contenu de la page */}
            <div className="space-y-8">
              {/* Section Expérience professionnelle */}
              <div>
                <h2 className="text-xl font-semibold text-white mb-6 flex items-center">
                  <div className="w-8 h-8 bg-gray-600 rounded-lg flex items-center justify-center mr-3">
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0V6a2 2 0 012 2v6a2 2 0 01-2 2H8a2 2 0 01-2-2V8a2 2 0 012-2V6" />
                    </svg>
                  </div>
                  Expérience professionnelle
                </h2>
                <div className="space-y-6">
                  <div className="border border-gray-600 rounded-lg p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                      <div>
                        <label className="block text-sm font-medium text-white mb-2">
                          Poste
                        </label>
                        <input
                          type="text"
                          className="w-full px-4 py-3 border border-gray-600 rounded-lg bg-transparent text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                          placeholder="Développeur Full Stack"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-white mb-2">
                          Entreprise
                        </label>
                        <input
                          type="text"
                          className="w-full px-4 py-3 border border-gray-600 rounded-lg bg-transparent text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                          placeholder="Nom de l'entreprise"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-white mb-2">
                          Date de début
                        </label>
                        <input
                          type="date"
                          className="w-full px-4 py-3 border border-gray-600 rounded-lg bg-transparent text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-white mb-2">
                          Date de fin
                        </label>
                        <input
                          type="date"
                          className="w-full px-4 py-3 border border-gray-600 rounded-lg bg-transparent text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-white mb-2">
                        Description
                      </label>
                      <textarea
                        rows={3}
                        className="w-full px-4 py-3 border border-gray-600 rounded-lg bg-transparent text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 resize-none"
                        placeholder="Décrivez vos responsabilités et réalisations..."
                      />
                    </div>
                  </div>
                  <button className="text-blue-400 hover:text-blue-300 text-sm font-medium transition-colors duration-200">
                    + Ajouter une expérience
                  </button>
                </div>
              </div>

              {/* Section Formation */}
              <div>
                <h2 className="text-xl font-semibold text-white mb-6 flex items-center">
                  <div className="w-8 h-8 bg-gray-600 rounded-lg flex items-center justify-center mr-3">
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
                    </svg>
                  </div>
                  Formation
                </h2>
                <div className="space-y-6">
                  <div className="border border-gray-600 rounded-lg p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                      <div>
                        <label className="block text-sm font-medium text-white mb-2">
                          Diplôme
                        </label>
                        <input
                          type="text"
                          className="w-full px-4 py-3 border border-gray-600 rounded-lg bg-transparent text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                          placeholder="Master en Informatique"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-white mb-2">
                          Établissement
                        </label>
                        <input
                          type="text"
                          className="w-full px-4 py-3 border border-gray-600 rounded-lg bg-transparent text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                          placeholder="Université ou École"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-white mb-2">
                          Date d'obtention
                        </label>
                        <input
                          type="date"
                          className="w-full px-4 py-3 border border-gray-600 rounded-lg bg-transparent text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-white mb-2">
                          Mention
                        </label>
                        <input
                          type="text"
                          className="w-full px-4 py-3 border border-gray-600 rounded-lg bg-transparent text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                          placeholder="Très bien, Bien, etc."
                        />
                      </div>
                    </div>
                  </div>
                  <button className="text-blue-400 hover:text-blue-300 text-sm font-medium transition-colors duration-200">
                    + Ajouter une formation
                  </button>
                </div>
              </div>

              {/* Section Compétences */}
              <div>
                <h2 className="text-xl font-semibold text-white mb-6 flex items-center">
                  <div className="w-8 h-8 bg-gray-600 rounded-lg flex items-center justify-center mr-3">
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                    </svg>
                  </div>
                  Compétences
                </h2>
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-white mb-2">
                      Compétences techniques
                    </label>
                    <textarea
                      rows={3}
                      className="w-full px-4 py-3 border border-gray-600 rounded-lg bg-transparent text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 resize-none"
                      placeholder="JavaScript, React, Node.js, Python, SQL, etc."
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-white mb-2">
                      Compétences linguistiques
                    </label>
                    <textarea
                      rows={2}
                      className="w-full px-4 py-3 border border-gray-600 rounded-lg bg-transparent text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 resize-none"
                      placeholder="Français (natif), Anglais (courant), etc."
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-white mb-2">
                      Compétences personnelles
                    </label>
                    <textarea
                      rows={2}
                      className="w-full px-4 py-3 border border-gray-600 rounded-lg bg-transparent text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 resize-none"
                      placeholder="Travail d'équipe, Communication, Gestion de projet, etc."
                    />
                  </div>
                </div>
              </div>

              {/* Section Projets */}
              <div>
                <h2 className="text-xl font-semibold text-white mb-6 flex items-center">
                  <div className="w-8 h-8 bg-gray-600 rounded-lg flex items-center justify-center mr-3">
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                    </svg>
                  </div>
                  Projets réalisés
                </h2>
                <div className="space-y-6">
                  <div className="border border-gray-600 rounded-lg p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                      <div>
                        <label className="block text-sm font-medium text-white mb-2">
                          Nom du projet
                        </label>
                        <input
                          type="text"
                          className="w-full px-4 py-3 border border-gray-600 rounded-lg bg-transparent text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                          placeholder="Nom du projet"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-white mb-2">
                          Technologies utilisées
                        </label>
                        <input
                          type="text"
                          className="w-full px-4 py-3 border border-gray-600 rounded-lg bg-transparent text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                          placeholder="React, Node.js, MongoDB"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-white mb-2">
                        Description
                      </label>
                      <textarea
                        rows={3}
                        className="w-full px-4 py-3 border border-gray-600 rounded-lg bg-transparent text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 resize-none"
                        placeholder="Décrivez le projet, ses fonctionnalités et votre rôle..."
                      />
                    </div>
                  </div>
                  <button className="text-blue-400 hover:text-blue-300 text-sm font-medium transition-colors duration-200">
                    + Ajouter un projet
                  </button>
                </div>
              </div>

              {/* Boutons d'action */}
              <div className="flex justify-end space-x-4 pt-8 border-t border-gray-700">
                <button className="px-8 py-4 text-gray-300 bg-transparent border border-gray-600 rounded-lg hover:bg-gray-800 transition-all duration-200">
                  Annuler
                </button>
                <button className="px-10 py-4 bg-white text-gray-900 rounded-lg hover:bg-gray-100 transition-all duration-200 font-medium">
                  Sauvegarder
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AuthGuard>
  )
} 