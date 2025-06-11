import React from "react";

interface TvaEtPaiementNoticeProps {
  montantFraisInscription: number;
  dateFraisInscription?: Date | string;
  datePrelevement?: Date | string;
  remiseCautionApplicable: boolean;
  editionDate: Date | string;
  dateCaution: Date | string;
  formule: string;
  niveau: "primaire" | "college";
  isCombined: boolean;
}

const TvaEtPaiementNotice: React.FC<TvaEtPaiementNoticeProps> = ({
  montantFraisInscription,
  dateFraisInscription,
  datePrelevement,
  remiseCautionApplicable,
  editionDate,
  dateCaution,
  formule,
  niveau,
  isCombined,
}) => {
  const formatDateFr = (date: Date | string) =>
    new Date(date).toLocaleDateString("fr-FR", {
      weekday: "long",
      day: "2-digit",
      month: "long",
      year: "numeric",
    });

  const FRAIS_REDUIT = montantFraisInscription === 90;
  const DATE_CAUTION_VISIBLE = remiseCautionApplicable && new Date(editionDate) >= new Date("2024-11-22");

  const Tarifs:any = isCombined
    ? {
        primaire: {
          "1h30": { prix: 125 },
          "3h00": { prix: 215 },
          "4h30": { prix: 250 },
          "6h00": { prix: 320 },
        },
        college: {
          "1h30": { prix: 150 },
          "3h00": { prix: 240 },
          "4h30": { prix: 290 },
          "6h00": { prix: 370 },
        },
      }
    : {
        primaire: {
          "1h30": { prix: 160 },
          "3h00": { prix: 250 },
          "4h30": { prix: 310 },
          "6h00": { prix: 370 },
        },
        college: {
          "1h30": { prix: 180 },
          "3h00": { prix: 290 },
          "4h30": { prix: 340 },
          "6h00": { prix: 410 },
        },
      };

  const formuleNorm = formule === "3h" ? "3h00" : formule === "6h" ? "6h00" : formule;
  const montantTrimestre = Tarifs[niveau][formuleNorm]?.prix * 3;

  return (
    <div className="space-y-4 text-sm">
      <h6 className="font-semibold">Application du taux de TVA en vigueur.</h6>

      {FRAIS_REDUIT && (
        <p>
          <strong>Frais d&apos;inscription&nbsp;</strong> de {montantFraisInscription / 2}€ (après
          réduction), facturés le{" "}
          {formatDateFr(dateFraisInscription || datePrelevement)} (Avance Immédiate URSSAF).
        </p>
      )}

      {DATE_CAUTION_VISIBLE && (
        <div className="mt-4">
          <p className="font-semibold">
            ⚠️ Le paiement mensuel indiqué dans le tableau ci-dessous est valable :
          </p>
          <br />
          <strong>
            Uniquement sous réserve de la remise du chèque de caution ({montantTrimestre}€) d&apos;ici
            le {formatDateFr(dateCaution)}.
          </strong>
          <p className="mt-2">
            À défaut, les paiements s&apos;effectueront sur une base trimestrielle, conformément à
            l&apos;engagement minimal requis.
          </p>
        </div>
      )}
    </div>
  );
};

export default TvaEtPaiementNotice;
