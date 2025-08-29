'use client'

import { useState, useEffect } from 'react'

export default function LoisirsSection() {
  const [isExpanded, setIsExpanded] = useState(false)
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')
  const [loisirs, setLoisirs] = useState([])
  const [editingLoisir, setEditingLoisir] = useState(null)
  const [description, setDescription] = useState('')

  // Charger les données au montage du composant
  useEffect(() => {
    if (isExpanded) {
      loadLoisirs()
    }
  }, [isExpanded])

  const loadLoisirs = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/portfolio/loisirs')
      const result = await response.json()
      
      if (result.success) {
        setLoisirs(result.data || [])
      } else {
        setMessage('Erreur lors du chargement des loisirs')
      }
    } catch (error) {
      console.error('Erreur lors du chargement des loisirs:', error)
      setMessage('Erreur lors du chargement des loisirs')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!description.trim()) {
      setMessage('La description est requise')
      return
    }

    setSaving(true)
    try {
      const url = '/api/portfolio/loisirs'
      const method = editingLoisir ? 'PUT' : 'POST'
      
      const body = editingLoisir 
        ? { id: editingLoisir.id, description }
        : { description }

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      })

      const result = await response.json()

      if (result.success) {
        setMessage(result.message)
        setDescription('')
        setEditingLoisir(null)
        loadLoisirs()
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

  const handleEdit = (loisir) => {
    setEditingLoisir(loisir)
    setDescription(loisir.description)
  }

  const handleCancel = () => {
    setEditingLoisir(null)
    setDescription('')
    setMessage('')
  }

  const handleDelete = async (id) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce loisir ?')) return

    try {
      const response = await fetch(`/api/portfolio/loisirs?id=${id}`, {
        method: 'DELETE',
      })

      const result = await response.json()

      if (result.success) {
        setMessage(result.message)
        loadLoisirs()
      } else {
        setMessage(result.error || 'Erreur lors de la suppression')
      }
    } catch (error) {
      console.error('Erreur lors de la suppression:', error)
      setMessage('Erreur lors de la suppression')
    }
  }

  const handleDeleteAll = async () => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer tous les loisirs ? Cette action est irréversible.')) return

    try {
      const response = await fetch('/api/portfolio/loisirs', {
        method: 'DELETE',
      })

      const result = await response.json()

      if (result.success) {
        setMessage(result.message)
        setLoisirs([])
      } else {
        setMessage(result.error || 'Erreur lors de la suppression')
      }
    } catch (error) {
      console.error('Erreur lors de la suppression:', error)
      setMessage('Erreur lors de la suppression')
    }
  }

  return (
    <div className="border border-gray-600 rounded-lg bg-gray-900/50">
      {/* En-tête de la section */}
      <div 
        className="flex items-center justify-between p-6 cursor-pointer hover:bg-gray-800/50 transition-all duration-200"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center">
          <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center mr-3">
            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-white">Loisirs</h2>
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
              {/* Partie gauche - Liste des loisirs */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium text-white">Mes loisirs</h3>
                  {loisirs.length > 0 && (
                    <button
                      onClick={handleDeleteAll}
                      className="px-3 py-1 text-red-400 hover:text-red-300 text-sm border border-red-400 rounded hover:bg-red-900/20 transition-all duration-200"
                    >
                      Tout supprimer
                    </button>
                  )}
                </div>
                
                {loisirs.length === 0 ? (
                  <div className="text-center py-12 text-gray-400 border-2 border-dashed border-gray-600 rounded-lg">
                    <svg className="mx-auto h-12 w-12 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <p>Aucun loisir enregistré</p>
                    <p className="text-sm">Ajoutez vos loisirs et centres d'intérêt</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {loisirs.map((loisir) => (
                      <LoisirCard 
                        key={loisir.id} 
                        loisir={loisir} 
                        onEdit={handleEdit}
                        onDelete={handleDelete}
                      />
                    ))}
                  </div>
                )}
              </div>

              {/* Partie droite - Formulaire */}
              <div>
                <h3 className="text-lg font-medium text-white mb-4">
                  {editingLoisir ? 'Modifier le loisir' : 'Ajouter un loisir'}
                </h3>
                
                <form onSubmit={handleSubmit} className="space-y-4">
                  {/* Description */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Description *
                    </label>
                    <textarea
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-500 resize-none"
                      placeholder="Ex: Lecture de science-fiction, Randonnée en montagne, Cuisine italienne..."
                      rows={4}
                      required
                    />
                  </div>

                  {/* Boutons */}
                  <div className="flex space-x-3">
                    <button
                      type="submit"
                      disabled={saving}
                      className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                    >
                      {saving ? (
                        <div className="flex items-center justify-center">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Sauvegarde...
                        </div>
                      ) : (
                        editingLoisir ? 'Modifier' : 'Ajouter'
                      )}
                    </button>
                    
                    {editingLoisir && (
                      <button
                        type="button"
                        onClick={handleCancel}
                        className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-all duration-200"
                      >
                        Annuler
                      </button>
                    )}
                  </div>
                </form>

                {/* Message */}
                {message && (
                  <div className={`mt-4 p-3 rounded-lg text-sm ${
                    message.includes('succès') ? 'bg-green-900/20 border border-green-400 text-green-400' : 'bg-red-900/20 border border-red-400 text-red-400'
                  }`}>
                    {message}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// Composant pour afficher une carte de loisir
function LoisirCard({ loisir, onEdit, onDelete }) {
  return (
    <div className="border border-gray-600 rounded-lg bg-gray-800/50 p-4">
      <div className="flex items-start justify-between">
        {/* Contenu */}
        <div className="flex-1 min-w-0">
          <p className="text-white leading-relaxed">{loisir.description}</p>
        </div>

        {/* Boutons d'action */}
        <div className="flex items-center space-x-2 flex-shrink-0 ml-4">
          <button
            onClick={() => onEdit(loisir)}
            className="p-2 text-purple-400 hover:text-purple-300 hover:bg-purple-900/20 rounded transition-all duration-200"
            title="Modifier"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </button>
          <button
            onClick={() => onDelete(loisir.id)}
            className="p-2 text-red-400 hover:text-red-300 hover:bg-red-900/20 rounded transition-all duration-200"
            title="Supprimer"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  )
}
