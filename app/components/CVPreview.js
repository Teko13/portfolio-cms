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
      switch (section.type) {
        case 'text':
          return (
            <div className="text-sm text-gray-800 leading-relaxed">
              {section.content || 'Contenu à ajouter...'}
            </div>
          )

        case 'skills':
          return (
            <div className="space-y-4">
              {section.content && section.content.length > 0 ? (
                section.content.map((skill, index) => (
                  <div key={index} className="mb-3">
                    <h4 className="font-semibold text-sm text-black mb-1">
                      {skill.title}
                    </h4>
                    <p className="text-xs text-gray-600 italic mb-1">
                      {skill.description}
                    </p>
                    <p className="text-xs text-gray-700">
                      Technologies: {skill.level || 'Niveau non spécifié'}
                    </p>
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-600">Aucune compétence ajoutée</p>
              )}
            </div>
          )

        case 'projects':
          return (
            <div className="space-y-4">
              {section.content && section.content.length > 0 ? (
                section.content.map((project, index) => (
                  <div key={index} className="mb-3">
                    <h4 className="font-semibold text-sm text-black mb-1">
                      {project.title}
                    </h4>
                    <p className="text-xs text-gray-800 mb-1">
                      {project.description}
                    </p>
                    <p className="text-xs text-gray-600 italic">
                      Technologies: {project.technologies}
                    </p>
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-600">Aucun projet ajouté</p>
              )}
            </div>
          )

        case 'education':
          return (
            <div className="space-y-4">
              {section.content && section.content.length > 0 ? (
                section.content.map((edu, index) => (
                  <div key={index} className="mb-3">
                    <h4 className="font-semibold text-sm text-black mb-1">
                      {edu.title}
                    </h4>
                    <p className="text-xs text-gray-800 mb-1">
                      {edu.school}
                    </p>
                    <p className="text-xs text-gray-600">
                      {formatDate(edu.date)}
                    </p>
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-600">Aucune formation ajoutée</p>
              )}
            </div>
          )

        default:
          return (
            <div className="text-sm text-gray-800">
              {section.content || 'Contenu à ajouter...'}
            </div>
          )
      }
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
