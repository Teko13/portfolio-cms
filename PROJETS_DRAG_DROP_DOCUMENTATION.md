# Section Projets - Drag & Drop et Gestion de l'Index

## 🎯 Vue d'ensemble

La section **Projets** a été mise à jour pour inclure la gestion de l'ordre d'affichage avec une colonne `index` et un système de drag & drop pour réorganiser facilement les projets.

## 🗂️ Structure de la base de données mise à jour

### Table `projet` - Nouvelle colonne

| Colonne       | Type      | Description                                  |
| ------------- | --------- | -------------------------------------------- |
| `id`          | BIGSERIAL | Identifiant unique du projet                 |
| `cree_le`     | TIMESTAMP | Date de création du projet                   |
| `titre`       | VARCHAR   | Titre du projet                              |
| `description` | TEXT      | Description du projet                        |
| `image_url`   | TEXT      | URL de l'image du projet (optionnel)         |
| `acces_url`   | TEXT      | URL d'accès au projet (optionnel)            |
| `source_url`  | TEXT      | URL du code source (optionnel)               |
| `index`       | INTEGER   | **NOUVEAU** : Ordre d'affichage (1, 2, 3...) |

## 🎨 Nouvelles fonctionnalités

### Affichage de l'index

- **Badge** : Chaque projet affiche son numéro d'ordre dans un badge bleu
- **Format** : `#1`, `#2`, `#3`, etc.
- **Visibilité** : L'index est visible mais non modifiable directement

### Gestion automatique de l'index

- **Nouveau projet** : L'index est automatiquement calculé (nombre de projets + 1)
- **Modification** : L'index reste inchangé lors de la modification
- **Suppression** : Les index sont recalculés lors du réordonnancement

### Drag & Drop

- **Interface** : Les cartes de projets sont maintenant glissables
- **Feedback visuel** : Opacité réduite pendant le glissement
- **Réordonnancement** : Mise à jour automatique des index en base
- **Indicateur** : Spinner "Mise à jour..." pendant le traitement

## 🔄 Nouvelles APIs

### API de réordonnancement

- **Endpoint** : `/api/portfolio/projets/reorder`
- **Méthode** : PUT
- **Body** : `{ projects: [{ id: 1, index: 1 }, { id: 2, index: 2 }, ...] }`
- **Action** : Met à jour les index de tous les projets

### API de création mise à jour

- **Calcul automatique** : L'index est calculé automatiquement
- **Comptage** : Utilise `SELECT COUNT(*)` pour déterminer le prochain index

## 🎯 Fonctionnalités implémentées

### Interface utilisateur

- ✅ **Badge d'index** : Affichage du numéro d'ordre sur chaque carte
- ✅ **Drag & Drop** : Glisser-déposer pour réorganiser
- ✅ **Feedback visuel** : Indicateurs de chargement et d'état
- ✅ **Tri automatique** : Affichage par ordre d'index croissant

### Logique métier

- ✅ **Calcul automatique** : Index basé sur le nombre de projets existants
- ✅ **Persistance** : Sauvegarde de l'ordre en base de données
- ✅ **Gestion d'erreurs** : Rollback en cas d'échec du réordonnancement
- ✅ **Performance** : Index SQL pour optimiser les requêtes

### Sécurité et robustesse

- ✅ **Validation** : Vérification des données de réordonnancement
- ✅ **Transaction** : Mises à jour séquentielles avec gestion d'erreurs
- ✅ **Rollback** : Retour à l'état précédent en cas d'erreur

## 🚀 Configuration requise

### Script SQL

Exécuter le script `projets-setup-updated.sql` dans Supabase :

```sql
-- Ajouter la colonne index
ALTER TABLE projet ADD COLUMN IF NOT EXISTS index INTEGER;

-- Mettre à jour les index existants
UPDATE projet
SET index = subquery.row_num
FROM (
  SELECT id, ROW_NUMBER() OVER (ORDER BY cree_le ASC) as row_num
  FROM projet
) AS subquery
WHERE projet.id = subquery.id;

-- Rendre la colonne NOT NULL
ALTER TABLE projet ALTER COLUMN index SET NOT NULL;

-- Ajouter un index pour les performances
CREATE INDEX IF NOT EXISTS idx_projet_index ON projet(index);
```

### Dépendances

- **react-beautiful-dnd** : Bibliothèque pour le drag & drop
- **Installation** : `npm install react-beautiful-dnd --legacy-peer-deps`

## 🎨 Utilisation

### Réorganiser les projets

1. **Glisser** : Cliquer et maintenir sur une carte de projet
2. **Déplacer** : Glisser vers la nouvelle position souhaitée
3. **Déposer** : Relâcher pour placer le projet
4. **Confirmation** : L'ordre est automatiquement sauvegardé

### Ajouter un nouveau projet

1. **Remplir le formulaire** : Titre, description, etc.
2. **Soumettre** : L'index est automatiquement calculé
3. **Affichage** : Le projet apparaît en dernière position

### Modifier un projet existant

1. **Cliquer sur modifier** : L'index reste inchangé
2. **Modifier les champs** : Titre, description, etc.
3. **Sauvegarder** : L'ordre d'affichage est préservé

## 🔍 Dépannage

### Erreurs courantes

1. **"Erreur lors du réordonnancement"** : Vérifier la connectivité à la base
2. **Index manquant** : Exécuter le script SQL de mise à jour
3. **Drag & Drop non fonctionnel** : Vérifier l'installation de react-beautiful-dnd

### Logs utiles

- Console du navigateur pour les erreurs frontend
- Logs du serveur pour les erreurs API
- Logs Supabase pour les erreurs de base de données

## 🎉 Avantages

- **UX améliorée** : Réorganisation intuitive par glisser-déposer
- **Flexibilité** : Ordre personnalisable selon les préférences
- **Performance** : Index SQL pour des requêtes rapides
- **Robustesse** : Gestion d'erreurs et rollback automatique
- **Visibilité** : Affichage clair de l'ordre d'affichage

## 📋 Checklist de déploiement

- [ ] Exécuter `projets-setup-updated.sql` dans Supabase
- [ ] Installer `react-beautiful-dnd` avec `--legacy-peer-deps`
- [ ] Vérifier que la colonne `index` existe dans la table
- [ ] Tester le drag & drop sur les projets existants
- [ ] Vérifier l'affichage des badges d'index
- [ ] Tester l'ajout de nouveaux projets
- [ ] Vérifier la persistance de l'ordre après rechargement
