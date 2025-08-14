import React from "react";

/**
 * UrssafNotice
 * -------------
 * Bloc d'information statique concernant la création et gestion du compte URSSAF.
 */
const CreationGestionCompteURSSAFComponent: React.FC = () => (
  <div className="space-y-4 m-1 py-2" style={{ letterSpacing: '0.02em' }}>
    <strong className="poppins-title-bold">Création et gestion du compte URSSAF&nbsp;:</strong>

    <ul className="list-disc list-inside space-y-2 mt-5">
      <li>
        Le Client s'engage à fournir à GENIUS les informations nécessaires pour la création du compte URSSAF (identité  complète  et RIB) puis à l'activer.
      </li>
      <li>
        GENIUS s'engage à assister le Client dans la création de son compte URSSAF et à fournir toute documentation et support nécessaires pour une gestion correcte du compte URSSAF.
      </li>
      <li>
        Les factures  seront systématiquement  déposées sur votre compte particulier Urssaf 48 heures avant la date indiquée sur l’échéancier joint au devis.
      </li>
      <li>
        Si le Client ne valide pas son compte URSSAF dans les 48 heures suivant la signature du contrat ou ne parvient pas à le créer, GENIUS prélèvera automatiquement via Stripe. Le Client paiera la totalité de la somme sans bénéficier de la réduction immédiate.
      </li>
      <li>
        En cas de rejet de factures sur la plateforme URSSAF ou d'oppositions, GENIUS recouvrira les montants par tous les moyens de paiement possibles.
      </li>
    </ul>
  </div>
);

export default CreationGestionCompteURSSAFComponent;