# Service de Scrapping - Vie Scolaire

Service Node.js automatisé pour récupérer les données des applications de vie scolaire via Puppeteer.

## Structure du projet

```
scrapper/
├── src/
│   ├── config/
│   │   ├── database.js       # Configuration PostgreSQL
│   │   └── logger.js          # Configuration Winston Logger
│   ├── scrapers/
│   │   └── vieScolaireScraper.js  # Script principal de scraping
│   ├── utils/
│   │   └── puppeteerConfig.js     # Configuration Puppeteer
│   └── index.js               # Point d'entrée avec CRON
├── logs/                      # Logs générés
├── Dockerfile                 # Configuration Docker
├── package.json              # Dépendances Node.js
└── .env.example              # Variables d'environnement exemple
```

## Installation

### Avec Docker (recommandé)

1. Copier le fichier d'environnement :
```bash
cp .env.example .env
```

2. Configurer les variables d'environnement dans `.env`

3. Construire et démarrer le service :
```bash
cd back
docker-compose up -d scrapper
```

4. Voir les logs :
```bash
docker-compose logs -f scrapper
```

### Sans Docker

1. Installer les dépendances :
```bash
npm install
```

2. Installer Chromium (si pas déjà installé) :
```bash
# macOS
brew install chromium

# Linux
apt-get install chromium-browser
```

3. Démarrer le service :
```bash
npm start
```

## Configuration

### Variables d'environnement

- `NODE_ENV` : Environnement (production/development)
- `DATABASE_URL` : URL de connexion PostgreSQL
- `SCRAPE_INTERVAL_HOURS` : Intervalle entre chaque scraping (défaut: 24h)
- `MAX_CONCURRENT_SCRAPES` : Nombre max de scraping simultanés
- `LOG_LEVEL` : Niveau de log (info/debug/error)
- `RUN_ON_START` : Exécuter le scraping au démarrage (true/false)

### Base de données

Le service s'attend à ce que les identifiants de vie scolaire soient stockés dans votre table `student` :

```sql
-- TODO: Adapter selon votre structure
ALTER TABLE student
  ADD COLUMN vie_scolaire_username VARCHAR(255),
  ADD COLUMN vie_scolaire_password VARCHAR(255);
```

## Utilisation

### Scraping manuel

Exécuter le scraping pour tous les élèves :
```bash
npm run scrape
```

### Scraping automatique

Le service utilise CRON pour exécuter le scraping automatiquement selon l'intervalle configuré (par défaut toutes les 24h).

### Intégration de votre script

Pour intégrer votre script Puppeteer existant, modifiez le fichier `src/scrapers/vieScolaireScraper.js` :

1. **Méthode `login()`** : Ajoutez votre logique de connexion
   - Remplacez `URL_DE_CONNEXION_ICI` par l'URL réelle
   - Adaptez les sélecteurs CSS pour les champs username/password

2. **Méthode `scrapeData()`** : Ajoutez votre logique de scraping
   - Récupération des absences
   - Récupération des notes
   - Récupération du comportement
   - etc.

3. **Méthode `saveData()`** : Adaptez la sauvegarde des données selon votre schéma

## Sécurité

- Le service utilise `puppeteer-extra-plugin-stealth` pour éviter la détection
- Les mots de passe doivent être chiffrés dans la base de données
- Le service tourne avec un utilisateur non-root dans Docker
- Les logs ne contiennent pas les mots de passe

## Monitoring

Les logs sont disponibles dans le dossier `logs/` :
- `combined.log` : Tous les logs
- `error.log` : Seulement les erreurs

En développement, les logs sont aussi affichés dans la console avec coloration.

## Troubleshooting

### Le navigateur ne démarre pas

Vérifier que Chromium est bien installé dans le conteneur Docker.

### Erreurs de connexion

- Vérifier les sélecteurs CSS dans la méthode `login()`
- Activer les screenshots en développement pour déboguer
- Vérifier les logs dans `logs/error.log`

### Performance

- Ajuster `MAX_CONCURRENT_SCRAPES` selon vos ressources
- Augmenter le délai entre chaque scraping pour éviter la détection
- Monitorer l'utilisation de la mémoire avec `docker stats`

## Commandes utiles

```bash
# Voir les logs en temps réel
docker-compose logs -f scrapper

# Redémarrer le service
docker-compose restart scrapper

# Accéder au conteneur
docker-compose exec scrapper sh

# Tester la connexion DB
docker-compose exec scrapper node -e "require('./src/config/database').query('SELECT NOW()')"
```

## TODO

- [ ] Ajouter votre script Puppeteer dans `vieScolaireScraper.js`
- [ ] Adapter les requêtes SQL selon votre schéma de base de données
- [ ] Configurer les URLs et sélecteurs de l'application de vie scolaire
- [ ] Tester le scraping manuellement avant d'activer le CRON
- [ ] Ajouter des tests unitaires
- [ ] Implémenter un système de retry en cas d'échec
- [ ] Ajouter une API REST pour déclencher manuellement le scraping
