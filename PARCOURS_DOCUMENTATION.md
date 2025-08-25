# Section Parcours - Documentation

## 📚 Vue d'ensemble

La section **Parcours** permet de gérer les formations, diplômes et certifications de l'utilisateur. Elle offre une interface complète pour ajouter, modifier et supprimer des parcours de formation avec la possibilité d'attacher des PDF de diplômes.

## 🗂️ Structure de la base de données

### Table `parcours`

| Colonne           | Type                     | Description                                           |
| ----------------- | ------------------------ | ----------------------------------------------------- |
| `id`              | BIGSERIAL                | Identifiant unique du parcours                        |
| `obtenu_en`       | TIMESTAMP WITH TIME ZONE | Date d'obtention du diplôme ou certification          |
| `titre`           | VARCHAR                  | Titre ou nom du parcours (formation, diplôme, etc.)   |
| `ecole`           | VARCHAR                  | Établissement ou organisme de formation               |
| `diplome_pdf_url` | TEXT                     | Lien vers le diplôme ou certificat en PDF (optionnel) |

## 🎨 Interface utilisateur

### En-tête de section

- **Icône** : Diplôme/graduation cap (vert)
- **Titre** : "Parcours"
- **Fonctionnalité** : Section pliable/dépliable

### Layout en deux colonnes

#### Colonne gauche - Liste des parcours

- **Titre** : "Parcours de formation"
- **Bouton** : "Tout supprimer" (si des parcours existent)
- **État vide** : Message avec icône de diplôme
- **Liste** : Cartes de parcours triées par date (plus récent en premier)

#### Colonne droite - Formulaire

- **Titre dynamique** : "Ajouter un parcours" ou "Modifier le parcours"
- **Champs requis** :
  - Titre (texte)
  - École/Organisme (texte)
  - Date d'obtention (date)
- **Champ optionnel** : PDF du diplôme

### Cartes de parcours

Chaque parcours est affiché dans une carte avec :

- **Icône PDF** : Rouge si PDF attaché, grise sinon
- **Titre** : Nom du parcours
- **École** : Établissement de formation
- **Date** : Date d'obtention formatée (ex: "juin 2023")
- **Boutons d'action** : Modifier (vert) et Supprimer (rouge)

## 📁 Gestion des fichiers

### Bucket de stockage

- **Bucket** : `docs` (différent du bucket `medias` utilisé pour les images)
- **Types autorisés** : PDF uniquement
- **Taille maximale** : 10MB
- **Nommage** : `diplome_{timestamp}_{randomString}.pdf`

### Upload de PDF

- **Interface** : Zone de glisser-déposer avec bouton de sélection
- **Validation** : Type PDF et taille du fichier
- **Feedback** : Indicateur de progression pendant l'upload
- **Gestion d'erreur** : Messages d'erreur spécifiques

### Prévisualisation PDF

- **Affichage** : Icône PDF avec nom du fichier
- **Actions** :
  - Voir le PDF (lien externe)
  - Supprimer le PDF (avec confirmation)

## 🔄 Fonctionnalités CRUD

### Création (POST)

- **Endpoint** : `/api/portfolio/parcours`
- **Validation** : Titre, école et date requis
- **PDF** : Optionnel, upload automatique vers Supabase Storage
- **Retour** : Parcours créé avec URL du PDF

### Lecture (GET)

- **Endpoint** : `/api/portfolio/parcours`
- **Tri** : Par date d'obtention (décroissant)
- **Retour** : Liste de tous les parcours

### Modification (PUT)

- **Endpoint** : `/api/portfolio/parcours`
- **Gestion PDF** : Suppression automatique de l'ancien PDF si remplacé
- **Retour** : Parcours modifié

### Suppression (DELETE)

- **Suppression individuelle** : `/api/portfolio/parcours?id={id}`
- **Suppression globale** : `/api/portfolio/parcours`
- **Nettoyage** : Suppression automatique des PDF du storage

## 🔧 APIs spécifiques

### Upload PDF

- **Endpoint** : `/api/upload/pdf`
- **Méthode** : POST
- **Body** : FormData avec fichier PDF
- **Validation** : Type PDF, taille max 10MB
- **Retour** : URL publique du PDF uploadé

### Suppression PDF

- **Endpoint** : `/api/upload/pdf/delete`
- **Méthode** : POST
- **Body** : `{ pdfUrl: string }`
- **Action** : Suppression du fichier du bucket `docs`

## 🎯 Fonctionnalités avancées

### Gestion automatique des fichiers

- **Upload** : Génération automatique d'URL publique
- **Remplacement** : Suppression de l'ancien PDF lors de la modification
- **Suppression** : Nettoyage automatique lors de la suppression de parcours
- **Bulk delete** : Suppression de tous les PDF lors de la suppression globale

### Validation et sécurité

- **Types de fichiers** : PDF uniquement
- **Taille** : Limite de 10MB
- **Authentification** : Service Role Key pour bypass RLS
- **Gestion d'erreurs** : Messages spécifiques et fallback API REST

### UX/UI

- **États de chargement** : Spinners pour upload et sauvegarde
- **Feedback** : Messages de succès/erreur colorés
- **Confirmation** : Dialogs pour suppressions
- **Responsive** : Layout adaptatif (1 colonne sur mobile, 2 sur desktop)

## 🚀 Configuration requise

### Supabase

1. **Bucket `docs`** : Créer le bucket pour les PDF
2. **Politiques RLS** : Configurer les politiques pour la table `parcours`
3. **Service Role Key** : Configurer pour bypass RLS

### Variables d'environnement

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

## 📋 Checklist de déploiement

- [ ] Exécuter `parcours-setup.sql` dans Supabase
- [ ] Créer le bucket `docs` dans Supabase Storage
- [ ] Configurer les politiques RLS pour le bucket `docs`
- [ ] Vérifier les variables d'environnement
- [ ] Tester l'upload de PDF
- [ ] Tester la création/modification/suppression de parcours
- [ ] Vérifier la suppression automatique des PDF

## 🔍 Dépannage

### Erreurs courantes

1. **"Could not find the table"** : Vérifier que la table `parcours` existe
2. **"Erreur de permissions"** : Vérifier les politiques RLS et Service Role Key
3. **"PDF trop volumineux"** : Vérifier la taille du fichier (max 10MB)
4. **"Type de fichier non autorisé"** : Vérifier que le fichier est bien un PDF

### Logs utiles

- Console du navigateur pour les erreurs frontend
- Logs du serveur Next.js pour les erreurs API
- Logs Supabase pour les erreurs de base de données
