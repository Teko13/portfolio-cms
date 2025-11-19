import { NextResponse } from 'next/server'

/**
 * Headers CORS pour permettre l'accès à l'API depuis n'importe quelle origine
 */
export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
  'Access-Control-Max-Age': '86400', // 24 heures
}

/**
 * Créer une réponse avec les headers CORS
 */
export function withCors(response) {
  const headers = new Headers(response.headers)
  Object.entries(corsHeaders).forEach(([key, value]) => {
    headers.set(key, value)
  })
  return new NextResponse(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  })
}

/**
 * Gérer les requêtes OPTIONS (preflight CORS)
 */
export function handleOptions() {
  return new NextResponse(null, {
    status: 200,
    headers: corsHeaders,
  })
}

