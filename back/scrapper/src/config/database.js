const { Pool } = require('pg');
require('dotenv').config();

/**
 * Configuration de la connexion à la base de données PostgreSQL
 */
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  // Désactiver SSL pour Docker (PostgreSQL local)
  ssl: false,
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

// Gestion des erreurs de connexion
pool.on('error', (err) => {
  console.error('Erreur inattendue sur le client PostgreSQL', err);
  process.exit(-1);
});

/**
 * Exécute une requête SQL
 * @param {string} text - La requête SQL
 * @param {Array} params - Les paramètres de la requête
 * @returns {Promise<Object>} - Le résultat de la requête
 */
const query = async (text, params) => {
  const start = Date.now();
  try {
    const res = await pool.query(text, params);
    const duration = Date.now() - start;
    console.log('Requête exécutée', { text, duration, rows: res.rowCount });
    return res;
  } catch (error) {
    console.error('Erreur lors de l\'exécution de la requête', { text, error: error.message });
    throw error;
  }
};

/**
 * Récupère un client de la pool pour les transactions
 * @returns {Promise<Object>} - Un client de la pool
 */
const getClient = () => {
  return pool.connect();
};

module.exports = {
  query,
  getClient,
  pool,
};
