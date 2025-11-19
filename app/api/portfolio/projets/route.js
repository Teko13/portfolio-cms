import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'
import { withCors, handleOptions } from '@/utils/cors'

// OPTIONS - Gérer les requêtes preflight CORS
export async function OPTIONS() {
  return handleOptions()
}

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
      .order('index', { ascending: true })

    if (error) throw error

    const response = NextResponse.json({ 
      success: true, 
      data: data || [] 
    })
    return withCors(response)
  } catch (error) {
    console.error('Erreur lors de la récupération des projets:', error)
    const response = NextResponse.json(
      { success: false, error: 'Erreur lors de la récupération des projets' },
      { status: 500 }
    )
    return withCors(response)
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
    
    // Calculer l'index : utiliser celui fourni ou calculer automatiquement
    let indexToUse = body.index
    
    if (!indexToUse || indexToUse <= 0) {
      // Récupérer le nombre de projets existants pour calculer l'index
      const { count, error: countError } = await supabase
        .from('projet')
        .select('*', { count: 'exact', head: true })

      if (countError) {
        console.error('Erreur lors du comptage des projets:', countError)
        return NextResponse.json(
          { success: false, error: 'Erreur lors du calcul de l\'index' },
          { status: 500 }
        )
      }

      indexToUse = (count || 0) + 1
    }
    
    // Préparer les données d'insertion
    const insertData = {
      titre: body.titre,
      description: body.description,
      cree_le: new Date().toISOString(), // Ajouter la date de création
      index: indexToUse // Utiliser l'index fourni ou calculé
    }
    
    // Ajouter les champs optionnels seulement s'ils existent
    if (body.image_url) insertData.image_url = body.image_url
    if (body.video_url) insertData.video_url = body.video_url
    if (body.acces_url) insertData.acces_url = body.acces_url
    if (body.source_url) insertData.source_url = body.source_url
    if (body.category) insertData.category = body.category
    
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
    
    // Récupérer l'ancienne image_url et video_url avant mise à jour
    const { data: oldProjet, error: fetchError } = await supabase
      .from('projet')
      .select('image_url, video_url')
      .eq('id', body.id)
      .single()

    if (fetchError && fetchError.code !== 'PGRST116') {
      console.error('Erreur lors de la récupération de l\'ancien projet:', fetchError)
    }

    // Préparer les données de mise à jour
    const updateData = {
      titre: body.titre,
      description: body.description,
      image_url: body.image_url || null,
      video_url: body.video_url || null,
      acces_url: body.acces_url || null,
      source_url: body.source_url || null
    }
    
    // Ajouter l'index si fourni
    if (body.index !== undefined && body.index !== null) {
      updateData.index = body.index
    }

    // Mettre à jour le projet
    const { data, error } = await supabase
      .from('projet')
      .update(updateData)
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

    // Supprimer l'ancienne vidéo si elle a changé et existe
    if (oldProjet && oldProjet.video_url && oldProjet.video_url !== body.video_url) {
      try {
        // Extraire le nom du fichier de l'URL
        const urlParts = oldProjet.video_url.split('/')
        const fileName = urlParts[urlParts.length - 1]
        
        console.log('Suppression de l\'ancienne vidéo:', fileName)
        
        const { error: storageError } = await supabase.storage
          .from('medias')
          .remove([fileName])

        if (storageError) {
          console.error('Erreur lors de la suppression de l\'ancienne vidéo:', storageError)
        } else {
          console.log('Ancienne vidéo supprimée avec succès:', fileName)
        }
      } catch (storageError) {
        console.error('Erreur lors de la suppression de l\'ancienne vidéo:', storageError)
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
      // Récupérer le projet avant suppression pour obtenir l'image_url et video_url
      const { data: projet, error: fetchError } = await supabase
        .from('projet')
        .select('image_url, video_url')
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

      // Supprimer la vidéo du storage si elle existe
      if (projet && projet.video_url) {
        try {
          // Extraire le nom du fichier de l'URL
          const urlParts = projet.video_url.split('/')
          const fileName = urlParts[urlParts.length - 1]
          
          console.log('Suppression de la vidéo:', fileName)
          
          const { error: storageError } = await supabase.storage
            .from('medias')
            .remove([fileName])

          if (storageError) {
            console.error('Erreur lors de la suppression de la vidéo:', storageError)
          } else {
            console.log('Vidéo supprimée avec succès:', fileName)
          }
        } catch (storageError) {
          console.error('Erreur lors de la suppression de la vidéo:', storageError)
        }
      }

      return NextResponse.json({ 
        success: true, 
        message: 'Projet supprimé avec succès'
      })
    } else {
      // Récupérer tous les projets avant suppression pour obtenir les image_url et video_url
      const { data: projets, error: fetchError } = await supabase
        .from('projet')
        .select('image_url, video_url')

      if (fetchError) {
        console.error('Erreur lors de la récupération des projets:', fetchError)
      }

      // Supprimer tous les projets
      const { error } = await supabase
        .from('projet')
        .delete()
        .neq('id', 0) // Supprime toutes les entrées

      if (error) throw error

      // Supprimer toutes les images et vidéos du storage
      if (projets && projets.length > 0) {
        const filesToDelete = []
        
        // Récupérer les noms de fichiers des images
        projets
          .filter(projet => projet.image_url)
          .forEach(projet => {
            const urlParts = projet.image_url.split('/')
            filesToDelete.push(urlParts[urlParts.length - 1])
          })
        
        // Récupérer les noms de fichiers des vidéos
        projets
          .filter(projet => projet.video_url)
          .forEach(projet => {
            const urlParts = projet.video_url.split('/')
            filesToDelete.push(urlParts[urlParts.length - 1])
          })

        if (filesToDelete.length > 0) {
          try {
            console.log('Suppression des fichiers média:', filesToDelete)
            
            const { error: storageError } = await supabase.storage
              .from('medias')
              .remove(filesToDelete)

            if (storageError) {
              console.error('Erreur lors de la suppression des fichiers média:', storageError)
            } else {
              console.log('Fichiers média supprimés avec succès:', filesToDelete.length)
            }
          } catch (storageError) {
            console.error('Erreur lors de la suppression des fichiers média:', storageError)
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