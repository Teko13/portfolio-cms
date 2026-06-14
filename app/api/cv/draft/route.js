import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

function admin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  )
}

// GET - Récupère le brouillon du CV
export async function GET() {
  try {
    const supabase = admin()
    const { data } = await supabase
      .from('cv_brouillon')
      .select('contenu, maj_le')
      .eq('id', 1)
      .single()

    return NextResponse.json({ success: true, html: data?.contenu || null, maj_le: data?.maj_le || null })
  } catch (error) {
    console.error('Erreur GET draft:', error)
    return NextResponse.json({ success: false, error: 'Erreur serveur' }, { status: 500 })
  }
}

// POST - Enregistre le brouillon du CV (sauvegarde manuelle, sans PDF)
export async function POST(request) {
  try {
    const { html } = await request.json()
    const supabase = admin()

    const { error } = await supabase
      .from('cv_brouillon')
      .update({ contenu: html ?? '', maj_le: new Date().toISOString() })
      .eq('id', 1)

    if (error) {
      console.error('Erreur sauvegarde brouillon:', error)
      return NextResponse.json({ success: false, error: 'Erreur sauvegarde' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Erreur POST draft:', error)
    return NextResponse.json({ success: false, error: 'Erreur serveur' }, { status: 500 })
  }
}
