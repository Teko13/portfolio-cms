'use client'

import { useState, useEffect, useRef } from 'react'

export default function ReseauSection() {
  const [isExpanded, setIsExpanded] = useState(false)
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [message, setMessage] = useState('')
  const [elements, setElements] = useState([])
  const [uploadError, setUploadError] = useState('')
  const [editingElement, setEditingElement] = useState(null)
  const [formData, setFormData] = useState({
    nom: '',
    url: '',
    icon_url: ''
  })
  const fileInputRef = useRef(null)

  // Charger les données au montage du composant
  useEffect(() => {
    if (isExpanded) {
      loadElements()
    }
  }, [isExpanded])

  const loadElements = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/portfolio/reseau')
      const result = await response.json()
      
      if (result.success) {
        setElements(result.data || [])
      } else {
        setMessage('Erreur lors du chargement du réseau')
      }
    } catch (error) {
      console.error('Erreur lors du chargement du réseau:', error)
      setMessage('Erreur lors du chargement du réseau')
    } finally {
      setLoading(false)
    }
  }

  const handleFileChange = async (e) => {
    const file = e.target.files[0]
    if (!file) return

    setUploading(true)
    setUploadError('')

    try {
      const formData = new FormData()
      formData.append('file', file)

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })

      const result = await response.json()

      if (result.success) {
        setFormData(prev => ({ ...prev, icon_url: result.data.url }))
        setUploadError('')
      } else {
        setUploadError(result.error || 'Erreur lors de l\'upload')
      }
    } catch (error) {
      console.error('Erreur lors de l\'upload:', error)
      setUploadError('Erreur lors de l\'upload de l\'icône')
    } finally {
      setUploading(false)
    }
  }

  const removeIcon = async () => {
    if (!formData.icon_url) return

    try {
      const response = await fetch('/api/upload/delete', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ imageUrl: formData.icon_url }),
      })

      const result = await response.json()

      if (result.success) {
        setFormData(prev => ({ ...prev, icon_url: '' }))
      } else {
        console.error('Erreur lors de la suppression de l\'icône:', result.error)
      }
    } catch (error) {
      console.error('Erreur lors de la suppression de l\'icône:', error)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!formData.nom.trim() || !formData.url.trim()) {
      setMessage('Le nom et l\'URL sont requis')
      return
    }

    setSaving(true)
    try {
      const url = editingElement ? `/api/portfolio/reseau` : `/api/portfolio/reseau`
      const method = editingElement ? 'PUT' : 'POST'
      
      const body = editingElement 
        ? { ...formData, id: editingElement.id }
        : formData

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
        setFormData({ nom: '', url: '', icon_url: '' })
        setEditingElement(null)
        loadElements()
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

  const handleEdit = (element) => {
    setEditingElement(element)
    setFormData({
      nom: element.nom,
      url: element.url,
      icon_url: element.icon_url || ''
    })
  }

  const handleCancel = () => {
    setEditingElement(null)
    setFormData({ nom: '', url: '', icon_url: '' })
    setMessage('')
  }

  const handleDelete = async (id) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cet élément ?')) return

    try {
      const response = await fetch(`/api/portfolio/reseau?id=${id}`, {
        method: 'DELETE',
      })

      const result = await response.json()

      if (result.success) {
        setMessage(result.message)
        loadElements()
      } else {
        setMessage(result.error || 'Erreur lors de la suppression')
      }
    } catch (error) {
      console.error('Erreur lors de la suppression:', error)
      setMessage('Erreur lors de la suppression')
    }
  }

  const handleDeleteAll = async () => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer tous les éléments du réseau ? Cette action est irréversible.')) return

    try {
      const response = await fetch('/api/portfolio/reseau', {
        method: 'DELETE',
      })

      const result = await response.json()

      if (result.success) {
        setMessage(result.message)
        setElements([])
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
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center mr-3">
            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-white">Réseau</h2>
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
              {/* Partie gauche - Liste des éléments */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium text-white">Éléments du réseau</h3>
                  {elements.length > 0 && (
                    <button
                      onClick={handleDeleteAll}
                      className="px-3 py-1 text-red-400 hover:text-red-300 text-sm border border-red-400 rounded hover:bg-red-900/20 transition-all duration-200"
                    >
                      Tout supprimer
                    </button>
                  )}
                </div>
                
                {elements.length === 0 ? (
                  <div className="text-center py-12 text-gray-400 border-2 border-dashed border-gray-600 rounded-lg">
                    <svg className="mx-auto h-12 w-12 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    <p>Aucun élément dans le réseau</p>
                    <p className="text-sm">Ajoutez des éléments pour commencer</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {elements.map((element) => (
                      <ReseauCard 
                        key={element.id} 
                        element={element} 
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
                  {editingElement ? 'Modifier l\'élément' : 'Ajouter un élément'}
                </h3>
                
                <form onSubmit={handleSubmit} className="space-y-4">
                  {/* Nom */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Nom *
                    </label>
                    <input
                      type="text"
                      value={formData.nom}
                      onChange={(e) => setFormData(prev => ({ ...prev, nom: e.target.value }))}
                      className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
                      placeholder="Ex: LinkedIn, GitHub, Twitter..."
                      required
                    />
                  </div>

                  {/* URL */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      URL *
                    </label>
                    <input
                      type="url"
                      value={formData.url}
                      onChange={(e) => setFormData(prev => ({ ...prev, url: e.target.value }))}
                      className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
                      placeholder="https://..."
                      required
                    />
                  </div>

                  {/* Icône */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Icône (optionnel)
                    </label>
                    
                    {formData.icon_url ? (
                      <div className="space-y-2">
                        <div className="flex items-center space-x-3 p-3 bg-gray-800 border border-gray-600 rounded-lg">
                          <img 
                            src={formData.icon_url} 
                            alt="Icône" 
                            className="w-8 h-8 object-cover rounded"
                          />
                          <span className="text-gray-300 text-sm flex-1 truncate">
                            Icône uploadée
                          </span>
                          <button
                            type="button"
                            onClick={removeIcon}
                            className="p-1 text-red-400 hover:text-red-300"
                            title="Supprimer l'icône"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="border-2 border-dashed border-gray-600 rounded-lg p-4 text-center hover:border-gray-500 transition-all duration-200">
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept="image/*"
                          onChange={handleFileChange}
                          className="hidden"
                        />
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          disabled={uploading}
                          className="w-full space-y-2"
                        >
                          {uploading ? (
                            <div className="flex items-center justify-center">
                              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-400"></div>
                              <span className="ml-2 text-blue-400">Upload en cours...</span>
                            </div>
                          ) : (
                            <>
                              <svg className="mx-auto h-8 w-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                              </svg>
                              <div className="text-gray-400">
                                <span className="font-medium">Cliquez pour uploader une icône</span>
                                <p className="text-sm">PNG, JPG, GIF jusqu'à 5MB</p>
                              </div>
                            </>
                          )}
                        </button>
                      </div>
                    )}
                  </div>

                  {uploadError && (
                    <div className="bg-red-900/20 border border-red-400 rounded-lg p-3">
                      <p className="text-red-400 text-sm">{uploadError}</p>
                    </div>
                  )}

                  {/* Boutons */}
                  <div className="flex space-x-3">
                    <button
                      type="submit"
                      disabled={saving}
                      className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                    >
                      {saving ? (
                        <div className="flex items-center justify-center">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Sauvegarde...
                        </div>
                      ) : (
                        editingElement ? 'Modifier' : 'Ajouter'
                      )}
                    </button>
                    
                    {editingElement && (
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

// Composant pour afficher une carte d'élément réseau
function ReseauCard({ element, onEdit, onDelete }) {
  return (
    <div className="border border-gray-600 rounded-lg bg-gray-800/50 p-4">
      <div className="flex items-center space-x-3">
        {/* Icône */}
        {element.icon_url ? (
          <img 
            src={element.icon_url} 
            alt={element.nom}
            className="w-10 h-10 object-cover rounded"
          />
        ) : (
          <div className="w-10 h-10 bg-gray-700 rounded flex items-center justify-center">
            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
            </svg>
          </div>
        )}

        {/* Contenu */}
        <div className="flex-1 min-w-0">
          <h4 className="text-white font-medium truncate">{element.nom}</h4>
          <a 
            href={element.url} 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-blue-400 hover:text-blue-300 text-sm truncate block"
          >
            {element.url}
          </a>
        </div>

        {/* Boutons d'action */}
        <div className="flex items-center space-x-2 flex-shrink-0">
          <button
            onClick={() => onEdit(element)}
            className="p-2 text-blue-400 hover:text-blue-300 hover:bg-blue-900/20 rounded transition-all duration-200"
            title="Modifier"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </button>
          <button
            onClick={() => onDelete(element.id)}
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
