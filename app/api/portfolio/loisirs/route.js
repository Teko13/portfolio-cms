import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'
import { withCors, handleOptions } from '@/utils/cors'

// OPTIONS - Gérer les requêtes preflight CORS
export async function OPTIONS() {
  return handleOptions()
}

// GET - Récupérer tous les loisirs
export async function GET() {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    )
    
    const { data, error } = await supabase
      .from('loisires')
      .select('*')
      .order('id', { ascending: true })

    if (error) throw error

    const response = NextResponse.json({ 
      success: true, 
      data: data || [] 
    })
    return withCors(response)
  } catch (error) {
    console.error('Erreur lors de la récupération des loisirs:', error)
    const response = NextResponse.json(
      { success: false, error: 'Erreur lors de la récupération des loisirs' },
      { status: 500 }
    )
    return withCors(response)
  }
}

// POST - Créer un nouveau loisir
export async function POST(request) {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    )
    const body = await request.json()
    
    console.log('Données reçues pour le loisir:', body)
    
    if (!body.description || !body.description.trim()) {
      return NextResponse.json(
        { success: false, error: 'La description est requise' },
        { status: 400 }
      )
    }
    
    const { data, error } = await supabase
      .from('loisires')
      .insert({ description: body.description.trim() })
      .select()
      .single()

    if (error) {
      console.error('Erreur lors de la création du loisir:', error)
      return NextResponse.json(
        { success: false, error: `Erreur lors de la création du loisir: ${error.message}` },
        { status: 500 }
      )
    }

    return NextResponse.json({ 
      success: true, 
      data: data,
      message: 'Loisir ajouté avec succès'
    })
  } catch (error) {
    console.error('Erreur lors de la création du loisir:', error)
    return NextResponse.json(
      { success: false, error: 'Erreur lors de la création du loisir' },
      { status: 500 }
    )
  }
}

// PUT - Modifier un loisir
export async function PUT(request) {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    )
    const body = await request.json()
    
    console.log('Données de modification reçues:', body)
    
    if (!body.description || !body.description.trim()) {
      return NextResponse.json(
        { success: false, error: 'La description est requise' },
        { status: 400 }
      )
    }
    
    const { data, error } = await supabase
      .from('loisires')
      .update({ description: body.description.trim() })
      .eq('id', body.id)
      .select()
      .single()

    if (error) {
      console.error('Erreur lors de la modification du loisir:', error)
      return NextResponse.json(
        { success: false, error: `Erreur lors de la modification du loisir: ${error.message}` },
        { status: 500 }
      )
    }

    return NextResponse.json({ 
      success: true, 
      data: data,
      message: 'Loisir modifié avec succès'
    })
  } catch (error) {
    console.error('Erreur lors de la modification du loisir:', error)
    return NextResponse.json(
      { success: false, error: 'Erreur lors de la modification du loisir' },
      { status: 500 }
    )
  }
}

// DELETE - Supprimer un loisir ou tous les loisirs
export async function DELETE(request) {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    )
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    
    if (id) {
      // Supprimer un loisir spécifique
      const { error } = await supabase
        .from('loisires')
        .delete()
        .eq('id', id)

      if (error) throw error

      return NextResponse.json({ 
        success: true, 
        message: 'Loisir supprimé avec succès'
      })
    } else {
      // Supprimer tous les loisirs
      const { error } = await supabase
        .from('loisires')
        .delete()
        .neq('id', 0) // Supprime toutes les entrées

      if (error) throw error

      return NextResponse.json({ 
        success: true, 
        message: 'Tous les loisirs ont été supprimés'
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
