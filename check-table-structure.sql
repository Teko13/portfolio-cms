-- Script pour vérifier la structure de la table projet
-- Exécutez ce script dans l'éditeur SQL de Supabase

-- Vérifier la structure de la table projet
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default,
    character_maximum_length
FROM information_schema.columns 
WHERE table_name = 'projet' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- Vérifier les contraintes de la table
SELECT 
    tc.constraint_name,
    tc.constraint_type,
    kcu.column_name,
    cc.check_clause
FROM information_schema.table_constraints tc
LEFT JOIN information_schema.key_column_usage kcu 
    ON tc.constraint_name = kcu.constraint_name
LEFT JOIN information_schema.check_constraints cc 
    ON tc.constraint_name = cc.constraint_name
WHERE tc.table_name = 'projet' 
AND tc.table_schema = 'public';

-- Vérifier les triggers sur la table
SELECT 
    trigger_name,
    event_manipulation,
    action_statement
FROM information_schema.triggers 
WHERE event_object_table = 'projet' 
AND event_object_schema = 'public'; 