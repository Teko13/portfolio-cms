'use client'

import { useState } from 'react'

export default function CVSidebar({
  cvData,
  onUpdateSection,
  onUpdatePersonalInfo,
  onAddSection,
  onRemoveSection,
  onReorderSections,
  onClearAllSections,
  onGeneratePDF,
  saveAsCV,
  onSaveAsCVChange,
  saving,
  message
}) {
  const [showAddSection, setShowAddSection] = useState(false)
  const [newSection, setNewSection] = useState({
    title: '',
    type: 'text'
  })
  // État pour gérer les sections pliées/dépliées
  const [expandedSections, setExpandedSections] = useState({})
  const [showAddElement, setShowAddElement] = useState({})

  const handleMoveSection = (sectionId, direction) => {
    const sections = [...cvData.sections]
    const currentIndex = sections.findIndex(s => s.id === sectionId)
    
    if (direction === 'up' && currentIndex > 0) {
      // Échanger avec l'élément précédent
      const temp = sections[currentIndex]
      sections[currentIndex] = sections[currentIndex - 1]
      sections[currentIndex - 1] = temp
    } else if (direction === 'down' && currentIndex < sections.length - 1) {
      // Échanger avec l'élément suivant
      const temp = sections[currentIndex]
      sections[currentIndex] = sections[currentIndex + 1]
      sections[currentIndex + 1] = temp
    }

    // Mettre à jour l'ordre
    const updatedSections = sections.map((section, index) => ({
      ...section,
      order: index + 1
    }))

    onReorderSections(updatedSections)
  }

  const handleAddSection = () => {
    if (newSection.title.trim()) {
      onAddSection({
        title: newSection.title.toUpperCase(),
        type: newSection.type,
        content: newSection.type === 'text' ? '' : []
      })
      setNewSection({ title: '', type: 'text' })
      setShowAddSection(false)
    }
  }

  const toggleSection = (sectionId) => {
    setExpandedSections(prev => ({
      ...prev,
      [sectionId]: !prev[sectionId]
    }))
  }

  const toggleAddElement = (sectionId) => {
    setShowAddElement(prev => ({
      ...prev,
      [sectionId]: !prev[sectionId]
    }))
  }

  const addElementToSection = (sectionId, elementType) => {
    const newElement = {
      id: `element_${Date.now()}`,
      type: elementType,
      content: elementType === 'list' ? [] : ''
    }

    const section = cvData.sections.find(s => s.id === sectionId)
    let currentContent = section?.content || []
    
    // Si le contenu est une chaîne (ancien format), on le convertit en tableau
    if (typeof currentContent === 'string') {
      currentContent = []
    }
    
    // S'assurer que currentContent est un tableau
    if (!Array.isArray(currentContent)) {
      currentContent = []
    }

    onUpdateSection(sectionId, {
      content: [...currentContent, newElement]
    })

    setShowAddElement(prev => ({
      ...prev,
      [sectionId]: false
    }))
  }

  const removeElementFromSection = (sectionId, elementId) => {
    const section = cvData.sections.find(s => s.id === sectionId)
    if (section && Array.isArray(section.content)) {
      const updatedContent = section.content.filter(element => element.id !== elementId)
      onUpdateSection(sectionId, { content: updatedContent })
    }
  }

  const updateElementContent = (sectionId, elementId, content) => {
    const section = cvData.sections.find(s => s.id === sectionId)
    if (section && Array.isArray(section.content)) {
      const updatedContent = section.content.map(element => 
        element.id === elementId ? { ...element, content } : element
      )
      onUpdateSection(sectionId, { content: updatedContent })
    }
  }

  const renderSectionEditor = (section, index) => {
    const isExpanded = expandedSections[section.id] || false
    const isPersonalInfo = section.id === 'personalInfo'

    return (
      <div key={section.id} className="bg-gray-800 rounded-lg border border-gray-700 mb-4">
        {/* En-tête du bloc */}
        <div className="flex items-center justify-between p-4 border-b border-gray-700">
          <div 
            className="flex items-center cursor-pointer flex-1"
            onClick={() => toggleSection(section.id)}
          >
            <div className="w-8 h-8 bg-gray-600 rounded-lg flex items-center justify-center mr-3">
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className="text-white font-semibold text-sm truncate max-w-[100px]">
              {section.title}
            </h3>
            <svg
              className={`w-4 h-4 text-gray-400 transition-transform duration-200 ml-2 ${
                isExpanded ? 'rotate-180' : ''
              }`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
          
          {/* Boutons d'action */}
          {!section.locked && (
            <div className="flex items-center space-x-2">
              {/* Boutons de déplacement */}
              <div className="flex flex-col space-y-1">
                <button
                  onClick={() => handleMoveSection(section.id, 'up')}
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
                  onClick={() => handleMoveSection(section.id, 'down')}
                  disabled={index === cvData.sections.length - 1}
                  className={`p-1 text-gray-400 hover:text-gray-300 hover:bg-gray-900/20 rounded transition-all duration-200 ${
                    index === cvData.sections.length - 1 ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                  title="Descendre"
                >
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
              </div>
              
              {/* Bouton de suppression */}
              <button
                onClick={() => onRemoveSection(section.id)}
                className="p-1 text-red-400 hover:text-red-300 hover:bg-red-900/20 rounded transition-all duration-200"
                title="Supprimer la section"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          )}
        </div>

        {isExpanded && (
          <div className="p-4">
            {/* Éditeur de titre */}
            <div className="mb-4">
              <label className="block text-gray-300 text-xs mb-2">Titre de la section</label>
              <input
                type="text"
                value={section.title}
                onChange={(e) => onUpdateSection(section.id, { title: e.target.value.toUpperCase() })}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={section.locked}
              />
            </div>

            {/* Contenu de la section */}
            <div className="space-y-3">
              {Array.isArray(section.content) && section.content.length > 0 ? (
                section.content.map((element, index) => (
                  <div key={element.id} className="bg-gray-700 rounded-lg p-3 border border-gray-600">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs text-gray-400 uppercase tracking-wide">
                        {element.type === 'subtitle' ? 'Sous-titre' : 
                         element.type === 'text' ? 'Texte' : 'Liste'}
                      </span>
                      <button
                        onClick={() => removeElementFromSection(section.id, element.id)}
                        className="text-red-400 hover:text-red-300 text-xs"
                      >
                        Supprimer
                      </button>
                    </div>
                    
                    {element.type === 'subtitle' && (
                      <input
                        type="text"
                        value={element.content}
                        onChange={(e) => updateElementContent(section.id, element.id, e.target.value)}
                        className="w-full px-3 py-2 bg-gray-600 border border-gray-500 rounded text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Entrez le sous-titre..."
                      />
                    )}
                    
                    {element.type === 'text' && (
                      <textarea
                        value={element.content}
                        onChange={(e) => updateElementContent(section.id, element.id, e.target.value)}
                        rows={3}
                        className="w-full px-3 py-2 bg-gray-600 border border-gray-500 rounded text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                        placeholder="Entrez le texte..."
                      />
                    )}
                    
                    {element.type === 'list' && (
                      <div className="space-y-2">
                        {element.content && element.content.length > 0 ? (
                          element.content.map((item, itemIndex) => (
                            <div key={itemIndex} className="flex items-center space-x-2">
                              <input
                                type="text"
                                value={item}
                                onChange={(e) => {
                                  const newList = [...element.content]
                                  newList[itemIndex] = e.target.value
                                  updateElementContent(section.id, element.id, newList)
                                }}
                                className="flex-1 px-3 py-2 bg-gray-600 border border-gray-500 rounded text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder={`Élément ${itemIndex + 1}`}
                              />
                              <button
                                onClick={() => {
                                  const newList = element.content.filter((_, i) => i !== itemIndex)
                                  updateElementContent(section.id, element.id, newList)
                                }}
                                className="text-red-400 hover:text-red-300 text-xs"
                              >
                                ×
                              </button>
                            </div>
                          ))
                        ) : (
                          <p className="text-gray-400 text-xs">Aucun élément dans la liste</p>
                        )}
                        <button
                          onClick={() => {
                            const newList = [...(element.content || []), '']
                            updateElementContent(section.id, element.id, newList)
                          }}
                          className="text-blue-400 hover:text-blue-300 text-xs"
                        >
                          + Ajouter un élément
                        </button>
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <p className="text-gray-400 text-xs text-center py-4">
                  Aucun élément dans cette section
                </p>
              )}
            </div>

            {/* Bouton d'ajout d'élément */}
            <div className="mt-4 pt-4 border-t border-gray-700">
              <button
                onClick={() => toggleAddElement(section.id)}
                className="w-full px-3 py-2 bg-white text-black rounded text-sm hover:bg-gray-100 transition-colors flex items-center justify-center"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Ajouter un élément
              </button>
              
              {showAddElement[section.id] && (
                <div className="mt-3 space-y-2">
                  <button
                    onClick={() => addElementToSection(section.id, 'subtitle')}
                    className="w-full px-3 py-2 bg-white text-black rounded text-sm hover:bg-gray-100 transition-colors"
                  >
                    + Sous-titre
                  </button>
                  <button
                    onClick={() => addElementToSection(section.id, 'text')}
                    className="w-full px-3 py-2 bg-white text-black rounded text-sm hover:bg-gray-100 transition-colors"
                  >
                    + Texte
                  </button>
                  <button
                    onClick={() => addElementToSection(section.id, 'list')}
                    className="w-full px-3 py-2 bg-white text-black rounded text-sm hover:bg-gray-100 transition-colors"
                  >
                    + Liste
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col">
      {/* En-tête */}
      <div className="p-4 border-b border-gray-700">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-white text-lg font-semibold">Édition du CV</h2>
          <button
            onClick={onClearAllSections}
            className="w-8 h-8 bg-red-600 text-white rounded hover:bg-red-700 transition-colors flex items-center justify-center"
            title="Supprimer tous les blocs"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
        <p className="text-gray-400 text-sm">
          Modifiez le contenu et l'ordre des sections
        </p>
      </div>

      {/* Informations personnelles */}
      <div className="bg-gray-800 rounded-lg border border-gray-700 mb-4">
        <div className="flex items-center justify-between p-4 border-b border-gray-700">
          <div 
            className="flex items-center cursor-pointer flex-1"
            onClick={() => toggleSection('personalInfo')}
          >
            <div className="w-8 h-8 bg-gray-600 rounded-lg flex items-center justify-center mr-3">
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <h3 className="text-white font-semibold text-sm">Informations personnelles</h3>
            <svg
              className={`w-4 h-4 text-gray-400 transition-transform duration-200 ml-2 ${
                expandedSections.personalInfo ? 'rotate-180' : ''
              }`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>
        
        {expandedSections.personalInfo && (
          <div className="p-4 space-y-3">
            <div>
              <label className="block text-gray-300 text-xs mb-1">Nom complet</label>
              <input
                type="text"
                value={cvData.personalInfo.name}
                onChange={(e) => onUpdatePersonalInfo({ name: e.target.value })}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-gray-300 text-xs mb-1">Email</label>
              <input
                type="email"
                value={cvData.personalInfo.email}
                onChange={(e) => onUpdatePersonalInfo({ email: e.target.value })}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-gray-300 text-xs mb-1">Téléphone</label>
              <input
                type="tel"
                value={cvData.personalInfo.phone}
                onChange={(e) => onUpdatePersonalInfo({ phone: e.target.value })}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-gray-300 text-xs mb-1">Site web</label>
              <input
                type="url"
                value={cvData.personalInfo.website}
                onChange={(e) => onUpdatePersonalInfo({ website: e.target.value })}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-gray-300 text-xs mb-1">GitHub</label>
              <input
                type="url"
                value={cvData.personalInfo.github}
                onChange={(e) => onUpdatePersonalInfo({ github: e.target.value })}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-gray-300 text-xs mb-1">LinkedIn</label>
              <input
                type="url"
                value={cvData.personalInfo.linkedin}
                onChange={(e) => onUpdatePersonalInfo({ linkedin: e.target.value })}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        )}
      </div>

      {/* Sections du CV */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-white font-semibold text-lg">Sections du CV</h3>
          <button
            onClick={() => setShowAddSection(!showAddSection)}
            className="px-3 py-1 bg-white text-black rounded text-sm hover:bg-gray-100 transition-colors"
          >
            + Ajouter
          </button>
        </div>

        {/* Formulaire d'ajout de section */}
        {showAddSection && (
          <div className="bg-gray-800 rounded-lg border border-gray-700 p-4 mb-4">
            <h4 className="text-white font-medium mb-3">Nouvelle section</h4>
            <div className="space-y-3">
              <div>
                <label className="block text-gray-300 text-xs mb-1">Titre</label>
                <input
                  type="text"
                  value={newSection.title}
                  onChange={(e) => setNewSection({ ...newSection, title: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Titre de la section"
                />
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={handleAddSection}
                  className="px-3 py-1 bg-white text-black rounded text-sm hover:bg-gray-100 transition-colors"
                >
                  Ajouter
                </button>
                <button
                  onClick={() => setShowAddSection(false)}
                  className="px-3 py-1 bg-white text-black rounded text-sm hover:bg-gray-100 transition-colors"
                >
                  Annuler
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Liste des sections avec boutons de réorganisation */}
        <div className="space-y-4">
          {cvData.sections
            .sort((a, b) => a.order - b.order)
            .map((section, index) => (
              <div key={section.id}>
                {renderSectionEditor(section, index)}
              </div>
            ))}
        </div>
      </div>

      {/* Actions globales */}
      <div className="p-4 border-t border-gray-700">
        <div className="space-y-4">
          {/* Case à cocher pour sauvegarder */}
          <div className="flex items-center">
            <input
              type="checkbox"
              id="saveAsCV"
              checked={saveAsCV}
              onChange={(e) => onSaveAsCVChange(e.target.checked)}
              className="w-4 h-4 text-blue-600 bg-gray-600 border-gray-500 rounded focus:ring-blue-500"
            />
            <label htmlFor="saveAsCV" className="ml-2 text-sm text-gray-300">
              Enregistrer comme mon CV
            </label>
          </div>

          {/* Bouton de génération */}
          <button
            onClick={onGeneratePDF}
            disabled={saving}
            className="w-full px-4 py-3 bg-white text-black rounded hover:bg-gray-100 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? 'Génération...' : (saveAsCV ? 'Créer ou modifier mon CV' : 'Télécharger le CV')}
          </button>

          {/* Message de statut */}
          {message && (
            <div className="text-sm text-center p-2 rounded bg-gray-700 text-gray-300">
              {message}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
