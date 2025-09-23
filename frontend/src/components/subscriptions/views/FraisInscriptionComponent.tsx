import React, { useEffect, useState } from "react";
import { ContractHeaderProps } from "./HeaderComponent";
import { MEMEBERSHIP_FEE, nbSeancesperWeek } from "../../../mocks/mocks";
import { endDateFeePrelevement, getNiveauScolaire, getPrice } from "../SubscriptionFunctions";

const FraisInscriptionComponent: React.FC<ContractHeaderProps> = ({student, subscription, subscriptionType, price}) => {


  const [feePrice, setFeePrice] = useState()
  const formatDateFr = (date: Date | string) =>
    new Date(date).toLocaleDateString("fr-FR", {
      weekday: "long",
      day: "2-digit",
      month: "long",
      year: "numeric",
    });

    useEffect(() => {
      let montantTrimestre;
      if(!subscription.combined_id) {
         montantTrimestre = price
      } else {
         montantTrimestre = subscriptionType === 'stage' ? price : ( price / 2 ) * 3  ;
      }

      setFeePrice(montantTrimestre)
    }, [subscription, subscriptionType, price])


   
  const fraisInscriptionEndDate:any = endDateFeePrelevement(subscription, subscriptionType)

  return (
    <div className="space-y-4 m-1 py-2">
      <h6 className="font-semibold">Application du taux de TVA en vigueur.</h6>
 
      {MEMEBERSHIP_FEE && (
        <p>
          <strong>Frais d&apos;inscription&nbsp;</strong> de {MEMEBERSHIP_FEE}€, facturés&nbsp; le{" "}
          {formatDateFr(fraisInscriptionEndDate)}.
        </p>
      )}

        {/* <div className="mt-4">
          <p className="font-semibold">
            ⚠️ Le paiement mensuel indiqué dans le tableau ci-dessous est valable :
          </p>
          <br />
          <strong>
            Uniquement sous réserve de la remise du chèque de caution ({feePrice}€) d&apos;ici
            le {formatDateFr(fraisInscriptionEndDate)}.
          </strong>
             <p className="mt-2">
            À défaut, les paiements&nbsp; s&apos;effectueront&nbsp; sur une base trimestrielle,&nbsp; conformément&nbsp; à
            l&apos;engagement minimal&nbsp; requis.
          </p>
        </div> */}
    </div>
  );
};

export default FraisInscriptionComponent;
