'use client'

import { useState, useEffect } from 'react'

export default function CompetencesSection() {
  const [isExpanded, setIsExpanded] = useState(false)
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')
  const [competences, setCompetences] = useState([])
  const [editingId, setEditingId] = useState(null)
  const [formData, setFormData] = useState({
    titre: '',
    description: ''
  })

  // Charger les données au montage du composant
  useEffect(() => {
    if (isExpanded) {
      loadCompetences()
    }
  }, [isExpanded])

  const loadCompetences = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/portfolio/competences')
      const result = await response.json()
      
      if (result.success) {
        setCompetences(result.data || [])
      } else {
        setMessage('Erreur lors du chargement des compétences')
      }
    } catch (error) {
      console.error('Erreur lors du chargement des compétences:', error)
      setMessage('Erreur lors du chargement des compétences')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    setMessage('')

    try {
      const method = editingId ? 'PUT' : 'POST'
      const body = editingId ? { ...formData, id: editingId } : formData

      const response = await fetch('/api/portfolio/competences', {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      })

      const result = await response.json()

      if (result.success) {
        setMessage(result.message)
        resetForm()
        await loadCompetences()
      } else {
        setMessage(result.error || 'Erreur lors de la sauvegarde')
      }
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error)
      setMessage('Erreur lors de la sauvegarde')
    } finally {
      setSaving(false)
    }
  }

  const handleEdit = (competence) => {
    setEditingId(competence.id)
    setFormData({
      titre: competence.titre,
      description: competence.description
    })
  }

  const handleDelete = async (id) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette compétence ?')) {
      return
    }

    try {
      const response = await fetch(`/api/portfolio/competences?id=${id}`, {
        method: 'DELETE',
      })

      const result = await response.json()

      if (result.success) {
        setMessage(result.message)
        await loadCompetences()
      } else {
        setMessage(result.error || 'Erreur lors de la suppression')
      }
    } catch (error) {
      console.error('Erreur lors de la suppression:', error)
      setMessage('Erreur lors de la suppression')
    }
  }

  const handleDeleteAll = async () => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer toutes les compétences ?')) {
      return
    }

    try {
      const response = await fetch('/api/portfolio/competences', {
        method: 'DELETE',
      })

      const result = await response.json()

      if (result.success) {
        setMessage(result.message)
        setCompetences([])
      } else {
        setMessage(result.error || 'Erreur lors de la suppression')
      }
    } catch (error) {
      console.error('Erreur lors de la suppression:', error)
      setMessage('Erreur lors de la suppression')
    }
  }

  const resetForm = () => {
    setEditingId(null)
    setFormData({
      titre: '',
      description: ''
    })
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  return (
    <div className="border border-gray-600 rounded-lg bg-gray-900/50">
      {/* En-tête de la section */}
      <div 
        className="flex items-center justify-between p-6 cursor-pointer hover:bg-gray-800/50 transition-all duration-200"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center">
          <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center mr-3">
            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-white">Compétences</h2>
        </div>
        <svg 
          className={`w-5 h-5 text-gray-400 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </div>

      {/* Contenu de la section */}
      {isExpanded && (
        <div className="p-6 border-t border-gray-600">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
              <span className="ml-3 text-white">Chargement...</span>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Partie gauche - Liste des compétences */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium text-white">Liste des compétences</h3>
                  {competences.length > 0 && (
                    <button
                      onClick={handleDeleteAll}
                      className="px-3 py-1 text-red-400 hover:text-red-300 text-sm border border-red-400 rounded hover:bg-red-900/20 transition-all duration-200"
                    >
                      Tout supprimer
                    </button>
                  )}
                </div>
                
                <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
                  {competences.length === 0 ? (
                    <div className="text-center py-8 text-gray-400">
                      Aucune compétence ajoutée
                    </div>
                  ) : (
                    competences.map((competence) => (
                      <CompetenceCard
                        key={competence.id}
                        competence={competence}
                        onEdit={handleEdit}
                        onDelete={handleDelete}
                      />
                    ))
                  )}
                </div>
              </div>

              {/* Partie droite - Formulaire */}
              <div>
                <h3 className="text-lg font-medium text-white mb-4">
                  {editingId ? 'Modifier la compétence' : 'Ajouter une compétence'}
                </h3>
                
                <form onSubmit={handleSubmit} className="space-y-4">
                  {/* Message de statut */}
                  {message && (
                    <div className={`p-3 rounded-lg ${
                      message.includes('succès') 
                        ? 'bg-green-900/50 border border-green-700/50 text-green-300' 
                        : 'bg-red-900/50 border border-red-700/50 text-red-300'
                    }`}>
                      {message}
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-medium text-white mb-2">
                      Titre
                    </label>
                    <input
                      type="text"
                      name="titre"
                      value={formData.titre}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-600 rounded-lg bg-transparent text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                      placeholder="Titre de la compétence"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-white mb-2">
                      Description
                    </label>
                    <textarea
                      rows={4}
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-600 rounded-lg bg-transparent text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 resize-none"
                      placeholder="Description de la compétence..."
                      required
                    />
                  </div>

                  {/* Boutons d'action */}
                  <div className="flex justify-end space-x-3 pt-4">
                    <button
                      type="button"
                      onClick={() => setIsExpanded(false)}
                      className="px-6 py-3 text-gray-300 bg-transparent border border-gray-600 rounded-lg hover:bg-gray-800 transition-all duration-200"
                    >
                      Fermer
                    </button>
                    {editingId && (
                      <button
                        type="button"
                        onClick={resetForm}
                        className="px-6 py-3 text-gray-300 bg-transparent border border-gray-600 rounded-lg hover:bg-gray-800 transition-all duration-200"
                      >
                        Annuler
                      </button>
                    )}
                    <button
                      type="submit"
                      disabled={saving}
                      className="px-6 py-3 bg-white text-gray-900 rounded-lg hover:bg-gray-100 transition-all duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {saving ? (
                        <div className="flex items-center">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-900 mr-2"></div>
                          {editingId ? 'Mise à jour...' : 'Ajout...'}
                        </div>
                      ) : (
                        editingId ? 'Mettre à jour' : 'Ajouter'
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// Composant pour une carte de compétence
function CompetenceCard({ competence, onEdit, onDelete }) {
  const [isExpanded, setIsExpanded] = useState(false)

  return (
    <div className={`border border-gray-600 rounded-lg bg-gray-800/50 transition-all duration-300 ${
      isExpanded ? 'min-h-24' : 'h-24'
    } overflow-hidden`}>
      <div className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h4 className="text-white font-medium mb-2 line-clamp-1">{competence.titre}</h4>
            <div className={`transition-all duration-300 ${
              isExpanded ? 'block' : 'line-clamp-2'
            }`}>
              <p className="text-gray-300 text-sm">
                {competence.description}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2 ml-4 flex-shrink-0">
            <button
              onClick={() => onEdit(competence)}
              className="p-2 text-blue-400 hover:text-blue-300 hover:bg-blue-900/20 rounded transition-all duration-200"
              title="Modifier"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </button>
            <button
              onClick={() => onDelete(competence.id)}
              className="p-2 text-red-400 hover:text-red-300 hover:bg-red-900/20 rounded transition-all duration-200"
              title="Supprimer"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-2 text-gray-400 hover:text-gray-300 hover:bg-gray-900/20 rounded transition-all duration-200"
              title={isExpanded ? "Replier" : "Déplier"}
            >
              <svg 
                className={`w-4 h-4 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
} 