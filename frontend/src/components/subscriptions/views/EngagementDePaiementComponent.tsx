import React from "react";

interface EngagementPaiementNoticeProps {
  remise?: number;
}

const EngagementPaiementNotice: React.FC<EngagementPaiementNoticeProps> = ({ remise = 0 }) => (
  <div className="space-y-4 m-1 py-2" style={{ letterSpacing: '0.02em' }}>
    <strong className="poppins-title-bold">Engagement de paiement&nbsp;:</strong>

    <ul className="list-disc list-inside space-y-2">
      <li>
        L&apos;abonnement au service de soutien scolaire constitue un <strong>engagement de paiement pour une durée minimale de trois mois.</strong>
      </li>
      <li>
        À défaut de résiliation notifiée dans les délais et selon les modalités prévues à l’article 6, <strong>le contrat est reconduit tacitement pour un nouveau trimestre </strong>, soit une durée supplémentaire de trois mois.
      </li>
      <li>
        Le client sera alors réputé engagé et tenu d’honorer intégralement le paiement correspondant à ce nouveau trimestre.
      </li>
      <li>
        Aucun délai de rétractation ne sera accordé après la signature du contrat.
      </li>
      {remise !== 0 && (
        <li>
          Cet abonnement bénéficie d&apos;une offre famille suite à l&apos;inscription de plusieurs enfants. Vous reconnaissez que la réduction ne sera plus applicable si vous arrêtez l’abonnement de l’un des enfants. Le tarif sera automatiquement réévalué sans cette réduction.
        </li>
      )}
    </ul>
  </div>
);

export default EngagementPaiementNotice;
