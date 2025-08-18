import React from "react";

interface EngagementPaiementNoticeProps {
  remise?: number;
}

const EngagementPaiementNotice: React.FC<EngagementPaiementNoticeProps> = ({ remise = 0 }) => (
  <div className="space-y-4  m-1 py-2" style={{ letterSpacing: '0.02em' }}>
    <strong className="poppins-title-bold">Engagement de paiement&nbsp;:</strong>

    <ul className="list-disc list-inside space-y-2">
      <li>
        L&apos;abonnement&nbsp; au service&nbsp; de soutien&nbsp; scolaire&nbsp; constitue&nbsp; un engagement&nbsp; de paiement&nbsp; pour une
        durée minimale&nbsp; de trois&nbsp; mois.
      </li>
      <li>
        Aucune modification&nbsp; ou annulation&nbsp; de l&apos;abonnement&nbsp; n&apos;est possible&nbsp; avant la fin&nbsp; de la
        période trimestrielle.&nbsp; Aucun délai de rétractation ne sera accordé après la signature&nbsp; du
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
