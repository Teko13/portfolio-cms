import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'

export async function middleware(request) {
  // Vérifier si c'est une route API
  if (!request.nextUrl.pathname.startsWith('/api/')) {
    return NextResponse.next()
  }

  // Autoriser toutes les requêtes GET (lecture publique)
  if (request.method === 'GET') {
    return NextResponse.next()
  }

  // Exclure les routes d'authentification
  const authRoutes = ['/api/auth/login', '/api/auth/logout', '/api/auth/user']
  if (authRoutes.includes(request.nextUrl.pathname)) {
    return NextResponse.next()
  }

  try {
    // Créer le client Supabase avec les cookies
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll()
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          },
        },
      }
    )

    // Vérifier l'authentification
    const { data: { user }, error } = await supabase.auth.getUser()

    if (error || !user) {
      return NextResponse.json(
        { success: false, error: 'Non autorisé - Token invalide ou expiré' },
        { status: 401 }
      )
    }

    // Ajouter l'utilisateur à la requête pour utilisation dans les routes
    const requestHeaders = new Headers(request.headers)
    requestHeaders.set('x-user-id', user.id)
    requestHeaders.set('x-user-email', user.email)

    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    })

  } catch (error) {
    console.error('Erreur middleware d\'authentification:', error)
    return NextResponse.json(
      { success: false, error: 'Erreur d\'authentification' },
      { status: 500 }
    )
  }
}

export const config = {
  matcher: [
    '/api/:path*',
  ],
}
