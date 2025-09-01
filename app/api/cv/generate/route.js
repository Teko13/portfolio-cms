import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Import conditionnel selon l'environnement
let puppeteer, chromium

if (process.env.NODE_ENV === 'production') {
  // En production (Vercel) : utiliser Puppeteer-core + Chromium
  puppeteer = require('puppeteer-core')
  chromium = require('@sparticuz/chromium')
} else {
  // En développement (local) : utiliser Puppeteer normal
  puppeteer = require('puppeteer')
}

// Fonction pour extraire le nom du fichier depuis une URL
const extractFileNameFromUrl = (url) => {
  if (!url) return null
  const urlParts = url.split('/')
  return urlParts[urlParts.length - 1]
}

// Fonction pour supprimer un fichier du storage
const deleteFileFromStorage = async (fileName) => {
  if (!fileName) return false
  
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    )
    
    const { error } = await supabase.storage
      .from('docs')
      .remove([fileName])
    
    if (error) {
      console.error('Erreur lors de la suppression:', error)
      return false
    }
    
    return true
  } catch (error) {
    console.error('Erreur lors de la suppression:', error)
    return false
  }
}

// POST - Générer le CV en PDF
export async function POST(request) {
  try {
    const { cvData, isDarkMode, saveAsCV } = await request.json()
    
    if (!cvData) {
      return NextResponse.json({ error: 'Données CV manquantes' }, { status: 400 })
    }

    // Générer le HTML du CV
    const htmlContent = generateCVHTML(cvData, isDarkMode)
    
    let browser

    if (process.env.NODE_ENV === 'production') {
      // Configuration de Chromium pour Vercel
      const executablePath = await chromium.executablePath()
      
      // Lancer le navigateur avec Puppeteer-core
      browser = await puppeteer.launch({
        args: chromium.args,
        defaultViewport: chromium.defaultViewport,
        executablePath: executablePath,
        headless: chromium.headless,
        ignoreHTTPSErrors: true,
      })
    } else {
      // En local : utiliser Puppeteer normal
      browser = await puppeteer.launch({
        headless: 'new',
        args: ['--no-sandbox', '--disable-setuid-sandbox']
      })
    }

    try {
      const page = await browser.newPage()
      
      // Définir le contenu HTML
      await page.setContent(htmlContent, { waitUntil: 'networkidle0' })
      
      // Générer le PDF
      const pdfBuffer = await page.pdf({
        format: 'A4',
        printBackground: true,
        margin: {
          top: '20mm',
          right: '20mm',
          bottom: '20mm',
          left: '20mm'
        }
      })

      // Fermer le navigateur
      await browser.close()

      // Générer un nom de fichier unique
      const timestamp = Date.now()
      const fileName = `cv_${timestamp}.pdf`
      
      // Créer le client Supabase
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL,
        process.env.SUPABASE_SERVICE_ROLE_KEY
      )
      
      // Upload du PDF vers Supabase Storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('docs')
        .upload(fileName, pdfBuffer, {
          contentType: 'application/pdf',
          cacheControl: '3600'
        })

      if (uploadError) {
        console.error('Erreur lors de l\'upload:', uploadError)
        return NextResponse.json({ error: 'Erreur lors de l\'upload du PDF' }, { status: 500 })
      }

      // Obtenir l'URL publique
      const { data: { publicUrl } } = supabase.storage
        .from('docs')
        .getPublicUrl(fileName)

      // Si on doit sauvegarder dans le profil, mettre à jour la base de données
      if (saveAsCV) {
        // Vérifier s'il y a déjà un CV sauvegardé
        const { data: existingProfile } = await supabase
          .from('moi')
          .select('cv_url')
          .single()

        if (existingProfile?.cv_url) {
          // Supprimer l'ancien CV du storage
          const oldFileName = extractFileNameFromUrl(existingProfile.cv_url)
          if (oldFileName) {
            console.log(`Suppression de l'ancien CV: ${oldFileName}`)
            await deleteFileFromStorage(oldFileName)
          }
        }

        // Mettre à jour le profil avec le nouveau CV
        const { error: updateError } = await supabase
          .from('moi')
          .update({ cv_url: publicUrl })
          .eq('id', 1) // Assumant qu'il n'y a qu'un seul profil

        if (updateError) {
          console.error('Erreur lors de la mise à jour du profil:', updateError)
          return NextResponse.json({ error: 'Erreur lors de la sauvegarde du CV' }, { status: 500 })
        }

        return NextResponse.json({ 
          success: true, 
          message: 'CV sauvegardé avec succès',
          pdfUrl: publicUrl,
          fileName: fileName
        })
      } else {
        // Pour les CV temporaires : streamer directement le PDF sans stockage
        return new NextResponse(pdfBuffer, {
          status: 200,
          headers: {
            'Content-Type': 'application/pdf',
            'Content-Disposition': 'attachment; filename="CV_Fabrice_Folly.pdf"',
            'Content-Length': pdfBuffer.length.toString()
          }
        })
      }

    } catch (browserError) {
      console.error('Erreur lors de la génération du PDF:', browserError)
      if (browser) await browser.close()
      return NextResponse.json({ error: 'Erreur lors de la génération du PDF' }, { status: 500 })
    }

  } catch (error) {
    console.error('Erreur lors de la génération du CV:', error)
    return NextResponse.json({ error: 'Erreur lors de la génération du CV' }, { status: 500 })
  }
}

// Fonction pour générer le HTML du CV
const generateCVHTML = (cvData, isDarkMode) => {
  const sections = cvData.sections.sort((a, b) => a.order - b.order)
  
  const renderContent = (section) => {
    if (typeof section.content === 'string') {
      return `<p class="text-sm text-gray-800 leading-relaxed mb-3" style="font-size: 12px;">${section.content || 'Contenu à ajouter...'}</p>`
    }
    
    if (!section.content || !Array.isArray(section.content) || section.content.length === 0) {
      return `<p class="text-sm text-gray-600 mb-3" style="font-size: 12px;">Aucun contenu ajouté</p>`
    }

    return section.content.map((element, index) => {
      switch (element.type) {
        case 'subtitle':
          return `<h4 class="font-semibold text-sm mb-2 mt-4 first:mt-0 text-black" style="font-size: 12px;">${element.content}</h4>`
        
        case 'text':
          return `<p class="text-sm text-gray-800 leading-relaxed mb-3" style="font-size: 12px;">${element.content.replace(/\n/g, '<br>')}</p>`
        
        case 'list':
          if (element.content && Array.isArray(element.content) && element.content.length > 0) {
            return `<ul class="list-disc list-inside text-sm mb-3 ml-4 text-gray-800" style="font-size: 12px;">${element.content.map(item => `<li class="mb-1">${item}</li>`).join('')}</ul>`
          } else {
            return `<ul class="list-disc list-inside text-sm mb-3 ml-4 text-gray-600" style="font-size: 12px;"><li>Aucun élément dans la liste</li></ul>`
          }
        
        default:
          return ''
      }
    }).join('')
  }

  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <title>CV - ${cvData.personalInfo?.name || 'FABRICE FOLLY'}</title>
        <style>
          @page {
            size: A4;
            margin: 20mm;
          }
          body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: ${isDarkMode ? '#ffffff' : '#000000'};
            background-color: ${isDarkMode ? '#000000' : '#ffffff'};
            margin: 0;
            padding: 0;
          }
          .cv-container {
            max-width: 210mm;
            margin: 0 auto;
            padding: 20mm;
            box-sizing: border-box;
            background-color: ${isDarkMode ? '#000000' : '#ffffff'};
            color: ${isDarkMode ? '#ffffff' : '#000000'};
          }
          .header {
            text-align: center;
            margin-bottom: 8mm;
            padding-bottom: 4mm;
            border-bottom: 2px solid ${isDarkMode ? '#666' : '#ccc'};
          }
          .name {
            font-size: 20px;
            font-weight: bold;
            margin-bottom: 2mm;
            text-transform: uppercase;
            letter-spacing: 0.1em;
            color: ${isDarkMode ? '#ffffff' : '#000000'};
          }
          .title {
            font-size: 14px;
            font-weight: normal;
            margin-bottom: 2mm;
            color: ${isDarkMode ? '#cccccc' : '#666666'};
          }
          .contact-info {
            font-size: 10px;
            color: ${isDarkMode ? '#cccccc' : '#666666'};
            line-height: 1.4;
          }
          .section {
            margin-bottom: 5mm;
          }
          .section-title {
            font-size: 16px;
            font-weight: bold;
            margin-bottom: 2mm;
            text-transform: uppercase;
            letter-spacing: 0.1em;
            border-bottom: 1px solid ${isDarkMode ? '#666' : '#ccc'};
            padding-bottom: 1mm;
            color: ${isDarkMode ? '#ffffff' : '#000000'};
          }
          .section-content {
            margin-bottom: 2mm;
          }
          .footer {
            position: fixed;
            bottom: 4mm;
            left: 4mm;
            right: 4mm;
            text-align: center;
            font-size: 8px;
            color: #666;
            border-top: 1px solid #eee;
            padding-top: 2mm;
          }
          h4 {
            font-weight: 600;
            margin-bottom: 1.5mm;
            margin-top: 3mm;
            color: ${isDarkMode ? '#ffffff' : '#000000'};
            font-size: 12px;
          }
          h4:first-child {
            margin-top: 0;
          }
          p {
            margin-bottom: 2mm;
            color: ${isDarkMode ? '#cccccc' : '#333333'};
            font-size: 12px;
            line-height: 1.4;
          }
          ul {
            margin-bottom: 2mm;
            color: ${isDarkMode ? '#cccccc' : '#333333'};
            font-size: 12px;
          }
          li {
            margin-bottom: 0.5mm;
          }
        </style>
      </head>
      <body>
        <div class="cv-container">
          <!-- En-tête -->
          <div class="header">
            <div class="name">${cvData.personalInfo?.name || 'FABRICE FOLLY'}</div>
            ${cvData.personalInfo?.title ? `<div class="title">${cvData.personalInfo.title}</div>` : ''}
            <div class="contact-info">
              ${cvData.personalInfo?.age ? `<div>${cvData.personalInfo.age}</div>` : ''}
              ${cvData.personalInfo?.email ? `<div>${cvData.personalInfo.email}</div>` : ''}
              ${cvData.personalInfo?.phone ? `<div>${cvData.personalInfo.phone}</div>` : ''}
              ${cvData.personalInfo?.website ? `<div>${cvData.personalInfo.website}</div>` : ''}
              ${cvData.personalInfo?.github ? `<div>${cvData.personalInfo.github}</div>` : ''}
              ${cvData.personalInfo?.linkedin ? `<div>${cvData.personalInfo.linkedin}</div>` : ''}
            </div>
          </div>

          <!-- Sections -->
          ${sections.map(section => `
            <div class="section">
              <h2 class="section-title">${section.title}</h2>
              <div class="section-content">
                ${renderContent(section)}
              </div>
            </div>
          `).join('')}

          <!-- Pied de page - Supprimé pour le PDF -->
          <!-- <div class="footer">
            CV généré le ${new Date().toLocaleDateString('fr-FR')}
          </div> -->
        </div>
      </body>
    </html>
  `
}
