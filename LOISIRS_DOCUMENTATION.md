# Section Loisirs - Documentation

## 🎯 Vue d'ensemble

La section **Loisirs** permet de gérer les loisirs et centres d'intérêt de l'utilisateur. C'est une section simple et épurée qui offre une interface intuitive pour ajouter, modifier et supprimer des descriptions de loisirs.

## 🗂️ Structure de la base de données

### Table `loisires`

| Colonne       | Type      | Description                               |
| ------------- | --------- | ----------------------------------------- |
| `id`          | BIGSERIAL | Identifiant unique du loisir              |
| `description` | TEXT      | Description du loisir ou centre d'intérêt |

## 🎨 Interface utilisateur

### En-tête de section

- **Icône** : Emoji sourire (violet)
- **Titre** : "Loisirs"
- **Fonctionnalité** : Section pliable/dépliable

### Layout en deux colonnes

#### Colonne gauche - Liste des loisirs

- **Titre** : "Mes loisirs"
- **Bouton** : "Tout supprimer" (si des loisirs existent)
- **État vide** : Message avec icône de sourire
- **Liste** : Cartes de loisirs avec descriptions

#### Colonne droite - Formulaire

- **Titre dynamique** : "Ajouter un loisir" ou "Modifier le loisir"
- **Champ requis** : Description (textarea)
- **Placeholder** : Exemples de loisirs

### Cartes de loisirs

Chaque loisir est affiché dans une carte avec :

- **Description** : Texte du loisir
- **Boutons d'action** : Modifier (violet) et Supprimer (rouge)

## 🔄 Fonctionnalités CRUD

### Création (POST)

- **Endpoint** : `/api/portfolio/loisirs`
- **Validation** : Description requise et non vide
- **Retour** : Loisir créé

### Lecture (GET)

- **Endpoint** : `/api/portfolio/loisirs`
- **Tri** : Par ID (ordre d'ajout)
- **Retour** : Liste de tous les loisirs

### Modification (PUT)

- **Endpoint** : `/api/portfolio/loisirs`
- **Validation** : Description requise et non vide
- **Retour** : Loisir modifié

### Suppression (DELETE)

- **Suppression individuelle** : `/api/portfolio/loisirs?id={id}`
- **Suppression globale** : `/api/portfolio/loisirs`
- **Confirmation** : Dialog de confirmation pour chaque suppression

## 🎯 Fonctionnalités avancées

### Validation et sécurité

- **Validation** : Description non vide et trimée
- **Authentification** : Service Role Key pour bypass RLS
- **Gestion d'erreurs** : Messages spécifiques

### UX/UI

- **États de chargement** : Spinners pour sauvegarde
- **Feedback** : Messages de succès/erreur colorés
- **Confirmation** : Dialogs pour suppressions
- **Responsive** : Layout adaptatif (1 colonne sur mobile, 2 sur desktop)
- **Couleur thématique** : Violet pour différencier des autres sections

### Interface utilisateur

- **Textarea** : Zone de texte redimensionnable pour descriptions longues
- **Placeholder** : Exemples pour guider l'utilisateur
- **Boutons d'action** : Couleurs cohérentes avec le thème violet

## 🚀 Configuration requise

### Supabase

1. **Table `loisires`** : Créer la table avec le script SQL
2. **Politiques RLS** : Configurer les politiques pour la table
3. **Service Role Key** : Configurer pour bypass RLS

### Variables d'environnement

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

## 📋 Checklist de déploiement

- [ ] Exécuter `loisires-setup.sql` dans Supabase
- [ ] Vérifier les variables d'environnement
- [ ] Tester la création/modification/suppression de loisirs
- [ ] Vérifier l'interface utilisateur
- [ ] Tester la suppression globale

## 🔍 Dépannage

### Erreurs courantes

1. **"Could not find the table"** : Vérifier que la table `loisires` existe
2. **"Erreur de permissions"** : Vérifier les politiques RLS et Service Role Key
3. **"La description est requise"** : Vérifier que le champ n'est pas vide

### Logs utiles

- Console du navigateur pour les erreurs frontend
- Logs du serveur Next.js pour les erreurs API
- Logs Supabase pour les erreurs de base de données

## 🎨 Design et UX

### Couleurs

- **Violet** : Couleur principale de la section
- **Vert** : Messages de succès
- **Rouge** : Messages d'erreur et boutons de suppression

### Icônes

- **En-tête** : Emoji sourire (🎭)
- **État vide** : Icône de sourire
- **Actions** : Crayon (modifier) et X (supprimer)

### Responsive

- **Mobile** : Layout en une colonne
- **Desktop** : Layout en deux colonnes
- **Tablette** : Adaptation automatique

## 💡 Utilisation

### Ajouter un loisir

1. Cliquez sur la section **"Loisirs"** pour l'ouvrir
2. Remplissez le champ description avec votre loisir
3. Cliquez sur **"Ajouter"**

### Modifier un loisir

1. Cliquez sur l'icône **modifier** (crayon violet) sur une carte
2. Modifiez la description dans le textarea
3. Cliquez sur **"Modifier"**

### Supprimer un loisir

1. Cliquez sur l'icône **supprimer** (X rouge) sur une carte
2. Confirmez la suppression

### Supprimer tous les loisirs

1. Cliquez sur **"Tout supprimer"** en haut de la liste
2. Confirmez la suppression globale

## 🎉 Avantages

- **Simplicité** : Interface épurée et intuitive
- **Flexibilité** : Descriptions libres et personnalisables
- **Cohérence** : Design harmonieux avec les autres sections
- **Performance** : Structure légère et efficace
- **Maintenabilité** : Code simple et bien documenté
