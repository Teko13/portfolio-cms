'use client'

import { useState, useEffect } from 'react'
import { api } from '@/utils/api'
import CVPreview from './CVPreview'
import CVSidebar from './CVSidebar'

export default function CVEditor() {
  const [cvData, setCvData] = useState({
    personalInfo: {
      name: '',
      email: '',
      phone: '',
      website: '',
      github: '',
      linkedin: ''
    },
    sections: [
      {
        id: 'resume',
        title: 'RÉSUMÉ PROFESSIONNEL',
        type: 'text',
        content: '',
        order: 1,
        locked: false
      },
      {
        id: 'skills',
        title: 'COMPÉTENCES TECHNIQUES',
        type: 'skills',
        content: [],
        order: 2,
        locked: false
      },
      {
        id: 'projects',
        title: 'PROJETS RÉALISÉS',
        type: 'projects',
        content: [],
        order: 3,
        locked: false
      },
      {
        id: 'education',
        title: 'FORMATION',
        type: 'education',
        content: [],
        order: 4,
        locked: false
      },
      {
        id: 'hobbies',
        title: 'LOISIRS',
        type: 'text',
        content: '',
        order: 5,
        locked: false
      }
    ]
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')
  const [saveAsCV, setSaveAsCV] = useState(false)

  // Charger les données du portfolio au montage
  useEffect(() => {
    loadPortfolioData()
  }, [])

  const loadPortfolioData = async () => {
    setLoading(true)
    try {
      // Charger les informations personnelles
      const moiResponse = await api.get('/api/portfolio/moi')
      if (moiResponse.success && moiResponse.data) {
        const personalData = moiResponse.data
        setCvData(prev => ({
          ...prev,
          personalInfo: {
            name: `${personalData.prenom || ''} ${personalData.nom || ''}`.trim(),
            email: personalData.email || '',
            phone: personalData.telephone || '',
            website: personalData.ma_photo_url || '',
            github: '',
            linkedin: ''
          }
        }))
      }

      // Charger les compétences
      const competencesResponse = await api.get('/api/portfolio/competences')
      if (competencesResponse.success && competencesResponse.data) {
        setCvData(prev => ({
          ...prev,
          sections: prev.sections.map(section =>
            section.id === 'skills' ? {
              ...section,
              content: competencesResponse.data.map(comp => ({
                title: comp.titre,
                description: comp.description,
                level: comp.niveau
              }))
            } : section
          )
        }))
      }

      // Charger les projets
      const projetsResponse = await api.get('/api/portfolio/projets')
      if (projetsResponse.success && projetsResponse.data) {
        setCvData(prev => ({
          ...prev,
          sections: prev.sections.map(section =>
            section.id === 'projects' ? {
              ...section,
              content: projetsResponse.data.map(projet => ({
                title: projet.titre,
                description: projet.description,
                technologies: projet.category || '',
                url: projet.acces_url || ''
              }))
            } : section
          )
        }))
      }

      // Charger le parcours
      const parcoursResponse = await api.get('/api/portfolio/parcours')
      if (parcoursResponse.success && parcoursResponse.data) {
        setCvData(prev => ({
          ...prev,
          sections: prev.sections.map(section =>
            section.id === 'education' ? {
              ...section,
              content: parcoursResponse.data.map(parcours => ({
                title: parcours.titre,
                school: parcours.ecole,
                date: parcours.obtenu_en,
                pdfUrl: parcours.diplome_pdf_url
              }))
            } : section
          )
        }))
      }

      // Charger les loisirs
      const loisirsResponse = await api.get('/api/portfolio/loisirs')
      if (loisirsResponse.success && loisirsResponse.data) {
        setCvData(prev => ({
          ...prev,
          sections: prev.sections.map(section =>
            section.id === 'hobbies' ? {
              ...section,
              content: loisirsResponse.data.map(loisir => loisir.description).join(', ')
            } : section
          )
        }))
      }

      // Charger le réseau pour GitHub et LinkedIn
      const reseauResponse = await api.get('/api/portfolio/reseau')
      if (reseauResponse.success && reseauResponse.data) {
        const githubElement = reseauResponse.data.find(el => el.nom.toLowerCase().includes('github'))
        const linkedinElement = reseauResponse.data.find(el => el.nom.toLowerCase().includes('linkedin'))
        
        setCvData(prev => ({
          ...prev,
          personalInfo: {
            ...prev.personalInfo,
            github: githubElement?.url || '',
            linkedin: linkedinElement?.url || ''
          }
        }))
      }

    } catch (error) {
      console.error('Erreur lors du chargement des données:', error)
      setMessage('Erreur lors du chargement des données du portfolio')
    } finally {
      setLoading(false)
    }
  }

  const updateSection = (sectionId, updates) => {
    setCvData(prev => ({
      ...prev,
      sections: prev.sections.map(section =>
        section.id === sectionId ? { ...section, ...updates } : section
      )
    }))
  }

  const updatePersonalInfo = (updates) => {
    setCvData(prev => ({
      ...prev,
      personalInfo: { ...prev.personalInfo, ...updates }
    }))
  }

  const addSection = (newSection) => {
    const maxOrder = Math.max(...cvData.sections.map(s => s.order))
    const sectionWithOrder = {
      ...newSection,
      id: `section_${Date.now()}`,
      order: maxOrder + 1
    }
    
    setCvData(prev => ({
      ...prev,
      sections: [...prev.sections, sectionWithOrder]
    }))
  }

  const removeSection = (sectionId) => {
    setCvData(prev => ({
      ...prev,
      sections: prev.sections.filter(section => section.id !== sectionId)
    }))
  }

  const reorderSections = (newOrder) => {
    setCvData(prev => ({
      ...prev,
      sections: newOrder
    }))
  }

  const clearAllSections = () => {
    setCvData(prev => ({
      ...prev,
      sections: prev.sections.filter(section => section.locked)
    }))
  }

  const generatePDF = async () => {
    setSaving(true)
    setMessage('')

    try {
      const response = await api.post('/api/cv/generate', {
        cvData,
        saveAsCV
      })

      if (response.success) {
        if (response.downloadUrl) {
          // Télécharger le fichier
          const link = document.createElement('a')
          link.href = response.downloadUrl
          link.download = 'CV_Fabrice_Folly.pdf'
          document.body.appendChild(link)
          link.click()
          document.body.removeChild(link)
        }
        
        setMessage(saveAsCV ? 'CV généré et sauvegardé avec succès' : 'CV généré avec succès')
      } else {
        setMessage(response.error || 'Erreur lors de la génération du CV')
      }
    } catch (error) {
      console.error('Erreur lors de la génération du CV:', error)
      setMessage('Erreur lors de la génération du CV')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-400">Chargement des données du portfolio...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-screen bg-gray-900">
      {/* Rendu visuel du CV (gauche) */}
      <div className="flex-1 p-6 overflow-auto">
        <div className="max-w-4xl mx-auto">
          <CVPreview cvData={cvData} />
        </div>
      </div>

      {/* Barre latérale d'édition (droite) */}
      <div className="w-96 bg-gray-800 border-l border-gray-700 overflow-y-auto">
        <CVSidebar
          cvData={cvData}
          onUpdateSection={updateSection}
          onUpdatePersonalInfo={updatePersonalInfo}
          onAddSection={addSection}
          onRemoveSection={removeSection}
          onReorderSections={reorderSections}
          onClearAllSections={clearAllSections}
          onGeneratePDF={generatePDF}
          saveAsCV={saveAsCV}
          onSaveAsCVChange={setSaveAsCV}
          saving={saving}
          message={message}
        />
      </div>
    </div>
  )
}
