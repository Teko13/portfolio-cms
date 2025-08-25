-- Création de la table réseau
CREATE TABLE IF NOT EXISTS ta_table (
    id BIGSERIAL PRIMARY KEY,
    nom VARCHAR NOT NULL,
    url TEXT NOT NULL,
    icon_url TEXT
);

-- Ajout de commentaires pour documenter la table
COMMENT ON TABLE ta_table IS 'Table pour stocker les éléments du réseau social/professionnel';
COMMENT ON COLUMN ta_table.id IS 'Identifiant unique de l''élément';
COMMENT ON COLUMN ta_table.nom IS 'Nom de l''élément (ex: LinkedIn, GitHub, Twitter)';
COMMENT ON COLUMN ta_table.url IS 'Lien associé à l''élément';
COMMENT ON COLUMN ta_table.icon_url IS 'Lien vers l''icône de l''élément (optionnel)';

-- Politique RLS pour permettre l'accès complet (à ajuster selon vos besoins)
ALTER TABLE ta_table ENABLE ROW LEVEL SECURITY;

-- Politique pour permettre toutes les opérations (pour le service role)
CREATE POLICY "Allow all operations for service role" ON ta_table
    FOR ALL
    USING (true)
    WITH CHECK (true);

-- Politique pour permettre la lecture publique (optionnel)
CREATE POLICY "Allow public read access" ON ta_table
    FOR SELECT
    USING (true);

-- Index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_ta_table_nom ON ta_table(nom);
CREATE INDEX IF NOT EXISTS idx_ta_table_url ON ta_table(url);

-- Exemple d'insertion de données de test (optionnel)
-- INSERT INTO ta_table (nom, url) VALUES 
--     ('LinkedIn', 'https://linkedin.com/in/example'),
--     ('GitHub', 'https://github.com/example'),
--     ('Twitter', 'https://twitter.com/example');
