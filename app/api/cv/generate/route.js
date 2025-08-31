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
            return `<p class="text-sm text-gray-800 leading-relaxed mb-3">${element.content}</p>`
          
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

  const renderPage = (sections, pageNumber, isLastPage = false) => {
    const pageBreakAfter = isLastPage ? 'auto' : 'always'
    
    return `
      <div class="page" style="
        width: 210mm;
        min-height: 297mm;
        padding: 20mm;
        box-sizing: border-box;
        page-break-after: ${pageBreakAfter};
        page-break-inside: avoid;
        position: relative;
        background: white;
        margin-bottom: 10mm;
      ">
        <!-- En-tête de page -->
        ${pageNumber > 1 ? `
          <div style="position: absolute; top: 4mm; right: 4mm; font-size: 10px; color: #666;">
            Page ${pageNumber}
          </div>
        ` : ''}
        
        <!-- Contenu de la page -->
        <div style="height: 100%;">
          <!-- En-tête avec informations personnelles (seulement sur la première page) -->
          ${pageNumber === 1 ? `
            <div style="text-align: center; margin-bottom: 8mm; padding-bottom: 4mm; border-bottom: 2px solid #ccc;">
              <h1 style="font-size: 24px; font-weight: bold; color: black; margin-bottom: 2mm; text-transform: uppercase; letter-spacing: 0.1em;">
                ${cvData.personalInfo.name || 'FABRICE FOLLY'}
              </h1>
              <div style="font-size: 12px; color: #666; line-height: 1.4;">
                <div>${cvData.personalInfo.email || 'teko.fabrice@gmail.com'}</div>
                <div>${cvData.personalInfo.phone || '+33 6 12 34 56 78'}</div>
                <div>${cvData.personalInfo.website || 'https://teko-fabrice.vercel.app/'}</div>
                ${cvData.personalInfo.github ? `<div>${cvData.personalInfo.github}</div>` : ''}
                ${cvData.personalInfo.linkedin ? `<div>${cvData.personalInfo.linkedin}</div>` : ''}
              </div>
            </div>
          ` : ''}

          <!-- Sections du CV -->
          <div style="margin-bottom: 6mm;">
            ${sections.map(section => `
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
        </div>

        <!-- Pied de page -->
        <div style="position: absolute; bottom: 4mm; left: 4mm; right: 4mm; text-align: center; font-size: 10px; color: #666; border-top: 1px solid #eee; padding-top: 2mm;">
          CV généré le ${new Date().toLocaleDateString('fr-FR')}
        </div>
      </div>
    `
  }

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
          }
        }
      </style>
    </head>
    <body>
      ${pages.map((pageSections, index) => 
        renderPage(pageSections, index + 1, index === pages.length - 1)
      ).join('')}
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
