import React from "react";

/**
 * CautionChequeNotice
 * -------------------
 * Conversion du bloc PHP/HTML « Chèque de caution » en composant React + Tailwind.
 *
 * Le texte varie selon la date d’édition :
 *   • Si édition ≥ 22 novembre 2024 → 1 chèque.
 *   • Sinon → 3 chèques.
 *
 * Props
 * -----
 * • `price`        : montant (nombre ou string) du/des chèque(s)
 * • `editionDate`  : Date de l’édition du contrat (Date | string ISO)
 * • `cautionDate`  : Date limite de dépôt du/des chèque(s) (Date | string ISO)
 */
interface CautionChequeNoticeProps {
  price: number | string;
  editionDate: Date | string;
  cautionDate: Date | string;
}

const LIMIT_DATE = new Date("2024-11-22");

const CautionChequeNotice: React.FC<CautionChequeNoticeProps> = ({
  price,
  editionDate,
  cautionDate,
}) => {
  // Normalise les dates
  const edition = new Date(editionDate);
  const caution = new Date(cautionDate);

  // Détermine s’il faut 1 ou 3 chèques
  const chequeCount = edition >= LIMIT_DATE ? 1 : 3;

  // Format prix (ex. « 1 200 »)
  const formattedPrice =
    typeof price === "number"
      ? new Intl.NumberFormat("fr-FR", { minimumFractionDigits: 0 }).format(price)
      : price;

  // Format date en français (ex. « mardi 02 janvier 2025 »)
  const formattedCautionDate = caution.toLocaleDateString("fr-FR", {
    weekday: "long",
    day: "2-digit",
    month: "long",
    year: "numeric",
  });

  return (
    <div className="space-y-4">
      <strong className="poppins-title-bold">Chèque de caution&nbsp;:</strong>

      <ul className="list-disc list-inside space-y-2">
        <li>
          GENIUS accepte un paiement trimestriel échelonné en plusieurs mensualités sous réserve que le
          Client fournisse {chequeCount === 1 ? "un chèque caution" : `${chequeCount} chèques de caution`} d&apos;un montant de {formattedPrice}€
          {chequeCount === 1 ? "" : " chacun"}, à déposer au plus tard le {formattedCautionDate} lors de l&apos;arrivée de son enfant.
        </li>
        <li>
          Sans ce dépôt à la date indiquée, le paiement s&apos;effectuera trimestriellement via Stripe sans
          bénéficier du Service Avance Immédiate proposé par l&apos;Urssaf.
        </li>
      </ul>
    </div>
  );
};

export default CautionChequeNotice;