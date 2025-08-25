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

-- Exemple d'insertion de données de test (optionnel)
-- INSERT INTO parcours (titre, ecole, obtenu_en) VALUES 
--     ('Master en Informatique', 'Université Paris-Saclay', '2023-06-15'),
--     ('Certification AWS Solutions Architect', 'Amazon Web Services', '2023-03-20'),
--     ('Formation React.js', 'OpenClassrooms', '2022-11-10');
