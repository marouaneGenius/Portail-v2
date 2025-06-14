import axios from "axios";
import { nbSeancesMap, nbSeancesperWeek, StandardDays } from "../../mocks/mocks";
import { TarificationLigne } from "./views/LevyTableComponent";
import { ContractData } from "./views/TarificationCalculator";

  interface StageData {
    start_date: Date;
    end_date: Date;
    hours_per_day: number;
    days_per_week: number;
    weeks: number;
    unit_price_before: number;
    unit_price_after: number;
    discount?: number;
  }
  interface TarifsStage {
    tarifs_semaines: Record<number, number>;
    tarif_semaine_supplementaire: number;
  }

  interface PreInscriptionData {
    formule_horaire: string;
    remise?: number;
    jour_prelevement: string;
    date_edition: string;
    admin_override?: boolean;
  }

  interface PreInscriptionResult {
    lignes: Array<{
      description: string;
      datePrelevement: string;
      nbSeances: number;
      tarifAvant: number;
      tarifApres: number;
    }>;
    totalApresReduction: number;
    coutHoraire: number;
  }

  type FormuleHoraire = '1h30' | '3h00' | '4h30' | '6h00';

  interface TarifDetails {
    prix: number;
    seances: number; // Nombre de séances par mois
  }

  type TarifsNiveau = Record<FormuleHoraire, TarifDetails>;

  const TARIFS: { 
    primaire: any; 
    college: TarifsNiveau 
  } = {
    primaire: {
      '1h30': { prix: 125, seances: 4 },   // 1 séance/semaine (4/mois)
      '3h00': { prix: 215, seances: 8 },   // 2 séances/semaine (8/mois)
      '4h30': { prix: 250, seances: 12 },  // 3 séances/semaine (12/mois)
      '6h00': { prix: 320, seances: 16 }   // 4 séances/semaine (16/mois)
    },
    college: {
      '1h30': { prix: 150, seances: 4 },
      '3h00': { prix: 240, seances: 8 },
      '4h30': { prix: 290, seances: 12 },
      '6h00': { prix: 370, seances: 16 }
    }
  };

  const CLASSES_COLLEGE_LYCEE = [
    '6ème', '5ème', '4ème', '3ème', 
    '2nd', '1ère', 'Term'
  ];

  const DUREES_PAR_SEANCE: Record<string, number> = {
    '1h': 1.0,
    '1h30': 1.5,
    '3h': 1.5,       // Compatibilité ancienne nomenclature
    '3h00': 1.5,
    '4h30': 1.5,
    '6h': 1.5,       // Compatibilité ancienne nomenclature
    '6h00': 1.5
  };

  function getTarifsStage(data: ContractData): TarifsStage {

    return {
      tarifs_semaines: {
        1: 350,
        2: 620,
        3: 930
      },
      tarif_semaine_supplementaire: 300
    };
  }

  export function computeStageTarification(data: StageData) {
    const {
      start_date,
      end_date,
      hours_per_day,
      days_per_week,
      weeks,
      unit_price_before,
      unit_price_after,
      discount = 0
    } = data;

    // Calcul du nombre total d'heures
    const total_hours = weeks * days_per_week * hours_per_day;

    // Calcul des dates de prélèvement (ex: chaque lundi)
    const payment_dates: Date[] = [];
    const current_date = new Date(start_date);
    
    // Trouve le premier lundi
    while (current_date.getDay() !== 1) {
      current_date.setDate(current_date.getDate() + 1);
    }

    // Génère les dates de paiement
    for (let i = 0; i < weeks; i++) {
      const payment_date = new Date(current_date);
      payment_date.setDate(current_date.getDate() + (i * 7));
      payment_dates.push(payment_date);
    }

    // Formatage des dates en français
    const french_months = ['janvier', 'février', 'mars', 'avril', 'mai', 'juin', 'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'];
    const french_days = ['dimanche', 'lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi'];

    // Création des lignes du tableau
    const lignes = payment_dates.map((date, index) => {
      const formatted_date = `${french_days[date.getDay()]} ${date.getDate()} ${french_months[date.getMonth()]} ${date.getFullYear()}`;
      
      return {
        description: `Échéance ${index + 1}`,
        datePrelevement: formatted_date,
        nbSeances: days_per_week * hours_per_day,
        tarifAvant: unit_price_before,
        tarifApres: unit_price_after,
      };
    });

    // Calcul des totaux
    const total_apres_reduction = unit_price_after * weeks;
    const cout_horaire = total_hours > 0 ? total_apres_reduction / total_hours : 0;

    return { 
      lignes, 
      totalApresReduction: total_apres_reduction, 
      coutHoraire: cout_horaire,
      totalHeures: total_hours
    };
  }

  export function getClosestStandardDate(date: Date): Date {
    const day = date.getDate();
    let closest = StandardDays[0];
    let minDiff = Math.abs(day - closest);
    for (const d of StandardDays) {
      const diff = Math.abs(day - d);
      if (diff < minDiff) {
        minDiff = diff;
        closest = d;
      }
    }
    const result = new Date(date);
    result.setDate(closest);
    return result;
  }
  
  /** Calcule le nombre de semaines complètes entre deux dates (inclusives) */
  export function weeksBetween(start: Date, end: Date): number {
    const msPerWeek = 1000 * 60 * 60 * 24 * 7;
    return Math.ceil((end.getTime() - start.getTime() + 1) / msPerWeek);
  }
  
  /** Génère le tableau de tarification et totaux */
  export function computeTarification(data: ContractData, price:any) {
    const {
      subscription_start_date,
      payment_mode,
      classe,
      session_per_week,
      is_combined,
      is_combined_stage,
      subscription_end_date,
      first_debit_date,

      remise = 0,
    } = data;
  
    // 1. Détermination du tarif unitaire selon la classe et le combo
    let priceByClass: Record<number, number>;
    const baseKey = is_combined || is_combined_stage
      ? [ "CP","CE1","CE2","CM1","CM2" ].includes(classe)
        ? {1:125,2:215,3:250,4:320}
        : {1:150,2:240,3:290,4:370}
      : [ "CP","CE1","CE2","CM1","CM2" ].includes(classe)
        ? {1:160,2:250,3:310,4:370}
        : {1:180,2:290,3:340,4:410};
    priceByClass = baseKey;
  
    // 2. Nombre de séances par semaine
    const seancesParSemaine:any = session_per_week;

    const dureeSeance = 1.5; // heures
  
    // 3. Point d’entrée des calculs
    const lignes: TarificationLigne[] = [];
    let totalApresReduction = 0;
    let totalHeures = 0;
  
    const prelevementDate = new Date(subscription_start_date);
  
    // Helper pour formater FR
    const fmtFR = (d: Date) =>
      d.toLocaleDateString("fr-FR", {
        weekday: "long",
        day: "2-digit",
        month: "long",
        year: "numeric",
      });

    if (data.subscription_type === 'stage') {
      const tarifs = getTarifsStage(data);
      const nb_semaines = data.week_count || 0;
      
      // Calcul du prix avant réduction
      let prix_avant = 0;
      
      // Semaines standard (1-3)
      if (nb_semaines <= 3) {
        prix_avant = tarifs.tarifs_semaines[nb_semaines] || 0;
      } 
      // Semaines supplémentaires (>3)
      else {
        const semaines_supp = nb_semaines - 3;
        prix_avant = tarifs.tarifs_semaines[3] + (semaines_supp * tarifs.tarif_semaine_supplementaire);
      }
      
      // Application de la réduction
      const prix_apres = prix_avant * (1 - (data.remise || 0) / 100);

      return computeStageTarification({
        start_date: new Date(data.subscription_start_date),
        end_date: new Date(data.subscription_end_date),
        hours_per_day: 3, // 3h par jour comme dans ton PHP
        days_per_week: 5, // 5 jours par semaine
        weeks: data.week_count || 0,
        unit_price_before: prix_avant,
        unit_price_after: prix_apres,
        discount: data.remise
      });
    }

    if(data.subscription_type === 'preinscription') {
       return computePreInscription(data, classe, price);
    }
  
    if (payment_mode === "annuel") {
      // Ajustement date début lundi et fin dimanche
      let debut = new Date(subscription_start_date);
      while (debut.getDay() !== 1) debut.setDate(debut.getDate() + 1);
      let fin = new Date(subscription_end_date);
      while (fin.getDay() !== 0) fin.setDate(fin.getDate() - 1);



  
      const nbWeeks = debut <= fin ? weeksBetween(debut, fin) : 0;
      const nbSeances = seancesParSemaine * nbWeeks;
      const tarifMoitie = price / 2;
  
      lignes.push({
        description: "Annuel",
        datePrelevement: fmtFR(prelevementDate),
        nbSeances,
        tarifAvant: price,
        tarifApres: tarifMoitie,
      });
  
      totalApresReduction += tarifMoitie;
      totalHeures += nbSeances * dureeSeance;
  
    } else if (payment_mode === "trimestriel") {
      const debut = new Date(subscription_start_date);
      const fin = new Date(subscription_end_date);
      const moisTotal = (fin.getFullYear() - debut.getFullYear()) * 12 + (fin.getMonth() - debut.getMonth());
      const nbTrimestres = Math.ceil((moisTotal + 1) / 3);
  
      for (let t = 0; t < nbTrimestres; t++) {
        const qStart = new Date(debut);
        qStart.setMonth(debut.getMonth() + t * 3);
        const qEnd = new Date(qStart);
        qEnd.setMonth(qStart.getMonth() + 3, 0);
  
        // Ramener aux bornes liturgiques
        while (qStart.getDay() !== 1) qStart.setDate(qStart.getDate() + 1);
        while (qEnd.getDay() !== 0) qEnd.setDate(qEnd.getDate() - 1);
  
        const nbWeeks = qStart <= qEnd ? weeksBetween(qStart, qEnd) : 0;
        const nbSeances = seancesParSemaine * nbWeeks;
        const tarifMoitie = price / 2;

  
        lignes.push({
          description: `${t + 1}ᵉ – trimestriel`,
          datePrelevement: fmtFR(prelevementDate),
          nbSeances,
          tarifAvant: price,
          tarifApres: tarifMoitie,
        });
  
        totalApresReduction += tarifMoitie;
        totalHeures += nbSeances * dureeSeance;
      }
  
    } else {


      // Mensualités
      const debut = new Date(subscription_start_date);
      const fin = new Date(subscription_end_date);

      // console.log(debut, fin)

      const diffDays = Math.ceil((fin.getTime() - debut.getTime() + 1) / (1000*60*60*24));
      const nbSemaines = diffDays > 8
        ? Math.ceil(diffDays / 7)
        : Math.ceil(Math.max(0, diffDays - 1) / 7);
      const totalSeances = seancesParSemaine * nbSemaines;
      const nbMois = Math.ceil(totalSeances / (seancesParSemaine * 4));
  
      for (let i = 0; i < nbMois; i++) {
        // Nombre de séances ce mois
        const seancesCeMois = (i === nbMois - 1)
          ? totalSeances - i * seancesParSemaine * 4
          : seancesParSemaine * 4;
  
        // Date de paiement : le prelevement + i mois, ramené au jour standard
        const dp = new Date(first_debit_date);
        dp.setMonth(dp.getMonth() + i);
        const dpStd = getClosestStandardDate(dp);
  
        // Calcul des prix
        const tarifReduit = price * (1 - remise / 100);
        const tarifMoitie = price / 2;

  
        lignes.push({
          description: `${i + 1}ᵉ – mensualité`,
          datePrelevement: fmtFR(dpStd),
          nbSeances: seancesCeMois,
          tarifAvant: price,
          tarifApres: tarifMoitie,
        });
  
        totalApresReduction += tarifMoitie;
        totalHeures += seancesCeMois * dureeSeance;
      }
    }
  
    const coutHoraire = totalHeures > 0
      ? totalApresReduction / totalHeures
      : 0;
  
    return { lignes, totalApresReduction, coutHoraire };
  }

  export function computePreInscription(
    data: any,
    classe: string,
    price:any
  ):any
  // : PreInscriptionResult
   
  {
    // Déterminer le niveau (primaire ou collège/lycée)
    const niveau = CLASSES_COLLEGE_LYCEE.includes(classe) ? 'college' : 'primaire';

    // // Normaliser la formule horaire
    let formule = nbSeancesperWeek[data.session_per_week -1];

  
    // // Récupérer les tarifs
    const tarifInfo = TARIFS[niveau][formule] || { prix: 0, seances: 0 };
    const prixMensuel = tarifInfo.prix;
    const nbSeancesMois = tarifInfo.seances;
    const dayOfDebit = parseInt(data.recurrent_debit_date, 10);
    const allowedMonths = [8, 9, 10, 11, 0, 1, 2, 3, 4];
    const today = new Date();
    const year = today.getFullYear();
    // 4. Construire la date de prélèvement pour chaque mois de la liste
    const prelevementDates = allowedMonths.map(monthIndex => {
      // si monthIndex < 8 (i.e. 0 à 4), on est sur l'année suivante
      const y = monthIndex < 8 ? year + 1 : year;
      return new Date(y, monthIndex, dayOfDebit);
    });
    
    // 5. Tes tableaux de noms
    const moisNames = ['septembre', 'octobre', 'novembre', 'décembre','janvier', 'février', 'mars', 'avril', 'mai'];
    const jourNames = ['dimanche', 'lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi'];
    
    // 6. Construire les lignes
    const lignes = prelevementDates.map((date, idx) => {
      const nbSemaines = 4;
      const montant = price * (1 - (data.remise || 0) / 100);
      const tarifApres = price /2;
    
      return {
        description: `${idx + 1}${idx === 0 ? 'er' : 'ème'} mensualité`,
        datePrelevement: `${jourNames[date.getDay()]} ${date.getDate()} ${moisNames[idx]} ${date.getFullYear()}`,
        nbSeances: nbSeancesMois,
        tarifAvant :montant,
        tarifApres
      };
    });
  
    // Calcul des totaux
    const totalApresReduction = lignes.reduce((sum, ligne) => sum + ligne.tarifApres, 0);
    const dureeSeance = DUREES_PAR_SEANCE[formule] || 1.5;
    const totalHeures = prelevementDates.length * nbSeancesMois * dureeSeance;
    const coutHoraire = totalHeures > 0 ? totalApresReduction / totalHeures : 0;

    return {
      lignes,
      totalApresReduction,
      coutHoraire
    };
  }


  export function getNiveauScolaire(classe:string) {
    const primaire = ['CP', 'CE1', 'CE2', 'CM1', 'CM2'];
    const college  = ['6ème', '5ème', '4ème', '3ème', 'Terminale'];
  
    if (primaire.includes(classe)) {
      return 'primaire';
    }
    if (college.includes(classe)) {
      return 'college';
    }
    return null; // ou "lycée" si tu veux couvrir 2nd/1ère/Term
  }

  export  const endDateFeePrelevement = (subscription:any, subscriptionType:any) => {
    if(subscriptionType === 'stage') {
      return new Date(subscription.created_at);
    }
    if(subscriptionType === 'annuel') {
      return new Date(subscription.subscription_end_date);
    } 
    if(subscriptionType === 'preinscription')  {
      const year = new Date().getFullYear();
      return new Date(year, 8, 15);
    }
  }



  export function getPrice(subscriptionType:string, hoursOrWeeks:any, level:any, options:any = {}) {
    // Tarifs pour "preinscription"
    const pre:any = {
      primaire: {
        '1': { prix: 125, seances: 4 },
        '2': { prix: 215, seances: 8 },
        '3': { prix: 250, seances: 12 },
        '4': { prix: 320, seances: 16 },
      },
      college: {
        '1': { prix: 150, seances: 4 },
        '2': { prix: 240, seances: 8 },
        '3': { prix: 290, seances: 12 },
        '4': { prix: 370, seances: 16 },
      },
    };

    // Tarifs pour "annuel"
    const annuelCombined = {
      primaire: { ...pre.primaire },
      college:  { ...pre.college  },
    };
    const annuelSingle = {
      primaire: {
        '1': { prix: 160, seances: 4 },
        '2': { prix: 250, seances: 8 },
        '3': { prix: 310, seances: 12 },
        '4': { prix: 370, seances: 16 },
      },
      college: {
        '1': { prix: 180, seances: 4 },
        '2': { prix: 290, seances: 8 },
        '3': { prix: 340, seances: 12 },
        '4': { prix: 410, seances: 16 },
      },
    };

    // Tarifs pour "stage" (semaines)
    const stageMember =    { 1: 280, 2: 500, 3: 800 };
    const stageNonMember = { 1: 350, 2: 620, 3: 930 };
    const extraMember      = 200;  // euros / semaine supplémentaire
    const extraNonMember   = 300;


    if(subscriptionType !== null && subscriptionType !== undefined) {

      switch (subscriptionType) {
        case 'preinscription':
          console.log(pre[level][hoursOrWeeks].prix )

          if (!level || !pre[level] || !pre[level][hoursOrWeeks]) {
            return null;
          } 


          return pre[level][hoursOrWeeks].prix;
    
        case 'annuel':
          if (!level) return null;
          const isCombined = Boolean(options.combined);
          const tableAnnuel:any = isCombined ? annuelCombined : annuelSingle;
          if (!tableAnnuel[level] || !tableAnnuel[level][hoursOrWeeks]) return null;
          return tableAnnuel[level][hoursOrWeeks].prix;
    
        case 'stage':
          const weeks = Number(hoursOrWeeks);
          const isMember = Boolean(options.isMember);
          const baseTable:any = isMember ? stageMember : stageNonMember;
          const extraRate = isMember ? extraMember : extraNonMember;
          if (weeks <= 0) return null;
          if (weeks <= 3) {
            return baseTable[weeks] || null;
          }
          // plus de 3 semaines : tarif pour 3 + extras
          return baseTable[3] + extraRate * (weeks - 3);
    
        // default:
        //   return null;
      }
    }



  }

  /**
   * Convertit une URL (data URL ou blob URL) en Blob
   */
  export const urlToBlob = async (url: string): Promise<Blob> => {
    // Cas d'une blob URL (commence par blob:)
    if (url.startsWith('blob:')) {
      const response = await fetch(url);
      return await response.blob();
    }
    
    // Cas d'un data URL (base64)
    if (url.startsWith('data:')) {
      const [header, base64Data] = url.split(',');
      const mimeType = header.match(/:(.*?);/)?.[1];
      
      if (!base64Data || !mimeType) {
        throw new Error('Format de data URL invalide');
      }

      const byteCharacters = atob(base64Data);
      const byteArrays = [];

      for (let offset = 0; offset < byteCharacters.length; offset += 512) {
        const slice = byteCharacters.slice(offset, offset + 512);
        const byteNumbers = new Array(slice.length);

        for (let i = 0; i < slice.length; i++) {
          byteNumbers[i] = slice.charCodeAt(i);
        }

        byteArrays.push(new Uint8Array(byteNumbers));
      }

      return new Blob(byteArrays, { type: mimeType });
    }

    throw new Error('Format d\'URL non supporté');
  };

  export const dataUrlToBlob = (dataUrl: string): any => {

    console.log

    // const [header, base64Data] = dataUrl.split(',');
    // const mimeType = header.match(/:(.*?);/)?.[1];
    
    // if (!base64Data || !mimeType) {
    //   throw new Error('Format de data URL invalide');
    // }
  
    // const byteCharacters = atob(base64Data);
    // const byteArrays = [];
  
    // for (let offset = 0; offset < byteCharacters.length; offset += 512) {
    //   const slice = byteCharacters.slice(offset, offset + 512);
    //   const byteNumbers = new Array(slice.length);
  
    //   for (let i = 0; i < slice.length; i++) {
    //     byteNumbers[i] = slice.charCodeAt(i);
    //   }
  
    //   byteArrays.push(new Uint8Array(byteNumbers));
    // }
  
    // return new Blob(byteArrays, { type: mimeType });
  };
  
  /**
   * Crée un FormData avec le fichier et les métadonnées
   */
  export const createUploadFormData = (
      fileBlob: Blob,
      fileName: string,
      metadata: Record<string, string>
    ): FormData => {
    const formData = new FormData();
    formData.append('file', fileBlob, fileName);
  
    Object.entries(metadata).forEach(([key, value]) => {
      formData.append(key, value);
    });
  
    return formData;
  };
  
  /**
   * Envoie les données au serveur
   */
  export const uploadToServer = async (url: string, formData: FormData, authToken: any) => {
    const response = await axios.post(url, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
        'Authorization': `Bearer ${authToken}`,
      },
    });
    return response.data;
  };
  
  

