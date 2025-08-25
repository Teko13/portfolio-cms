# Gestion Automatique des Images - Section Projets

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

## 🔍 Logs de débogage

Les opérations de suppression d'images sont loggées dans la console :

```
Suppression de l'image: projet_1755993720202_53eidxvfkcf.jpeg
Image supprimée avec succès: projet_1755993720202_53eidxvfkcf.jpeg
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
