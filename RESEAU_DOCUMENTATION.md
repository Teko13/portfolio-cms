# Section Réseau - Documentation

## 🌐 Vue d'ensemble

La section "Réseau" permet de gérer les liens vers vos réseaux sociaux et professionnels. Elle utilise le même bucket Supabase Storage que les autres sections pour les icônes.

## 🚀 Fonctionnalités

### **Gestion des éléments réseau**
- ✅ **Ajout** d'éléments avec nom, URL et icône optionnelle
- ✅ **Modification** des éléments existants
- ✅ **Suppression** individuelle ou en masse
- ✅ **Upload d'icônes** avec validation et stockage automatique
- ✅ **Suppression automatique** des icônes du storage

### **Interface utilisateur**
- ✅ **Design cohérent** avec les autres sections
- ✅ **Formulaire** avec validation des champs requis
- ✅ **Cartes d'éléments** avec icônes et liens cliquables
- ✅ **Gestion d'erreurs** et messages de confirmation
- ✅ **Responsive** design

## 🔧 Structure de données

### **Table `reseau`**
```sql
{
  "table": "ta_table",
  "columns": [
    {
      "name": "id",
      "type": "bigint",
      "description": "Identifiant unique de l'élément"
    },
    {
      "name": "nom",
      "type": "character varying",
      "description": "Nom de l'élément (ex: LinkedIn, GitHub)"
    },
    {
      "name": "url",
      "type": "text",
      "description": "Lien associé à l'élément"
    },
    {
      "name": "icon_url",
      "type": "text",
      "description": "Lien vers l'icône de l'élément (optionnel)"
    }
  ]
}
```

## 📁 APIs implémentées

### **GET `/api/portfolio/reseau`**
Récupère tous les éléments du réseau.

**Réponse :**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "nom": "LinkedIn",
      "url": "https://linkedin.com/in/example",
      "icon_url": "https://supabase.co/storage/v1/object/public/medias/icon.png"
    }
  ]
}
```

### **POST `/api/portfolio/reseau`**
Ajoute un nouvel élément au réseau.

**Corps de la requête :**
```json
{
  "nom": "LinkedIn",
  "url": "https://linkedin.com/in/example",
  "icon_url": "https://supabase.co/storage/v1/object/public/medias/icon.png"
}
```

**Réponse :**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "nom": "LinkedIn",
    "url": "https://linkedin.com/in/example",
    "icon_url": "https://supabase.co/storage/v1/object/public/medias/icon.png"
  },
  "message": "Élément réseau ajouté avec succès"
}
```

### **PUT `/api/portfolio/reseau`**
Modifie un élément existant du réseau.

**Corps de la requête :**
```json
{
  "id": 1,
  "nom": "LinkedIn Updated",
  "url": "https://linkedin.com/in/example",
  "icon_url": "https://supabase.co/storage/v1/object/public/medias/new-icon.png"
}
```

**Réponse :**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "nom": "LinkedIn Updated",
    "url": "https://linkedin.com/in/example",
    "icon_url": "https://supabase.co/storage/v1/object/public/medias/new-icon.png"
  },
  "message": "Élément réseau modifié avec succès"
}
```

### **DELETE `/api/portfolio/reseau?id=1`**
Supprime un élément spécifique du réseau.

**Réponse :**
```json
{
  "success": true,
  "message": "Élément réseau supprimé avec succès"
}
```

### **DELETE `/api/portfolio/reseau`**
Supprime tous les éléments du réseau.

**Réponse :**
```json
{
  "success": true,
  "message": "Tous les éléments du réseau ont été supprimés"
}
```

## 🎨 Interface utilisateur

### **Layout**
- **Partie gauche** : Liste des éléments du réseau
- **Partie droite** : Formulaire d'ajout/modification
- **Design cohérent** avec les autres sections

### **Cartes d'éléments**
- **Icône** : Affichage de l'icône uploadée ou icône par défaut
- **Nom** : Nom de l'élément réseau
- **URL** : Lien cliquable vers le réseau
- **Boutons d'action** : Modifier et supprimer

### **Formulaire**
- **Nom** : Champ requis pour le nom de l'élément
- **URL** : Champ requis avec validation URL
- **Icône** : Upload optionnel d'une icône
- **Boutons** : Ajouter/Modifier et Annuler

## 🧪 Tests effectués

### **API de récupération**
```bash
curl -X GET http://localhost:3000/api/portfolio/reseau
# ✅ Réponse: {"success":true,"data":[]}
```

### **API d'ajout**
```bash
curl -X POST http://localhost:3000/api/portfolio/reseau \
  -H "Content-Type: application/json" \
  -d '{"nom":"LinkedIn","url":"https://linkedin.com/in/example"}'
# ✅ Réponse: {"success":true,"data":{"id":1,"nom":"LinkedIn",...}}
```

### **API de modification**
```bash
curl -X PUT http://localhost:3000/api/portfolio/reseau \
  -H "Content-Type: application/json" \
  -d '{"id":1,"nom":"LinkedIn Updated","url":"https://linkedin.com/in/example"}'
# ✅ Réponse: {"success":true,"data":{"id":1,"nom":"LinkedIn Updated",...}}
```

### **API de suppression**
```bash
curl -X DELETE "http://localhost:3000/api/portfolio/reseau?id=1"
# ✅ Réponse: {"success":true,"message":"Élément réseau supprimé..."}
```

## 🔄 Flux de travail

### **Ajout d'un élément**
1. **Remplir** le formulaire avec nom et URL
2. **Uploader** une icône (optionnel)
3. **Sauvegarder** l'élément
4. **Affichage** dans la liste à gauche

### **Modification d'un élément**
1. **Clic** sur le bouton modifier
2. **Modification** des champs dans le formulaire
3. **Upload** d'une nouvelle icône (optionnel)
4. **Sauvegarde** des modifications
5. **Mise à jour** de l'affichage

### **Suppression d'un élément**
1. **Clic** sur le bouton supprimer
2. **Confirmation** de suppression
3. **Suppression** de la base de données
4. **Suppression automatique** de l'icône du storage
5. **Mise à jour** de la liste

## 🎯 Utilisation

### **Dans l'interface**
1. **Accédez** à `http://localhost:3000/dashboard/portfolio`
2. **Ouvrez** la section "Réseau"
3. **Ajoutez** des éléments via le formulaire de droite
4. **Visualisez** les éléments dans la liste à gauche
5. **Modifiez** ou **supprimez** les éléments selon besoin

### **Exemples d'éléments réseau**
- **LinkedIn** : `https://linkedin.com/in/votre-profil`
- **GitHub** : `https://github.com/votre-username`
- **Twitter** : `https://twitter.com/votre-handle`
- **Portfolio** : `https://votre-portfolio.com`
- **Blog** : `https://votre-blog.com`

## 📝 Configuration requise

### **Base de données**
Exécutez le script `reseau-setup.sql` dans votre base de données Supabase pour créer la table `reseau`.

### **Variables d'environnement**
Assurez-vous que les variables suivantes sont configurées :
- `NEXT_PUBLIC_SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`

## 📊 Avantages

1. **Simplicité** : Interface intuitive et facile à utiliser
2. **Cohérence** : Même design que les autres sections
3. **Flexibilité** : Support d'icônes personnalisées
4. **Sécurité** : Suppression automatique des fichiers
5. **Validation** : Champs requis et validation URL
6. **UX améliorée** : Messages de confirmation et gestion d'erreurs

La section Réseau est maintenant complètement opérationnelle ! 🎉
