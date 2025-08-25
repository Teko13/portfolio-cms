# Configuration Supabase Storage pour l'upload d'images

## Problème actuel

L'erreur 500 lors de l'upload d'images est causée par une violation de la politique RLS (Row Level Security) sur le bucket "medias" de Supabase Storage.

## Solutions

### Solution 1 : Configuration RLS (Recommandée)

#### 1. Accéder à l'éditeur SQL de Supabase

1. Connectez-vous à votre dashboard Supabase
2. Allez dans la section "SQL Editor"
3. Créez un nouveau script

#### 2. Exécuter le script de configuration

Copiez et exécutez le contenu du fichier `supabase-setup-fix.sql` :

```sql
-- Configuration corrigée pour Supabase Storage

-- 1. Vérifier que le bucket "medias" existe et est public
INSERT INTO storage.buckets (id, name, public)
VALUES ('medias', 'medias', true)
ON CONFLICT (id) DO UPDATE SET
  public = true,
  name = 'medias';

-- 2. Supprimer les anciennes politiques si elles existent
DROP POLICY IF EXISTS "Allow authenticated users to upload files" ON storage.objects;
DROP POLICY IF EXISTS "Allow public read access to medias bucket" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated users to update files" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated users to delete files" ON storage.objects;
DROP POLICY IF EXISTS "Allow all operations on medias bucket" ON storage.objects;

-- 3. Activer RLS sur storage.objects
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- 4. Créer une politique permissive pour le bucket "medias"
CREATE POLICY "Allow all operations on medias bucket" ON storage.objects
FOR ALL USING (
  bucket_id = 'medias'
);
```

### Solution 2 : Utilisation du Service Role Key (Alternative)

Si la solution 1 ne fonctionne pas, vous pouvez utiliser le Service Role Key :

#### 1. Récupérer le Service Role Key

1. Dans votre dashboard Supabase, allez dans "Settings" → "API"
2. Copiez la "service_role" key (attention : gardez-la secrète !)

#### 2. Ajouter la variable d'environnement

Ajoutez dans votre fichier `.env.local` :

```env
SUPABASE_SERVICE_ROLE_KEY=votre_service_role_key_ici
```

#### 3. L'API d'upload utilisera automatiquement cette clé

### Solution 3 : Configuration manuelle dans l'interface

#### 1. Aller dans Storage

1. Dashboard Supabase → Storage
2. Vérifiez que le bucket "medias" existe et est public

#### 2. Configurer les politiques RLS

1. Cliquez sur le bucket "medias"
2. Allez dans l'onglet "Policies"
3. Cliquez sur "New Policy"
4. Choisissez "Create a policy from scratch"
5. Configurez :
   - **Policy Name** : `Allow all operations on medias bucket`
   - **Allowed operation** : `ALL`
   - **Using expression** : `bucket_id = 'medias'`
6. Cliquez sur "Review" puis "Save policy"

## Vérification

### 1. Vérifier le bucket

```sql
SELECT * FROM storage.buckets WHERE id = 'medias';
```

### 2. Vérifier les politiques

```sql
SELECT * FROM pg_policies WHERE tablename = 'objects' AND schemaname = 'storage';
```

### 3. Test de l'upload

Une fois configuré, testez l'upload d'images dans votre application.

## Dépannage

### Erreur persistante après configuration RLS

1. **Vérifiez que vous êtes connecté** dans l'application
2. **Redémarrez le serveur** : `npm run dev`
3. **Vérifiez les variables d'environnement** Supabase
4. **Essayez la Solution 2** avec le Service Role Key

### Erreur "bucket does not exist"

1. Créez le bucket manuellement dans l'interface Storage
2. Ou exécutez le script SQL pour le créer

### Erreur de permissions

1. Vérifiez que RLS est activé sur `storage.objects`
2. Vérifiez que les politiques sont bien créées
3. Essayez la politique permissive : `FOR ALL USING (bucket_id = 'medias')`

## Notes importantes

- Le bucket "medias" doit être public pour permettre l'accès aux images
- Les politiques RLS sont nécessaires même pour un bucket public
- Le Service Role Key contourne RLS mais doit être gardé secret
- Redémarrez toujours le serveur après modification des variables d'environnement
