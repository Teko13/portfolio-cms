# Gestion Automatique des Images et Documents

## 🗑️ Suppression Automatique des Images

### **Fonctionnalités implémentées**

#### 1. **Suppression lors de la suppression de projet**

- ✅ **Suppression individuelle** : L'image est supprimée du storage quand un projet est supprimé
- ✅ **Suppression en masse** : Toutes les images sont supprimées quand tous les projets sont supprimés
- ✅ **Gestion d'erreurs** : Les erreurs de suppression d'image sont loggées mais n'empêchent pas la suppression du projet

#### 2. **Suppression lors de la mise à jour de projet**

- ✅ **Changement d'image** : L'ancienne image est supprimée quand une nouvelle image est uploadée
- ✅ **Suppression d'image** : L'image est supprimée si elle est retirée du projet
- ✅ **Conservation** : L'image n'est pas supprimée si elle reste la même

#### 3. **Suppression manuelle dans le formulaire**

- ✅ **Bouton de suppression** : L'utilisateur peut supprimer une image avant de sauvegarder
- ✅ **API dédiée** : `/api/upload/delete` pour supprimer une image spécifique
- ✅ **Feedback utilisateur** : Messages de confirmation et gestion d'erreurs

## 📄 Gestion Automatique des CV

### **Fonctionnalités implémentées**

#### 1. **CV temporaires (téléchargeables uniquement)**

- ✅ **Suppression automatique** : Les CV temporaires sont supprimés après 3 minutes
- ✅ **Timer côté serveur** : Utilisation de `setTimeout` pour programmer la suppression
- ✅ **Logs de débogage** : Confirmation de suppression dans les logs

#### 2. **CV sauvegardés (stockés en base)**

- ✅ **Suppression de l'ancien CV** : L'ancien CV est supprimé avant de sauvegarder le nouveau
- ✅ **Vérification de l'existant** : Récupération de l'URL du CV actuel depuis la table `moi`
- ✅ **Extraction du nom de fichier** : Fonction pour extraire le nom depuis l'URL Supabase
- ✅ **Gestion d'erreurs** : Les erreurs de suppression n'empêchent pas la création du nouveau CV

#### 3. **Fonctions utilitaires**

- ✅ **`extractFileNameFromUrl(url)`** : Extrait le nom du fichier depuis une URL Supabase
- ✅ **`deleteFileFromStorage(supabase, fileName)`** : Supprime un fichier du bucket `docs`

## 🔧 APIs implémentées

### **API de suppression d'image** (`/api/upload/delete`)

```javascript
POST /api/upload/delete
Content-Type: application/json

{
  "imageUrl": "https://supabase.co/storage/v1/object/public/medias/filename.jpg"
}
```

**Réponse :**

```json
{
  "success": true,
  "message": "Image supprimée avec succès"
}
```

### **API de génération de CV améliorée** (`/api/cv/generate`)

- **CV temporaires** : Suppression automatique après 3 minutes
- **CV sauvegardés** : Suppression de l'ancien CV avant création du nouveau
- **Gestion d'erreurs** : Logs détaillés pour le débogage

**Réponse pour CV temporaire :**

```json
{
  "success": true,
  "downloadUrl": "https://...",
  "message": "CV généré avec succès (sera supprimé automatiquement dans 3 minutes)"
}
```

**Réponse pour CV sauvegardé :**

```json
{
  "success": true,
  "downloadUrl": "https://...",
  "message": "CV généré et sauvegardé avec succès"
}
```

### **API de suppression de projet améliorée** (`/api/portfolio/projets`)

- Récupère l'`image_url` avant suppression
- Supprime l'image du storage après suppression du projet
- Gère les erreurs de suppression d'image

### **API de mise à jour de projet améliorée** (`/api/portfolio/projets`)

- Compare l'ancienne et la nouvelle `image_url`
- Supprime l'ancienne image si elle a changé
- Conserve l'image si elle reste la même

## 📁 Fichiers modifiés

### **APIs**

- ✅ `app/api/portfolio/projets/route.js` - Suppression automatique dans DELETE et PUT
- ✅ `app/api/upload/delete/route.js` - Nouvelle API de suppression d'image
- ✅ `app/api/cv/generate/route.js` - Suppression automatique des CV temporaires et sauvegardés

### **Composants**

- ✅ `app/components/ProjetsSection.js` - Suppression manuelle dans le formulaire

## 🧪 Tests effectués

### **Suppression automatique lors de suppression de projet**

```bash
# 1. Créer un projet avec image
curl -X POST http://localhost:3000/api/portfolio/projets \
  -H "Content-Type: application/json" \
  -d '{"titre":"Test","description":"Test","image_url":"https://..."}'

# 2. Supprimer le projet (l'image est automatiquement supprimée)
curl -X DELETE "http://localhost:3000/api/portfolio/projets?id=12"
```

### **Suppression manuelle d'image**

```bash
# Supprimer une image spécifique
curl -X POST http://localhost:3000/api/upload/delete \
  -H "Content-Type: application/json" \
  -d '{"imageUrl":"https://..."}'
```

### **Gestion automatique des CV**

```bash
# 1. Générer un CV temporaire (supprimé après 3 minutes)
curl -X POST http://localhost:3000/api/cv/generate \
  -H "Content-Type: application/json" \
  -d '{"cvData": {...}, "saveAsCV": false}'

# 2. Générer un CV sauvegardé (ancien CV supprimé automatiquement)
curl -X POST http://localhost:3000/api/cv/generate \
  -H "Content-Type: application/json" \
  -d '{"cvData": {...}, "saveAsCV": true}'
```

## 🔍 Logs de débogage

Les opérations de suppression d'images et de CV sont loggées dans la console :

### **Images**

```
Suppression de l'image: projet_1755993720202_53eidxvfkcf.jpeg
Image supprimée avec succès: projet_1755993720202_53eidxvfkcf.jpeg
```

### **CV**

```
Suppression de l'ancien CV: cv_1755993720202.pdf
Fichier supprimé avec succès: cv_1755993720202.pdf
Suppression automatique du CV temporaire: cv_1755993720203.pdf
Fichier supprimé avec succès: cv_1755993720203.pdf
```

## ⚠️ Gestion d'erreurs

### **Erreurs de suppression d'image**

- Les erreurs sont loggées mais n'empêchent pas les opérations principales
- L'utilisateur reçoit toujours une confirmation de suppression de projet
- Les erreurs de storage sont gérées gracieusement

### **Cas d'erreur courants**

- Fichier déjà supprimé
- Permissions insuffisantes
- URL d'image invalide
- Erreur de réseau

## 🎯 Utilisation

### **Dans l'interface utilisateur**

1. **Suppression d'image** : Cliquez sur le bouton "X" sur l'aperçu de l'image
2. **Suppression de projet** : Cliquez sur le bouton de suppression du projet
3. **Changement d'image** : Upload d'une nouvelle image remplace automatiquement l'ancienne

### **Programmatiquement**

```javascript
// Supprimer une image spécifique
const response = await fetch("/api/upload/delete", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ imageUrl: "https://..." }),
});
```

## 📝 Avantages

1. **Économie d'espace** : Pas d'accumulation d'images orphelines
2. **Cohérence** : Les images correspondent toujours aux projets
3. **Performance** : Moins de fichiers à gérer dans le storage
4. **Sécurité** : Suppression automatique des données sensibles
5. **Expérience utilisateur** : Gestion transparente des images

La gestion automatique des images est maintenant complètement opérationnelle ! 🎉
