-- Création de la table réseau
CREATE TABLE IF NOT EXISTS reseaux (
    id BIGSERIAL PRIMARY KEY,
    nom VARCHAR NOT NULL,
    url TEXT NOT NULL,
    icon_url TEXT NULL
);

-- Ajout de commentaires pour documenter la table
COMMENT ON TABLE reseaux IS 'Table pour stocker les éléments du réseau social/professionnel';
COMMENT ON COLUMN reseaux.id IS 'Identifiant unique de l''élément';
COMMENT ON COLUMN reseaux.nom IS 'Nom de l''élément (ex: LinkedIn, GitHub, Twitter)';
COMMENT ON COLUMN reseaux.url IS 'Lien associé à l''élément';
COMMENT ON COLUMN reseaux.icon_url IS 'Lien vers l''icône de l''élément (optionnel)';

-- Politique RLS pour permettre l'accès complet (à ajuster selon vos besoins)
ALTER TABLE reseaux ENABLE ROW LEVEL SECURITY;

-- Politique pour permettre toutes les opérations (pour le service role)
CREATE POLICY "Allow all operations for service role" ON reseaux
    FOR ALL
    USING (true)
    WITH CHECK (true);

-- Politique pour permettre la lecture publique (optionnel)
CREATE POLICY "Allow public read access" ON reseaux
    FOR SELECT
    USING (true);

-- Index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_reseaux_nom ON reseaux(nom);
CREATE INDEX IF NOT EXISTS idx_reseaux_url ON reseaux(url);

-- Exemple d'insertion de données de test (optionnel)
-- INSERT INTO reseaux (nom, url) VALUES 
--     ('LinkedIn', 'https://linkedin.com/in/example'),
--     ('GitHub', 'https://github.com/example'),
--     ('Twitter', 'https://twitter.com/example');
