import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { resolveVariablesInHtml } from '@/utils/cvResolve'

let puppeteer, chromium

if (process.env.NODE_ENV === 'production') {
  puppeteer = require('puppeteer-core')
  chromium = require('@sparticuz/chromium')
} else {
  puppeteer = require('puppeteer')
}

export async function POST(request) {
  try {
    const { html: rawHtml, saveAsMain } = await request.json()
    if (!rawHtml) return NextResponse.json({ error: 'HTML manquant' }, { status: 400 })

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    )

    // Résoudre les variables dynamiques avant la génération du PDF
    const html = await resolveVariablesInHtml(rawHtml, supabase)

    const fullHtml = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet">
  <style>
    /* Marge appliquée par le moteur d'impression à CHAQUE page → marges identiques partout */
    @page { size: A4; margin: 18mm 20mm; }
    * { box-sizing: border-box; }
    html, body { margin: 0; background: #fff; }
    .cv-page {
      font-family: Inter, Arial, sans-serif;
      color: #1a1a1a;
      font-size: 11pt;
      line-height: 1.62;
      background: #fff;
    }
    .cv-page h1 { font-size: 25pt; font-weight: 800; text-align: center; letter-spacing: .4px; color: #111; margin: 0 0 4px; }
    .cv-page h2 { font-size: 13pt; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; color: #111; border-bottom: 1px solid #ccc; padding-bottom: 6px; margin: 24px 0 12px; }
    .cv-page h3 { font-size: 11.5pt; font-weight: 600; color: #333; margin: 14px 0 4px; }
    .cv-page p { margin: 0 0 10px; }
    .cv-page ul, .cv-page ol { padding-left: 22px; margin: 0 0 10px; }
    .cv-page li { margin: 0 0 5px; }
    .cv-page a { color: #2563eb; }
    .cv-page hr { border: none; border-top: 1px solid #ccc; margin: 18px 0; }
    /* Render variable chips as plain text */
    [data-var] {
      display: inline;
      padding: 0;
      margin: 0;
      background: transparent;
      color: inherit;
      font-weight: inherit;
      white-space: normal;
      box-shadow: none;
      border-radius: 0;
    }
  </style>
</head>
<body>
  <div class="cv-page">${html}</div>
</body>
</html>`

    let browser
    if (process.env.NODE_ENV === 'production') {
      const executablePath = await chromium.executablePath()
      browser = await puppeteer.launch({
        args: chromium.args,
        defaultViewport: chromium.defaultViewport,
        executablePath,
        headless: chromium.headless,
        ignoreHTTPSErrors: true,
      })
    } else {
      browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox', '--disable-setuid-sandbox'] })
    }

    let pdfBuffer
    try {
      const page = await browser.newPage()
      await page.setContent(fullHtml, { waitUntil: 'networkidle0' })

      // Conversion thème sombre → page blanche lisible :
      // - textes clairs/grisâtres (pensés pour fond sombre) → sombres
      // - chips de variables échantillon → texte normal
      // - couleurs vives volontaires (bleu, vert…) conservées
      await page.evaluate(() => {
        const parse = (c) => {
          const m = c && c.match(/rgba?\(([^)]+)\)/)
          if (!m) return null
          const p = m[1].split(',').map((s) => parseFloat(s))
          return { r: p[0], g: p[1], b: p[2], a: p[3] ?? 1 }
        }
        const isWashedOut = (r, g, b) => {
          const lum = 0.2126 * r + 0.7152 * g + 0.0722 * b
          const max = Math.max(r, g, b), min = Math.min(r, g, b)
          const sat = max === 0 ? 0 : (max - min) / max
          // clair + peu saturé (blanc/gris) OU extrêmement clair quelle que soit la teinte
          return (lum > 150 && sat < 0.28) || lum > 210
        }
        // Chips échantillon : redeviennent du texte normal
        document.querySelectorAll('.cv-page [data-var]').forEach((el) => {
          el.style.background = 'transparent'
          el.style.boxShadow = 'none'
          el.style.color = ''
        })
        // Tout le texte : neutralise les couleurs claires illisibles
        document.querySelectorAll('.cv-page, .cv-page *').forEach((el) => {
          const cs = getComputedStyle(el)
          const col = parse(cs.color)
          if (col && isWashedOut(col.r, col.g, col.b)) el.style.color = '#1a1a1a'
        })
      })

      pdfBuffer = await page.pdf({ format: 'A4', printBackground: true })
      await browser.close()
    } catch (e) {
      await browser.close()
      throw e
    }

    const fileName = `cv_${Date.now()}.pdf`
    const { error: uploadError } = await supabase.storage
      .from('docs')
      .upload(fileName, pdfBuffer, { contentType: 'application/pdf', upsert: true })

    if (uploadError) {
      return NextResponse.json({ error: 'Erreur upload PDF' }, { status: 500 })
    }

    const { data: { publicUrl } } = supabase.storage.from('docs').getPublicUrl(fileName)

    if (saveAsMain) {
      // Supprimer l'ancien CV du storage si existant
      const { data: profile } = await supabase.from('moi').select('cv_url').single()
      if (profile?.cv_url) {
        const oldFile = profile.cv_url.split('/').pop()
        if (oldFile) await supabase.storage.from('docs').remove([oldFile])
      }
      await supabase.from('moi').update({ cv_url: publicUrl }).eq('id', 1)
    }

    return NextResponse.json({ success: true, pdfUrl: publicUrl })
  } catch (error) {
    console.error('Erreur save-html:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
