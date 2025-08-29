import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

// PUT - Réordonner les projets
export async function PUT(request) {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    )
    const body = await request.json()
    
    console.log('Données de réordonnancement reçues:', body)
    
    if (!body.projects || !Array.isArray(body.projects)) {
      return NextResponse.json(
        { success: false, error: 'Liste de projets requise' },
        { status: 400 }
      )
    }

    // Mettre à jour les index de tous les projets
    const updates = body.projects.map((project, newIndex) => ({
      id: project.id,
      index: newIndex + 1
    }))

    console.log('Mises à jour à effectuer:', updates)

    // Effectuer les mises à jour une par une
    for (const update of updates) {
      const { error } = await supabase
        .from('projet')
        .update({ index: update.index })
        .eq('id', update.id)

      if (error) {
        console.error(`Erreur lors de la mise à jour du projet ${update.id}:`, error)
        return NextResponse.json(
          { success: false, error: `Erreur lors de la mise à jour du projet ${update.id}` },
          { status: 500 }
        )
      }
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Projets réordonnés avec succès'
    })
  } catch (error) {
    console.error('Erreur lors du réordonnancement:', error)
    return NextResponse.json(
      { success: false, error: 'Erreur lors du réordonnancement' },
      { status: 500 }
    )
  }
}
