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
    const { cvData, saveAsCV, isDarkMode } = await request.json()

    // Créer le HTML du CV
    const htmlContent = generateCVHTML(cvData, isDarkMode)

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
function generateCVHTML(cvData, isDarkMode) {
  const formatDate = (dateString) => {
    if (!dateString) return ''
    const date = new Date(dateString)
    return date.toLocaleDateString('fr-FR', { 
      year: 'numeric', 
      month: '2-digit', 
      day: '2-digit' 
    })
  }

  const renderContent = (section) => {
    let content = ''
    
    // Gestion de l'ancien format (content est une chaîne)
    if (typeof section.content === 'string') {
      content = `<p class="text-sm text-gray-800 leading-relaxed mb-3">${section.content || 'Contenu à ajouter...'}</p>`
    }
    // Gestion du nouveau format (content est un tableau)
    else if (!section.content || !Array.isArray(section.content) || section.content.length === 0) {
      content = '<p class="text-sm text-gray-600 mb-3">Aucun contenu ajouté</p>'
    } else {
      content = section.content.map(element => {
        switch (element.type) {
          case 'subtitle':
            return `<h4 class="font-semibold text-sm text-black mb-2 mt-4 first:mt-0">${element.content}</h4>`
          
          case 'text':
            return `<p class="text-sm text-gray-800 leading-relaxed mb-3">${element.content.replace(/\n/g, '<br>')}</p>`
          
          case 'list':
            if (element.content && Array.isArray(element.content) && element.content.length > 0) {
              const listItems = element.content.map(item => `<li class="mb-1">${item}</li>`).join('')
              return `<ul class="list-disc list-inside text-sm text-gray-800 mb-3 ml-4">${listItems}</ul>`
            } else {
              return '<ul class="list-disc list-inside text-sm text-gray-800 mb-3 ml-4"><li class="text-gray-600">Aucun élément dans la liste</li></ul>'
            }
          
          default:
            return ''
        }
      }).join('')
    }

    return content
  }

  // Fonction pour diviser le contenu en pages
  const splitContentIntoPages = () => {
    const sections = cvData.sections.sort((a, b) => a.order - b.order)
    const pages = []
    let currentPage = []
    
    // Approche simple : mettre plusieurs sections par page
    // On va essayer de mettre 2-3 sections par page selon leur taille
    sections.forEach((section, index) => {
      // Si c'est la première section ou si on a déjà 2 sections sur la page courante
      // et que la section actuelle semble "lourde" (compétences), commencer une nouvelle page
      const isHeavySection = section.title.toLowerCase().includes('compétences') || 
                            section.title.toLowerCase().includes('projets')
      
      if (index === 0) {
        // Première section : toujours sur la première page
        currentPage.push(section)
      } else if (currentPage.length >= 2 && isHeavySection) {
        // Section lourde après 2 sections : nouvelle page
        pages.push([...currentPage])
        currentPage = [section]
      } else if (currentPage.length >= 3) {
        // Après 3 sections : nouvelle page
        pages.push([...currentPage])
        currentPage = [section]
      } else {
        // Sinon : continuer sur la page courante
        currentPage.push(section)
      }
    })

    // Ajouter la dernière page
    if (currentPage.length > 0) {
      pages.push(currentPage)
    }

    return pages
  }

  const pages = splitContentIntoPages()

  // Générer le HTML avec des pages séparées explicitement
  const pagesHTML = pages.map((pageSections, pageIndex) => {
    const pageNumber = pageIndex + 1
    const isFirstPage = pageIndex === 0
    
    return `
      <div class="page" style="
        width: 210mm;
        height: 297mm;
        padding: 20mm;
        box-sizing: border-box;
        position: relative;
        background: white;
        margin: 0 auto 10mm auto;
        page-break-after: always;
        page-break-inside: avoid;
        overflow: hidden;
      ">
        <!-- Numéro de page -->
        <div style="position: absolute; top: 4mm; right: 4mm; font-size: 10px; color: #666;">
          Page ${pageNumber}
        </div>
        
        <!-- En-tête avec informations personnelles (seulement sur la première page) -->
        ${isFirstPage ? `
          <div style="text-align: center; margin-bottom: 8mm; padding-bottom: 4mm; border-bottom: 2px solid #ccc;">
            <h1 style="font-size: 24px; font-weight: bold; color: black; margin-bottom: 2mm; text-transform: uppercase; letter-spacing: 0.1em;">
              ${cvData.personalInfo?.name || 'FABRICE FOLLY'}
            </h1>
            ${cvData.personalInfo?.title ? `
              <h2 style="font-size: 16px; font-weight: normal; color: #666; margin-bottom: 2mm;">
                ${cvData.personalInfo.title}
              </h2>
            ` : ''}
            <div style="font-size: 12px; color: #666; line-height: 1.4;">
              ${cvData.personalInfo?.age ? `<div>${cvData.personalInfo.age}</div>` : ''}
              ${cvData.personalInfo?.email ? `<div>${cvData.personalInfo.email}</div>` : ''}
              ${cvData.personalInfo?.phone ? `<div>${cvData.personalInfo.phone}</div>` : ''}
              ${cvData.personalInfo?.website ? `<div>${cvData.personalInfo.website}</div>` : ''}
              ${cvData.personalInfo?.github ? `<div>${cvData.personalInfo.github}</div>` : ''}
              ${cvData.personalInfo?.linkedin ? `<div>${cvData.personalInfo.linkedin}</div>` : ''}
            </div>
          </div>
        ` : ''}

        <!-- Sections du CV pour cette page -->
        <div style="margin-bottom: 6mm;">
          ${pageSections.map(section => `
            <div class="section" style="margin-bottom: 6mm;">
              <h2 style="font-size: 16px; font-weight: bold; color: black; margin-bottom: 3mm; text-transform: uppercase; letter-spacing: 0.1em; border-bottom: 1px solid #ccc; padding-bottom: 1mm;">
                ${section.title}
              </h2>
              <div class="section-content">
                ${renderContent(section)}
              </div>
            </div>
          `).join('')}
        </div>

        <!-- Pied de page - Supprimé pour le PDF -->
        <!-- <div style="position: absolute; bottom: 4mm; left: 4mm; right: 4mm; text-align: center; font-size: 10px; color: #666; border-top: 1px solid #eee; padding-top: 2mm;">
          CV généré le ${new Date().toLocaleDateString('fr-FR')}
        </div> -->
      </div>
    `
  }).join('')

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
          margin: 0;
        }
        body {
          font-family: 'Times New Roman', serif;
          line-height: 1.6;
          color: #333;
          margin: 0;
          padding: 0;
          background: #f5f5f5;
        }
        .page {
          background: white;
          box-shadow: 0 2px 10px rgba(0,0,0,0.1);
          border: 1px solid #e5e7eb;
        }
        .section {
          page-break-inside: avoid;
        }
        h1, h2, h3, h4 {
          font-family: 'Times New Roman', serif;
        }
        ul {
          margin: 0;
          padding-left: 20px;
        }
        li {
          margin-bottom: 2px;
        }
        @media print {
          body {
            background: white;
          }
          .page {
            box-shadow: none;
            margin: 0;
            border: none;
            page-break-after: always;
          }
          .page:last-child {
            page-break-after: auto;
          }
        }
      </style>
    </head>
    <body>
      ${pagesHTML}
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
