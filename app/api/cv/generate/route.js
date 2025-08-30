import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'
import puppeteer from 'puppeteer'

// Fonction pour extraire le nom du fichier depuis une URL Supabase
function extractFileNameFromUrl(url) {
  if (!url) return null
  const parts = url.split('/')
  return parts[parts.length - 1]
}

// Fonction pour supprimer un fichier du storage
async function deleteFileFromStorage(supabase, fileName) {
  if (!fileName) return
  
  try {
    const { error } = await supabase.storage
      .from('docs')
      .remove([fileName])
    
    if (error) {
      console.error('Erreur lors de la suppression du fichier:', error)
    } else {
      console.log(`Fichier supprimé avec succès: ${fileName}`)
    }
  } catch (error) {
    console.error('Erreur lors de la suppression du fichier:', error)
  }
}

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

    // Si saveAsCV est true, supprimer l'ancien CV s'il existe
    if (saveAsCV) {
      try {
        // Récupérer l'ancien CV URL
        const { data: userData, error: userError } = await supabase
          .from('moi')
          .select('cv_url')
          .eq('id', 1)
          .single()

        if (!userError && userData && userData.cv_url) {
          const oldFileName = extractFileNameFromUrl(userData.cv_url)
          if (oldFileName) {
            console.log(`Suppression de l'ancien CV: ${oldFileName}`)
            await deleteFileFromStorage(supabase, oldFileName)
          }
        }
      } catch (error) {
        console.error('Erreur lors de la récupération/suppression de l\'ancien CV:', error)
      }
    }

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
    } else {
      // Pour les CV temporaires, programmer la suppression après 3 minutes
      setTimeout(async () => {
        console.log(`Suppression automatique du CV temporaire: ${fileName}`)
        await deleteFileFromStorage(supabase, fileName)
      }, 3 * 60 * 1000) // 3 minutes en millisecondes
    }

    return NextResponse.json({
      success: true,
      downloadUrl: publicUrl,
      message: saveAsCV ? 'CV généré et sauvegardé avec succès' : 'CV généré avec succès (sera supprimé automatiquement dans 3 minutes)'
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
    
    // Gestion de l'ancien format (content est une chaîne)
    if (typeof section.content === 'string') {
      content = `<p class="text-sm text-gray-800 leading-relaxed">${section.content || 'Contenu à ajouter...'}</p>`
    }
    // Gestion du nouveau format (content est un tableau)
    else if (!section.content || !Array.isArray(section.content) || section.content.length === 0) {
      content = '<p class="text-sm text-gray-600">Aucun contenu ajouté</p>'
    } else {
      content = section.content.map(element => {
        switch (element.type) {
          case 'subtitle':
            return `<h4 class="font-semibold text-sm text-black mb-1">${element.content}</h4>`
          
          case 'text':
            return `<p class="text-sm text-gray-800 leading-relaxed mb-2">${element.content}</p>`
          
          case 'list':
            if (element.content && Array.isArray(element.content) && element.content.length > 0) {
              const listItems = element.content.map(item => `<li class="mb-1">${item}</li>`).join('')
              return `<ul class="list-disc list-inside text-sm text-gray-800 mb-2">${listItems}</ul>`
            } else {
              return '<ul class="list-disc list-inside text-sm text-gray-800 mb-2"><li class="text-gray-600">Aucun élément dans la liste</li></ul>'
            }
          
          default:
            return ''
        }
      }).join('')
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
