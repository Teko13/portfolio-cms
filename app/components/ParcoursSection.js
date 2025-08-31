'use client'

import { useState, useEffect, useRef } from 'react'

export default function ParcoursSection() {
  const [isExpanded, setIsExpanded] = useState(false)
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [message, setMessage] = useState('')
  const [parcours, setParcours] = useState([])
  const [uploadError, setUploadError] = useState('')
  const [editingParcours, setEditingParcours] = useState(null)
  const [formData, setFormData] = useState({
    titre: '',
    ecole: '',
    obtenu_en: '',
    diplome_pdf_url: ''
  })
  const fileInputRef = useRef(null)

  // Charger les données au montage du composant
  useEffect(() => {
    if (isExpanded) {
      loadParcours()
    }
  }, [isExpanded])

  const loadParcours = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/portfolio/parcours')
      const result = await response.json()
      
      if (result.success) {
        setParcours(result.data || [])
      } else {
        setMessage('Erreur lors du chargement des parcours')
      }
    } catch (error) {
      console.error('Erreur lors du chargement des parcours:', error)
      setMessage('Erreur lors du chargement des parcours')
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

      const response = await fetch('/api/upload/pdf', {
        method: 'POST',
        body: formData,
      })

      const result = await response.json()

      if (result.success) {
        setFormData(prev => ({ ...prev, diplome_pdf_url: result.data.url }))
        setUploadError('')
      } else {
        setUploadError(result.error || 'Erreur lors de l\'upload')
      }
    } catch (error) {
      console.error('Erreur lors de l\'upload:', error)
      setUploadError('Erreur lors de l\'upload du PDF')
    } finally {
      setUploading(false)
    }
  }

  const removePdf = async () => {
    if (!formData.diplome_pdf_url) return

    try {
      const response = await fetch('/api/upload/pdf/delete', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ pdfUrl: formData.diplome_pdf_url }),
      })

      const result = await response.json()

      if (result.success) {
        setFormData(prev => ({ ...prev, diplome_pdf_url: '' }))
      } else {
        console.error('Erreur lors de la suppression du PDF:', result.error)
      }
    } catch (error) {
      console.error('Erreur lors de la suppression du PDF:', error)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!formData.titre.trim() || !formData.ecole.trim() || !formData.obtenu_en) {
      setMessage('Le titre, l\'école et la date d\'obtention sont requis')
      return
    }

    setSaving(true)
    try {
      const url = editingParcours ? `/api/portfolio/parcours` : `/api/portfolio/parcours`
      const method = editingParcours ? 'PUT' : 'POST'
      
      const body = editingParcours 
        ? { ...formData, id: editingParcours.id }
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
        setFormData({ titre: '', ecole: '', obtenu_en: '', diplome_pdf_url: '' })
        setEditingParcours(null)
        loadParcours()
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

  const handleEdit = (parcours) => {
    setEditingParcours(parcours)
    setFormData({
      titre: parcours.titre,
      ecole: parcours.ecole,
      obtenu_en: parcours.obtenu_en,
      diplome_pdf_url: parcours.diplome_pdf_url || ''
    })
  }

  const handleCancel = () => {
    setEditingParcours(null)
    setFormData({ titre: '', ecole: '', obtenu_en: '', diplome_pdf_url: '' })
    setMessage('')
  }

  const handleDelete = async (id) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce parcours ?')) return

    try {
      const response = await fetch(`/api/portfolio/parcours?id=${id}`, {
        method: 'DELETE',
      })

      const result = await response.json()

      if (result.success) {
        setMessage(result.message)
        loadParcours()
      } else {
        setMessage(result.error || 'Erreur lors de la suppression')
      }
    } catch (error) {
      console.error('Erreur lors de la suppression:', error)
      setMessage('Erreur lors de la suppression')
    }
  }

  const handleDeleteAll = async () => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer tous les parcours ? Cette action est irréversible.')) return

    try {
      const response = await fetch('/api/portfolio/parcours', {
        method: 'DELETE',
      })

      const result = await response.json()

      if (result.success) {
        setMessage(result.message)
        setParcours([])
      } else {
        setMessage(result.error || 'Erreur lors de la suppression')
      }
    } catch (error) {
      console.error('Erreur lors de la suppression:', error)
      setMessage('Erreur lors de la suppression')
    }
  }

  const formatDate = (dateString) => {
    if (!dateString) return ''
    const date = new Date(dateString)
    return date.toLocaleDateString('fr-FR', { 
      year: 'numeric', 
      month: 'long' 
    })
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
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-white">Parcours</h2>
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
              {/* Partie gauche - Liste des parcours */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium text-white">Parcours de formation</h3>
                  {parcours.length > 0 && (
                    <button
                      onClick={handleDeleteAll}
                      className="px-3 py-1 text-red-400 hover:text-red-300 text-sm border border-red-400 rounded hover:bg-red-900/20 transition-all duration-200"
                    >
                      Tout supprimer
                    </button>
                  )}
                </div>
                
                {parcours.length === 0 ? (
                  <div className="text-center py-12 text-gray-400 border-2 border-dashed border-gray-600 rounded-lg">
                    <svg className="mx-auto h-12 w-12 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
                    </svg>
                    <p>Aucun parcours enregistré</p>
                    <p className="text-sm">Ajoutez vos formations et diplômes</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {parcours.map((parcours) => (
                      <ParcoursCard 
                        key={parcours.id} 
                        parcours={parcours} 
                        onEdit={handleEdit}
                        onDelete={handleDelete}
                        formatDate={formatDate}
                      />
                    ))}
                  </div>
                )}
              </div>

              {/* Partie droite - Formulaire */}
              <div>
                <h3 className="text-lg font-medium text-white mb-4">
                  {editingParcours ? 'Modifier le parcours' : 'Ajouter un parcours'}
                </h3>
                
                <form onSubmit={handleSubmit} className="space-y-4">
                  {/* Titre */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Titre *
                    </label>
                    <input
                      type="text"
                      value={formData.titre}
                      onChange={(e) => setFormData(prev => ({ ...prev, titre: e.target.value }))}
                      className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-green-500"
                      placeholder="Ex: Master en Informatique, Certification AWS..."
                      required
                    />
                  </div>

                  {/* École */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      École/Organisme *
                    </label>
                    <input
                      type="text"
                      value={formData.ecole}
                      onChange={(e) => setFormData(prev => ({ ...prev, ecole: e.target.value }))}
                      className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-green-500"
                      placeholder="Ex: Université Paris-Saclay, OpenClassrooms..."
                      required
                    />
                  </div>

                  {/* Date d'obtention */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Date d'obtention *
                    </label>
                    <input
                      type="date"
                      value={formData.obtenu_en}
                      onChange={(e) => setFormData(prev => ({ ...prev, obtenu_en: e.target.value }))}
                      className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-green-500"
                      required
                    />
                  </div>

                  {/* PDF du diplôme */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      PDF du diplôme (optionnel)
                    </label>
                    
                    {formData.diplome_pdf_url ? (
                      <div className="space-y-2">
                        <div className="flex items-center space-x-3 p-3 bg-gray-800 border border-gray-600 rounded-lg">
                          <svg className="w-8 h-8 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                          </svg>
                          <span className="text-gray-300 text-sm flex-1 truncate">
                            PDF uploadé
                          </span>
                          <a
                            href={formData.diplome_pdf_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1 text-blue-400 hover:text-blue-300"
                            title="Voir le PDF"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                            </svg>
                          </a>
                          <button
                            type="button"
                            onClick={removePdf}
                            className="p-1 text-red-400 hover:text-red-300"
                            title="Supprimer le PDF"
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
                          accept=".pdf"
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
                              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-green-400"></div>
                              <span className="ml-2 text-green-400">Upload en cours...</span>
                            </div>
                          ) : (
                            <>
                              <svg className="mx-auto h-8 w-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                              </svg>
                              <div className="text-gray-400">
                                <span className="font-medium">Cliquez pour uploader un PDF</span>
                                <p className="text-sm">PDF jusqu'à 10MB</p>
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
                      className="flex-1 px-4 py-2 bg-white text-black rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                    >
                      {saving ? (
                        <div className="flex items-center justify-center">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-black mr-2"></div>
                          Sauvegarde...
                        </div>
                      ) : (
                        editingParcours ? 'Modifier' : 'Ajouter'
                      )}
                    </button>
                    
                    {editingParcours && (
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

                {/* Bouton Fermer */}
                <div className="flex justify-end pt-4">
                  <button
                    type="button"
                    onClick={() => setIsExpanded(false)}
                    className="px-6 py-3 text-gray-300 bg-transparent border border-gray-600 rounded-lg hover:bg-gray-800 transition-all duration-200"
                  >
                    Fermer
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// Composant pour afficher une carte de parcours
function ParcoursCard({ parcours, onEdit, onDelete, formatDate }) {
  return (
    <div className="border border-gray-600 rounded-lg bg-gray-800/50 p-4">
      <div className="flex items-start space-x-3">
        {/* Icône PDF */}
        {parcours.diplome_pdf_url ? (
          <div className="flex-shrink-0">
            <a
              href={parcours.diplome_pdf_url}
              target="_blank"
              rel="noopener noreferrer"
              className="block w-10 h-10 bg-red-600 rounded flex items-center justify-center hover:bg-red-700 transition-all duration-200"
              title="Voir le PDF"
            >
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
            </a>
          </div>
        ) : (
          <div className="w-10 h-10 bg-gray-700 rounded flex items-center justify-center flex-shrink-0">
            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
            </svg>
          </div>
        )}

        {/* Contenu */}
        <div className="flex-1 min-w-0">
          <h4 className="text-white font-medium truncate">{parcours.titre}</h4>
          <p className="text-gray-300 text-sm truncate">{parcours.ecole}</p>
          <p className="text-green-400 text-xs">{formatDate(parcours.obtenu_en)}</p>
        </div>

        {/* Boutons d'action */}
        <div className="flex items-center space-x-2 flex-shrink-0">
          <button
            onClick={() => onEdit(parcours)}
            className="p-2 text-green-400 hover:text-green-300 hover:bg-green-900/20 rounded transition-all duration-200"
            title="Modifier"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </button>
          <button
            onClick={() => onDelete(parcours.id)}
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
