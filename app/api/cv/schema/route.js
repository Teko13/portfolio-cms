import { NextResponse } from 'next/server'

// Colonnes techniques masquées dans le constructeur de variables
const HIDDEN_COLUMNS = new Set(['id'])

// GET - Retourne les tables du portfolio et leurs colonnes (sans les données)
export async function GET() {
  try {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY

    const res = await fetch(`${url}/rest/v1/`, {
      headers: { apikey: key, Authorization: `Bearer ${key}` },
      cache: 'no-store',
    })

    if (!res.ok) {
      return NextResponse.json({ success: false, error: 'Schéma indisponible' }, { status: 500 })
    }

    const spec = await res.json()
    const defs = spec.definitions || {}

    const tables = Object.entries(defs).map(([name, def]) => {
      const props = def.properties || {}
      const columns = Object.entries(props)
        .filter(([col]) => !HIDDEN_COLUMNS.has(col))
        .map(([col, meta]) => ({
          name: col,
          type: (meta.format || meta.type || 'text'),
        }))
      return { name, columns }
    })

    return NextResponse.json({ success: true, tables })
  } catch (error) {
    console.error('Erreur schema:', error)
    return NextResponse.json({ success: false, error: 'Erreur serveur' }, { status: 500 })
  }
}
