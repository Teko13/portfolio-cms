import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

// GET - Récupérer tous les parcours
export async function GET() {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    )
    
    const { data, error } = await supabase
      .from('parcours')
      .select('*')
      .order('obtenu_en', { ascending: false })

    if (error) throw error

    return NextResponse.json({ 
      success: true, 
      data: data || [] 
    })
  } catch (error) {
    console.error('Erreur lors de la récupération des parcours:', error)
    return NextResponse.json(
      { success: false, error: 'Erreur lors de la récupération des parcours' },
      { status: 500 }
    )
  }
}

// POST - Créer un nouveau parcours
export async function POST(request) {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    )
    const body = await request.json()
    
    console.log('Données reçues pour le parcours:', body)
    
    // Préparer les données d'insertion
    const insertData = {
      titre: body.titre,
      ecole: body.ecole,
      obtenu_en: body.obtenu_en
    }

    // Ajouter le PDF seulement s'il existe
    if (body.diplome_pdf_url) insertData.diplome_pdf_url = body.diplome_pdf_url

    console.log('Données d\'insertion:', insertData)
    
    const { data, error } = await supabase
      .from('parcours')
      .insert(insertData)
      .select()
      .single()

    if (error) {
      console.error('Erreur lors de la création du parcours:', error)
      return NextResponse.json(
        { success: false, error: `Erreur lors de la création du parcours: ${error.message}` },
        { status: 500 }
      )
    }

    return NextResponse.json({ 
      success: true, 
      data: data,
      message: 'Parcours ajouté avec succès'
    })
  } catch (error) {
    console.error('Erreur lors de la création du parcours:', error)
    return NextResponse.json(
      { success: false, error: 'Erreur lors de la création du parcours' },
      { status: 500 }
    )
  }
}

// PUT - Modifier un parcours
export async function PUT(request) {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    )
    const body = await request.json()
    
    console.log('Données de modification reçues:', body)
    
    // Récupérer l'ancien PDF avant modification
    const { data: oldData, error: fetchError } = await supabase
      .from('parcours')
      .select('diplome_pdf_url')
      .eq('id', body.id)
      .single()

    if (fetchError && fetchError.code !== 'PGRST116') {
      console.error('Erreur lors de la récupération de l\'ancien PDF:', fetchError)
    }

    // Préparer les données de mise à jour
    const updateData = {
      titre: body.titre,
      ecole: body.ecole,
      obtenu_en: body.obtenu_en
    }

    // Ajouter le PDF seulement s'il existe
    if (body.diplome_pdf_url) updateData.diplome_pdf_url = body.diplome_pdf_url

    console.log('Données de mise à jour:', updateData)
    
    const { data, error } = await supabase
      .from('parcours')
      .update(updateData)
      .eq('id', body.id)
      .select()
      .single()

    if (error) {
      console.error('Erreur lors de la modification du parcours:', error)
      return NextResponse.json(
        { success: false, error: `Erreur lors de la modification du parcours: ${error.message}` },
        { status: 500 }
      )
    }

    // Supprimer l'ancien PDF si il a changé
    if (oldData && oldData.diplome_pdf_url && oldData.diplome_pdf_url !== body.diplome_pdf_url) {
      try {
        // Extraire le nom du fichier de l'URL
        const urlParts = oldData.diplome_pdf_url.split('/')
        const fileName = urlParts[urlParts.length - 1]
        
        console.log('Suppression de l\'ancien PDF:', fileName)
        
        const { error: storageError } = await supabase.storage
          .from('docs')
          .remove([fileName])

        if (storageError) {
          console.error('Erreur lors de la suppression de l\'ancien PDF:', storageError)
        } else {
          console.log('Ancien PDF supprimé avec succès:', fileName)
        }
      } catch (storageError) {
        console.error('Erreur lors de la suppression de l\'ancien PDF:', storageError)
      }
    }

    return NextResponse.json({ 
      success: true, 
      data: data,
      message: 'Parcours modifié avec succès'
    })
  } catch (error) {
    console.error('Erreur lors de la modification du parcours:', error)
    return NextResponse.json(
      { success: false, error: 'Erreur lors de la modification du parcours' },
      { status: 500 }
    )
  }
}

// DELETE - Supprimer un parcours ou tous les parcours
export async function DELETE(request) {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    )
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    
    if (id) {
      // Récupérer le parcours avant suppression pour obtenir le diplome_pdf_url
      const { data: parcours, error: fetchError } = await supabase
        .from('parcours')
        .select('diplome_pdf_url')
        .eq('id', id)
        .single()

      if (fetchError && fetchError.code !== 'PGRST116') {
        console.error('Erreur lors de la récupération du parcours:', fetchError)
      }

      // Supprimer le parcours
      const { error } = await supabase
        .from('parcours')
        .delete()
        .eq('id', id)

      if (error) throw error

      // Supprimer le PDF du storage s'il existe
      if (parcours && parcours.diplome_pdf_url) {
        try {
          // Extraire le nom du fichier de l'URL
          const urlParts = parcours.diplome_pdf_url.split('/')
          const fileName = urlParts[urlParts.length - 1]
          
          console.log('Suppression du PDF du parcours:', fileName)
          
          const { error: storageError } = await supabase.storage
            .from('docs')
            .remove([fileName])

          if (storageError) {
            console.error('Erreur lors de la suppression du PDF:', storageError)
          } else {
            console.log('PDF du parcours supprimé avec succès:', fileName)
          }
        } catch (storageError) {
          console.error('Erreur lors de la suppression du PDF:', storageError)
        }
      }

      return NextResponse.json({ 
        success: true, 
        message: 'Parcours supprimé avec succès'
      })
    } else {
      // Récupérer tous les parcours avant suppression pour obtenir les diplome_pdf_url
      const { data: parcours, error: fetchError } = await supabase
        .from('parcours')
        .select('diplome_pdf_url')

      if (fetchError) {
        console.error('Erreur lors de la récupération des parcours:', fetchError)
      }

      // Supprimer tous les parcours
      const { error } = await supabase
        .from('parcours')
        .delete()
        .neq('id', 0) // Supprime toutes les entrées

      if (error) throw error

      // Supprimer tous les PDF du storage
      if (parcours && parcours.length > 0) {
        const pdfFiles = parcours
          .filter(p => p.diplome_pdf_url)
          .map(p => {
            const urlParts = p.diplome_pdf_url.split('/')
            return urlParts[urlParts.length - 1]
          })

        if (pdfFiles.length > 0) {
          try {
            console.log('Suppression des PDF des parcours:', pdfFiles)
            
            const { error: storageError } = await supabase.storage
              .from('docs')
              .remove(pdfFiles)

            if (storageError) {
              console.error('Erreur lors de la suppression des PDF:', storageError)
            } else {
              console.log('PDF des parcours supprimés avec succès:', pdfFiles.length)
            }
          } catch (storageError) {
            console.error('Erreur lors de la suppression des PDF:', storageError)
          }
        }
      }

      return NextResponse.json({ 
        success: true, 
        message: 'Tous les parcours ont été supprimés'
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
