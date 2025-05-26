# Configuration du LinkedInBot Pro 💼

Ce document explique comment configurer et utiliser le nouveau chatbot LinkedIn recruiter.

## Prérequis

### 1. Clés API nécessaires

Copiez le fichier `env.example` vers `.env` et configurez les variables suivantes :

#### SerpAPI (pour la recherche de profils LinkedIn)
```
SERP_API_KEY=your_serp_api_key_here
```
- Créez un compte sur [SerpAPI](https://serpapi.com/)
- Obtenez votre clé API dans le dashboard
- Plan gratuit : 100 recherches/mois

#### Google Sheets API (pour sauvegarder les profils)
```
GOOGLE_SHEETS_PRIVATE_KEY=your_google_sheets_private_key_here
GOOGLE_SHEETS_CLIENT_EMAIL=your_google_sheets_client_email_here
GOOGLE_SPREADSHEET_ID=your_google_spreadsheet_id_here
```

### 2. Configuration Google Sheets

#### Étape 1 : Créer un projet Google Cloud
1. Allez sur [Google Cloud Console](https://console.cloud.google.com/)
2. Créez un nouveau projet ou sélectionnez un projet existant
3. Activez l'API Google Sheets dans la bibliothèque d'API

#### Étape 2 : Créer un compte de service
1. Allez dans "IAM et administration" > "Comptes de service"
2. Cliquez sur "Créer un compte de service"
3. Donnez un nom au compte de service
4. Cliquez sur "Créer et continuer"
5. Dans "Clés", cliquez sur "Ajouter une clé" > "Créer une nouvelle clé"
6. Sélectionnez "JSON" et téléchargez le fichier

#### Étape 3 : Extraire les informations du fichier JSON
```json
{
  "private_key": "-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n",
  "client_email": "your-service-account@your-project.iam.gserviceaccount.com"
}
```

#### Étape 4 : Créer une Google Sheet
1. Créez une nouvelle Google Sheet
2. Partagez-la avec l'email du compte de service (client_email)
3. Donnez-lui les permissions d'édition
4. Copiez l'ID de la sheet depuis l'URL : 
   ```
   https://docs.google.com/spreadsheets/d/VOTRE_SPREADSHEET_ID/edit
   ```

## Fonctionnalités

### 🔍 Recherche de profils LinkedIn
- Recherche par mots-clés (titre de poste, compétences, entreprise)
- Filtrage par localisation
- Résultats limités à LinkedIn uniquement
- Respect des termes d'utilisation de LinkedIn

### 📊 Sauvegarde automatique
- Sauvegarde automatique dans Google Sheets
- Organisation par colonnes : Nom, Titre, Entreprise, Localisation, URL, Description, Date
- Création automatique d'onglets si nécessaire

### 🤖 Interface intelligente
- Conversations en français
- Suggestions de recherche optimisées
- Conseils de recrutement personnalisés

## Utilisation

### Exemples de requêtes :

1. **Recherche simple :**
   ```
   Trouve-moi des développeurs React à Paris
   ```

2. **Recherche spécifique :**
   ```
   Je cherche des CEO de startups dans la fintech à Londres
   ```

3. **Recherche avec filtres :**
   ```
   Trouve des data scientists avec plus de 5 ans d'expérience chez Google
   ```

### Workflow automatique :
1. **Analyse** de votre demande
2. **Recherche** sur LinkedIn via SerpAPI
3. **Extraction** des informations pertinentes
4. **Sauvegarde** dans votre Google Sheet
5. **Présentation** des résultats avec conseils de recrutement

## Limitations et bonnes pratiques

### ⚠️ Limitations
- Respect de la politique de LinkedIn concernant l'extraction de données
- Informations publiques uniquement
- Limitation des recherches selon votre plan SerpAPI

### ✅ Bonnes pratiques
- Utilisez des termes de recherche spécifiques
- Respectez la vie privée des candidats
- Utilisez les données à des fins de recrutement éthique
- Vérifiez toujours les profils manuellement

## Dépannage

### Erreurs courantes :

1. **"SERP_API_KEY non configuré"**
   - Vérifiez que la clé API SerpAPI est correctement définie dans `.env`

2. **"GOOGLE_SPREADSHEET_ID non configuré"**
   - Vérifiez l'ID de votre Google Sheet dans `.env`

3. **"Erreur d'authentification Google Sheets"**
   - Vérifiez que le compte de service a bien accès à votre sheet
   - Vérifiez que la clé privée est correctement formatée (avec les \n)

4. **"Aucun profil trouvé"**
   - Essayez des termes de recherche plus généraux
   - Vérifiez votre quota SerpAPI

## Support

Pour toute question ou problème, consultez :
- [Documentation SerpAPI](https://serpapi.com/search-api)
- [Documentation Google Sheets API](https://developers.google.com/sheets/api)
- [Politique de LinkedIn](https://www.linkedin.com/legal/professional-community-policies) 