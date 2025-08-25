import { createClient } from '@/utils/supabase/server'
import { NextResponse } from 'next/server'

// GET - Récupérer toutes les compétences
export async function GET() {
  try {
    const supabase = await createClient()
    
    const { data, error } = await supabase
      .from('competences')
      .select('*')
      .order('id', { ascending: true })

    if (error) throw error

    return NextResponse.json({ 
      success: true, 
      data: data || [] 
    })
  } catch (error) {
    console.error('Erreur lors de la récupération des compétences:', error)
    return NextResponse.json(
      { success: false, error: 'Erreur lors de la récupération des compétences' },
      { status: 500 }
    )
  }
}

// POST - Créer une nouvelle compétence
export async function POST(request) {
  try {
    const supabase = await createClient()
    const body = await request.json()
    
    const { data, error } = await supabase
      .from('competences')
      .insert({
        titre: body.titre,
        description: body.description
      })
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ 
      success: true, 
      data: data,
      message: 'Compétence ajoutée avec succès'
    })
  } catch (error) {
    console.error('Erreur lors de la création de la compétence:', error)
    return NextResponse.json(
      { success: false, error: 'Erreur lors de la création de la compétence' },
      { status: 500 }
    )
  }
}

// PUT - Mettre à jour une compétence existante
export async function PUT(request) {
  try {
    const supabase = await createClient()
    const body = await request.json()
    
    const { data, error } = await supabase
      .from('competences')
      .update({
        titre: body.titre,
        description: body.description
      })
      .eq('id', body.id)
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ 
      success: true, 
      data: data,
      message: 'Compétence mise à jour avec succès'
    })
  } catch (error) {
    console.error('Erreur lors de la mise à jour de la compétence:', error)
    return NextResponse.json(
      { success: false, error: 'Erreur lors de la mise à jour de la compétence' },
      { status: 500 }
    )
  }
}

// DELETE - Supprimer une compétence ou toutes les compétences
export async function DELETE(request) {
  try {
    const supabase = await createClient()
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    
    if (id) {
      // Supprimer une compétence spécifique
      const { error } = await supabase
        .from('competences')
        .delete()
        .eq('id', id)

      if (error) throw error

      return NextResponse.json({ 
        success: true, 
        message: 'Compétence supprimée avec succès'
      })
    } else {
      // Supprimer toutes les compétences
      const { error } = await supabase
        .from('competences')
        .delete()
        .neq('id', 0) // Supprime toutes les entrées

      if (error) throw error

      return NextResponse.json({ 
        success: true, 
        message: 'Toutes les compétences ont été supprimées'
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