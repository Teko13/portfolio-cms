// Script de test simplifié pour vérifier l'accès au storage Supabase
// Exécutez avec: node test-storage-simple.js

import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'

// Charger les variables d'environnement manuellement
function loadEnv() {
  try {
    const envContent = readFileSync('.env.local', 'utf8')
    const env = {}
    
    envContent.split('\n').forEach(line => {
      const [key, ...valueParts] = line.split('=')
      if (key && valueParts.length > 0) {
        env[key.trim()] = valueParts.join('=').trim()
      }
    })
    
    return env
  } catch (error) {
    console.error('Erreur lors du chargement de .env.local:', error.message)
    return {}
  }
}

const env = loadEnv()
const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL
const serviceRoleKey = env.SUPABASE_SERVICE_ROLE_KEY
const anonKey = env.NEXT_PUBLIC_SUPABASE_ANON_KEY

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