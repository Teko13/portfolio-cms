'use client'

import { useState } from 'react'

export default function CVPreview({ cvData }) {
  const [isPrintMode, setIsPrintMode] = useState(false)

  const formatDate = (dateString) => {
    if (!dateString) return ''
    const date = new Date(dateString)
    return date.toLocaleDateString('fr-FR', { 
      year: 'numeric', 
      month: '2-digit', 
      day: '2-digit' 
    })
  }

  const renderPersonalInfo = () => (
    <div className="text-center mb-6">
      <h1 className="text-3xl font-bold text-black mb-2 uppercase tracking-wide">
        {cvData.personalInfo.name || 'FABRICE FOLLY'}
      </h1>
      <div className="text-sm text-gray-700 space-y-1">
        <div>{cvData.personalInfo.email || 'teko.fabrice@gmail.com'}</div>
        <div>{cvData.personalInfo.phone || '+33 6 12 34 56 78'}</div>
        <div>{cvData.personalInfo.website || 'https://teko-fabrice.vercel.app/'}</div>
        <div>
          {cvData.personalInfo.github && (
            <span className="inline-block mr-4">
              {cvData.personalInfo.github}
            </span>
          )}
          {cvData.personalInfo.linkedin && (
            <span className="inline-block">
              {cvData.personalInfo.linkedin}
            </span>
          )}
        </div>
      </div>
    </div>
  )

  const renderSection = (section) => {
    const renderContent = () => {
      // Gestion de l'ancien format (content est une chaîne)
      if (typeof section.content === 'string') {
        return (
          <div className="text-sm text-gray-800 leading-relaxed">
            {section.content || 'Contenu à ajouter...'}
          </div>
        )
      }

      // Gestion du nouveau format (content est un tableau)
      if (!section.content || !Array.isArray(section.content) || section.content.length === 0) {
        return <p className="text-sm text-gray-600">Aucun contenu ajouté</p>
      }

      return (
        <div className="space-y-3">
          {section.content.map((element, index) => {
            switch (element.type) {
              case 'subtitle':
                return (
                  <h4 key={element.id || index} className="font-semibold text-sm text-black mb-1">
                    {element.content}
                  </h4>
                )
              
              case 'text':
                return (
                  <p key={element.id || index} className="text-sm text-gray-800 leading-relaxed mb-2">
                    {element.content}
                  </p>
                )
              
              case 'list':
                return (
                  <ul key={element.id || index} className="list-disc list-inside text-sm text-gray-800 mb-2">
                    {element.content && Array.isArray(element.content) && element.content.length > 0 ? (
                      element.content.map((item, itemIndex) => (
                        <li key={itemIndex} className="mb-1">
                          {item}
                        </li>
                      ))
                    ) : (
                      <li className="text-gray-600">Aucun élément dans la liste</li>
                    )}
                  </ul>
                )
              
              default:
                return null
            }
          })}
        </div>
      )
    }

    return (
      <div key={section.id} className="mb-6">
        <h2 className="text-lg font-bold text-black mb-2 uppercase tracking-wide border-b border-gray-300 pb-1">
          {section.title}
        </h2>
        {renderContent()}
      </div>
    )
  }

  return (
    <div className={`bg-white p-8 shadow-lg ${isPrintMode ? 'print-mode' : ''}`}>
      {/* Bouton d'impression */}
      {!isPrintMode && (
        <div className="mb-4 flex justify-end">
          <button
            onClick={() => setIsPrintMode(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
          >
            Aperçu Impression
          </button>
        </div>
      )}

      {/* Contenu du CV */}
      <div className="max-w-4xl mx-auto">
        {/* Informations personnelles */}
        {renderPersonalInfo()}

        {/* Sections du CV */}
        {cvData.sections
          .sort((a, b) => a.order - b.order)
          .map(section => renderSection(section))}
      </div>

      {/* Styles d'impression */}
      <style jsx>{`
        @media print {
          .print-mode {
            box-shadow: none !important;
            margin: 0 !important;
            padding: 20px !important;
          }
        }
      `}</style>
    </div>
  )
}
