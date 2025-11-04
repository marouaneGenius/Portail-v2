const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');

// Ajout du plugin Stealth pour éviter la détection
puppeteer.use(StealthPlugin());

/**
 * Configuration par défaut pour Puppeteer
 */
const defaultConfig = {
  headless: 'new',
  args: [
    '--no-sandbox',
    '--disable-setuid-sandbox',
    '--disable-dev-shm-usage',
    '--disable-accelerated-2d-canvas',
    '--no-first-run',
    '--no-zygote',
    '--disable-gpu',
    '--disable-web-security',
    '--disable-features=IsolateOrigins,site-per-process',
  ],
  executablePath: process.env.PUPPETEER_EXECUTABLE_PATH || undefined,
};

/**
 * Configuration de la page pour éviter la détection
 * @param {Object} page - La page Puppeteer
 */
const configurePage = async (page) => {
  // Configuration du viewport
  await page.setViewport({ width: 1920, height: 1080 });

  // Configuration du User-Agent
  await page.setUserAgent(
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
  );

  // Configuration des en-têtes supplémentaires
  await page.setExtraHTTPHeaders({
    'Accept-Language': 'fr-FR,fr;q=0.9,en-US;q=0.8,en;q=0.7',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
  });

  // Masquer l'automatisation WebDriver
  await page.evaluateOnNewDocument(() => {
    Object.defineProperty(navigator, 'webdriver', { get: () => false });
  });
};

/**
 * Crée et configure une nouvelle instance de navigateur
 * @param {Object} customConfig - Configuration personnalisée
 * @returns {Promise<Object>} - Instance du navigateur
 */
const createBrowser = async (customConfig = {}) => {
  const config = { ...defaultConfig, ...customConfig };
  const browser = await puppeteer.launch(config);
  return browser;
};

/**
 * Crée et configure une nouvelle page
 * @param {Object} browser - Instance du navigateur
 * @returns {Promise<Object>} - Instance de la page configurée
 */
const createPage = async (browser) => {
  const page = await browser.newPage();
  await configurePage(page);
  return page;
};

/**
 * Attend que l'élément soit visible et clique dessus
 * @param {Object} page - La page Puppeteer
 * @param {string} selector - Le sélecteur CSS
 * @param {Object} options - Options d'attente
 */
const waitAndClick = async (page, selector, options = {}) => {
  await page.waitForSelector(selector, { visible: true, timeout: 30000, ...options });
  await page.click(selector);
};

/**
 * Attend que l'élément soit visible et saisit du texte
 * @param {Object} page - La page Puppeteer
 * @param {string} selector - Le sélecteur CSS
 * @param {string} text - Le texte à saisir
 * @param {Object} options - Options d'attente
 */
const waitAndType = async (page, selector, text, options = {}) => {
  await page.waitForSelector(selector, { visible: true, timeout: 30000, ...options });
  await page.type(selector, text, { delay: 50 }); // Délai pour simuler la saisie humaine
};

/**
 * Prend une capture d'écran pour le débogage
 * @param {Object} page - La page Puppeteer
 * @param {string} name - Nom du fichier
 */
const takeScreenshot = async (page, name) => {
  if (process.env.NODE_ENV !== 'production') {
    await page.screenshot({
      path: `logs/screenshots/${name}-${Date.now()}.png`,
      fullPage: true
    });
  }
};

module.exports = {
  createBrowser,
  createPage,
  configurePage,
  waitAndClick,
  waitAndType,
  takeScreenshot,
  defaultConfig,
};
