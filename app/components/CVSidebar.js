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

  const renderSectionEditor = (section) => {
    const isPersonalInfo = section.id === 'personalInfo'

    return (
      <div key={section.id} className="bg-gray-700 rounded-lg p-4 mb-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-white font-semibold text-sm">
            {section.title}
          </h3>
          {!section.locked && (
            <button
              onClick={() => onRemoveSection(section.id)}
              className="text-red-400 hover:text-red-300 text-xs"
            >
              Supprimer
            </button>
          )}
        </div>

        {/* Éditeur de titre */}
        <div className="mb-3">
          <label className="block text-gray-300 text-xs mb-1">Titre</label>
          <input
            type="text"
            value={section.title}
            onChange={(e) => onUpdateSection(section.id, { title: e.target.value.toUpperCase() })}
            className="w-full px-3 py-2 bg-gray-600 border border-gray-500 rounded text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={section.locked}
          />
        </div>

        {/* Éditeur de contenu selon le type */}
        {section.type === 'text' && (
          <div className="mb-3">
            <label className="block text-gray-300 text-xs mb-1">Contenu</label>
            <textarea
              value={section.content}
              onChange={(e) => onUpdateSection(section.id, { content: e.target.value })}
              rows={4}
              className="w-full px-3 py-2 bg-gray-600 border border-gray-500 rounded text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              placeholder="Entrez le contenu de cette section..."
            />
          </div>
        )}

        {section.type === 'skills' && (
          <div className="mb-3">
            <label className="block text-gray-300 text-xs mb-1">Compétences</label>
            <div className="text-gray-400 text-xs">
              {section.content && section.content.length > 0 ? (
                <div className="space-y-2">
                  {section.content.map((skill, index) => (
                    <div key={index} className="bg-gray-600 p-2 rounded">
                      <div className="font-medium">{skill.title}</div>
                      <div className="text-gray-300">{skill.description}</div>
                      <div className="text-gray-400">Niveau: {skill.level}</div>
                    </div>
                  ))}
                </div>
              ) : (
                <p>Aucune compétence disponible</p>
              )}
            </div>
          </div>
        )}

        {section.type === 'projects' && (
          <div className="mb-3">
            <label className="block text-gray-300 text-xs mb-1">Projets</label>
            <div className="text-gray-400 text-xs">
              {section.content && section.content.length > 0 ? (
                <div className="space-y-2">
                  {section.content.map((project, index) => (
                    <div key={index} className="bg-gray-600 p-2 rounded">
                      <div className="font-medium">{project.title}</div>
                      <div className="text-gray-300">{project.description}</div>
                      <div className="text-gray-400">Tech: {project.technologies}</div>
                    </div>
                  ))}
                </div>
              ) : (
                <p>Aucun projet disponible</p>
              )}
            </div>
          </div>
        )}

        {section.type === 'education' && (
          <div className="mb-3">
            <label className="block text-gray-300 text-xs mb-1">Formation</label>
            <div className="text-gray-400 text-xs">
              {section.content && section.content.length > 0 ? (
                <div className="space-y-2">
                  {section.content.map((edu, index) => (
                    <div key={index} className="bg-gray-600 p-2 rounded">
                      <div className="font-medium">{edu.title}</div>
                      <div className="text-gray-300">{edu.school}</div>
                      <div className="text-gray-400">{edu.date}</div>
                    </div>
                  ))}
                </div>
              ) : (
                <p>Aucune formation disponible</p>
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
        <h2 className="text-white text-lg font-semibold mb-2">Édition du CV</h2>
        <p className="text-gray-400 text-sm">
          Modifiez le contenu et l'ordre des sections
        </p>
      </div>

      {/* Informations personnelles */}
      <div className="p-4 border-b border-gray-700">
        <h3 className="text-white font-semibold mb-3">Informations personnelles</h3>
        <div className="space-y-3">
          <div>
            <label className="block text-gray-300 text-xs mb-1">Nom complet</label>
            <input
              type="text"
              value={cvData.personalInfo.name}
              onChange={(e) => onUpdatePersonalInfo({ name: e.target.value })}
              className="w-full px-3 py-2 bg-gray-600 border border-gray-500 rounded text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-gray-300 text-xs mb-1">Email</label>
            <input
              type="email"
              value={cvData.personalInfo.email}
              onChange={(e) => onUpdatePersonalInfo({ email: e.target.value })}
              className="w-full px-3 py-2 bg-gray-600 border border-gray-500 rounded text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-gray-300 text-xs mb-1">Téléphone</label>
            <input
              type="tel"
              value={cvData.personalInfo.phone}
              onChange={(e) => onUpdatePersonalInfo({ phone: e.target.value })}
              className="w-full px-3 py-2 bg-gray-600 border border-gray-500 rounded text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-gray-300 text-xs mb-1">Site web</label>
            <input
              type="url"
              value={cvData.personalInfo.website}
              onChange={(e) => onUpdatePersonalInfo({ website: e.target.value })}
              className="w-full px-3 py-2 bg-gray-600 border border-gray-500 rounded text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-gray-300 text-xs mb-1">GitHub</label>
            <input
              type="url"
              value={cvData.personalInfo.github}
              onChange={(e) => onUpdatePersonalInfo({ github: e.target.value })}
              className="w-full px-3 py-2 bg-gray-600 border border-gray-500 rounded text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-gray-300 text-xs mb-1">LinkedIn</label>
            <input
              type="url"
              value={cvData.personalInfo.linkedin}
              onChange={(e) => onUpdatePersonalInfo({ linkedin: e.target.value })}
              className="w-full px-3 py-2 bg-gray-600 border border-gray-500 rounded text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      {/* Sections du CV */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-white font-semibold">Sections du CV</h3>
          <button
            onClick={() => setShowAddSection(!showAddSection)}
            className="text-blue-400 hover:text-blue-300 text-sm"
          >
            + Ajouter
          </button>
        </div>

        {/* Formulaire d'ajout de section */}
        {showAddSection && (
          <div className="bg-gray-700 rounded-lg p-4 mb-4">
            <h4 className="text-white font-medium mb-3">Nouvelle section</h4>
            <div className="space-y-3">
              <div>
                <label className="block text-gray-300 text-xs mb-1">Titre</label>
                <input
                  type="text"
                  value={newSection.title}
                  onChange={(e) => setNewSection({ ...newSection, title: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-600 border border-gray-500 rounded text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Titre de la section"
                />
              </div>
              <div>
                <label className="block text-gray-300 text-xs mb-1">Type</label>
                <select
                  value={newSection.type}
                  onChange={(e) => setNewSection({ ...newSection, type: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-600 border border-gray-500 rounded text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="text">Texte simple</option>
                  <option value="skills">Compétences</option>
                  <option value="projects">Projets</option>
                  <option value="education">Formation</option>
                </select>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={handleAddSection}
                  className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
                >
                  Ajouter
                </button>
                <button
                  onClick={() => setShowAddSection(false)}
                  className="px-3 py-1 bg-gray-600 text-white rounded text-sm hover:bg-gray-700"
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
              <div key={section.id} className="relative">
                {renderSectionEditor(section)}
                
                {/* Boutons de réorganisation */}
                {!section.locked && (
                  <div className="absolute top-2 right-2 flex space-x-1">
                    <button
                      onClick={() => handleMoveSection(section.id, 'up')}
                      disabled={index === 0}
                      className="w-6 h-6 bg-gray-600 text-white rounded text-xs hover:bg-gray-500 disabled:opacity-50 disabled:cursor-not-allowed"
                      title="Déplacer vers le haut"
                    >
                      ↑
                    </button>
                    <button
                      onClick={() => handleMoveSection(section.id, 'down')}
                      disabled={index === cvData.sections.length - 1}
                      className="w-6 h-6 bg-gray-600 text-white rounded text-xs hover:bg-gray-500 disabled:opacity-50 disabled:cursor-not-allowed"
                      title="Déplacer vers le bas"
                    >
                      ↓
                    </button>
                  </div>
                )}
              </div>
            ))}
        </div>
      </div>

      {/* Actions globales */}
      <div className="p-4 border-t border-gray-700">
        <div className="space-y-4">
          {/* Bouton supprimer tout */}
          <button
            onClick={onClearAllSections}
            className="w-full px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors text-sm"
          >
            Supprimer tous les blocs
          </button>

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
            className="w-full px-4 py-3 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
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
