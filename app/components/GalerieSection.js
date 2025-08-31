'use client'

import { useState, useEffect, useRef } from 'react'

export default function GalerieSection() {
  const [isExpanded, setIsExpanded] = useState(false)
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [message, setMessage] = useState('')
  const [photos, setPhotos] = useState([])
  const [uploadError, setUploadError] = useState('')
  const [titre, setTitre] = useState('')
  const [uploadedImageUrl, setUploadedImageUrl] = useState('')
  const [imageUploaded, setImageUploaded] = useState(false)
  const fileInputRef = useRef(null)

  // Charger les données au montage du composant
  useEffect(() => {
    if (isExpanded) {
      loadPhotos()
    }
  }, [isExpanded])

  const loadPhotos = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/portfolio/galerie')
      const result = await response.json()
      
      if (result.success) {
        setPhotos(result.data || [])
      } else {
        setMessage('Erreur lors du chargement de la galerie')
      }
    } catch (error) {
      console.error('Erreur lors du chargement de la galerie:', error)
      setMessage('Erreur lors du chargement de la galerie')
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
        // Stocker l'URL de l'image uploadée
        setUploadedImageUrl(result.data.url)
        setImageUploaded(true)
        setUploadError('')
      } else {
        setUploadError(result.error || 'Erreur lors de l\'upload')
      }
    } catch (error) {
      console.error('Erreur lors de l\'upload:', error)
      setUploadError('Erreur lors de l\'upload de l\'image')
    } finally {
      setUploading(false)
    }
  }

  const addPhotoToGallery = async () => {
    if (!uploadedImageUrl) {
      setMessage('Aucune image uploadée')
      return
    }
    
    setSaving(true)
    try {
      const response = await fetch('/api/portfolio/galerie', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          photo_url: uploadedImageUrl,
          titre: titre || null
        }),
      })

      const result = await response.json()

      if (result.success) {
        setMessage('Photo ajoutée à la galerie avec succès')
        setTitre('') // Réinitialiser le titre
        setUploadedImageUrl('') // Réinitialiser l'URL de l'image
        setImageUploaded(false) // Réinitialiser l'état d'upload
        loadPhotos() // Recharger la galerie
      } else {
        setMessage(result.error || 'Erreur lors de l\'ajout de la photo')
      }
    } catch (error) {
      console.error('Erreur lors de l\'ajout de la photo:', error)
      setMessage('Erreur lors de l\'ajout de la photo')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette photo ?')) return

    try {
      const response = await fetch(`/api/portfolio/galerie?id=${id}`, {
        method: 'DELETE',
      })

      const result = await response.json()

      if (result.success) {
        setMessage(result.message)
        loadPhotos()
      } else {
        setMessage(result.error || 'Erreur lors de la suppression')
      }
    } catch (error) {
      console.error('Erreur lors de la suppression:', error)
      setMessage('Erreur lors de la suppression')
    }
  }

  const handleCancelUpload = () => {
    setUploadedImageUrl('')
    setImageUploaded(false)
    setTitre('')
    setUploadError('')
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleDeleteAll = async () => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer toutes les photos de la galerie ? Cette action est irréversible.')) return

    try {
      const response = await fetch('/api/portfolio/galerie', {
        method: 'DELETE',
      })

      const result = await response.json()

      if (result.success) {
        setMessage(result.message)
        setPhotos([])
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
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-white">Ma Galerie</h2>
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
              {/* Partie gauche - Galerie */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium text-white">Galerie d'images</h3>
                  {photos.length > 0 && (
                    <button
                      onClick={handleDeleteAll}
                      className="px-3 py-1 text-red-400 hover:text-red-300 text-sm border border-red-400 rounded hover:bg-red-900/20 transition-all duration-200"
                    >
                      Tout supprimer
                    </button>
                  )}
                </div>
                
                {photos.length === 0 ? (
                  <div className="text-center py-12 text-gray-400 border-2 border-dashed border-gray-600 rounded-lg">
                    <svg className="mx-auto h-12 w-12 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <p>Aucune photo dans la galerie</p>
                    <p className="text-sm">Ajoutez des photos pour commencer</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {photos.map((photo, index) => (
                      <div key={photo.id} className="relative group">
                        <div className="aspect-square bg-gray-800 rounded-lg overflow-hidden">
                          <img 
                            src={photo.photo_url} 
                            alt={photo.titre || `Photo ${index + 1}`}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                          />
                          
                          {/* Overlay avec bouton de suppression */}
                          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/50 transition-all duration-200 flex items-center justify-center">
                            <button
                              onClick={() => handleDelete(photo.id)}
                              className="opacity-0 group-hover:opacity-100 p-2 bg-red-600 text-white rounded-full hover:bg-red-700 transition-all duration-200"
                              title="Supprimer cette photo"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            </button>
                          </div>
                        </div>
                        
                        {/* Titre de la photo */}
                        {photo.titre && (
                          <div className="mt-2 text-center">
                            <p className="text-sm text-gray-300 font-medium truncate">
                              {photo.titre}
                            </p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Partie droite - Upload */}
              <div>
                <h3 className="text-lg font-medium text-white mb-4">Ajouter une photo</h3>
                
                <div className="space-y-4">
                  {/* Titre de la photo */}
                  <div>
                    <label className="block text-sm font-medium text-white mb-2">
                      Titre de la photo (optionnel)
                    </label>
                    <input
                      type="text"
                      value={titre}
                      onChange={(e) => setTitre(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-600 rounded-lg bg-transparent text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200"
                      placeholder="Ex: Photo de vacances, Portrait, etc."
                    />
                  </div>

                  {/* Zone d'upload */}
                  {!imageUploaded ? (
                    <div className="border-2 border-dashed border-gray-600 rounded-lg p-6 text-center hover:border-gray-500 transition-all duration-200">
                                              <input
                          ref={fileInputRef}
                          type="file"
                          accept="image/*,.svg"
                          onChange={handleFileChange}
                          className="hidden"
                        />
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        disabled={uploading}
                        className="w-full space-y-2"
                      >
                        {uploading ? (
                          <div className="flex items-center justify-center">
                            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-400"></div>
                            <span className="ml-2 text-purple-400">Upload en cours...</span>
                          </div>
                        ) : (
                          <>
                            <svg className="mx-auto h-8 w-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                            </svg>
                            <div className="text-gray-400">
                              <span className="font-medium">Cliquez pour uploader</span>
                              <p className="text-sm">PNG, JPG, GIF, SVG jusqu'à 5MB</p>
                            </div>
                          </>
                        )}
                      </button>
                    </div>
                  ) : (
                    /* Aperçu de l'image uploadée */
                    <div className="space-y-4">
                      <div className="border border-gray-600 rounded-lg p-4">
                        <div className="aspect-square bg-gray-800 rounded-lg overflow-hidden mb-3">
                          <img 
                            src={uploadedImageUrl} 
                            alt="Aperçu"
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <p className="text-sm text-gray-400 text-center">Image uploadée avec succès</p>
                      </div>
                      
                      {/* Boutons d'action */}
                      <div className="flex space-x-3">
                        <button
                          onClick={addPhotoToGallery}
                          disabled={saving}
                          className="flex-1 bg-white hover:bg-gray-100 text-black py-2 px-4 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {saving ? (
                            <div className="flex items-center justify-center">
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-black mr-2"></div>
                              Ajout en cours...
                            </div>
                          ) : (
                            'Ajouter à la galerie'
                          )}
                        </button>
                        <button
                          onClick={handleCancelUpload}
                          disabled={saving}
                          className="px-4 py-2 border border-gray-600 text-gray-400 hover:text-gray-300 hover:bg-gray-800 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          Annuler
                        </button>
                      </div>
                    </div>
                  )}
                  
                  {uploadError && (
                    <div className="bg-red-900/20 border border-red-400 rounded-lg p-3">
                      <p className="text-red-400 text-sm">{uploadError}</p>
                    </div>
                  )}
                  
                  {/* Message */}
                  {message && (
                    <div className={`p-3 rounded-lg text-sm ${
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
            </div>
          )}
        </div>
      )}
    </div>
  )
}
