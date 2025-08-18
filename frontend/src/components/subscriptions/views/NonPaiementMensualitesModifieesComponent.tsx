import React from "react";

/**
 * NonPaiementMensualitesNotice
 * -----------------------------
 * Bloc statique : conditions de non-paiement des mensualités modifiées.
 */
const NonPaiementMensualitesNotice: React.FC = () => (
  <div className="space-y-4 m-1 ml-3 py-2 " style={{ letterSpacing: '0.02em' }}>
    <strong className="text-body">Non-paiement des Mensualités Modifiées&nbsp;:</strong>
    <p>
      En cas de retard de paiement, après contact de notre équipe, le Client dispose de 48 heures pour
      régulariser. Passé ce délai, GENIUS encaissera les chèques de caution pour couvrir les montants
      restants jusqu’à la prochaine date de résiliation. L’abonnement sera automatiquement annulé à la
      date de résiliation  prévue si le paiement n’est pas mis à jour.
    </p>
  </div>
);

export default NonPaiementMensualitesNotice;
