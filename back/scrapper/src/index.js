require('dotenv').config();
const cron = require('cron');
const logger = require('./config/logger');
const VieScolaireScraper = require('./scrapers/vieScolaireScraper');

/**
 * Point d'entrée principal du service de scrapping
 */

// Configuration de l'intervalle de scraping (par défaut toutes les 24 heures)
const SCRAPE_INTERVAL_HOURS = parseInt(process.env.SCRAPE_INTERVAL_HOURS || '24', 10);

/**
 * Exécute le scraping de tous les élèves
 */
async function runScraping() {
  logger.info('=== Début de la tâche de scraping ===');
  const scraper = new VieScolaireScraper();

  try {
    const results = await scraper.scrapeAllStudents();

    const summary = {
      total: results.length,
      success: results.filter(r => r.success).length,
      failed: results.filter(r => !r.success).length,
      timestamp: new Date().toISOString()
    };

    logger.info('=== Tâche de scraping terminée ===', summary);

    return summary;
  } catch (error) {
    logger.error('Erreur lors de l\'exécution du scraping', { error: error.message, stack: error.stack });
    throw error;
  } finally {
    await scraper.cleanup();
  }
}

/**
 * Configure et démarre le scheduler CRON
 */
function setupScheduler() {
  // Exécution toutes les X heures
  const cronExpression = `0 */${SCRAPE_INTERVAL_HOURS} * * *`;

  logger.info(`Configuration du scheduler avec l'intervalle: ${SCRAPE_INTERVAL_HOURS} heures`);
  logger.info(`Expression CRON: ${cronExpression}`);

  const job = new cron.CronJob(
    cronExpression,
    async () => {
      try {
        await runScraping();
      } catch (error) {
        logger.error('Erreur dans la tâche CRON', { error: error.message });
      }
    },
    null,
    true,
    'Europe/Paris'
  );

  job.start();
  logger.info('Scheduler CRON démarré avec succès');

  return job;
}

/**
 * Gestion de l'arrêt gracieux
 */
function setupGracefulShutdown(job) {
  const shutdown = async (signal) => {
    logger.info(`Signal ${signal} reçu, arrêt du service...`);

    if (job) {
      job.stop();
      logger.info('Scheduler CRON arrêté');
    }

    // Attendre que les tâches en cours se terminent
    await new Promise(resolve => setTimeout(resolve, 5000));

    logger.info('Service arrêté proprement');
    process.exit(0);
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));
}

/**
 * Démarrage du service
 */
async function start() {
  try {
    logger.info('=== Démarrage du service de scraping de vie scolaire ===');
    logger.info(`Environnement: ${process.env.NODE_ENV || 'development'}`);

    // Vérifier la connexion à la base de données
    const db = require('./config/database');
    await db.query('SELECT NOW()');
    logger.info('Connexion à la base de données établie');

    // Configuration du scheduler
    const job = setupScheduler();

    // Configuration de l'arrêt gracieux
    setupGracefulShutdown(job);

    // Exécution immédiate au démarrage (optionnel)
    if (process.env.RUN_ON_START === 'true') {
      logger.info('Exécution immédiate au démarrage activée');
      await runScraping();
    }

    logger.info('=== Service de scraping démarré et en attente ===');

  } catch (error) {
    logger.error('Erreur fatale lors du démarrage du service', {
      error: error.message,
      stack: error.stack
    });
    process.exit(1);
  }
}

// Démarrage du service
start();

// Export pour les tests ou l'utilisation externe
module.exports = {
  runScraping,
  setupScheduler,
};
