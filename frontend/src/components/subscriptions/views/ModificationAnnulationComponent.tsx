import React from "react";

/**
 * ModificationAnnulationNotice
 * -----------------------------
 * Bloc statique : conditions de modification et d'annulation d’un abonnement annuel.
 */
const ModificationAnnulationNotice: React.FC = () => (
  <div className="space-y-4 m-1 py-2" style={{ letterSpacing: '0.02em' }}>
    <strong className="text-body">Modification et Annulation&nbsp;:</strong>
    <p>
      Il n'est pas possible de modifier ou d'annuler un abonnement annuel avant la fin du trimestre 
      en cours. Une fois le trimestre écoulé, le client peut demander un changement d'abonnement selon
      les procédures énoncées ci-dessous.
    </p>
  </div>
);

export default ModificationAnnulationNotice;
