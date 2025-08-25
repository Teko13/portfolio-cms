// Script de test pour vérifier l'accès au storage Supabase
// Exécutez avec: node test-storage.js

import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

// Charger les variables d'environnement
dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

console.log('=== Test de configuration Supabase Storage ===')
console.log('Supabase URL:', supabaseUrl ? '✅' : '❌')
console.log('Service Role Key:', serviceRoleKey ? '✅' : '❌')
console.log('Anon Key:', anonKey ? '✅' : '❌')

if (!supabaseUrl || !serviceRoleKey) {
  console.error('❌ Variables d\'environnement manquantes')
  process.exit(1)
}

async function testStorage() {
  try {
    // Créer le client avec le service role key
    const supabase = createClient(supabaseUrl, serviceRoleKey)
    
    console.log('\n=== Test 1: Vérification du bucket ===')
    
    // Lister les buckets
    const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets()
    
    if (bucketsError) {
      console.error('❌ Erreur lors de la récupération des buckets:', bucketsError)
      return
    }
    
    console.log('Buckets disponibles:', buckets.map(b => b.name))
    
    const mediasBucket = buckets.find(b => b.name === 'medias')
    if (mediasBucket) {
      console.log('✅ Bucket "medias" trouvé')
      console.log('   - Public:', mediasBucket.public)
      console.log('   - ID:', mediasBucket.id)
    } else {
      console.log('❌ Bucket "medias" non trouvé')
      
      // Essayer de créer le bucket
      console.log('\n=== Tentative de création du bucket ===')
      const { data: newBucket, error: createError } = await supabase.storage.createBucket('medias', {
        public: true
      })
      
      if (createError) {
        console.error('❌ Erreur lors de la création du bucket:', createError)
      } else {
        console.log('✅ Bucket "medias" créé avec succès')
      }
    }
    
    console.log('\n=== Test 2: Test d\'upload ===')
    
    // Créer un fichier de test
    const testContent = 'Test file content'
    const testFile = new Blob([testContent], { type: 'text/plain' })
    const testFileName = `test_${Date.now()}.txt`
    
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('medias')
      .upload(testFileName, testFile, {
        cacheControl: '3600',
        upsert: false
      })
    
    if (uploadError) {
      console.error('❌ Erreur lors de l\'upload:', uploadError)
    } else {
      console.log('✅ Upload réussi:', uploadData)
      
      // Obtenir l'URL publique
      const { data: urlData } = supabase.storage
        .from('medias')
        .getPublicUrl(testFileName)
      
      console.log('✅ URL publique:', urlData.publicUrl)
      
      // Supprimer le fichier de test
      const { error: deleteError } = await supabase.storage
        .from('medias')
        .remove([testFileName])
      
      if (deleteError) {
        console.error('⚠️ Erreur lors de la suppression du fichier de test:', deleteError)
      } else {
        console.log('✅ Fichier de test supprimé')
      }
    }
    
  } catch (error) {
    console.error('❌ Erreur générale:', error)
  }
}

testStorage() 