import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

export async function POST(request) {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    )

    const body = await request.json()
    const { pdfUrl } = body

    if (!pdfUrl) {
      return NextResponse.json(
        { success: false, error: 'URL du PDF requise' },
        { status: 400 }
      )
    }

    // Extraire le nom du fichier de l'URL
    const urlParts = pdfUrl.split('/')
    const fileName = urlParts[urlParts.length - 1]

    if (!fileName) {
      return NextResponse.json(
        { success: false, error: 'Nom de fichier invalide' },
        { status: 400 }
      )
    }

    console.log('Suppression du PDF:', fileName)

    // Supprimer le fichier du storage
    const { error } = await supabase.storage
      .from('docs')
      .remove([fileName])

    if (error) {
      console.error('Erreur lors de la suppression du PDF:', error)
      return NextResponse.json(
        { success: false, error: 'Erreur lors de la suppression du PDF' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'PDF supprimé avec succès'
    })

  } catch (error) {
    console.error('Erreur lors de la suppression du PDF:', error)
    return NextResponse.json(
      { success: false, error: 'Erreur lors de la suppression du PDF' },
      { status: 500 }
    )
  }
}
