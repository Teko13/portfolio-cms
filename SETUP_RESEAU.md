# Configuration de la table Réseau

## 🚨 Erreur actuelle
```
Could not find the table 'public.reseau' in the schema cache
```

## ✅ Solution

### 1. Accéder à Supabase
1. Allez sur [supabase.com](https://supabase.com)
2. Connectez-vous à votre compte
3. Sélectionnez votre projet

### 2. Ouvrir l'éditeur SQL
1. Dans le menu de gauche, cliquez sur **"SQL Editor"**
2. Cliquez sur **"New query"**

### 3. Exécuter le script
Copiez et collez le contenu du fichier `reseau-setup.sql` :

```sql
-- Création de la table réseau
CREATE TABLE IF NOT EXISTS reseau (
    id BIGSERIAL PRIMARY KEY,
    nom VARCHAR NOT NULL,
    url TEXT NOT NULL,
    icon_url TEXT
);

-- Ajout de commentaires pour documenter la table
COMMENT ON TABLE reseau IS 'Table pour stocker les éléments du réseau social/professionnel';
COMMENT ON COLUMN reseau.id IS 'Identifiant unique de l''élément';
COMMENT ON COLUMN reseau.nom IS 'Nom de l''élément (ex: LinkedIn, GitHub, Twitter)';
COMMENT ON COLUMN reseau.url IS 'Lien associé à l''élément';
COMMENT ON COLUMN reseau.icon_url IS 'Lien vers l''icône de l''élément (optionnel)';

-- Politique RLS pour permettre l'accès complet (à ajuster selon vos besoins)
ALTER TABLE reseau ENABLE ROW LEVEL SECURITY;

-- Politique pour permettre toutes les opérations (pour le service role)
CREATE POLICY "Allow all operations for service role" ON reseau
    FOR ALL
    USING (true)
    WITH CHECK (true);

-- Politique pour permettre la lecture publique (optionnel)
CREATE POLICY "Allow public read access" ON reseau
    FOR SELECT
    USING (true);

-- Index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_reseau_nom ON reseau(nom);
CREATE INDEX IF NOT EXISTS idx_reseau_url ON reseau(url);
```

### 4. Exécuter le script
1. Cliquez sur le bouton **"Run"** (ou appuyez sur Ctrl+Enter)
2. Vérifiez que le message de succès s'affiche

### 5. Vérifier la création
1. Allez dans **"Table Editor"** dans le menu de gauche
2. Vous devriez voir la table **"reseau"** dans la liste
3. Cliquez dessus pour voir sa structure

## 🧪 Test après configuration

Une fois la table créée, testez l'API :

```bash
# Test de récupération
curl -X GET http://localhost:3000/api/portfolio/reseau

# Test d'ajout
curl -X POST http://localhost:3000/api/portfolio/reseau \
  -H "Content-Type: application/json" \
  -d '{"nom":"LinkedIn","url":"https://linkedin.com/in/example"}'
```

## ✅ Résultat attendu

Après la création de la table, vous devriez obtenir :
- **GET** : `{"success":true,"data":[]}`
- **POST** : `{"success":true,"data":{"id":1,"nom":"LinkedIn",...}}`

## 🎯 Prochaines étapes

1. **Exécutez** le script SQL dans Supabase
2. **Testez** l'API avec les commandes curl ci-dessus
3. **Accédez** à `http://localhost:3000/dashboard/portfolio`
4. **Ouvrez** la section "Réseau"
5. **Ajoutez** vos premiers éléments réseau !

La section Réseau sera alors complètement opérationnelle ! 🎉
