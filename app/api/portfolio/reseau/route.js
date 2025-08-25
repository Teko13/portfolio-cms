import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

// GET - Récupérer tous les éléments du réseau
export async function GET() {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    )
    
    const { data, error } = await supabase
      .from('ta_table')
      .select('*')
      .order('id', { ascending: true })

    if (error) throw error

    return NextResponse.json({ 
      success: true, 
      data: data || [] 
    })
  } catch (error) {
    console.error('Erreur lors de la récupération du réseau:', error)
    return NextResponse.json(
      { success: false, error: 'Erreur lors de la récupération du réseau' },
      { status: 500 }
    )
  }
}

// POST - Créer un nouvel élément du réseau
export async function POST(request) {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    )
    const body = await request.json()
    
    console.log('Données reçues pour le réseau:', body)
    
    // Préparer les données d'insertion
    const insertData = {
      nom: body.nom,
      url: body.url
    }

    // Ajouter l'icône seulement si elle existe
    if (body.icon_url) insertData.icon_url = body.icon_url

    console.log('Données d\'insertion:', insertData)
    
    const { data, error } = await supabase
      .from('ta_table')
      .insert(insertData)
      .select()
      .single()

    if (error) {
      console.error('Erreur lors de la création de l\'élément réseau:', error)
      return NextResponse.json(
        { success: false, error: `Erreur lors de la création de l'élément réseau: ${error.message}` },
        { status: 500 }
      )
    }

    return NextResponse.json({ 
      success: true, 
      data: data,
      message: 'Élément réseau ajouté avec succès'
    })
  } catch (error) {
    console.error('Erreur lors de la création de l\'élément réseau:', error)
    return NextResponse.json(
      { success: false, error: 'Erreur lors de la création de l\'élément réseau' },
      { status: 500 }
    )
  }
}

// PUT - Modifier un élément du réseau
export async function PUT(request) {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    )
    const body = await request.json()
    
    console.log('Données de modification reçues:', body)
    
    // Récupérer l'ancienne icône avant modification
    const { data: oldData, error: fetchError } = await supabase
      .from('ta_table')
      .select('icon_url')
      .eq('id', body.id)
      .single()

    if (fetchError && fetchError.code !== 'PGRST116') {
      console.error('Erreur lors de la récupération de l\'ancienne icône:', fetchError)
    }

    // Préparer les données de mise à jour
    const updateData = {
      nom: body.nom,
      url: body.url
    }

    // Ajouter l'icône seulement si elle existe
    if (body.icon_url) updateData.icon_url = body.icon_url

    console.log('Données de mise à jour:', updateData)
    
    const { data, error } = await supabase
      .from('ta_table')
      .update(updateData)
      .eq('id', body.id)
      .select()
      .single()

    if (error) {
      console.error('Erreur lors de la modification de l\'élément réseau:', error)
      return NextResponse.json(
        { success: false, error: `Erreur lors de la modification de l'élément réseau: ${error.message}` },
        { status: 500 }
      )
    }

    // Supprimer l'ancienne icône si elle a changé
    if (oldData && oldData.icon_url && oldData.icon_url !== body.icon_url) {
      try {
        // Extraire le nom du fichier de l'URL
        const urlParts = oldData.icon_url.split('/')
        const fileName = urlParts[urlParts.length - 1]
        
        console.log('Suppression de l\'ancienne icône:', fileName)
        
        const { error: storageError } = await supabase.storage
          .from('medias')
          .remove([fileName])

        if (storageError) {
          console.error('Erreur lors de la suppression de l\'ancienne icône:', storageError)
        } else {
          console.log('Ancienne icône supprimée avec succès:', fileName)
        }
      } catch (storageError) {
        console.error('Erreur lors de la suppression de l\'ancienne icône:', storageError)
      }
    }

    return NextResponse.json({ 
      success: true, 
      data: data,
      message: 'Élément réseau modifié avec succès'
    })
  } catch (error) {
    console.error('Erreur lors de la modification de l\'élément réseau:', error)
    return NextResponse.json(
      { success: false, error: 'Erreur lors de la modification de l\'élément réseau' },
      { status: 500 }
    )
  }
}

// DELETE - Supprimer un élément ou tous les éléments du réseau
export async function DELETE(request) {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    )
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    
    if (id) {
      // Récupérer l'élément avant suppression pour obtenir l'icon_url
      const { data: element, error: fetchError } = await supabase
        .from('ta_table')
        .select('icon_url')
        .eq('id', id)
        .single()

      if (fetchError && fetchError.code !== 'PGRST116') {
        console.error('Erreur lors de la récupération de l\'élément:', fetchError)
      }

      // Supprimer l'élément du réseau
      const { error } = await supabase
        .from('ta_table')
        .delete()
        .eq('id', id)

      if (error) throw error

      // Supprimer l'icône du storage si elle existe
      if (element && element.icon_url) {
        try {
          // Extraire le nom du fichier de l'URL
          const urlParts = element.icon_url.split('/')
          const fileName = urlParts[urlParts.length - 1]
          
          console.log('Suppression de l\'icône du réseau:', fileName)
          
          const { error: storageError } = await supabase.storage
            .from('medias')
            .remove([fileName])

          if (storageError) {
            console.error('Erreur lors de la suppression de l\'icône:', storageError)
          } else {
            console.log('Icône du réseau supprimée avec succès:', fileName)
          }
        } catch (storageError) {
          console.error('Erreur lors de la suppression de l\'icône:', storageError)
        }
      }

      return NextResponse.json({ 
        success: true, 
        message: 'Élément réseau supprimé avec succès'
      })
    } else {
      // Récupérer tous les éléments avant suppression pour obtenir les icon_url
      const { data: elements, error: fetchError } = await supabase
        .from('ta_table')
        .select('icon_url')

      if (fetchError) {
        console.error('Erreur lors de la récupération des éléments:', fetchError)
      }

      // Supprimer tous les éléments du réseau
      const { error } = await supabase
        .from('ta_table')
        .delete()
        .neq('id', 0) // Supprime toutes les entrées

      if (error) throw error

      // Supprimer toutes les icônes du storage
      if (elements && elements.length > 0) {
        const iconFiles = elements
          .filter(element => element.icon_url)
          .map(element => {
            const urlParts = element.icon_url.split('/')
            return urlParts[urlParts.length - 1]
          })

        if (iconFiles.length > 0) {
          try {
            console.log('Suppression des icônes du réseau:', iconFiles)
            
            const { error: storageError } = await supabase.storage
              .from('medias')
              .remove(iconFiles)

            if (storageError) {
              console.error('Erreur lors de la suppression des icônes:', storageError)
            } else {
              console.log('Icônes du réseau supprimées avec succès:', iconFiles.length)
            }
          } catch (storageError) {
            console.error('Erreur lors de la suppression des icônes:', storageError)
          }
        }
      }

      return NextResponse.json({ 
        success: true, 
        message: 'Tous les éléments du réseau ont été supprimés'
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
