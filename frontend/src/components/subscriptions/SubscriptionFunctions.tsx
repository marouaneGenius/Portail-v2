import { StandardDays } from "../../mocks/mocks";
import { TarificationLigne } from "./views/LevyTableComponent";
import { ContractData } from "./views/TarificationCalculator";

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
  export function computeTarification(data: ContractData) {
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


      console.log(payment_mode)
  
    if (payment_mode === "annuel") {
      // Ajustement date début lundi et fin dimanche
      let debut = new Date(subscription_start_date);
      while (debut.getDay() !== 1) debut.setDate(debut.getDate() + 1);
      let fin = new Date(subscription_end_date);
      while (fin.getDay() !== 0) fin.setDate(fin.getDate() - 1);



  
      const nbWeeks = debut <= fin ? weeksBetween(debut, fin) : 0;
      const nbSeances = seancesParSemaine * nbWeeks;
      const tarifTotal = ((priceByClass[seancesParSemaine] / 4) * nbWeeks) * 2;
      const tarifMoitie = tarifTotal / 2;
  
      lignes.push({
        description: "Annuel",
        datePrelevement: fmtFR(prelevementDate),
        nbSeances,
        tarifAvant: tarifTotal,
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
        const tarifTotal = ((priceByClass[seancesParSemaine] / 4) * nbWeeks) * 2;
        const tarifMoitie = tarifTotal / 2;
  
        lignes.push({
          description: `${t + 1}ᵉ – trimestriel`,
          datePrelevement: fmtFR(prelevementDate),
          nbSeances,
          tarifAvant: tarifTotal,
          tarifApres: tarifMoitie,
        });
  
        totalApresReduction += tarifMoitie;
        totalHeures += nbSeances * dureeSeance;
      }
  
    } else {
      // Mensualités
      const debut = new Date(subscription_start_date);
      const fin = new Date(subscription_end_date);
      console.log(debut, fin)

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
        const tarifBrut = (seancesCeMois * priceByClass[seancesParSemaine]) / 4;
        const tarifReduit = tarifBrut * (1 - remise / 100);
        const tarifMoitie = tarifReduit / 2;
  
        lignes.push({
          description: `${i + 1}ᵉ – mensualité`,
          datePrelevement: fmtFR(dpStd),
          nbSeances: seancesCeMois,
          tarifAvant: tarifBrut,
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