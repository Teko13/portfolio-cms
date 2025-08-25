# Section Galerie - Documentation

## 🖼️ Vue d'ensemble

La section "Ma Galerie" permet de gérer une collection d'images avec une galerie en grille interactive. Elle utilise le même bucket Supabase Storage que la section projets pour la cohérence.

## 🚀 Fonctionnalités

### **Upload d'images**
- ✅ **Drag & drop** ou clic pour uploader
- ✅ **Validation** des types de fichiers (JPEG, PNG, GIF, WebP)
- ✅ **Limite de taille** : 5MB maximum
- ✅ **Stockage automatique** dans le bucket "medias"
- ✅ **URL publique** générée automatiquement

### **Galerie d'images**
- ✅ **Affichage en grille** responsive (2-3 colonnes)
- ✅ **Aperçu** de toutes les images simultanément
- ✅ **Effet hover** avec zoom et overlay
- ✅ **Boutons de suppression** sur chaque image
- ✅ **Design responsive** adaptatif

### **Gestion des images**
- ✅ **Suppression individuelle** avec confirmation
- ✅ **Suppression en masse** (tout supprimer)
- ✅ **Suppression automatique** du storage Supabase
- ✅ **Gestion d'erreurs** robuste

## 🔧 Structure de données

### **Table `ma_gallerie`**
```sql
{
  "table": "ma_gallerie",
  "columns": [
    {
      "name": "id",
      "type": "bigint",
      "description": "Identifiant unique de la photo"
    },
    {
      "name": "photo_url",
      "type": "text", 
      "description": "Lien vers la photo stockée"
    }
  ]
}
```

## 📁 APIs implémentées

### **GET `/api/portfolio/galerie`**
Récupère toutes les photos de la galerie.

**Réponse :**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "photo_url": "https://supabase.co/storage/v1/object/public/medias/filename.jpg"
    }
  ]
}
```

### **POST `/api/portfolio/galerie`**
Ajoute une nouvelle photo à la galerie.

**Corps de la requête :**
```json
{
  "photo_url": "https://supabase.co/storage/v1/object/public/medias/filename.jpg"
}
```

**Réponse :**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "photo_url": "https://supabase.co/storage/v1/object/public/medias/filename.jpg"
  },
  "message": "Photo ajoutée à la galerie avec succès"
}
```

### **DELETE `/api/portfolio/galerie?id=1`**
Supprime une photo spécifique de la galerie.

**Réponse :**
```json
{
  "success": true,
  "message": "Photo supprimée de la galerie avec succès"
}
```

### **DELETE `/api/portfolio/galerie`**
Supprime toutes les photos de la galerie.

**Réponse :**
```json
{
  "success": true,
  "message": "Toutes les photos ont été supprimées de la galerie"
}
```

## 🎨 Interface utilisateur

### **Layout**
- **Partie gauche** : Galerie d'images en grille
- **Partie droite** : Zone d'upload d'images
- **Design cohérent** avec les autres sections

### **Galerie**
- **Grille responsive** : 2 colonnes sur mobile, 3 sur desktop
- **Images carrées** : aspect-square avec object-cover
- **Effet hover** : Zoom léger + overlay avec bouton de suppression
- **Boutons de suppression** : Apparaissent au survol de chaque image
- **Transitions fluides** : Animations CSS pour une meilleure UX

### **Zone d'upload**
- **Zone drag & drop** : Bordure en pointillés
- **Icône d'upload** : SVG avec animation
- **Messages d'état** : Upload en cours, succès, erreur
- **Validation** : Types de fichiers et taille

## 🧪 Tests effectués

### **API de récupération**
```bash
curl -X GET http://localhost:3000/api/portfolio/galerie
# ✅ Réponse: {"success":true,"data":[]}
```

### **API d'ajout**
```bash
curl -X POST http://localhost:3000/api/portfolio/galerie \
  -H "Content-Type: application/json" \
  -d '{"photo_url":"https://..."}'
# ✅ Réponse: {"success":true,"data":{"id":1,"photo_url":"..."}}
```

### **API de suppression**
```bash
curl -X DELETE "http://localhost:3000/api/portfolio/galerie?id=1"
# ✅ Réponse: {"success":true,"message":"Photo supprimée..."}
```

## 🔄 Flux de travail

### **Ajout d'une image**
1. **Clic** sur la zone d'upload
2. **Sélection** du fichier image
3. **Upload** vers Supabase Storage
4. **Génération** de l'URL publique
5. **Ajout** automatique à la galerie
6. **Affichage** dans la grille

### **Suppression d'une image**
1. **Survol** de l'image pour afficher le bouton de suppression (X)
2. **Clic** sur le bouton de suppression
3. **Confirmation** de suppression
4. **Suppression** de la base de données
5. **Suppression** automatique du storage
6. **Mise à jour** de la grille

## 🎯 Utilisation

### **Dans l'interface**
1. **Accédez** à `http://localhost:3000/dashboard/portfolio`
2. **Ouvrez** la section "Ma Galerie"
3. **Upload** des images via la zone de droite
4. **Visualisez** toutes les images dans la grille à gauche
5. **Supprimez** les images en survolant et cliquant sur le X

### **Fonctionnalités de la galerie**
- **Vue d'ensemble** : Toutes les images visibles simultanément
- **Navigation directe** : Clic sur n'importe quelle image
- **Suppression individuelle** : Bouton X sur chaque image
- **Responsive** : S'adapte aux différentes tailles d'écran

## 📝 Avantages

1. **Simplicité** : Interface intuitive et facile à utiliser
2. **Cohérence** : Même design que les autres sections
3. **Vue d'ensemble** : Toutes les images visibles simultanément
4. **Sécurité** : Suppression automatique des fichiers
5. **Flexibilité** : Support de multiples formats d'image
6. **UX améliorée** : Effets hover et transitions fluides

La section Galerie est maintenant complètement opérationnelle avec un affichage en grille ! 🎉
