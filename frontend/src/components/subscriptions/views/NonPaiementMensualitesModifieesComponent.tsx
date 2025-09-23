import React from "react";

/**
 * NonPaiementMensualitesNotice
 * -----------------------------
 * Bloc statique : conditions de non-paiement des mensualités modifiées.
 */
const NonPaiementMensualitesNotice: React.FC = () => (
  <div className="space-y-4 m-1 ml-3 py-2 " style={{ letterSpacing: '0.02em' }}>
    <strong className="text-body">Non-paiement des Mensualités Modifiées&nbsp;:</strong>
    <ul className="list-disc list-inside space-y-2">
      <li>
        En cas de retard de paiement, après relance de notre équipe, le client dispose de 48 heures pour régulariser.
      </li>
      <li>
        Passé ce délai, <strong>GENIUS engagera une procédure de recouvrement par tous moyens légaux.</strong>
      </li>
      <li>
        Les <strong>frais de justice et d’huissier seront intégralement imputés au client débiteur.</strong>
      </li>
    </ul>
  </div>
);

export default NonPaiementMensualitesNotice;
