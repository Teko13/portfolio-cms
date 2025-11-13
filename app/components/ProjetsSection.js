'use client'

import { useState, useEffect, useRef } from 'react'
import { api } from '@/utils/api'
import { uploadFile } from '@/utils/upload'

export default function ProjetsSection() {
  const [isExpanded, setIsExpanded] = useState(false)
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [message, setMessage] = useState('')
  const [projets, setProjets] = useState([])
  const [editingId, setEditingId] = useState(null)
  const [uploadError, setUploadError] = useState('')
  const [videoUploadError, setVideoUploadError] = useState('')
  const fileInputRef = useRef(null)
  const videoInputRef = useRef(null)
  const [uploadingVideo, setUploadingVideo] = useState(false)
  const [formData, setFormData] = useState({
    titre: '',
    description: '',
    image_url: '',
    video_url: '',
    acces_url: '',
    source_url: '',
    category: '',
    index: ''
  })
  const [reordering, setReordering] = useState(false)

  // Charger les données au montage du composant
  useEffect(() => {
    if (isExpanded) {
      loadProjets()
    }
  }, [isExpanded])

  // Mettre à jour l'index par défaut après le chargement des projets (uniquement pour nouveau projet)
  useEffect(() => {
    if (!editingId && projets.length > 0) {
      const nextIndex = projets.length + 1
      // Ne mettre à jour que si l'index n'est pas déjà défini ou est vide
      setFormData(prev => {
        if (!prev.index || prev.index === '') {
          return {
            ...prev,
            index: nextIndex.toString()
          }
        }
        return prev
      })
    }
  }, [projets.length, editingId])

  const loadProjets = async () => {
    setLoading(true)
    try {
      const result = await api.get('/api/portfolio/projets')
      setProjets(result.data || [])
    } catch (error) {
      console.error('Erreur lors du chargement des projets:', error)
      setMessage('Erreur lors du chargement des projets')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    setMessage('')

    try {
      // Convertir l'index en nombre
      const body = {
        ...formData,
        index: formData.index ? parseInt(formData.index, 10) : undefined
      }
      
      if (editingId) {
        body.id = editingId
        await api.put('/api/portfolio/projets', body)
      } else {
        await api.post('/api/portfolio/projets', body)
      }

      setMessage(editingId ? 'Projet modifié avec succès' : 'Projet ajouté avec succès')
      resetForm()
      loadProjets()
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error)
      setMessage('Erreur lors de la sauvegarde')
    } finally {
      setSaving(false)
    }
  }

  const handleEdit = (projet) => {
    setEditingId(projet.id)
    setFormData({
      titre: projet.titre || '',
      description: projet.description || '',
      image_url: projet.image_url || '',
      video_url: projet.video_url || '',
      acces_url: projet.acces_url || '',
      source_url: projet.source_url || '',
      category: projet.category || '',
      index: projet.index ? projet.index.toString() : ''
    })
  }

  const handleDelete = async (id) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce projet ?')) return

    try {
      const result = await api.delete(`/api/portfolio/projets?id=${id}`)
      setMessage(result.message)
      loadProjets()
    } catch (error) {
      console.error('Erreur lors de la suppression:', error)
      setMessage('Erreur lors de la suppression')
    }
  }

  const handleDeleteAll = async () => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer tous les projets ? Cette action est irréversible.')) return

    try {
      const result = await api.delete('/api/portfolio/projets')
      setMessage(result.message)
      setProjets([])
    } catch (error) {
      console.error('Erreur lors de la suppression:', error)
      setMessage('Erreur lors de la suppression')
    }
  }

  const handleMoveProject = async (currentIndex, direction) => {
    if (direction === 'up' && currentIndex === 0) return
    if (direction === 'down' && currentIndex === projets.length - 1) return

    const reorderedItems = Array.from(projets)
    const targetIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1
    
    // Échanger les positions
    const temp = reorderedItems[currentIndex];
    reorderedItems[currentIndex] = reorderedItems[targetIndex];
    reorderedItems[targetIndex] = temp;

    // Mettre à jour les index dans l'état local
    reorderedItems.forEach((projet, newIndex) => {
      projet.index = newIndex + 1;
    });

    setProjets(reorderedItems)
    setReordering(true)

    try {
      const responseResult = await api.put('/api/portfolio/projets/reorder', { projects: reorderedItems })

      setMessage('Ordre des projets mis à jour')
    } catch (error) {
      console.error('Erreur lors du réordonnancement:', error)
      setMessage('Erreur lors du réordonnancement')
      // Recharger les projets en cas d'erreur
      loadProjets()
    } finally {
      setReordering(false)
    }
  }

  const resetForm = () => {
    setEditingId(null)
    const nextIndex = projets.length + 1
    setFormData({
      titre: '',
      description: '',
      image_url: '',
      video_url: '',
      acces_url: '',
      source_url: '',
      category: '',
      index: nextIndex.toString()
    })
    setUploadError('')
    setVideoUploadError('')
  }

  const handleFileChange = async (e) => {
    const file = e.target.files[0]
    if (!file) return

    setUploading(true)
    setUploadError('')

    try {
      const formData = new FormData()
      formData.append('file', file)

      const result = await uploadFile('/api/upload', formData)

      setFormData(prev => ({
        ...prev,
        image_url: result.data.url
      }))
      setMessage('Image uploadée avec succès')
    } catch (error) {
      console.error('Erreur lors de l\'upload:', error)
      setUploadError('Erreur lors de l\'upload de l\'image')
    } finally {
      setUploading(false)
    }
  }

  const retryUpload = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click()
    }
  }

  const handleVideoChange = async (e) => {
    const file = e.target.files[0]
    if (!file) return

    setUploadingVideo(true)
    setVideoUploadError('')

    try {
      const formData = new FormData()
      formData.append('file', file)

      const result = await uploadFile('/api/upload/video', formData)

      setFormData(prev => ({
        ...prev,
        video_url: result.data.url
      }))
      setMessage('Vidéo uploadée avec succès')
    } catch (error) {
      console.error('Erreur lors de l\'upload:', error)
      setVideoUploadError('Erreur lors de l\'upload de la vidéo')
    } finally {
      setUploadingVideo(false)
    }
  }

  const removeImage = async () => {
    // Si il y a une image_url, la supprimer du storage
    if (formData.image_url) {
      try {
        const result = await api.post('/api/upload/delete', { imageUrl: formData.image_url })
        console.log('Image supprimée du storage:', formData.image_url)
      } catch (error) {
        console.error('Erreur lors de la suppression de l\'image:', error)
      }
    }

    // Vider le champ image_url
    setFormData(prev => ({
      ...prev,
      image_url: ''
    }))
    setUploadError('')
  }

  const removeVideo = async () => {
    // Si il y a une video_url, la supprimer du storage
    if (formData.video_url) {
      try {
        const result = await api.post('/api/upload/delete', { imageUrl: formData.video_url })
        console.log('Vidéo supprimée du storage:', formData.video_url)
      } catch (error) {
        console.error('Erreur lors de la suppression de la vidéo:', error)
      }
    }

    // Vider le champ video_url
    setFormData(prev => ({
      ...prev,
      video_url: ''
    }))
    setVideoUploadError('')
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
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-white">Projets</h2>
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
              {/* Partie gauche - Liste des projets */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium text-white">Liste des projets</h3>
                  <div className="flex items-center gap-2">
                    {reordering && (
                      <div className="flex items-center text-blue-400 text-sm">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-400 mr-2"></div>
                        Mise à jour...
                      </div>
                    )}
                    {projets.length > 0 && (
                      <button
                        onClick={handleDeleteAll}
                        className="px-3 py-1 text-red-400 hover:text-red-300 text-sm border border-red-400 rounded hover:bg-red-900/20 transition-all duration-200"
                      >
                        Tout supprimer
                      </button>
                    )}
                  </div>
                </div>
                
                <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
                  {projets.length === 0 ? (
                    <div className="text-center py-8 text-gray-400">
                      Aucun projet ajouté
                    </div>
                  ) : (
                    projets.map((projet, index) => (
                      <ProjetCard
                        key={projet.id}
                        projet={projet}
                        index={index}
                        totalProjects={projets.length}
                        onEdit={handleEdit}
                        onDelete={handleDelete}
                        onMoveUp={() => handleMoveProject(index, 'up')}
                        onMoveDown={() => handleMoveProject(index, 'down')}
                      />
                    ))
                  )}
                </div>
              </div>

              {/* Partie droite - Formulaire */}
              <div>
                <h3 className="text-lg font-medium text-white mb-4">
                  {editingId ? 'Modifier le projet' : 'Ajouter un nouveau projet'}
                </h3>

                <form onSubmit={handleSubmit} className="space-y-4">
                  {/* Titre */}
                  <div>
                    <label className="block text-sm font-medium text-white mb-2">
                      Titre *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.titre}
                      onChange={(e) => setFormData({ ...formData, titre: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-600 rounded-lg bg-transparent text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                      placeholder="Titre du projet"
                    />
                  </div>

                  {/* Index */}
                  <div>
                    <label className="block text-sm font-medium text-white mb-2">
                      Index (position dans la liste)
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={formData.index}
                      onChange={(e) => setFormData({ ...formData, index: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-600 rounded-lg bg-transparent text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                      placeholder="Position dans la liste"
                    />
                    <p className="text-xs text-gray-400 mt-1">
                      Détermine l'ordre d'affichage des projets (1 = premier, 2 = deuxième, etc.)
                    </p>
                  </div>

                  {/* Catégorie */}
                  <div>
                    <label className="block text-sm font-medium text-white mb-2">
                      Catégorie
                    </label>
                    <input
                      type="text"
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-600 rounded-lg bg-transparent text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                      placeholder="Ex: Web, Mobile, IA, etc."
                    />
                  </div>

                  {/* Description */}
                  <div>
                    <label className="block text-sm font-medium text-white mb-2">
                      Description *
                    </label>
                    <textarea
                      required
                      rows={3}
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-600 rounded-lg bg-transparent text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 resize-none"
                      placeholder="Description du projet"
                    />
                  </div>

                  {/* Upload d'image */}
                  <div>
                    <label className="block text-sm font-medium text-white mb-2">
                      Image du projet
                    </label>
                    
                    {formData.image_url ? (
                      <div className="space-y-3">
                        <div className="relative">
                          <img 
                            src={formData.image_url} 
                            alt="Aperçu" 
                            className="w-full h-32 object-cover rounded-lg border border-gray-600"
                          />
                          <button
                            type="button"
                            onClick={removeImage}
                            className="absolute top-2 right-2 p-1 bg-red-600 text-white rounded-full hover:bg-red-700 transition-all duration-200"
                            title="Supprimer l'image"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </div>
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          className="w-full px-4 py-2 text-blue-400 border border-blue-400 rounded-lg hover:bg-blue-900/20 transition-all duration-200"
                        >
                          Changer l'image
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <div className="border-2 border-dashed border-gray-600 rounded-lg p-6 text-center hover:border-gray-500 transition-all duration-200">
                                                  <input
                          ref={fileInputRef}
                          type="file"
                          accept="image/*,.svg"
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
                                  <span className="font-medium">Cliquez pour uploader</span>
                                  <p className="text-sm">PNG, JPG, GIF, SVG jusqu'à 5MB</p>
                                </div>
                              </>
                            )}
                          </button>
                        </div>
                        
                        {uploadError && (
                          <div className="bg-red-900/20 border border-red-400 rounded-lg p-3">
                            <p className="text-red-400 text-sm mb-2">{uploadError}</p>
                            <button
                              type="button"
                              onClick={retryUpload}
                              className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700 transition-all duration-200"
                            >
                              Réessayer
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Upload de vidéo */}
                  <div>
                    <label className="block text-sm font-medium text-white mb-2">
                      Vidéo du projet
                    </label>
                    
                    {formData.video_url ? (
                      <div className="space-y-3">
                        <div className="relative">
                          <video 
                            src={formData.video_url} 
                            controls
                            className="w-full h-48 object-cover rounded-lg border border-gray-600"
                          />
                          <button
                            type="button"
                            onClick={removeVideo}
                            className="absolute top-2 right-2 p-1 bg-red-600 text-white rounded-full hover:bg-red-700 transition-all duration-200"
                            title="Supprimer la vidéo"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </div>
                        <button
                          type="button"
                          onClick={() => videoInputRef.current?.click()}
                          className="w-full px-4 py-2 text-blue-400 border border-blue-400 rounded-lg hover:bg-blue-900/20 transition-all duration-200"
                        >
                          Changer la vidéo
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <div className="border-2 border-dashed border-gray-600 rounded-lg p-6 text-center hover:border-gray-500 transition-all duration-200">
                          <input
                            ref={videoInputRef}
                            type="file"
                            accept="video/*"
                            onChange={handleVideoChange}
                            className="hidden"
                          />
                          <button
                            type="button"
                            onClick={() => videoInputRef.current?.click()}
                            disabled={uploadingVideo}
                            className="w-full space-y-2"
                          >
                            {uploadingVideo ? (
                              <div className="flex items-center justify-center">
                                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-400"></div>
                                <span className="ml-2 text-blue-400">Upload en cours...</span>
                              </div>
                            ) : (
                              <>
                                <svg className="mx-auto h-8 w-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                </svg>
                                <div className="text-gray-400">
                                  <span className="font-medium">Cliquez pour uploader</span>
                                  <p className="text-sm">MP4, WebM, OGG, MOV, AVI jusqu'à 50MB</p>
                                </div>
                              </>
                            )}
                          </button>
                        </div>
                        
                        {videoUploadError && (
                          <div className="bg-red-900/20 border border-red-400 rounded-lg p-3">
                            <p className="text-red-400 text-sm mb-2">{videoUploadError}</p>
                            <button
                              type="button"
                              onClick={() => videoInputRef.current?.click()}
                              className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700 transition-all duration-200"
                            >
                              Réessayer
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* URL d'accès */}
                  <div>
                    <label className="block text-sm font-medium text-white mb-2">
                      URL d'accès
                    </label>
                    <input
                      type="url"
                      value={formData.acces_url}
                      onChange={(e) => setFormData({ ...formData, acces_url: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-600 rounded-lg bg-transparent text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                      placeholder="https://exemple.com"
                    />
                  </div>

                  {/* URL source */}
                  <div>
                    <label className="block text-sm font-medium text-white mb-2">
                      URL source (GitHub, etc.)
                    </label>
                    <input
                      type="url"
                      value={formData.source_url}
                      onChange={(e) => setFormData({ ...formData, source_url: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-600 rounded-lg bg-transparent text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                      placeholder="https://github.com/user/repo"
                    />
                  </div>

                  {/* Message */}
                  {message && (
                    <div className={`p-3 rounded-lg text-sm ${
                      message.includes('succès') ? 'bg-green-900/20 border border-green-400 text-green-400' : 'bg-red-900/20 border border-red-400 text-red-400'
                    }`}>
                      {message}
                    </div>
                  )}

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

// Composant pour une carte de projet
function ProjetCard({ projet, index, totalProjects, onEdit, onDelete, onMoveUp, onMoveDown }) {
  const [isExpanded, setIsExpanded] = useState(false)

  return (
    <div className={`border border-gray-600 rounded-lg bg-gray-800/50 transition-all duration-300 ${
      isExpanded ? 'min-h-32' : 'h-32'
    } overflow-hidden`}>
      <div className="p-4">
        <div className="flex items-start gap-4">
          {/* Image à gauche */}
          {projet.image_url && (
            <div className="flex-shrink-0">
              <img 
                src={projet.image_url} 
                alt={projet.titre}
                className="w-24 h-24 object-cover rounded border border-gray-600"
              />
            </div>
          )}
          
          {/* Contenu à droite */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs bg-blue-600 text-white px-2 py-1 rounded-full font-bold">
                    #{projet.index || 'N/A'}
                  </span>
                  <h4 className="text-white font-medium line-clamp-1">{projet.titre}</h4>
                </div>
                
                {projet.category && (
                  <div className="mb-2">
                    <span className="text-xs bg-green-600 text-white px-2 py-1 rounded-full">
                      {projet.category}
                    </span>
                  </div>
                )}
                
                <div className={`transition-all duration-300 ${
                  isExpanded ? 'block' : 'line-clamp-2'
                }`}>
                  <p className="text-gray-300 text-sm mb-2">
                    {projet.description}
                  </p>
                  
                  {(projet.acces_url || projet.source_url) && (
                    <div className="flex flex-wrap gap-2 text-xs">
                      {projet.acces_url && (
                        <a 
                          href={projet.acces_url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-blue-400 hover:text-blue-300 underline"
                        >
                          Voir le projet
                        </a>
                      )}
                      {projet.source_url && (
                        <a 
                          href={projet.source_url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-green-400 hover:text-green-300 underline"
                        >
                          Code source
                        </a>
                      )}
                    </div>
                  )}
                </div>
              </div>
              
              {/* Boutons d'action */}
              <div className="flex items-center space-x-2 ml-4 flex-shrink-0">
                {/* Boutons de déplacement */}
                <div className="flex flex-col space-y-1">
                  <button
                    onClick={onMoveUp}
                    disabled={index === 0}
                    className={`p-1 text-gray-400 hover:text-gray-300 hover:bg-gray-900/20 rounded transition-all duration-200 ${
                      index === 0 ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                    title="Monter"
                  >
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                    </svg>
                  </button>
                  <button
                    onClick={onMoveDown}
                    disabled={index === totalProjects - 1}
                    className={`p-1 text-gray-400 hover:text-gray-300 hover:bg-gray-900/20 rounded transition-all duration-200 ${
                      index === totalProjects - 1 ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                    title="Descendre"
                  >
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                </div>
                
                <button
                  onClick={() => onEdit(projet)}
                  className="p-2 text-blue-400 hover:text-blue-300 hover:bg-blue-900/20 rounded transition-all duration-200"
                  title="Modifier"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </button>
                <button
                  onClick={() => onDelete(projet.id)}
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
      </div>
    </div>
  )
} 