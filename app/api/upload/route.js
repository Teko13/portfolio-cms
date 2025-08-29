import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

export async function POST(request) {
  try {
    // Vérifier que les variables d'environnement sont disponibles
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    
    console.log('Supabase URL:', supabaseUrl ? '✅' : '❌')
    console.log('Service Role Key:', serviceRoleKey ? '✅' : '❌')
    console.log('Anon Key:', anonKey ? '✅' : '❌')
    
    if (!supabaseUrl) {
      return NextResponse.json(
        { success: false, error: 'NEXT_PUBLIC_SUPABASE_URL non configurée' },
        { status: 500 }
      )
    }
    
    if (!serviceRoleKey) {
      return NextResponse.json(
        { success: false, error: 'SUPABASE_SERVICE_ROLE_KEY non configurée' },
        { status: 500 }
      )
    }
    
    const formData = await request.formData()
    const file = formData.get('file')

    if (!file) {
      return NextResponse.json(
        { success: false, error: 'Aucun fichier fourni' },
        { status: 400 }
      )
    }

    // Vérifier le type de fichier
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml']
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { success: false, error: 'Type de fichier non autorisé. Utilisez JPEG, PNG, GIF, WebP ou SVG.' },
        { status: 400 }
      )
    }

    // Vérifier la taille du fichier (max 5MB)
    const maxSize = 5 * 1024 * 1024 // 5MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { success: false, error: 'Fichier trop volumineux. Taille maximale : 5MB.' },
        { status: 400 }
      )
    }

    // Générer un nom de fichier unique
    const timestamp = Date.now()
    const randomString = Math.random().toString(36).substring(2, 15)
    const fileExtension = file.name.split('.').pop()
    const fileName = `projet_${timestamp}_${randomString}.${fileExtension}`

    // Essayer d'abord avec le client Supabase
    try {
      const supabase = createClient(supabaseUrl, serviceRoleKey)
      
      const { data, error } = await supabase.storage
        .from('medias')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false
        })

      if (error) {
        console.error('Erreur client Supabase:', error)
        throw error
      }

      // Obtenir l'URL publique
      const { data: urlData } = supabase.storage
        .from('medias')
        .getPublicUrl(fileName)

      return NextResponse.json({
        success: true,
        data: {
          url: urlData.publicUrl,
          fileName: fileName
        },
        message: 'Image uploadée avec succès'
      })

    } catch (clientError) {
      console.error('Erreur avec le client Supabase:', clientError)
      
      // Si le client échoue, essayer avec l'API REST directe
      try {
        console.log('Tentative avec l\'API REST directe...')
        
        // Convertir le fichier en buffer
        const arrayBuffer = await file.arrayBuffer()
        const buffer = Buffer.from(arrayBuffer)
        
        // Upload via l'API REST de Supabase
        const uploadUrl = `${supabaseUrl}/storage/v1/object/medias/${fileName}`
        
        const uploadResponse = await fetch(uploadUrl, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${serviceRoleKey}`,
            'Content-Type': file.type,
            'Content-Length': buffer.length.toString()
          },
          body: buffer
        })

        if (!uploadResponse.ok) {
          const errorText = await uploadResponse.text()
          console.error('Erreur API REST:', uploadResponse.status, errorText)
          throw new Error(`API REST error: ${uploadResponse.status} - ${errorText}`)
        }

        // Construire l'URL publique
        const publicUrl = `${supabaseUrl}/storage/v1/object/public/medias/${fileName}`

        return NextResponse.json({
          success: true,
          data: {
            url: publicUrl,
            fileName: fileName
          },
          message: 'Image uploadée avec succès (via API REST)'
        })

      } catch (restError) {
        console.error('Erreur API REST:', restError)
        
        return NextResponse.json(
          { 
            success: false, 
            error: 'Erreur lors de l\'upload. Vérifiez la configuration Supabase et les politiques RLS.' 
          },
          { status: 500 }
        )
      }
    }

  } catch (error) {
    console.error('Erreur générale lors de l\'upload:', error)
    return NextResponse.json(
      { success: false, error: 'Erreur lors de l\'upload du fichier' },
      { status: 500 }
    )
  }
} 