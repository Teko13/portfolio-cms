# Interface d'Édition de CV - Documentation

## 🎯 Vue d'ensemble

L'interface d'édition de CV permet de créer et modifier un CV au format ATS (Applicant Tracking System) avec un rendu visuel en temps réel et une barre latérale d'édition complète.

## 🏗️ Architecture

### **Composants principaux :**

1. **`CVEditor`** - Composant principal qui orchestre l'interface
2. **`CVPreview`** - Rendu visuel du CV en temps réel
3. **`CVSidebar`** - Barre latérale d'édition avec tous les outils

### **Structure des données :**

```javascript
{
  personalInfo: {
    name: string,
    email: string,
    phone: string,
    website: string,
    github: string,
    linkedin: string
  },
  sections: [
    {
      id: string,
      title: string,
      type: 'text' | 'skills' | 'projects' | 'education',
      content: string | array,
      order: number,
      locked: boolean
    }
  ]
}
```

## 🚀 Fonctionnalités

### **1. Interface générale**
- ✅ **Rendu visuel en temps réel** (gauche)
- ✅ **Barre latérale d'édition** (droite)
- ✅ **Mise à jour instantanée** du contenu

### **2. Gestion des sections**
- ✅ **Sections pré-remplies** depuis le portfolio
- ✅ **Ajout de nouvelles sections** personnalisées
- ✅ **Modification du contenu** en temps réel
- ✅ **Réorganisation** avec boutons haut/bas
- ✅ **Suppression** de sections (sauf verrouillées)

### **3. Types de sections supportés**
- **`text`** - Texte simple (résumé, loisirs)
- **`skills`** - Compétences techniques (auto-remplies)
- **`projects`** - Projets réalisés (auto-remplis)
- **`education`** - Formation/parcours (auto-remplis)

### **4. Informations personnelles**
- ✅ **Nom complet** - Modifiable
- ✅ **Email** - Modifiable
- ✅ **Téléphone** - Modifiable
- ✅ **Site web** - Modifiable
- ✅ **GitHub** - Auto-rempli depuis le réseau
- ✅ **LinkedIn** - Auto-rempli depuis le réseau

### **5. Pré-remplissage automatique**
- ✅ **Données du portfolio** chargées automatiquement
- ✅ **Compétences** depuis la section compétences
- ✅ **Projets** depuis la section projets
- ✅ **Parcours** depuis la section parcours
- ✅ **Loisirs** depuis la section loisirs
- ✅ **Réseau** pour GitHub et LinkedIn

### **6. Actions globales**
- ✅ **Supprimer tous les blocs** - Réinitialisation
- ✅ **Génération PDF** - Avec options de sauvegarde

### **7. Export et sauvegarde**
- ✅ **Génération PDF** avec Puppeteer
- ✅ **Upload automatique** vers Supabase Storage
- ✅ **Sauvegarde optionnelle** dans la base de données
- ✅ **Téléchargement automatique** du fichier

## 📁 Structure des fichiers

### **Pages :**
- `app/dashboard/cv/page.js` - Page principale du CV

### **Composants :**
- `app/components/CVEditor.js` - Orchestrateur principal
- `app/components/CVPreview.js` - Rendu visuel du CV
- `app/components/CVSidebar.js` - Barre latérale d'édition

### **APIs :**
- `app/api/cv/generate/route.js` - Génération PDF et upload

## 🔧 Configuration requise

### **Dépendances :**
```json
{
  "puppeteer": "^latest"
}
```

### **Variables d'environnement :**
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

### **Bucket Supabase :**
- **`docs`** - Pour stocker les PDFs générés

## 🎨 Interface utilisateur

### **Layout :**
```
┌─────────────────────────────────────────────────────────┐
│                    CVEditor                             │
├─────────────────────────┬───────────────────────────────┤
│                         │                               │
│     CVPreview           │        CVSidebar              │
│   (Rendu visuel)        │     (Barre d'édition)         │
│                         │                               │
│   • Informations        │   • Informations personnelles │
│   • Résumé              │   • Sections du CV            │
│   • Compétences         │   • Ajout de sections         │
│   • Projets             │   • Réorganisation            │
│   • Formation           │   • Actions globales          │
│   • Loisirs             │   • Génération PDF            │
│                         │                               │
└─────────────────────────┴───────────────────────────────┘
```

### **Fonctionnalités de la barre latérale :**

#### **1. Informations personnelles**
- Champs modifiables pour toutes les informations de contact
- Mise à jour en temps réel sur le rendu

#### **2. Sections du CV**
- Liste des sections avec éditeurs spécifiques
- Boutons de réorganisation (haut/bas)
- Boutons de suppression

#### **3. Ajout de sections**
- Formulaire pour créer de nouvelles sections
- Choix du type (texte, compétences, projets, formation)
- Intégration automatique dans le rendu

#### **4. Actions globales**
- Bouton "Supprimer tous les blocs"
- Case à cocher "Enregistrer comme mon CV"
- Bouton de génération avec texte dynamique

## 🔄 Flux de données

### **1. Chargement initial :**
```
CVEditor → API calls → Portfolio data → CVData state
```

### **2. Édition en temps réel :**
```
User input → CVSidebar → CVEditor → CVPreview
```

### **3. Génération PDF :**
```
User click → API /cv/generate → Puppeteer → Supabase Storage → Download
```

## 🛡️ Sécurité

### **Authentification :**
- ✅ **Page protégée** par AuthGuard
- ✅ **API protégée** par middleware d'authentification
- ✅ **Accès utilisateur uniquement** aux données

### **Validation :**
- ✅ **Types de fichiers** pour les uploads
- ✅ **Validation des données** avant sauvegarde
- ✅ **Gestion d'erreurs** robuste

## 📊 Gestion des erreurs

### **Types d'erreurs gérées :**
- **Chargement des données** - Affichage de messages d'erreur
- **Génération PDF** - Retry automatique
- **Upload Supabase** - Fallback et messages d'erreur
- **Validation** - Messages d'erreur contextuels

### **Messages utilisateur :**
- ✅ **Succès** - Confirmation des actions
- ✅ **Erreurs** - Messages explicatifs
- ✅ **Chargement** - Indicateurs visuels

## 🎯 Utilisation

### **1. Accès à l'interface :**
- Navigation vers `/dashboard/cv`
- Authentification requise

### **2. Édition du contenu :**
- Modification des informations personnelles
- Édition des sections existantes
- Ajout de nouvelles sections
- Réorganisation avec les boutons ↑↓

### **3. Génération du CV :**
- Choix de sauvegarder ou non
- Génération PDF automatique
- Téléchargement immédiat

### **4. Sauvegarde :**
- Option "Enregistrer comme mon CV"
- Mise à jour de la base de données
- URL du CV stockée dans `moi.cv_url`

## 🔮 Améliorations futures

### **Fonctionnalités envisagées :**
- **Templates multiples** - Différents styles de CV
- **Export formats** - DOCX, HTML, etc.
- **Historique des versions** - Sauvegarde des versions précédentes
- **Partage direct** - Liens de partage des CV
- **Analytics** - Statistiques de téléchargement

### **Optimisations techniques :**
- **Cache des données** - Réduction des appels API
- **Lazy loading** - Chargement progressif
- **Compression PDF** - Optimisation de la taille
- **Preview mobile** - Responsive design amélioré

## 📝 Notes techniques

### **Puppeteer :**
- Utilisé pour la génération PDF
- Configuration headless pour la production
- Gestion des polices et styles CSS

### **React 19 :**
- Compatible avec les nouvelles fonctionnalités
- Utilisation de hooks modernes
- Gestion d'état optimisée

### **Supabase :**
- Storage pour les PDFs
- Base de données pour les métadonnées
- Authentification intégrée

---

**Interface d'édition de CV complète et fonctionnelle ! 🎉**
