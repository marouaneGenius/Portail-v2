import React from "react";
import TarificationTable, { TarificationLigne } from "./LevyTableComponent";
import { computeTarification } from "../SubscriptionFunctions";


export interface ContractData {
  subscription_start_date: Date;   // ISO string
  date_debut_abo: string;     // ISO string
  subscription_end_date: Date;       // ISO string
  payment_mode: "annuel" | "trimestriel" | "mensuel";
  session_per_week: string;      // "Lundi | Mercredi", etc.
  is_combined: boolean;
  is_combined_stage: boolean;
  remise?: number;     
  first_debit_date?:any       // en pourcentage, optionnel
  subscription_type?:any;
  week_count?: number; // Nombre de semaines pour les stages
}

interface CalculatorProps {
  data: ContractData;
  price:any
}

/** Composant wrapper : calcule puis affiche la table */
const TarificationCalculator: React.FC<CalculatorProps> = ({ data, price }) => {
  const { lignes, totalApresReduction, coutHoraire } = computeTarification(data, price);
  return (
    <TarificationTable
      lignes={lignes}
      totalApresReduction={totalApresReduction}
      coutHoraire={coutHoraire}
      subscription_type={data.subscription_type}
    />
  );
};

export default TarificationCalculator;
