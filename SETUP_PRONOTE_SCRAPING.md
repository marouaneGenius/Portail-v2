# Configuration du Scraping Pronote

Ce guide explique comment configurer et utiliser le système de scraping automatisé des données Pronote.

## Architecture

Le système est composé de :

1. **Service Node.js de scraping** ([back/scrapper/](back/scrapper/)) - Service autonome avec Puppeteer
2. **API REST** - Exposée sur le port 3000 pour déclencher le scraping
3. **Contrôleur Symfony** ([PronoteScrapingController.php](back/src/Controller/PronoteScrapingController.php)) - Interface entre le backend et le service de scraping
4. **Bouton frontend** - Dans la fiche élève pour lancer le scraping manuellement

## Installation

### 1. Lancer les services Docker

```bash
cd back
docker-compose up -d
```

Cela va démarrer :
- Le service PHP/Symfony
- La base de données PostgreSQL
- Le service de scraping Node.js (port 3000)

### 2. Configuration de la base de données

Le système utilise les **champs existants** de la table `student` :
- `school_app` (VARCHAR 50) - Doit être défini à `'pronote'`
- `school_app_url` (VARCHAR 255) - URL du compte Pronote
- `school_app_username` (VARCHAR 100) - Identifiant Pronote
- `school_app_password` (VARCHAR 255) - Mot de passe Pronote

**✅ Aucune migration n'est nécessaire**, ces champs existent déjà dans votre base de données.

### 3. Vérifier que le service de scraping fonctionne

```bash
# Vérifier les logs du service
docker-compose logs -f scrapper

# Tester l'API directement
curl http://localhost:3000/health
```

Vous devriez voir :
```json
{
  "status": "ok",
  "timestamp": "2025-10-29T...",
  "service": "vie-scolaire-scrapper"
}
```

## Configuration des identifiants Pronote pour un élève

### Via l'interface

1. Aller sur la fiche de l'élève
2. Cliquer sur "Modifier"
3. Renseigner les champs de vie scolaire :
   - **Application de vie scolaire** (`school_app`) : Sélectionner `"pronote"`
   - **URL** (`school_app_url`) : URL complète du compte Pronote
   - **Nom d'utilisateur** (`school_app_username`) : Identifiant Pronote
   - **Mot de passe** (`school_app_password`) : Mot de passe Pronote

### Types de liens Pronote supportés

Le système détecte automatiquement le type de compte :

#### 1. Compte Parent Pronote
```
https://XXXXX.index-education.net/pronote/parent.html
```

#### 2. Compte Élève Direct
```
https://XXXXX.index-education.net/pronote/eleve.html
```

#### 3. Compte Élève Île-de-France (via ENT)
```
https://monlycee.net/...IDF...
```

## Utilisation

### Scraping manuel depuis la fiche élève

1. Ouvrir la fiche d'un élève
2. Si l'élève a `school_app = 'pronote'` avec tous les champs remplis, un bouton **"Récupérer les données Pronote"** apparaît
3. Cliquer sur le bouton
4. Le scraping démarre (peut prendre 30-60 secondes)
5. Un toast de notification indique le succès ou l'échec
6. Les données récupérées sont visibles dans les logs

### Données récupérées

Selon le type de compte, le système récupère :

**Pour les comptes Parent :**
- Notes récentes (date, matière, note)
- Prochains devoirs surveillés (date, matière, horaire, salle)
- Travail à faire (par date, avec statut et description)

**Pour les comptes Élève :**
- Notes récentes (date, matière, note)

## API Endpoints

### Déclencher le scraping pour un élève

```bash
POST /api/pronote/scrape/{id}
```

**Exemple :**
```bash
curl -X POST http://localhost:8080/api/pronote/scrape/123
```

**Réponse succès :**
```json
{
  "success": true,
  "message": "Scraping Pronote terminé avec succès",
  "data": {
    "notes": [...],
    "prochainDS": [...],
    "travailAFaire": [...]
  }
}
```

### Vérifier le statut d'un élève

```bash
GET /api/pronote/status/{id}
```

**Réponse :**
```json
{
  "success": true,
  "hasCredentials": true,
  "schoolApp": "pronote",
  "pronoteLink": "https://...",
  "pronoteUsername": "username",
  "studentId": 123,
  "studentName": "Jean Dupont"
}
```

### Health check du service de scraping

```bash
GET /api/pronote/health
```

## Scraping automatique (CRON)

Pour activer le scraping automatique périodique :

### 1. Modifier le Dockerfile

Éditer [back/scrapper/Dockerfile](back/scrapper/Dockerfile) ligne 43 :

```dockerfile
# Remplacer
CMD ["node", "src/api/server.js"]

# Par
CMD ["node", "src/index.js"]
```

### 2. Configurer l'intervalle

Éditer [back/scrapper/.env](back/scrapper/.env.example) :

```env
SCRAPE_INTERVAL_HOURS=24  # Scraping toutes les 24h
RUN_ON_START=true          # Exécuter au démarrage
```

### 3. Redémarrer le service

```bash
cd back
docker-compose restart scrapper
```

Le CRON va maintenant scraper automatiquement tous les élèves ayant `school_app = 'pronote'`.

## Développement et Debugging

### Logs du service de scraping

```bash
docker-compose logs -f scrapper
```

Les logs sont aussi sauvegardés dans :
- `back/scrapper/logs/combined.log` - Tous les logs
- `back/scrapper/logs/error.log` - Seulement les erreurs

### Mode debug (headless: false)

Pour voir le navigateur Chromium pendant le scraping :

1. Éditer [back/scrapper/src/scrapers/vieScolaireScraper.js](back/scrapper/src/scrapers/vieScolaireScraper.js)
2. Ligne 20, changer `headless` :

```javascript
async init(headless = false) {  // false pour voir le navigateur
```

**Note :** Cela ne fonctionne qu'en local, pas dans Docker.

### Tester le scraping en local (hors Docker)

```bash
cd back/scrapper

# Installer les dépendances
npm install

# Créer le .env
cp .env.example .env

# Modifier le .env avec vos identifiants de test
# DATABASE_URL=postgresql://...

# Tester l'API
npm run dev:api

# Ou tester le scraping directement
npm run scrape
```

## Troubleshooting

### Le bouton n'apparaît pas

- Vérifier que `school_app = 'pronote'` pour cet élève
- Vérifier que les 3 champs (`school_app_url`, `school_app_username`, `school_app_password`) sont remplis
- Rafraîchir la page

### Erreur "Service unavailable"

```bash
# Vérifier que le service tourne
docker-compose ps scrapper

# Vérifier les logs
docker-compose logs scrapper

# Redémarrer le service
docker-compose restart scrapper
```

### Échec du scraping

1. **Identifiants incorrects** - Vérifier username/password
2. **URL invalide** - Vérifier que le lien Pronote est complet
3. **`school_app` incorrect** - Doit être exactement `'pronote'`
4. **Popup non géré** - Le script gère les popups d'enregistrement d'appareil automatiquement
5. **Timeout** - Pronote peut être lent, augmenter le timeout dans le code

### Vérifier la connexion PostgreSQL

```bash
# Depuis le service scrapper
docker-compose exec scrapper node -e "require('./src/config/database').query('SELECT NOW()')"
```

## Structure des fichiers

```
back/
├── scrapper/
│   ├── src/
│   │   ├── api/
│   │   │   └── server.js              # API REST
│   │   ├── config/
│   │   │   ├── database.js            # Configuration PostgreSQL
│   │   │   └── logger.js              # Configuration Winston
│   │   ├── scrapers/
│   │   │   └── vieScolaireScraper.js  # Script de scraping Pronote
│   │   ├── utils/
│   │   │   └── puppeteerConfig.js     # Configuration Puppeteer
│   │   └── index.js                   # CRON scheduler
│   ├── logs/                          # Logs générés
│   ├── Dockerfile                     # Configuration Docker
│   ├── package.json
│   └── .env.example
├── src/
│   ├── Controller/
│   │   └── PronoteScrapingController.php  # API Symfony
│   └── Entity/
│       └── Student.php                     # Entité avec méthodes alias Pronote
└── compose.yaml                       # Configuration Docker Compose

frontend/
└── src/
    └── components/
        ├── PronoteScrapingButton.tsx  # Bouton de scraping
        └── ItemDetails.tsx            # Fiche élève (modifiée)
```

## Sécurité

- Les mots de passe Pronote sont stockés en clair dans la base de données
- TODO: Implémenter le chiffrement des mots de passe
- Le service tourne dans un conteneur isolé
- Utilisation de puppeteer-stealth pour éviter la détection

## Méthodes alias dans l'entité Student

L'entité Student expose des méthodes alias pour faciliter l'utilisation :

```php
// Ces méthodes utilisent les champs school_app_* en interne
$student->getPronoteLink();        // Retourne school_app_url si school_app = 'pronote'
$student->setPronoteLink($url);    // Définit school_app = 'pronote' et school_app_url
$student->getPronoteUsername();    // Retourne school_app_username si school_app = 'pronote'
$student->setPronoteUsername($u);  // Définit school_app = 'pronote' et school_app_username
$student->getPronotePassword();    // Retourne school_app_password si school_app = 'pronote'
$student->setPronotePassword($p);  // Définit school_app = 'pronote' et school_app_password
$student->hasPronoteCredentials(); // Vérifie que tout est configuré
```

## Prochaines étapes

- [ ] Chiffrer les mots de passe Pronote dans la base de données
- [ ] Créer une table dédiée pour stocker les données scrapées
- [ ] Implémenter un système de retry en cas d'échec
- [ ] Ajouter des webhooks pour notifier après chaque scraping
- [ ] Créer une interface pour visualiser les données récupérées
- [ ] Ajouter le support d'École Directe
- [ ] Implémenter un système de cache pour éviter trop de requêtes

## Support

Pour toute question ou problème :
1. Consulter les logs : `docker-compose logs scrapper`
2. Vérifier le README du scrapper : [back/scrapper/README.md](back/scrapper/README.md)
3. Tester l'API avec curl pour isoler le problème
