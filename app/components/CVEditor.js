'use client'

import { useState, useEffect } from 'react'
import { api } from '@/utils/api'
import CVPreview from './CVPreview'
import CVSidebar from './CVSidebar'

export default function CVEditor() {
  const [cvData, setCvData] = useState({
    personalInfo: {
      name: '',
      title: '',
      age: '',
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
        type: 'section',
        content: [],
        order: 1,
        locked: false
      },
      {
        id: 'skills',
        title: 'COMPÉTENCES TECHNIQUES',
        type: 'section',
        content: [],
        order: 2,
        locked: false
      },
      {
        id: 'projects',
        title: 'PROJETS RÉALISÉS',
        type: 'section',
        content: [],
        order: 3,
        locked: false
      },
      {
        id: 'education',
        title: 'FORMATION',
        type: 'section',
        content: [],
        order: 4,
        locked: false
      },
      {
        id: 'hobbies',
        title: 'LOISIRS',
        type: 'section',
        content: [],
        order: 5,
        locked: false
      }
    ]
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')
  const [saveAsCV, setSaveAsCV] = useState(false)
  const [isDarkMode, setIsDarkMode] = useState(true)

  const handleThemeChange = (newTheme) => {
    setIsDarkMode(newTheme)
  }

  // Fonction pour calculer l'âge à partir de la date de naissance
  const calculateAge = (birthDate) => {
    if (!birthDate) return ''
    const today = new Date()
    const birth = new Date(birthDate)
    let age = today.getFullYear() - birth.getFullYear()
    const monthDiff = today.getMonth() - birth.getMonth()
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--
    }
    
    return age
  }

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
            title: personalData.titre || '',
            age: personalData.date_naissance ? `Âge: ${calculateAge(personalData.date_naissance)} ans` : '',
            email: `Email: ${personalData.email || 'teko.fabrice@gmail.com'}`,
            phone: `Téléphone: ${personalData.telephone || '+33 6 12 34 56 78'}`,
            website: `Portfolio: ${personalData.ma_photo_url || 'https://teko-fabrice.vercel.app/'}`,
            github: '',
            linkedin: ''
          },
          sections: prev.sections.map(section =>
            section.id === 'resume' ? {
              ...section,
              content: [
                {
                  id: 'resume_text',
                  type: 'text',
                  content: personalData.resume || 'Développeur passionné avec une expertise en technologies web modernes.'
                }
              ]
            } : section
          )
        }))
      }

      // Charger les compétences
      const competencesResponse = await api.get('/api/portfolio/competences')
      if (competencesResponse.success && competencesResponse.data) {
        const skillsContent = competencesResponse.data.flatMap((comp, index) => [
          {
            id: `skill_title_${index}`,
            type: 'subtitle',
            content: comp.titre
          },
          {
            id: `skill_desc_${index}`,
            type: 'text',
            content: comp.description
          }
        ])
        
        setCvData(prev => ({
          ...prev,
          sections: prev.sections.map(section =>
            section.id === 'skills' ? {
              ...section,
              content: skillsContent
            } : section
          )
        }))
      }

      // Charger les projets
      const projetsResponse = await api.get('/api/portfolio/projets')
      if (projetsResponse.success && projetsResponse.data) {
        const projectsContent = projetsResponse.data.flatMap((projet, index) => [
          {
            id: `project_title_${index}`,
            type: 'subtitle',
            content: projet.titre
          },
          {
            id: `project_desc_${index}`,
            type: 'text',
            content: projet.description
          }
        ])
        
        setCvData(prev => ({
          ...prev,
          sections: prev.sections.map(section =>
            section.id === 'projects' ? {
              ...section,
              content: projectsContent
            } : section
          )
        }))
      }

      // Charger le parcours
      const parcoursResponse = await api.get('/api/portfolio/parcours')
      if (parcoursResponse.success && parcoursResponse.data) {
        const educationContent = parcoursResponse.data.flatMap((parcours, index) => [
          {
            id: `edu_title_${index}`,
            type: 'subtitle',
            content: parcours.titre
          },
          {
            id: `edu_school_${index}`,
            type: 'text',
            content: `${parcours.ecole} - ${parcours.obtenu_en}`
          }
        ])
        
        setCvData(prev => ({
          ...prev,
          sections: prev.sections.map(section =>
            section.id === 'education' ? {
              ...section,
              content: educationContent
            } : section
          )
        }))
      }

      // Charger les loisirs
      const loisirsResponse = await api.get('/api/portfolio/loisirs')
      if (loisirsResponse.success && loisirsResponse.data) {
        const hobbiesContent = loisirsResponse.data.map((loisir, index) => ({
          id: `hobby_${index}`,
          type: 'text',
          content: loisir.description
        }))
        
        setCvData(prev => ({
          ...prev,
          sections: prev.sections.map(section =>
            section.id === 'hobbies' ? {
              ...section,
              content: hobbiesContent
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
            github: githubElement?.url ? `GitHub: ${githubElement.url}` : '',
            linkedin: linkedinElement?.url ? `LinkedIn: ${linkedinElement.url}` : ''
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
      personalInfo: {
        ...prev.personalInfo,
        ...updates
      }
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
        saveAsCV,
        isDarkMode
      })

      if (response.success) {
        if (response.pdfUrl) {
          // Télécharger le fichier
          const link = document.createElement('a')
          link.href = response.pdfUrl
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
    <div className="h-screen bg-gray-900">
      <CVPreview 
        cvData={cvData} 
        isDarkMode={isDarkMode}
        onThemeChange={handleThemeChange}
        sidebar={
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
        }
      />
    </div>
  )
}
