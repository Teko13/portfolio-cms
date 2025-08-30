import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'
import puppeteer from 'puppeteer'

// POST - Générer le CV en PDF
export async function POST(request) {
  try {
    const { cvData, saveAsCV } = await request.json()

    // Créer le HTML du CV
    const htmlContent = generateCVHTML(cvData)

    // Générer le PDF avec Puppeteer
    const pdfBuffer = await generatePDF(htmlContent)

    // Upload vers Supabase Storage
    const fileName = `cv_${Date.now()}.pdf`
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    )

    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('docs')
      .upload(fileName, pdfBuffer, {
        contentType: 'application/pdf',
        cacheControl: '3600'
      })

    if (uploadError) {
      console.error('Erreur lors de l\'upload du PDF:', uploadError)
      return NextResponse.json(
        { success: false, error: 'Erreur lors de l\'upload du PDF' },
        { status: 500 }
      )
    }

    // Obtenir l'URL publique
    const { data: { publicUrl } } = supabase.storage
      .from('docs')
      .getPublicUrl(fileName)

    // Si saveAsCV est true, mettre à jour la base de données
    if (saveAsCV) {
      const { error: updateError } = await supabase
        .from('moi')
        .update({ cv_url: publicUrl })
        .eq('id', 1) // Supposons que l'utilisateur a l'ID 1

      if (updateError) {
        console.error('Erreur lors de la mise à jour du CV:', updateError)
        return NextResponse.json(
          { success: false, error: 'Erreur lors de la sauvegarde du CV' },
          { status: 500 }
        )
      }
    }

    return NextResponse.json({
      success: true,
      downloadUrl: publicUrl,
      message: saveAsCV ? 'CV généré et sauvegardé avec succès' : 'CV généré avec succès'
    })

  } catch (error) {
    console.error('Erreur lors de la génération du CV:', error)
    return NextResponse.json(
      { success: false, error: 'Erreur lors de la génération du CV' },
      { status: 500 }
    )
  }
}

// Fonction pour générer le HTML du CV
function generateCVHTML(cvData) {
  const formatDate = (dateString) => {
    if (!dateString) return ''
    const date = new Date(dateString)
    return date.toLocaleDateString('fr-FR', { 
      year: 'numeric', 
      month: '2-digit', 
      day: '2-digit' 
    })
  }

  const renderSection = (section) => {
    let content = ''
    
    switch (section.type) {
      case 'text':
        content = `<p class="text-sm text-gray-800 leading-relaxed">${section.content || 'Contenu à ajouter...'}</p>`
        break
      
      case 'skills':
        if (section.content && section.content.length > 0) {
          content = section.content.map(skill => `
            <div class="mb-3">
              <h4 class="font-semibold text-sm text-black mb-1">${skill.title}</h4>
              <p class="text-xs text-gray-600 italic mb-1">${skill.description}</p>
              <p class="text-xs text-gray-700">Technologies: ${skill.level || 'Niveau non spécifié'}</p>
            </div>
          `).join('')
        } else {
          content = '<p class="text-sm text-gray-600">Aucune compétence ajoutée</p>'
        }
        break
      
      case 'projects':
        if (section.content && section.content.length > 0) {
          content = section.content.map(project => `
            <div class="mb-3">
              <h4 class="font-semibold text-sm text-black mb-1">${project.title}</h4>
              <p class="text-xs text-gray-800 mb-1">${project.description}</p>
              <p class="text-xs text-gray-600 italic">Technologies: ${project.technologies}</p>
            </div>
          `).join('')
        } else {
          content = '<p class="text-sm text-gray-600">Aucun projet ajouté</p>'
        }
        break
      
      case 'education':
        if (section.content && section.content.length > 0) {
          content = section.content.map(edu => `
            <div class="mb-3">
              <h4 class="font-semibold text-sm text-black mb-1">${edu.title}</h4>
              <p class="text-xs text-gray-800 mb-1">${edu.school}</p>
              <p class="text-xs text-gray-600">${formatDate(edu.date)}</p>
            </div>
          `).join('')
        } else {
          content = '<p class="text-sm text-gray-600">Aucune formation ajoutée</p>'
        }
        break
      
      default:
        content = `<p class="text-sm text-gray-800">${section.content || 'Contenu à ajouter...'}</p>`
    }

    return `
      <div class="mb-6">
        <h2 class="text-lg font-bold text-black mb-2 uppercase tracking-wide border-b border-gray-300 pb-1">
          ${section.title}
        </h2>
        ${content}
      </div>
    `
  }

  return `
    <!DOCTYPE html>
    <html lang="fr">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>CV - ${cvData.personalInfo.name}</title>
      <style>
        @page {
          size: A4;
          margin: 2cm;
        }
        body {
          font-family: Arial, sans-serif;
          line-height: 1.6;
          color: #333;
          margin: 0;
          padding: 0;
        }
        .header {
          text-align: center;
          margin-bottom: 2rem;
        }
        .name {
          font-size: 2rem;
          font-weight: bold;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          margin-bottom: 0.5rem;
        }
        .contact-info {
          font-size: 0.875rem;
          color: #666;
        }
        .contact-info div {
          margin-bottom: 0.25rem;
        }
        .section {
          margin-bottom: 1.5rem;
        }
        .section-title {
          font-size: 1.125rem;
          font-weight: bold;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          border-bottom: 1px solid #ccc;
          padding-bottom: 0.25rem;
          margin-bottom: 1rem;
        }
        .skill-item, .project-item, .education-item {
          margin-bottom: 0.75rem;
        }
        .item-title {
          font-weight: 600;
          font-size: 0.875rem;
          color: #000;
          margin-bottom: 0.25rem;
        }
        .item-description {
          font-size: 0.75rem;
          color: #666;
          font-style: italic;
          margin-bottom: 0.25rem;
        }
        .item-details {
          font-size: 0.75rem;
          color: #666;
        }
        .text-content {
          font-size: 0.875rem;
          color: #333;
          line-height: 1.5;
        }
      </style>
    </head>
    <body>
      <div class="header">
        <div class="name">${cvData.personalInfo.name || 'FABRICE FOLLY'}</div>
        <div class="contact-info">
          <div>${cvData.personalInfo.email || 'teko.fabrice@gmail.com'}</div>
          <div>${cvData.personalInfo.phone || '+33 6 12 34 56 78'}</div>
          <div>${cvData.personalInfo.website || 'https://teko-fabrice.vercel.app/'}</div>
          ${cvData.personalInfo.github ? `<div>${cvData.personalInfo.github}</div>` : ''}
          ${cvData.personalInfo.linkedin ? `<div>${cvData.personalInfo.linkedin}</div>` : ''}
        </div>
      </div>

      ${cvData.sections
        .sort((a, b) => a.order - b.order)
        .map(section => renderSection(section))
        .join('')}
    </body>
    </html>
  `
}

// Fonction pour générer le PDF avec Puppeteer
async function generatePDF(htmlContent) {
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  })

  try {
    const page = await browser.newPage()
    await page.setContent(htmlContent, { waitUntil: 'networkidle0' })
    
    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: {
        top: '2cm',
        right: '2cm',
        bottom: '2cm',
        left: '2cm'
      }
    })

    return pdfBuffer
  } finally {
    await browser.close()
  }
}
