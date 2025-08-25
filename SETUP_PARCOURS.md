# Guide de Configuration - Section Parcours

## 🚀 Configuration initiale

### 1. Création de la table dans Supabase

Exécutez le script SQL suivant dans l'éditeur SQL de Supabase :

```sql
-- Script de configuration pour la table parcours
-- À exécuter dans l'éditeur SQL de Supabase

-- Création de la table parcours
CREATE TABLE IF NOT EXISTS parcours (
    id BIGSERIAL PRIMARY KEY,
    obtenu_en TIMESTAMP WITH TIME ZONE NOT NULL,
    titre VARCHAR NOT NULL,
    ecole VARCHAR NOT NULL,
    diplome_pdf_url TEXT NULL -- Optionnel, peut être NULL
);

-- Ajout de commentaires pour documenter la table
COMMENT ON TABLE parcours IS 'Table pour stocker les parcours de formation et diplômes';
COMMENT ON COLUMN parcours.id IS 'Identifiant unique du parcours';
COMMENT ON COLUMN parcours.obtenu_en IS 'Date d''obtention du diplôme ou certification';
COMMENT ON COLUMN parcours.titre IS 'Titre ou nom du parcours (formation, diplôme, etc.)';
COMMENT ON COLUMN parcours.ecole IS 'Établissement ou organisme de formation';
COMMENT ON COLUMN parcours.diplome_pdf_url IS 'Lien vers le diplôme ou certificat en PDF (optionnel)';

-- Politique RLS pour permettre l'accès complet (à ajuster selon vos besoins)
ALTER TABLE parcours ENABLE ROW LEVEL SECURITY;

-- Politique pour permettre toutes les opérations (pour le service role)
CREATE POLICY "Allow all operations for service role" ON parcours
    FOR ALL
    USING (true)
    WITH CHECK (true);

-- Politique pour permettre la lecture publique (optionnel)
CREATE POLICY "Allow public read access" ON parcours
    FOR SELECT
    USING (true);

-- Index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_parcours_obtenu_en ON parcours(obtenu_en DESC);
CREATE INDEX IF NOT EXISTS idx_parcours_titre ON parcours(titre);
CREATE INDEX IF NOT EXISTS idx_parcours_ecole ON parcours(ecole);
```

### 2. Configuration du bucket de stockage

#### Créer le bucket `docs`

1. Allez dans **Storage** dans votre dashboard Supabase
2. Cliquez sur **"New bucket"**
3. Nommez le bucket : `docs`
4. Cochez **"Public bucket"** pour permettre l'accès public aux PDF
5. Cliquez sur **"Create bucket"**

#### Configurer les politiques RLS pour le bucket

Exécutez ce script SQL pour configurer les politiques du bucket :

```sql
-- Politiques RLS pour le bucket 'docs'

-- Politique pour permettre l'upload de fichiers (pour le service role)
CREATE POLICY "Allow upload for service role" ON storage.objects
    FOR INSERT
    WITH CHECK (
        bucket_id = 'docs' AND
        (auth.role() = 'service_role')
    );

-- Politique pour permettre la lecture publique des fichiers
CREATE POLICY "Allow public read access" ON storage.objects
    FOR SELECT
    USING (bucket_id = 'docs');

-- Politique pour permettre la suppression de fichiers (pour le service role)
CREATE POLICY "Allow delete for service role" ON storage.objects
    FOR DELETE
    USING (
        bucket_id = 'docs' AND
        (auth.role() = 'service_role')
    );
```

### 3. Vérification des variables d'environnement

Assurez-vous que votre fichier `.env.local` contient :

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

## 🧪 Tests de configuration

### Test 1 : Vérification de la table

Exécutez cette requête dans l'éditeur SQL :

```sql
SELECT * FROM parcours LIMIT 5;
```

Vous devriez voir une table vide (aucun résultat).

### Test 2 : Test d'insertion

```sql
INSERT INTO parcours (titre, ecole, obtenu_en)
VALUES ('Test Formation', 'Test École', '2023-01-01');
```

Puis vérifiez :

```sql
SELECT * FROM parcours;
```

### Test 3 : Test du bucket

Dans l'interface Storage de Supabase :

1. Allez dans le bucket `docs`
2. Essayez d'uploader un fichier PDF de test
3. Vérifiez que le fichier apparaît dans la liste

## 🔧 Fonctionnalités implémentées

### APIs créées

1. **`/api/portfolio/parcours`** - CRUD complet pour les parcours
2. **`/api/upload/pdf`** - Upload de PDF vers le bucket `docs`
3. **`/api/upload/pdf/delete`** - Suppression de PDF du bucket

### Composants créés

1. **`ParcoursSection.js`** - Interface principale de la section
2. **`ParcoursCard`** - Affichage des cartes de parcours

### Fonctionnalités

- ✅ Ajout/modification/suppression de parcours
- ✅ Upload de PDF avec validation (type et taille)
- ✅ Suppression automatique des PDF lors de la suppression de parcours
- ✅ Interface responsive avec design cohérent
- ✅ Gestion des erreurs et feedback utilisateur
- ✅ Tri par date d'obtention (plus récent en premier)

## 🎯 Utilisation

### Ajouter un parcours

1. Cliquez sur la section **"Parcours"** pour l'ouvrir
2. Remplissez le formulaire :
   - **Titre** : Nom de la formation/diplôme
   - **École** : Établissement de formation
   - **Date d'obtention** : Date de fin de formation
   - **PDF** : Optionnel, cliquez pour uploader un PDF
3. Cliquez sur **"Ajouter"**

### Modifier un parcours

1. Cliquez sur l'icône **modifier** (crayon vert) sur une carte
2. Les données se chargent dans le formulaire
3. Modifiez les champs souhaités
4. Cliquez sur **"Modifier"**

### Supprimer un parcours

1. Cliquez sur l'icône **supprimer** (X rouge) sur une carte
2. Confirmez la suppression
3. Le parcours et son PDF (si présent) sont supprimés

## 🔍 Dépannage

### Erreur "Could not find the table"

**Cause** : La table `parcours` n'existe pas
**Solution** : Exécuter le script SQL de création de table

### Erreur "Erreur de permissions"

**Cause** : Problème avec les politiques RLS
**Solution** : Vérifier les politiques RLS et le Service Role Key

### Erreur "PDF trop volumineux"

**Cause** : Fichier PDF > 10MB
**Solution** : Réduire la taille du PDF ou utiliser un autre fichier

### Erreur "Type de fichier non autorisé"

**Cause** : Fichier non-PDF uploadé
**Solution** : Utiliser uniquement des fichiers PDF

## 📋 Checklist finale

- [ ] Table `parcours` créée dans Supabase
- [ ] Bucket `docs` créé et configuré
- [ ] Politiques RLS configurées
- [ ] Variables d'environnement vérifiées
- [ ] APIs testées (GET, POST, PUT, DELETE)
- [ ] Upload de PDF testé
- [ ] Interface utilisateur fonctionnelle
- [ ] Suppression automatique des PDF testée

## 🎉 Félicitations !

La section **Parcours** est maintenant complètement configurée et fonctionnelle. Vous pouvez commencer à ajouter vos formations, diplômes et certifications avec leurs PDF associés !
