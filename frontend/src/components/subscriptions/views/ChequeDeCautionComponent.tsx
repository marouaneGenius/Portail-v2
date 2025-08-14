import React from "react";
import { ContractHeaderProps } from "./HeaderComponent";
import { endDateFeePrelevement, getNiveauScolaire } from "../SubscriptionFunctions";

const ChequeDeCautionComponent: React.FC<ContractHeaderProps> = ({student, subscription, subscriptionType, price}) => {
  const fraisInscriptionEndDate:any = endDateFeePrelevement(subscription, subscriptionType)
  const caution = new Date(fraisInscriptionEndDate);
  const chequeCount = 1;

  const formattedCautionDate = caution.toLocaleDateString("fr-FR", {
    weekday: "long",
    day: "2-digit",
    month: "long",
    year: "numeric",
  });

  const chequeMontant = price ? price * 3 : 'N/C';

  return (
    <div className="space-y-4  m-1 py-2" style={{ letterSpacing: '0.02em' }}>
      <strong className="poppins-title-bold">Chèque de caution&nbsp;:</strong>
      <ul className="list-disc list-inside space-y-2">
        <li>
          GENIUS accepte&nbsp; un paiement&nbsp; trimestriel&nbsp; échelonné en plusieurs&nbsp; mensualités&nbsp; sous réserve que le
          Client fournisse&nbsp; un chèque caution&nbsp; d&apos;un montant&nbsp; de {chequeMontant}€
          {chequeCount === 1 ? "" : " chacun"}, à déposer au plus tard&nbsp; le {formattedCautionDate} &nbsp;lors de l&apos;arrivée de son enfant.
        </li>
        <li>
          Sans ce dépôt à la date indiquée, le paiement s&apos;effectuera trimestriellement via Stripe sans
          bénéficier du Service Avance Immédiate proposé par l&apos;Urssaf.
        </li>
      </ul>
    </div>
  );
};

export default ChequeDeCautionComponent;