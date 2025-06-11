import React from "react";

export interface ProcedureResiliationProps {
  /**  
   * Type de souscription (1 = mensuel, sinon = annuel/autre)  
   */
  subscriptionType: number;
  /**  
   * Dates de fin de contrat retournées par la logique back-end (ISO 8601)  
   */ 
  endDates: string[];
}

/**
 * ProcedureResiliationNotice
 * --------------------------
 * Affiche la procédure de résiliation avec les dates de fin et leurs délais
 * de notification (–7 jours pour mensuel, –15 jours pour autre).
 */
const ProcedureResiliationNotice: React.FC<ProcedureResiliationProps> = ({
  subscriptionType,
  endDates,
}) => {
  // Nombre de jours à retrancher selon le type
  const offsetDays = subscriptionType === 1 ? 7 : 15;

  // Formatte une date ISO en "jour dd mois yyyy"
  const formatFR = (isoDate: string): string => {
    const d = new Date(isoDate);
    return d.toLocaleDateString("fr-FR", {
      weekday: "long",
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  };

  // Calcule la date limite de résiliation
  const computeDeadline = (isoDate: string): string => {
    const d = new Date(isoDate);
    d.setDate(d.getDate() - offsetDays);
    return formatFR(d.toISOString());
  };

  return (
    <div className="space-y-4">
      <strong className="text-body">Procédure de Résiliation&nbsp;:</strong>
      <p>
        La résiliation doit être notifiée sur la plateforme de gestion&nbsp;
        <a
          href="https://gestion.geniusclass.fr"
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 underline"
        >
          gestion.geniusclass.fr
        </a>
        &nbsp;aux dates indiquées ci-dessous.
      </p>
      <ul className="list-disc list-inside space-y-2">
        {endDates.map((endIso, idx) => {
          const endFr = formatFR(endIso);
          const deadlineFr = computeDeadline(endIso);
          return (
            <li key={idx}>
              {endFr} (Résiliation au plus tard le&nbsp;: {deadlineFr})
            </li>
          );
        })}
      </ul>
    </div>
  );
};

export default ProcedureResiliationNotice;
