import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

// GET - Récupérer tous les projets
export async function GET() {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    )
    
    const { data, error } = await supabase
      .from('projet')
      .select('*')
      .order('id', { ascending: true })

    if (error) throw error

    return NextResponse.json({ 
      success: true, 
      data: data || [] 
    })
  } catch (error) {
    console.error('Erreur lors de la récupération des projets:', error)
    return NextResponse.json(
      { success: false, error: 'Erreur lors de la récupération des projets' },
      { status: 500 }
    )
  }
}

// POST - Créer un nouveau projet
export async function POST(request) {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    )
    const body = await request.json()
    
    console.log('Données reçues:', body)
    
    // Préparer les données d'insertion
    const insertData = {
      titre: body.titre,
      description: body.description,
      cree_le: new Date().toISOString() // Ajouter la date de création
    }
    
    // Ajouter les champs optionnels seulement s'ils existent
    if (body.image_url) insertData.image_url = body.image_url
    if (body.acces_url) insertData.acces_url = body.acces_url
    if (body.source_url) insertData.source_url = body.source_url
    
    console.log('Données d\'insertion:', insertData)
    
    const { data, error } = await supabase
      .from('projet')
      .insert(insertData)
      .select()
      .single()

    if (error) {
      console.error('Erreur lors de la création du projet:', error)
      return NextResponse.json(
        { success: false, error: `Erreur lors de la création du projet: ${error.message}` },
        { status: 500 }
      )
    }

    return NextResponse.json({ 
      success: true, 
      data: data,
      message: 'Projet ajouté avec succès'
    })
  } catch (error) {
    console.error('Erreur lors de la création du projet:', error)
    return NextResponse.json(
      { success: false, error: 'Erreur lors de la création du projet' },
      { status: 500 }
    )
  }
}

// PUT - Mettre à jour un projet existant
export async function PUT(request) {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    )
    const body = await request.json()
    
    // Récupérer l'ancienne image_url avant mise à jour
    const { data: oldProjet, error: fetchError } = await supabase
      .from('projet')
      .select('image_url')
      .eq('id', body.id)
      .single()

    if (fetchError && fetchError.code !== 'PGRST116') {
      console.error('Erreur lors de la récupération de l\'ancien projet:', fetchError)
    }

    // Mettre à jour le projet
    const { data, error } = await supabase
      .from('projet')
      .update({
        titre: body.titre,
        description: body.description,
        image_url: body.image_url || null,
        acces_url: body.acces_url || null,
        source_url: body.source_url || null
      })
      .eq('id', body.id)
      .select()
      .single()

    if (error) throw error

    // Supprimer l'ancienne image si elle a changé et existe
    if (oldProjet && oldProjet.image_url && oldProjet.image_url !== body.image_url) {
      try {
        // Extraire le nom du fichier de l'URL
        const urlParts = oldProjet.image_url.split('/')
        const fileName = urlParts[urlParts.length - 1]
        
        console.log('Suppression de l\'ancienne image:', fileName)
        
        const { error: storageError } = await supabase.storage
          .from('medias')
          .remove([fileName])

        if (storageError) {
          console.error('Erreur lors de la suppression de l\'ancienne image:', storageError)
        } else {
          console.log('Ancienne image supprimée avec succès:', fileName)
        }
      } catch (storageError) {
        console.error('Erreur lors de la suppression de l\'ancienne image:', storageError)
      }
    }

    return NextResponse.json({ 
      success: true, 
      data: data,
      message: 'Projet mis à jour avec succès'
    })
  } catch (error) {
    console.error('Erreur lors de la mise à jour du projet:', error)
    return NextResponse.json(
      { success: false, error: 'Erreur lors de la mise à jour du projet' },
      { status: 500 }
    )
  }
}

// DELETE - Supprimer un projet ou tous les projets
export async function DELETE(request) {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    )
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    
    if (id) {
      // Récupérer le projet avant suppression pour obtenir l'image_url
      const { data: projet, error: fetchError } = await supabase
        .from('projet')
        .select('image_url')
        .eq('id', id)
        .single()

      if (fetchError && fetchError.code !== 'PGRST116') {
        console.error('Erreur lors de la récupération du projet:', fetchError)
      }

      // Supprimer le projet
      const { error } = await supabase
        .from('projet')
        .delete()
        .eq('id', id)

      if (error) throw error

      // Supprimer l'image du storage si elle existe
      if (projet && projet.image_url) {
        try {
          // Extraire le nom du fichier de l'URL
          const urlParts = projet.image_url.split('/')
          const fileName = urlParts[urlParts.length - 1]
          
          console.log('Suppression de l\'image:', fileName)
          
          const { error: storageError } = await supabase.storage
            .from('medias')
            .remove([fileName])

          if (storageError) {
            console.error('Erreur lors de la suppression de l\'image:', storageError)
          } else {
            console.log('Image supprimée avec succès:', fileName)
          }
        } catch (storageError) {
          console.error('Erreur lors de la suppression de l\'image:', storageError)
        }
      }

      return NextResponse.json({ 
        success: true, 
        message: 'Projet supprimé avec succès'
      })
    } else {
      // Récupérer tous les projets avant suppression pour obtenir les image_url
      const { data: projets, error: fetchError } = await supabase
        .from('projet')
        .select('image_url')

      if (fetchError) {
        console.error('Erreur lors de la récupération des projets:', fetchError)
      }

      // Supprimer tous les projets
      const { error } = await supabase
        .from('projet')
        .delete()
        .neq('id', 0) // Supprime toutes les entrées

      if (error) throw error

      // Supprimer toutes les images du storage
      if (projets && projets.length > 0) {
        const imageFiles = projets
          .filter(projet => projet.image_url)
          .map(projet => {
            const urlParts = projet.image_url.split('/')
            return urlParts[urlParts.length - 1]
          })

        if (imageFiles.length > 0) {
          try {
            console.log('Suppression des images:', imageFiles)
            
            const { error: storageError } = await supabase.storage
              .from('medias')
              .remove(imageFiles)

            if (storageError) {
              console.error('Erreur lors de la suppression des images:', storageError)
            } else {
              console.log('Images supprimées avec succès:', imageFiles.length)
            }
          } catch (storageError) {
            console.error('Erreur lors de la suppression des images:', storageError)
          }
        }
      }

      return NextResponse.json({ 
        success: true, 
        message: 'Tous les projets ont été supprimés'
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