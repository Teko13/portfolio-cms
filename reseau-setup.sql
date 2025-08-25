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

-- Exemple d'insertion de données de test (optionnel)
-- INSERT INTO reseau (nom, url) VALUES 
--     ('LinkedIn', 'https://linkedin.com/in/example'),
--     ('GitHub', 'https://github.com/example'),
--     ('Twitter', 'https://twitter.com/example');
