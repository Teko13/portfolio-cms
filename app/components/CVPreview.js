'use client'

import React from 'react'

const CVPreview = ({ cvData, sidebar, isDarkMode, onThemeChange }) => {
  const toggleTheme = () => {
    onThemeChange(!isDarkMode)
  }

  const renderContent = (section) => {
    if (typeof section.content === 'string') {
      return (
        <p className={`text-sm leading-relaxed mb-3 ${
          isDarkMode ? 'text-gray-200' : 'text-gray-800'
        }`}>
          {section.content || 'Contenu à ajouter...'}
        </p>
      )
    }
    
    if (!section.content || !Array.isArray(section.content) || section.content.length === 0) {
      return (
        <p className={`text-sm mb-3 ${
          isDarkMode ? 'text-gray-400' : 'text-gray-600'
        }`}>
          Aucun contenu ajouté
        </p>
      )
    }

    return section.content.map((element, index) => {
      switch (element.type) {
        case 'subtitle':
          return (
            <h4 key={element.id || index} className={`font-semibold text-sm mb-2 mt-4 first:mt-0 ${
              isDarkMode ? 'text-white' : 'text-black'
            }`}>
              {element.content}
            </h4>
          )
        
        case 'text':
          return (
            <p key={element.id || index} className={`text-sm leading-relaxed mb-3 ${
              isDarkMode ? 'text-gray-200' : 'text-gray-800'
            }`} dangerouslySetInnerHTML={{ __html: element.content.replace(/\n/g, '<br>') }}>
            </p>
          )
        
        case 'list':
          if (element.content && Array.isArray(element.content) && element.content.length > 0) {
            return (
              <ul key={element.id || index} className={`list-disc list-inside text-sm mb-3 ml-4 ${
                isDarkMode ? 'text-gray-200' : 'text-gray-800'
              }`}>
                {element.content.map((item, itemIndex) => (
                  <li key={itemIndex} className="mb-1">{item}</li>
                ))}
              </ul>
            )
          } else {
            return (
              <ul key={element.id || index} className={`list-disc list-inside text-sm mb-3 ml-4 ${
                isDarkMode ? 'text-gray-400' : 'text-gray-600'
              }`}>
                <li>Aucun élément dans la liste</li>
              </ul>
            )
          }
        
        default:
          return null
      }
    })
  }

  // Fonction pour formater une date
  const formatDate = (dateString) => {
    if (!dateString) return ''
    const date = new Date(dateString)
    return date.toLocaleDateString('fr-FR', { 
      year: 'numeric', 
      month: 'long' 
    })
  }

  return (
    <div className="flex h-screen bg-black">
      {/* Colonne gauche - Rendu CV (2/3 de la largeur) */}
      <div className="w-2/3 p-8 overflow-y-auto">
        <div className="mb-6">
          <div className="text-white text-lg font-semibold mb-3">
            Rendu cv {isDarkMode ? '🌙' : '☀️'}
          </div>
          
          {/* Switch de basculement thème */}
          <div className="flex items-center space-x-3">
            <span className={`text-sm ${isDarkMode ? 'text-white' : 'text-gray-400'}`}>Mode sombre</span>
            <button
              onClick={toggleTheme}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                isDarkMode 
                  ? 'bg-blue-600' 
                  : 'bg-gray-200'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition duration-200 ease-in-out ${
                  isDarkMode ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
            <span className={`text-sm ${!isDarkMode ? 'text-white' : 'text-gray-400'}`}>Mode clair</span>
          </div>
        </div>

        {/* CV en un seul bloc */}
        <div 
          className={`mx-auto relative transition-all duration-300 ${
            isDarkMode 
              ? 'bg-black shadow-xl border border-gray-700' 
              : 'bg-white shadow-lg border-2 border-gray-300'
          }`}
          style={{
            width: '210mm',
            minHeight: '297mm',
            padding: '20mm',
            boxSizing: 'border-box',
            borderRadius: '2px'
          }}
        >
          {/* En-tête avec informations personnelles */}
          <div className={`text-center mb-8 pb-4 border-b-2 ${
            isDarkMode ? 'border-gray-600' : 'border-gray-300'
          }`}>
            <h1 className={`text-3xl font-bold mb-2 uppercase tracking-wider ${
              isDarkMode ? 'text-white' : 'text-black'
            }`}>
              {cvData.personalInfo?.name || 'FABRICE FOLLY'}
            </h1>
            {cvData.personalInfo?.title && (
              <h2 className={`text-lg font-medium mb-3 ${
                isDarkMode ? 'text-gray-300' : 'text-gray-600'
              }`}>
                {cvData.personalInfo.title}
              </h2>
            )}
            <div className={`text-sm space-y-1 ${
              isDarkMode ? 'text-gray-300' : 'text-gray-600'
            }`}>
              {cvData.personalInfo?.age && <div>{cvData.personalInfo.age}</div>}
              {cvData.personalInfo?.email && <div>{cvData.personalInfo.email}</div>}
              {cvData.personalInfo?.phone && <div>{cvData.personalInfo.phone}</div>}
              {cvData.personalInfo?.website && <div>{cvData.personalInfo.website}</div>}
              {cvData.personalInfo?.github && <div>{cvData.personalInfo.github}</div>}
              {cvData.personalInfo?.linkedin && <div>{cvData.personalInfo.linkedin}</div>}
            </div>
          </div>

          {/* Sections du CV */}
          <div className="space-y-6">
            {cvData.sections.map((section, index) => (
              <div key={section.id} className="section">
                <h2 className={`text-lg font-bold mb-3 uppercase tracking-wide border-b pb-1 ${
                  isDarkMode 
                    ? 'text-white border-gray-600' 
                    : 'text-black border-gray-300'
                }`}>
                  {section.title}
                </h2>
                <div className="section-content">
                  {renderContent(section)}
                </div>
              </div>
            ))}
          </div>

          {/* Pied de page */}
          <div className={`absolute bottom-4 left-4 right-4 text-center text-xs border-t pt-2 ${
            isDarkMode 
              ? 'text-gray-400 border-gray-600' 
              : 'text-gray-500 border-gray-200'
          }`}>
            CV généré le {new Date().toLocaleDateString('fr-FR')}
          </div>
        </div>
      </div>

      {/* Colonne droite - CV Edition (1/3 de la largeur) */}
      <div className="w-1/3 border-l border-gray-700">
        {sidebar}
      </div>
    </div>
  )
}

export default CVPreview
