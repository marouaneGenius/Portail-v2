import React from "react";
import TarificationTable, { TarificationLigne } from "./LevyTableComponent";
import { computeTarification } from "../SubscriptionFunctions";


export interface ContractData {
  subscription_start_date: Date;   // ISO string
  date_debut_abo: string;     // ISO string
  subscription_end_date: Date;       // ISO string
  payment_mode: "annuel" | "trimestriel" | "mensuel";
  classe: string;             // ex. "CP", "CM1", etc.
  session_per_week: string;      // "Lundi | Mercredi", etc.
  is_combined: boolean;
  is_combined_stage: boolean;
  remise?: number;     
  first_debit_date?:any       // en pourcentage, optionnel
}

interface CalculatorProps {
  data: ContractData;
}

/** Composant wrapper : calcule puis affiche la table */
const TarificationCalculator: React.FC<CalculatorProps> = ({ data }) => {
  const { lignes, totalApresReduction, coutHoraire } = computeTarification(data);
  return (
    <TarificationTable
      lignes={lignes}
      totalApresReduction={totalApresReduction}
      coutHoraire={coutHoraire}
    />
  );
};

export default TarificationCalculator;
