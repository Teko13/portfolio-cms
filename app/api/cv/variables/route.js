import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

function admin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  )
}

// GET - Liste toutes les variables enregistrées
export async function GET() {
  try {
    const supabase = admin()
    const { data, error } = await supabase
      .from('cv_variables')
      .select('definition, maj_le')
      .order('maj_le', { ascending: true })

    if (error) throw error
    const variables = (data || []).map((r) => r.definition)
    return NextResponse.json({ success: true, variables })
  } catch (error) {
    console.error('Erreur GET variables:', error)
    return NextResponse.json({ success: false, error: 'Erreur serveur' }, { status: 500 })
  }
}

// POST - Crée ou met à jour une variable
export async function POST(request) {
  try {
    const { def } = await request.json()
    if (!def?.id) return NextResponse.json({ success: false, error: 'Variable invalide' }, { status: 400 })

    const supabase = admin()
    const { error } = await supabase
      .from('cv_variables')
      .upsert({ id: def.id, nom: def.name || '', definition: def, maj_le: new Date().toISOString() })

    if (error) throw error
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Erreur POST variables:', error)
    return NextResponse.json({ success: false, error: 'Erreur serveur' }, { status: 500 })
  }
}

// DELETE - Supprime une variable (?id=...)
export async function DELETE(request) {
  try {
    const id = new URL(request.url).searchParams.get('id')
    if (!id) return NextResponse.json({ success: false, error: 'id manquant' }, { status: 400 })

    const supabase = admin()
    const { error } = await supabase.from('cv_variables').delete().eq('id', id)
    if (error) throw error
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Erreur DELETE variables:', error)
    return NextResponse.json({ success: false, error: 'Erreur serveur' }, { status: 500 })
  }
}
