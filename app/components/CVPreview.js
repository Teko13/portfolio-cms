'use client'

import React from 'react'

const CVPreview = ({ cvData, sidebar }) => {
  const renderContent = (section) => {
    if (typeof section.content === 'string') {
      return <p className="text-sm text-gray-800 leading-relaxed mb-3">{section.content || 'Contenu à ajouter...'}</p>
    }
    
    if (!section.content || !Array.isArray(section.content) || section.content.length === 0) {
      return <p className="text-sm text-gray-600 mb-3">Aucun contenu ajouté</p>
    }

    return section.content.map((element, index) => {
      switch (element.type) {
        case 'subtitle':
          return (
            <h4 key={element.id || index} className="font-semibold text-sm text-black mb-2 mt-4 first:mt-0">
              {element.content}
            </h4>
          )
        
        case 'text':
          return (
            <p key={element.id || index} className="text-sm text-gray-800 leading-relaxed mb-3">
              {element.content}
            </p>
          )
        
        case 'list':
          if (element.content && Array.isArray(element.content) && element.content.length > 0) {
            return (
              <ul key={element.id || index} className="list-disc list-inside text-sm text-gray-800 mb-3 ml-4">
                {element.content.map((item, itemIndex) => (
                  <li key={itemIndex} className="mb-1">{item}</li>
                ))}
              </ul>
            )
          } else {
            return (
              <ul key={element.id || index} className="list-disc list-inside text-sm text-gray-800 mb-3 ml-4">
                <li className="text-gray-600">Aucun élément dans la liste</li>
              </ul>
            )
          }
        
        default:
          return null
      }
    })
  }

  const renderPage = (sections, pageNumber, isLastPage = false) => (
    <div 
      key={pageNumber}
      className="bg-white shadow-xl mx-auto mb-8 relative"
      style={{
        width: '210mm',
        minHeight: '297mm',
        padding: '20mm',
        boxSizing: 'border-box',
        borderRadius: '2px',
        border: '1px solid #e5e7eb'
      }}
    >
      {/* Numéro de page en haut à droite */}
      <div className="absolute top-4 right-4 text-xs text-gray-500 font-medium">
        Page {pageNumber}
      </div>
      
      {/* Contenu de la page */}
      <div className="h-full">
        {/* En-tête avec informations personnelles (seulement sur la première page) */}
        {pageNumber === 1 && (
          <div className="text-center mb-8 pb-4 border-b-2 border-gray-300">
            <h1 className="text-3xl font-bold text-black mb-2 uppercase tracking-wider">
              {cvData.personalInfo.name || 'FABRICE FOLLY'}
            </h1>
            <div className="text-sm text-gray-600 space-y-1">
              <div>{cvData.personalInfo.email || 'teko.fabrice@gmail.com'}</div>
              <div>{cvData.personalInfo.phone || '+33 6 12 34 56 78'}</div>
              <div>{cvData.personalInfo.website || 'https://teko-fabrice.vercel.app/'}</div>
              {cvData.personalInfo.github && <div>{cvData.personalInfo.github}</div>}
              {cvData.personalInfo.linkedin && <div>{cvData.personalInfo.linkedin}</div>}
            </div>
          </div>
        )}

        {/* Sections du CV */}
        <div className="space-y-6">
          {sections.map((section, index) => (
            <div key={section.id} className="section">
              <h2 className="text-lg font-bold text-black mb-3 uppercase tracking-wide border-b border-gray-300 pb-1">
                {section.title}
              </h2>
              <div className="section-content">
                {renderContent(section)}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Pied de page */}
      <div className="absolute bottom-4 left-4 right-4 text-center text-xs text-gray-500 border-t border-gray-200 pt-2">
        CV généré le {new Date().toLocaleDateString('fr-FR')}
      </div>
    </div>
  )

  // Fonction pour diviser le contenu en pages
  const splitContentIntoPages = () => {
    const sections = cvData.sections.sort((a, b) => a.order - b.order)
    const pages = []
    let currentPage = []
    let currentHeight = 0
    const maxPageHeight = 257 // 297mm - 40mm (marges) = 257mm

    sections.forEach(section => {
      // Estimation de la hauteur de la section (approximative)
      const sectionHeight = estimateSectionHeight(section)
      
      if (currentHeight + sectionHeight > maxPageHeight && currentPage.length > 0) {
        // Créer une nouvelle page
        pages.push([...currentPage])
        currentPage = [section]
        currentHeight = sectionHeight
      } else {
        // Ajouter à la page courante
        currentPage.push(section)
        currentHeight += sectionHeight
      }
    })

    // Ajouter la dernière page
    if (currentPage.length > 0) {
      pages.push(currentPage)
    }

    return pages
  }

  // Fonction pour estimer la hauteur d'une section
  const estimateSectionHeight = (section) => {
    let height = 40 // Hauteur du titre de section
    
    if (typeof section.content === 'string') {
      height += Math.ceil(section.content.length / 80) * 20 // Estimation basée sur la longueur du texte
    } else if (Array.isArray(section.content)) {
      section.content.forEach(element => {
        switch (element.type) {
          case 'subtitle':
            height += 25
            break
          case 'text':
            height += Math.ceil(element.content.length / 80) * 20
            break
          case 'list':
            if (Array.isArray(element.content)) {
              height += element.content.length * 20
            } else {
              height += 20
            }
            break
        }
      })
    }
    
    return height
  }

  const pages = splitContentIntoPages()

  return (
    <div className="flex h-screen bg-gray-900">
      {/* Colonne gauche - Rendu CV (2/3 de la largeur) */}
      <div className="w-2/3 p-8 overflow-y-auto">
        <div className="text-white text-lg font-semibold mb-6">Rendu cv</div>
        <div className="flex justify-center">
          <div className="space-y-0">
            {pages.map((pageSections, index) => 
              renderPage(pageSections, index + 1, index === pages.length - 1)
            )}
          </div>
        </div>
      </div>

      {/* Colonne droite - CV Edition (1/3 de la largeur) */}
      <div className="w-1/3 bg-gray-800 border-l border-gray-700">
        <div className="text-white text-lg font-semibold p-6 border-b border-gray-700">
          CV edition
        </div>
        <div className="h-full overflow-y-auto">
          {sidebar || (
            <div className="p-6 text-gray-400 text-sm">
              Interface d'édition à intégrer
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default CVPreview
