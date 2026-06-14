import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { resolveDef } from '@/utils/cvResolve'

// POST - Résout une définition de variable en HTML avec les vraies données
export async function POST(request) {
  try {
    const { def } = await request.json()
    if (!def) return NextResponse.json({ error: 'Définition manquante' }, { status: 400 })

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    )

    const html = await resolveDef(def, supabase)
    return NextResponse.json({ success: true, html })
  } catch (error) {
    console.error('Erreur resolve:', error)
    return NextResponse.json({ success: false, error: 'Erreur serveur' }, { status: 500 })
  }
}
