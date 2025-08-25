import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

// GET - Récupérer toutes les photos de la galerie
export async function GET() {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    )
    
    const { data, error } = await supabase
      .from('ma_gallerie')
      .select('*')
      .order('id', { ascending: true })

    if (error) throw error

    return NextResponse.json({ 
      success: true, 
      data: data || [] 
    })
  } catch (error) {
    console.error('Erreur lors de la récupération de la galerie:', error)
    return NextResponse.json(
      { success: false, error: 'Erreur lors de la récupération de la galerie' },
      { status: 500 }
    )
  }
}

// POST - Ajouter une nouvelle photo à la galerie
export async function POST(request) {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    )
    const body = await request.json()
    
    console.log('Données reçues pour la galerie:', body)
    
    const { data, error } = await supabase
      .from('ma_gallerie')
      .insert({
        photo_url: body.photo_url
      })
      .select()
      .single()

    if (error) {
      console.error('Erreur lors de l\'ajout de la photo:', error)
      return NextResponse.json(
        { success: false, error: `Erreur lors de l'ajout de la photo: ${error.message}` },
        { status: 500 }
      )
    }

    return NextResponse.json({ 
      success: true, 
      data: data,
      message: 'Photo ajoutée à la galerie avec succès'
    })
  } catch (error) {
    console.error('Erreur lors de l\'ajout de la photo:', error)
    return NextResponse.json(
      { success: false, error: 'Erreur lors de l\'ajout de la photo' },
      { status: 500 }
    )
  }
}

// DELETE - Supprimer une photo ou toutes les photos
export async function DELETE(request) {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    )
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    
    if (id) {
      // Récupérer la photo avant suppression pour obtenir la photo_url
      const { data: photo, error: fetchError } = await supabase
        .from('ma_gallerie')
        .select('photo_url')
        .eq('id', id)
        .single()

      if (fetchError && fetchError.code !== 'PGRST116') {
        console.error('Erreur lors de la récupération de la photo:', fetchError)
      }

      // Supprimer la photo de la galerie
      const { error } = await supabase
        .from('ma_gallerie')
        .delete()
        .eq('id', id)

      if (error) throw error

      // Supprimer l'image du storage si elle existe
      if (photo && photo.photo_url) {
        try {
          // Extraire le nom du fichier de l'URL
          const urlParts = photo.photo_url.split('/')
          const fileName = urlParts[urlParts.length - 1]
          
          console.log('Suppression de l\'image de la galerie:', fileName)
          
          const { error: storageError } = await supabase.storage
            .from('medias')
            .remove([fileName])

          if (storageError) {
            console.error('Erreur lors de la suppression de l\'image:', storageError)
          } else {
            console.log('Image de la galerie supprimée avec succès:', fileName)
          }
        } catch (storageError) {
          console.error('Erreur lors de la suppression de l\'image:', storageError)
        }
      }

      return NextResponse.json({ 
        success: true, 
        message: 'Photo supprimée de la galerie avec succès'
      })
    } else {
      // Récupérer toutes les photos avant suppression pour obtenir les photo_url
      const { data: photos, error: fetchError } = await supabase
        .from('ma_gallerie')
        .select('photo_url')

      if (fetchError) {
        console.error('Erreur lors de la récupération des photos:', fetchError)
      }

      // Supprimer toutes les photos de la galerie
      const { error } = await supabase
        .from('ma_gallerie')
        .delete()
        .neq('id', 0) // Supprime toutes les entrées

      if (error) throw error

      // Supprimer toutes les images du storage
      if (photos && photos.length > 0) {
        const imageFiles = photos
          .filter(photo => photo.photo_url)
          .map(photo => {
            const urlParts = photo.photo_url.split('/')
            return urlParts[urlParts.length - 1]
          })

        if (imageFiles.length > 0) {
          try {
            console.log('Suppression des images de la galerie:', imageFiles)
            
            const { error: storageError } = await supabase.storage
              .from('medias')
              .remove(imageFiles)

            if (storageError) {
              console.error('Erreur lors de la suppression des images:', storageError)
            } else {
              console.log('Images de la galerie supprimées avec succès:', imageFiles.length)
            }
          } catch (storageError) {
            console.error('Erreur lors de la suppression des images:', storageError)
          }
        }
      }

      return NextResponse.json({ 
        success: true, 
        message: 'Toutes les photos ont été supprimées de la galerie'
      })
    }
  } catch (error) {
    console.error('Erreur lors de la suppression:', error)
    return NextResponse.json(
      { success: false, error: 'Erreur lors de la suppression' },
      { status: 500 }
    )
  }
}
