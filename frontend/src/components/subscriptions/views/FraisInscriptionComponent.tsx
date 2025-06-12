import React from "react";
import { ContractHeaderProps } from "./HeaderComponent";
import { MEMEBERSHIP_FEE, nbSeancesperWeek } from "../../../mocks/mocks";
import { endDateFeePrelevement, getNiveauScolaire } from "../SubscriptionFunctions";

const FraisInscriptionComponent: React.FC<ContractHeaderProps> = ({student, subscription, subscriptionType, price}) => {

  const formatDateFr = (date: Date | string) =>
    new Date(date).toLocaleDateString("fr-FR", {
      weekday: "long",
      day: "2-digit",
      month: "long",
      year: "numeric",
    });

  const montantTrimestre = price * 3;
  const fraisInscriptionEndDate:any = endDateFeePrelevement(subscription, subscriptionType)

  return (
    <div className="space-y-4 m-1 py-2">
      <h6 className="font-semibold">Application du taux de TVA en vigueur.</h6>
 
      {MEMEBERSHIP_FEE && (
        <p>
          <strong>Frais d&apos;inscription&nbsp;</strong> de {MEMEBERSHIP_FEE / 2}€ (après
          réduction), facturés le{" "}
          {formatDateFr(fraisInscriptionEndDate)} (Avance Immédiate URSSAF).
        </p>
      )}

        <div className="mt-4">
          <p className="font-semibold">
            ⚠️ Le paiement mensuel indiqué dans le tableau ci-dessous est valable :
          </p>
          <br />
          <strong>
            Uniquement sous réserve de la remise du chèque de caution ({montantTrimestre}€) d&apos;ici
            le {formatDateFr(fraisInscriptionEndDate)}.
          </strong>
             <p className="mt-2">
            À défaut, les paiements s&apos;effectueront sur une base trimestrielle, conformément à
            l&apos;engagement minimal requis.
          </p>
        </div>
    </div>
  );
};

export default FraisInscriptionComponent;
