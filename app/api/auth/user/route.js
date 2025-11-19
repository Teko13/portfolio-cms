import { createClient } from '@/utils/supabase/server'
import { NextResponse } from 'next/server'
import { withCors, handleOptions } from '@/utils/cors'

// OPTIONS - Gérer les requêtes preflight CORS
export async function OPTIONS() {
  return handleOptions()
}

export async function GET() {
  try {
    const supabase = await createClient()
    
    const { data: { user }, error } = await supabase.auth.getUser()

    if (error) {
      const response = NextResponse.json(
        { error: error.message },
        { status: 401 }
      )
      return withCors(response)
    }

    if (!user) {
      const response = NextResponse.json(
        { error: 'Utilisateur non connecté' },
        { status: 401 }
      )
      return withCors(response)
    }

    const response = NextResponse.json(
      { user },
      { status: 200 }
    )
    return withCors(response)
  } catch (error) {
    const response = NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    )
    return withCors(response)
  }
} 