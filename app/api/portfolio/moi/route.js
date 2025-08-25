import { createClient } from '@/utils/supabase/server'
import { NextResponse } from 'next/server'

// GET - Récupérer les données de la table "moi"
export async function GET() {
  try {
    const supabase = await createClient()
    
    const { data, error } = await supabase
      .from('moi')
      .select('*')
      .limit(1)
      .single()

    if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
      throw error
    }

    return NextResponse.json({ 
      success: true, 
      data: data || null 
    })
  } catch (error) {
    console.error('Erreur lors de la récupération des données:', error)
    return NextResponse.json(
      { success: false, error: 'Erreur lors de la récupération des données' },
      { status: 500 }
    )
  }
}

// POST - Créer ou mettre à jour les données de la table "moi"
export async function POST(request) {
  try {
    const supabase = await createClient()
    const body = await request.json()
    
    // Vérifier si une entrée existe déjà
    const { data: existingData } = await supabase
      .from('moi')
      .select('id')
      .limit(1)
      .single()

    let result

    if (existingData) {
      // Mise à jour si une entrée existe
      const { data, error } = await supabase
        .from('moi')
        .update({
          nom: body.nom,
          prenom: body.prenom,
          date_naissance: body.date_naissance,
          resume: body.resume,
          ma_photo_url: body.ma_photo_url,
          email: body.email,
          telephone: body.telephone,
          titre: body.titre,
          cv_url: body.cv_url
        })
        .eq('id', existingData.id)
        .select()
        .single()

      if (error) throw error
      result = data
    } else {
      // Insertion si aucune entrée n'existe
      const { data, error } = await supabase
        .from('moi')
        .insert({
          nom: body.nom,
          prenom: body.prenom,
          date_naissance: body.date_naissance,
          resume: body.resume,
          ma_photo_url: body.ma_photo_url,
          email: body.email,
          telephone: body.telephone,
          titre: body.titre,
          cv_url: body.cv_url
        })
        .select()
        .single()

      if (error) throw error
      result = data
    }

    return NextResponse.json({ 
      success: true, 
      data: result,
      message: existingData ? 'Données mises à jour avec succès' : 'Données créées avec succès'
    })
  } catch (error) {
    console.error('Erreur lors de la sauvegarde des données:', error)
    return NextResponse.json(
      { success: false, error: 'Erreur lors de la sauvegarde des données' },
      { status: 500 }
    )
  }
} 