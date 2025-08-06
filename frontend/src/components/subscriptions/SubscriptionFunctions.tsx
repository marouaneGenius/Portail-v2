import axios from "axios";
import { ClassesOptionsLevel, nbSeancesMap, nbSeancesperWeek, StandardDays } from "../../mocks/mocks";
import { TarificationLigne } from "./views/LevyTableComponent";
import { ContractData } from "./views/TarificationCalculator";
import api from "../../api/aixos";

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


  export const getStagePrice = (    week_count: any,
    hasPreinscription: boolean,
    isMember: boolean) => {
     
    const baseTarifs:any = hasPreinscription || isMember
    ? { 1: 280, 2: 500, 3: 800 }
    : { 1: 350, 2: 620, 3: 930 };

    return baseTarifs[week_count];
  }


  export function computeStageTarification(
    data: any,
    hasPreinscription: boolean,
    isMember: boolean
  ) {
    // 1) Base tarifs
    const baseTarifs:any = hasPreinscription || isMember
      ? { 1: 280, 2: 500, 3: 800 }
      : { 1: 350, 2: 620, 3: 930 };
    const suppl = hasPreinscription || isMember ? 200 : 300;
  
    // 2) Prix total avant remise
    const nbSemaines = data.week_count;
    const prixTotalAvantRemise =
      nbSemaines <= 3
        ? baseTarifs[nbSemaines] ?? baseTarifs[1]
        : baseTarifs[3] + (nbSemaines - 3) * suppl;
  
    // 3) Appliquer la remise
    const prixReduit = Math.round(
      prixTotalAvantRemise * (1 - (data.discount ?? 0) / 100)
    );
  
    // 4) Déterminer le nombre d’échéances
    const nbEcheances =
      data.installment_count && data.installment_count > 0
        ? data.installment_count
        : data.selected_weeks.length;
  
    // 5) Répartition

    const prixAvantEch = Math.round((prixReduit * 2) / nbEcheances);
    const prixApresEch = Math.round(prixAvantEch / 2);
  
    const rawDatesIso = buildPaymentDates(
      data.first_debit_date,   // ta première date de prélèvement
      nbEcheances              // le nombre d’échéances calculé
    );
  
    // 7) Formatage FR
    const frenchDays = ['dimanche','lundi','mardi','mercredi','jeudi','vendredi','samedi'];
    const frenchMonths = ['janvier','février','mars','avril','mai','juin','juillet',
                          'août','septembre','octobre','novembre','décembre'];
    const formatFR = (iso: string) => {
      const d = new Date(iso);
      return `${frenchDays[d.getDay()]} ${String(d.getDate()).padStart(2,'0')} `
           + `${frenchMonths[d.getMonth()]} ${d.getFullYear()}`;
    };

    // 8) Construire les lignes
    const lignes: any[] = rawDatesIso.map((iso:any, idx:any) => ({
      description: `Échéance ${idx + 1}`,
      datePrelevement: formatFR(iso),
      tarifAvant: prixAvantEch,
      tarifApres: prixApresEch,
    }));
  
    // 9) Totaux
    const totalApresReduction = prixApresEch * nbEcheances;
    const totalHeures = nbSemaines * 5 * 3; // 3h/jour, 5j/sem
    const coutHoraire =
      totalHeures > 0 ? Number((totalApresReduction / totalHeures).toFixed(2)) : 0;
  
    return { lignes, totalApresReduction, coutHoraire };
  }

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
  export function computeTarification(data: any, price:any) {
    const {
      subscription_start_date,
      payment_mode,
      session_per_week,
      is_combined,
      is_combined_stage,
      subscription_end_date,
      first_debit_date,

      remise = 0,
    } = data;
  
    // 1. Détermination du tarif unitaire selon la classe et le combo
    let priceByClass: Record<number, number>;
  
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
      const is_member = false;
      const r = computeStageTarification(data, data.combined_id, is_member)
      return r
    }

    if(data.subscription_type === 'preinscription') {
       return computePreInscription(data, data.student.class, price);
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
        tarifAvant: price * 2,
        tarifApres: price,
      });
  
      totalApresReduction += tarifMoitie;
      totalHeures += nbSeances * dureeSeance;
  
    } else if (payment_mode === "trimeslle") {
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
        const nbSeances = (seancesParSemaine * nbWeeks) * 3;
        prelevementDate.setMonth(prelevementDate.getMonth() + 3);
  
        // Affichage de la date de prélèvement
        // console.log(prelevementDate);

        lignes.push({
          description: `${t + 1}ᵉ – trimestrielle`,
          datePrelevement: fmtFR(prelevementDate),
          nbSeances,
          tarifAvant: (price * 2) *3,
          tarifApres: price * 3, 
        });
  
        totalApresReduction += price;
        totalHeures += nbSeances * dureeSeance;
      }
    } else {
      // Mensualités
      const debut = new Date(subscription_start_date);
      const fin = new Date(subscription_end_date);

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
  
        lignes.push({
          description: `${i + 1}ᵉ – mensualité`,
          datePrelevement: fmtFR(dpStd),
          nbSeances: seancesCeMois,
          tarifAvant: price * 2,
          tarifApres: price,
        });
  
        totalApresReduction += price;
        totalHeures += seancesCeMois * dureeSeance;
      }
    }
  
    const coutHoraire = totalHeures > 0
      ? totalApresReduction / totalHeures
      : 0;

    console.log(coutHoraire, totalHeures, totalApresReduction)


    return { lignes, totalApresReduction, coutHoraire, payment_mode };
  }

  export function computePreInscription(
    data: any,
    classe: string,
    price:any
  ):any
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
      const tarifApres = price ;
    
      return {
        description: `${idx + 1}${idx === 0 ? 'er' : 'ème'} mensualité`,
        datePrelevement: `${jourNames[date.getDay()]} ${date.getDate()} ${moisNames[idx]} ${date.getFullYear()}`,
        nbSeances: nbSeancesMois,
        tarifAvant :montant * 2,
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

  export const showSubscriptionPrice = async (Sub:any) => {
    const combinedId = Sub.combined_id;
    return api.get(`/api/subs/combined/${combinedId}`)
    .then(res => {
      return res.data.map((sub:any) => sub.subscription_type)
    });
  }

  function buildPaymentDates(firstDateIso: string, count: number): string[] {
    const dates: string[] = [];
    const first = new Date(firstDateIso);
  
    for (let i = 0; i < count; i++) {
      const d = new Date(first);
      d.setMonth(first.getMonth() + i);
      // retransforme en ISO court YYYY-MM-DD pour plus de sécurité
      dates.push(d.toISOString().slice(0, 10));
    }
    return dates;
  }


  export const IsStudentIsMember = async (studentId: number | string) => {
    if (!studentId) return false;
    const res = await api.get(`/api/student/is-member/${studentId}`);
    return res.data.is_member === true;
  };
  


  export const IsStudentHaveBrothers = async (studentId: number | string) => {
    if (!studentId) return false;
    const res = await api.get(`/api/student/has-sibling/${studentId}`);
    return res.data.has_sibling === true;
  };

  export const getStudent = (id:any) => {
    return api.get(`/api/student/${id}`)
  }

  export const hasLevelForSubject = (tutor: any, studentClass: any, subjects: any[]) => {
    const level = classLevel(studentClass);
  
    const result = subjects.every((subj) => {
      const found = tutor.class.find((e:any) =>
        e.subject === subj && Number(e.level) >= Number(level)
      );
      if (!found) {
        console.log(`Pas trouvé: ${subj} pour niveau >= ${level}`);
      }
      return !!found;
    });
    return result;
  };

  export const classLevel = (studentClass:any) =>{
    const level=  ClassesOptionsLevel.find((subjectLevel:any) => subjectLevel.value === studentClass );
    return level?.level
  }

  export const getLevelOfClass = (tutorLevel:any) =>{
    const level=  ClassesOptionsLevel.find((subjectLevel:any) => subjectLevel.level === tutorLevel );
    return level?.value
  }

  export function getLevelForSubject(tutor:any, subject:any) {
    const found = tutor.class.find((classSubject:any) => classSubject.subject === subject);
    if (found) {
      const tutorClass = getLevelOfClass(found.level)
      return ` jusqu'en ${tutorClass}`;
    }
    return 'Pas de niveau trouvé';
  }