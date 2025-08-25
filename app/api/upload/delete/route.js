import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

export async function POST(request) {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    )
    
    const body = await request.json()
    const { imageUrl } = body

    if (!imageUrl) {
      return NextResponse.json(
        { success: false, error: 'URL de l\'image requise' },
        { status: 400 }
      )
    }

    // Extraire le nom du fichier de l'URL
    const urlParts = imageUrl.split('/')
    const fileName = urlParts[urlParts.length - 1]

    if (!fileName) {
      return NextResponse.json(
        { success: false, error: 'Nom de fichier invalide' },
        { status: 400 }
      )
    }

    console.log('Suppression de l\'image:', fileName)

    // Supprimer le fichier du storage
    const { error } = await supabase.storage
      .from('medias')
      .remove([fileName])

    if (error) {
      console.error('Erreur lors de la suppression de l\'image:', error)
      return NextResponse.json(
        { success: false, error: 'Erreur lors de la suppression de l\'image' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Image supprimée avec succès'
    })

  } catch (error) {
    console.error('Erreur lors de la suppression de l\'image:', error)
    return NextResponse.json(
      { success: false, error: 'Erreur lors de la suppression de l\'image' },
      { status: 500 }
    )
  }
} 