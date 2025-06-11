import React from "react";

interface EngagementPaiementNoticeProps {
  remise?: number;
}

const EngagementPaiementNotice: React.FC<EngagementPaiementNoticeProps> = ({ remise = 0 }) => (
  <div className="space-y-4">
    <strong className="poppins-title-bold">Engagement de paiement&nbsp;:</strong>

    <ul className="list-disc list-inside space-y-2">
      <li>
        L&apos;abonnement au service de soutien scolaire constitue un engagement de paiement pour une
        durée minimale de trois mois.
      </li>
      <li>
        Aucune modification ou annulation de l&apos;abonnement n&apos;est possible avant la fin de la
        période trimestrielle. Aucun délai de rétractation ne sera accordé après la signature du
        contrat.
      </li>
      {remise !== 0 && (
        <li>
          Cet abonnement bénéficie d&apos;une offre famille suite à l&apos;inscription de plusieurs
          enfants. Vous reconnaissez que la réduction ne sera plus applicable si vous arrêtez
          l’abonnement de l’un des enfants. Le tarif sera automatiquement réévalué sans cette
          réduction.
        </li>
      )}
    </ul>
  </div>
);

export default EngagementPaiementNotice;
