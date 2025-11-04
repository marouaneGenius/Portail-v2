const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
const logger = require('../config/logger');
const db = require('../config/database');

puppeteer.use(StealthPlugin());

/**
 * Classe pour le scrapping des données Pronote
 */
class VieScolaireScraper {
  constructor() {
    this.browser = null;
    this.page = null;
  }

  /**
   * Initialise le navigateur et la page
   */
  async init(headless = true) {
    try {
      logger.info('Initialisation du scraper Pronote');
      this.browser = await puppeteer.launch({
        headless: headless ? 'new' : false,
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-accelerated-2d-canvas',
          '--no-first-run',
          '--no-zygote',
          '--disable-gpu',
        ],
        executablePath: process.env.PUPPETEER_EXECUTABLE_PATH || undefined,
      });
      this.page = await this.browser.newPage();

      // Configuration de la page
      await this.page.setViewport({ width: 1920, height: 1080 });
      await this.page.setUserAgent(
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      );

      logger.info('Navigateur initialisé avec succès');
    } catch (error) {
      logger.error('Erreur lors de l\'initialisation du scraper', { error: error.message });
      throw error;
    }
  }

  /**
   * Récupère les identifiants de connexion depuis la base de données
   * @param {number} studentId - ID de l'élève
   * @returns {Promise<Object>} - Identifiants et URL Pronote
   */
  async getCredentials(studentId) {
    try {
      const result = await db.query(
        'SELECT school_app, school_app_url, school_app_username, school_app_password FROM student WHERE id = $1',
        [studentId]
      );

      if (result.rows.length === 0) {
        throw new Error(`Aucun identifiant trouvé pour l'élève ${studentId}`);
      }

      const row = result.rows[0];

      if (row.school_app !== 'pronote') {
        throw new Error(`L'élève ${studentId} n'a pas Pronote configuré (school_app: ${row.school_app})`);
      }

      if (!row.school_app_url || !row.school_app_username || !row.school_app_password) {
        throw new Error(`Identifiants Pronote incomplets pour l'élève ${studentId}`);
      }

      return {
        pronoteLink: row.school_app_url,
        username: row.school_app_username,
        password: row.school_app_password,
      };
    } catch (error) {
      logger.error('Erreur lors de la récupération des identifiants', { studentId, error: error.message });
      throw error;
    }
  }

  /**
   * Gestion de l'enregistrement d'appareil Pronote
   */
  async handleDeviceRegistration(deviceName, timeout = 5000) {
    try {
      logger.info(`Attente du popup d'enregistrement (timeout: ${timeout}ms)...`);

      const inputSelector = await Promise.race([
        this.page.waitForSelector('input[id*="inp"][placeholder*="Domicile"], input[id*="inp"][placeholder*="appareil"]', { visible: true, timeout })
          .then(() => 'input[id*="inp"]'),
        this.page.waitForSelector('input[type="text"][placeholder*="Domicile"]', { visible: true, timeout })
          .then(() => 'input[type="text"][placeholder*="Domicile"]'),
        new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), timeout))
      ]).catch(() => null);

      if (!inputSelector) {
        logger.info('Aucun popup d\'enregistrement détecté');
        return false;
      }

      logger.info(`Popup d'enregistrement détecté (selector: ${inputSelector})`);

      // Cocher la case "faire confiance"
      const checkboxChecked = await this.page.evaluate(() => {
        const checkbox = document.querySelector('input[type="checkbox"][id*="ccb"]');
        if (checkbox && !checkbox.checked) {
          checkbox.click();
          return true;
        }
        return checkbox?.checked || false;
      });
      if (checkboxChecked) {
        logger.info('Case "faire confiance" cochée');
      }

      // Saisir le nom de l'appareil
      await this.page.waitForSelector(inputSelector, { visible: true });
      await this.page.type(inputSelector, deviceName);
      logger.info(`Nom de l'appareil saisi: ${deviceName}`);

      await new Promise(resolve => setTimeout(resolve, 500));

      // Cliquer sur Valider
      let buttonClicked = false;

      try {
        await this.page.click('button[id$="_btns_1"]', { timeout: 3000 });
        buttonClicked = true;
        logger.info('Bouton Valider cliqué (Stratégie 1)');
      } catch (e) {
        try {
          const [validerButton] = await this.page.$x("//button[contains(text(), 'Valider')]");
          if (validerButton) {
            await validerButton.click();
            buttonClicked = true;
            logger.info('Bouton Valider cliqué (Stratégie 2)');
          }
        } catch (e2) {
          const buttons = await this.page.$$('button.themeBoutonPrimaire');
          for (const button of buttons) {
            const text = await this.page.evaluate(el => el.innerText, button);
            if (text.includes('Valider')) {
              await button.click();
              buttonClicked = true;
              logger.info('Bouton Valider cliqué (Stratégie 3)');
              break;
            }
          }
        }
      }

      if (!buttonClicked) {
        logger.warn('Impossible de trouver le bouton Valider');
        return false;
      }

      await new Promise(resolve => setTimeout(resolve, 2000));

      // Vérifier si popup de confirmation (nom déjà utilisé)
      const hasConfirmationPopup = await this.page.evaluate(() => {
        const popup = document.querySelector('p.ObjetMessage-contenu-a3ad3155');
        return popup && popup.innerText.includes('Vous avez déjà utilisé ce nom');
      });

      if (hasConfirmationPopup) {
        logger.info('Popup de confirmation détecté - validation finale');
        await this.page.evaluate(() => {
          const buttons = Array.from(document.querySelectorAll('button.themeBoutonPrimaire'));
          const validerButton = buttons[buttons.length - 1];
          if (validerButton && validerButton.innerText.includes('Valider')) {
            validerButton.click();
          }
        });
        await new Promise(resolve => setTimeout(resolve, 2000));
      }

      logger.info('Enregistrement d\'appareil terminé');
      return true;
    } catch (error) {
      logger.error('Erreur lors de l\'enregistrement d\'appareil', { error: error.message });
      return false;
    }
  }

  /**
   * Scrape données Pronote - Compte parent
   */
  async scrapePronoteParent(pronoteLink, username, password) {
    const randomDigit = `Geniusclassroom-${Date.now()}`;
    logger.info('Scraping Pronote Parent', { url: pronoteLink, username });

    await this.page.goto(pronoteLink, { waitUntil: 'networkidle2', timeout: 60000 });

    // Connexion
    await this.page.waitForSelector('input[type="text"][placeholder*="identifiant"]', { visible: true });
    await this.page.waitForSelector('input[type="password"][placeholder*="mot de passe"]', { visible: true });
    await this.page.type('input[type="text"][placeholder*="identifiant"]', username);
    await this.page.type('input[type="password"][placeholder*="mot de passe"]', password);

    await this.page.waitForSelector('button:not([disabled])', { visible: true });
    await new Promise(resolve => setTimeout(resolve, 500));
    await this.page.click('button.themeBoutonPrimaire');

    // Gestion enregistrement appareil
    await this.handleDeviceRegistration(randomDigit);

    logger.info('Attente de la liste des éléments...');
    await this.page.waitForSelector("ul.liste-clickable li", { visible: true, timeout: 30000 });

    // Scraping du dashboard
    const dashboardData = await this.page.evaluate(() => {
      // Notes
      const notesRows = Array.from(document.querySelectorAll("section.widget.notes ul.liste-clickable li, ul.liste-clickable li")).filter(li => {
        return li.querySelector(".infos-conteneur .date") && li.querySelector("h3 span") && li.querySelector(".as-info.fixed");
      });

      const notes = notesRows.map(row => {
        const dateElement = row.querySelector(".infos-conteneur .date");
        const subjectElement = row.querySelector("h3 span");
        const gradeElement = row.querySelector(".as-info.fixed");
        const scaleElement = row.querySelector(".bareme");

        const date = dateElement ? dateElement.innerText.trim() : null;
        const subject = subjectElement ? subjectElement.innerText.trim() : null;
        let grade = gradeElement ? gradeElement.childNodes[0].nodeValue.trim() : null;
        const scale = scaleElement ? scaleElement.innerText.trim() : null;

        if (scale) {
          grade += ` ${scale}`;
        }

        return { date, subject, grade };
      });

      // Prochains DS
      const dsRows = Array.from(document.querySelectorAll("section.widget.ds ul.liste-clickable li"));
      const prochainDS = dsRows.map(row => {
        const dayElement = row.querySelector(".bloc-date-conteneur div:first-child");
        const monthElement = row.querySelector(".bloc-date-conteneur div:nth-child(2)");
        const subjectElement = row.querySelector(".infos-ds-conteneur h3");
        const dateTimeElement = row.querySelector(".infos-ds-conteneur .date");
        const salleElement = row.querySelector(".infos-ds-conteneur span:last-child");

        const day = dayElement ? dayElement.innerText.trim() : null;
        const month = monthElement ? monthElement.innerText.trim() : null;
        const subject = subjectElement ? subjectElement.innerText.trim() : null;
        const dateTime = dateTimeElement ? dateTimeElement.innerText.trim() : null;
        const salle = salleElement ? salleElement.innerText.trim() : null;

        return { day, month, subject, dateTime, salle };
      });

      // Travail à faire
      const tafSections = Array.from(document.querySelectorAll("section.widget.travailafaire .conteneur-liste-CDT > ul > li"));
      const travailAFaire = tafSections.map(section => {
        const dateHeader = section.querySelector("h3");
        const dateText = dateHeader ? dateHeader.innerText.trim() : null;

        const tasks = Array.from(section.querySelectorAll("ul.sub-liste > li")).map(taskLi => {
          const subjectElement = taskLi.querySelector(".titre-matiere");
          const statusElement = taskLi.querySelector(".tag-style .text");
          const descriptionElement = taskLi.querySelector(".description");

          const subject = subjectElement ? subjectElement.innerText.trim() : null;
          const status = statusElement ? statusElement.innerText.trim() : null;
          const description = descriptionElement ? descriptionElement.innerText.trim() : null;

          return { subject, status, description };
        });

        return { date: dateText, tasks };
      });

      return { notes, prochainDS, travailAFaire };
    });

    logger.info('Données Pronote Parent récupérées', {
      notes: dashboardData.notes.length,
      ds: dashboardData.prochainDS.length,
      taf: dashboardData.travailAFaire.length
    });

    return dashboardData;
  }

  /**
   * Scrape données Pronote - Élève direct
   */
  async scrapePronoteEleveDirect(pronoteLink, username, password) {
    const randomDigit = `Geniusclassroom-${Date.now()}`;
    logger.info('Scraping Pronote Élève Direct', { url: pronoteLink, username });

    await this.page.goto(pronoteLink, { waitUntil: 'networkidle2', timeout: 60000 });

    // Connexion
    await this.page.type("input[id='id_29']", username);
    await this.page.type("input[id='id_30']", password);
    await this.page.click("button[id='id_18']");

    // Gestion enregistrement appareil
    const popupHandled = await this.handleDeviceRegistration(randomDigit, 3000);

    if (!popupHandled) {
      logger.info('Méthode fallback clavier...');
      await new Promise(resolve => setTimeout(resolve, 2000));
      await this.page.keyboard.type(randomDigit.toString());
      await this.page.keyboard.press("Enter");
      await this.page.waitForNavigation({ waitUntil: "networkidle2" });
    }

    logger.info("Connexion réussie!");
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Clic sur Notes
    await this.page.evaluate(() => {
      const target = document.querySelector("div[id='GInterface.Instances[0].Instances[1]_Combo2']");
      if (target && target.parentElement) {
        target.parentElement.click();
      }
    });

    await this.page.waitForSelector('div.liste_celluleGrid', { visible: true });

    const data = await this.page.evaluate(() => {
      const rows = Array.from(document.querySelectorAll("div.liste_celluleGrid"));
      return rows.map(row => {
        const dateElement = row.querySelector("div.zone-gauche time");
        const subjectElement = row.querySelector("div.titre-principal");
        const gradeElement = row.querySelector("div.zone-complementaire span.note-devoir");

        const date = dateElement ? dateElement.innerText.trim() : null;
        const subject = subjectElement ? subjectElement.innerText.trim() : null;
        const grade = gradeElement ? gradeElement.innerText.trim() : null;

        return { date, subject, grade };
      });
    });

    logger.info('Données Pronote Élève récupérées', { notes: data.length });
    return { notes: data };
  }

  /**
   * Scrape données Pronote - Élève IDF via portail
   */
  async scrapePronoteEleveIDF(pronoteLink, username, password) {
    const randomDigit = `Geniusclassroom-${Date.now()}`;
    logger.info('Scraping Pronote Élève IDF', { url: pronoteLink, username });

    await this.page.goto(pronoteLink, { waitUntil: 'networkidle2', timeout: 60000 });

    // Connexion portail IDF
    await this.page.type("input[id='username']", username);
    await this.page.type("input[id='password']", password);
    await this.page.waitForSelector("#kc-login", { visible: true });
    await this.page.click("#kc-login");

    // Clic sur Pronote
    await this.page.waitForSelector('a[href*="pronote"]', { visible: true });

    const [newPage] = await Promise.all([
      new Promise(resolve => this.browser.once('targetcreated', target => resolve(target.page()))),
      this.page.click('a[href*="pronote"]')
    ]);

    await new Promise(resolve => setTimeout(resolve, 2000));
    await newPage.bringToFront();
    this.page = newPage; // Basculer vers la nouvelle page

    // Clic sur élève
    await this.page.waitForSelector('a[href*="eleve"]', { visible: true });
    await this.page.click('a[href*="eleve"]');
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Clic sur Notes
    await this.page.evaluate(() => {
      const target = document.querySelector("div[id='GInterface.Instances[0].Instances[1]_Combo2']");
      if (target && target.parentElement) {
        target.parentElement.click();
      }
    });

    await this.page.waitForSelector('div.liste_celluleGrid', { visible: true });

    const data = await this.page.evaluate(() => {
      const rows = Array.from(document.querySelectorAll("div.liste_celluleGrid"));
      return rows.map(row => {
        const dateElement = row.querySelector("div.zone-gauche time");
        const subjectElement = row.querySelector("div.titre-principal");
        const gradeElement = row.querySelector("div.zone-complementaire span.note-devoir");

        const date = dateElement ? dateElement.innerText.trim() : null;
        const subject = subjectElement ? subjectElement.innerText.trim() : null;
        const grade = gradeElement ? gradeElement.innerText.trim() : null;

        return { date, subject, grade };
      });
    });

    logger.info('Données Pronote IDF récupérées', { notes: data.length });
    return { notes: data };
  }

  /**
   * Router vers la bonne méthode selon l'URL Pronote
   */
  async scrapeData(pronoteLink, username, password) {
    try {
      logger.info('Début du scraping Pronote', { pronoteLink });

      let data;

      // Détection du type de compte
      if (pronoteLink.includes("monlycee") && pronoteLink.includes("IDF")) {
        data = await this.scrapePronoteEleveIDF(pronoteLink, username, password);
      } else if (pronoteLink.includes("parent") && pronoteLink.includes("pronote")) {
        data = await this.scrapePronoteParent(pronoteLink, username, password);
      } else if (pronoteLink.includes("index-education") && pronoteLink.includes("eleve")) {
        data = await this.scrapePronoteEleveDirect(pronoteLink, username, password);
      } else {
        throw new Error(`Type de lien Pronote non reconnu: ${pronoteLink}`);
      }

      logger.info('Scraping des données terminé', { dataKeys: Object.keys(data) });
      return data;
    } catch (error) {
      logger.error('Erreur lors du scraping des données', { error: error.message, stack: error.stack });
      throw error;
    }
  }

  /**
   * Sauvegarde les données dans la base de données
   * @param {number} studentId - ID de l'élève
   * @param {Object} data - Données à sauvegarder
   */
  async saveData(studentId, data) {
    const client = await db.getClient();
    const crypto = require('crypto');
    let stats = {
      grades: { inserted: 0, duplicates: 0 },
      exams: { inserted: 0, duplicates: 0 },
      homework: { inserted: 0, duplicates: 0 }
    };

    try {
      await client.query('BEGIN');

      // Sauvegarder les notes
      if (data.notes && Array.isArray(data.notes)) {
        for (const note of data.notes) {
          if (!note.date || !note.subject || !note.grade) continue;

          const result = await client.query(
            `INSERT INTO pronote_grade (student_id, date, subject, grade, scraped_at, created_at)
             VALUES ($1, $2, $3, $4, NOW(), NOW())
             ON CONFLICT ON CONSTRAINT unique_grade DO NOTHING
             RETURNING id`,
            [studentId, note.date, note.subject, note.grade]
          );

          if (result.rowCount > 0) {
            stats.grades.inserted++;
          } else {
            stats.grades.duplicates++;
          }
        }
      }

      // Sauvegarder les DS (devoirs surveillés)
      if (data.prochainDS && Array.isArray(data.prochainDS)) {
        for (const ds of data.prochainDS) {
          if (!ds.day || !ds.month || !ds.subject || !ds.dateTime) continue;

          const result = await client.query(
            `INSERT INTO pronote_exam (student_id, day, month, subject, date_time, salle, scraped_at, created_at)
             VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW())
             ON CONFLICT ON CONSTRAINT unique_exam DO NOTHING
             RETURNING id`,
            [studentId, ds.day, ds.month, ds.subject, ds.dateTime, ds.salle || null]
          );

          if (result.rowCount > 0) {
            stats.exams.inserted++;
          } else {
            stats.exams.duplicates++;
          }
        }
      }

      // Sauvegarder le travail à faire
      if (data.travailAFaire && Array.isArray(data.travailAFaire)) {
        for (const tafSection of data.travailAFaire) {
          if (!tafSection.date || !tafSection.tasks) continue;

          for (const task of tafSection.tasks) {
            if (!task.subject) continue;

            // Générer un hash de la description pour détecter les doublons
            const descriptionHash = task.description
              ? crypto.createHash('sha256').update(task.description).digest('hex')
              : null;

            const result = await client.query(
              `INSERT INTO pronote_homework (student_id, date, subject, status, description, description_hash, scraped_at, created_at)
               VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW())
               ON CONFLICT ON CONSTRAINT unique_homework DO NOTHING
               RETURNING id`,
              [studentId, tafSection.date, task.subject, task.status || null, task.description || null, descriptionHash]
            );

            if (result.rowCount > 0) {
              stats.homework.inserted++;
            } else {
              stats.homework.duplicates++;
            }
          }
        }
      }

      await client.query('COMMIT');
      logger.info('Données sauvegardées avec succès', { studentId, stats });

      return stats;
    } catch (error) {
      await client.query('ROLLBACK');
      logger.error('Erreur lors de la sauvegarde des données', { studentId, error: error.message, stack: error.stack });
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Scrape les données pour un élève spécifique
   * @param {number} studentId - ID de l'élève
   */
  async scrapeStudent(studentId) {
    try {
      logger.info('Début du scraping pour l\'élève', { studentId });

      // Récupération des identifiants
      const credentials = await this.getCredentials(studentId);

      // Scraping des données avec les credentials
      const data = await this.scrapeData(
        credentials.pronoteLink,
        credentials.username,
        credentials.password
      );

      // Sauvegarde des données
      await this.saveData(studentId, data);

      logger.info('Scraping terminé avec succès', { studentId });
      return { success: true, studentId, data };
    } catch (error) {
      logger.error('Erreur lors du scraping de l\'élève', { studentId, error: error.message, stack: error.stack });
      return { success: false, studentId, error: error.message };
    }
  }

  /**
   * Scrape tous les élèves qui ont des identifiants
   */
  async scrapeAllStudents() {
    try {
      logger.info('Début du scraping de tous les élèves');

      const result = await db.query(
        "SELECT id FROM student WHERE school_app = 'pronote' AND school_app_url IS NOT NULL AND school_app_username IS NOT NULL AND school_app_password IS NOT NULL"
      );

      const students = result.rows;
      logger.info(`${students.length} élèves à scraper`);

      const results = [];

      for (const student of students) {
        await this.init(); // Nouvelle instance pour chaque élève
        const result = await this.scrapeStudent(student.id);
        results.push(result);
        await this.cleanup(); // Nettoyage après chaque élève

        // Attendre un peu entre chaque scraping pour éviter la détection
        await new Promise(resolve => setTimeout(resolve, 5000));
      }

      logger.info('Scraping de tous les élèves terminé', {
        total: results.length,
        success: results.filter(r => r.success).length,
        failed: results.filter(r => !r.success).length
      });

      return results;
    } catch (error) {
      logger.error('Erreur lors du scraping de tous les élèves', { error: error.message });
      throw error;
    }
  }

  /**
   * Nettoie les ressources
   */
  async cleanup() {
    try {
      if (this.page) {
        await this.page.close();
        this.page = null;
      }
      if (this.browser) {
        await this.browser.close();
        this.browser = null;
      }
      logger.info('Ressources nettoyées');
    } catch (error) {
      logger.error('Erreur lors du nettoyage des ressources', { error: error.message });
    }
  }
}

module.exports = VieScolaireScraper;

// Si le fichier est exécuté directement
if (require.main === module) {
  (async () => {
    const scraper = new VieScolaireScraper();
    try {
      await scraper.init();
      await scraper.scrapeAllStudents();
    } catch (error) {
      logger.error('Erreur fatale', { error: error.message });
      process.exit(1);
    } finally {
      await scraper.cleanup();
      process.exit(0);
    }
  })();
}
