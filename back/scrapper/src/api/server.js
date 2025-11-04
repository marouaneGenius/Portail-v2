const express = require('express');
const logger = require('../config/logger');
const VieScolaireScraper = require('../scrapers/vieScolaireScraper');

const app = express();
const PORT = process.env.API_PORT || 3000;

// Middleware
app.use(express.json());

// Middleware de logging
app.use((req, res, next) => {
  logger.info('API Request', {
    method: req.method,
    path: req.path,
    body: req.body,
    ip: req.ip
  });
  next();
});

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'vie-scolaire-scrapper'
  });
});

/**
 * POST /api/scrape/:studentId
 * Déclenche le scraping pour un élève spécifique
 */
app.post('/api/scrape/:studentId', async (req, res) => {
  const { studentId } = req.params;

  if (!studentId || isNaN(parseInt(studentId))) {
    return res.status(400).json({
      success: false,
      error: 'studentId invalide'
    });
  }

  logger.info('Déclenchement du scraping via API', { studentId: parseInt(studentId) });

  const scraper = new VieScolaireScraper();

  try {
    await scraper.init();
    const result = await scraper.scrapeStudent(parseInt(studentId));

    if (result.success) {
      res.json({
        success: true,
        message: `Scraping terminé pour l'élève ${studentId}`,
        data: result.data
      });
    } else {
      res.status(500).json({
        success: false,
        error: result.error
      });
    }
  } catch (error) {
    logger.error('Erreur lors du scraping via API', { studentId, error: error.message });
    res.status(500).json({
      success: false,
      error: error.message
    });
  } finally {
    await scraper.cleanup();
  }
});

/**
 * POST /api/scrape-all
 * Déclenche le scraping pour tous les élèves
 */
app.post('/api/scrape-all', async (req, res) => {
  logger.info('Déclenchement du scraping de tous les élèves via API');

  const scraper = new VieScolaireScraper();

  try {
    const results = await scraper.scrapeAllStudents();

    res.json({
      success: true,
      message: 'Scraping de tous les élèves terminé',
      summary: {
        total: results.length,
        success: results.filter(r => r.success).length,
        failed: results.filter(r => !r.success).length
      },
      results
    });
  } catch (error) {
    logger.error('Erreur lors du scraping de tous les élèves via API', { error: error.message });
    res.status(500).json({
      success: false,
      error: error.message
    });
  } finally {
    await scraper.cleanup();
  }
});

/**
 * GET /api/scrape/status/:studentId
 * Vérifie si un élève a des identifiants Pronote configurés
 */
app.get('/api/scrape/status/:studentId', async (req, res) => {
  const { studentId } = req.params;

  if (!studentId || isNaN(parseInt(studentId))) {
    return res.status(400).json({
      success: false,
      error: 'studentId invalide'
    });
  }

  const db = require('../config/database');

  try {
    const result = await db.query(
      'SELECT pronote_link, pronote_username FROM student WHERE id = $1',
      [parseInt(studentId)]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Élève non trouvé'
      });
    }

    const hasCredentials = !!(
      result.rows[0].pronote_link &&
      result.rows[0].pronote_username
    );

    res.json({
      success: true,
      hasCredentials,
      pronoteLink: result.rows[0].pronote_link || null
    });
  } catch (error) {
    logger.error('Erreur lors de la vérification du statut', { studentId, error: error.message });
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Gestion des erreurs 404
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'Route non trouvée'
  });
});

// Gestion des erreurs globales
app.use((err, req, res, next) => {
  logger.error('Erreur serveur', { error: err.message, stack: err.stack });
  res.status(500).json({
    success: false,
    error: 'Erreur interne du serveur'
  });
});

// Démarrage du serveur
function startServer() {
  return new Promise((resolve) => {
    const server = app.listen(PORT, '0.0.0.0', () => {
      logger.info(`API REST démarrée sur le port ${PORT}`);
      resolve(server);
    });
  });
}

// Si le fichier est exécuté directement
if (require.main === module) {
  startServer();
}

module.exports = { app, startServer };
