/* -------------------------------------------------------------------------- */
/*                       3. ChequeEncashmentContractNotice                    */
/* -------------------------------------------------------------------------- */

/**
 * Contrat d'encaissement de chèque(s) de caution.
 *
 * N&apos;est pas rendu si `modePaiement` vaut "annuel".
 *
 * Règle d&apos;édition (même logique que `CautionChequeNotice`) :
 *   – édition ≥ 22/11/2024 → 1 chèque
 *   – sinon → 3 chèques
 */
interface ChequeEncashmentContractProps {
    parentTitle: "Mme." | "M." | string; // Titre (pour ajuster « soussigné·e »)
    parentFirstName: string;
    parentLastName: string;
    price: number | string;
    editionDate: Date | string;
    cautionDate: Date | string;
    modePaiement?: string; // e.g. "annuel", "trimestriel"…
  }
  
  export const ChequeEncashmentContract: React.FC<ChequeEncashmentContractProps> = ({
    parentTitle,
    parentFirstName,
    parentLastName,
    price,
    editionDate,
    cautionDate,
    modePaiement,
  }) => {
    if (modePaiement?.toLowerCase() === "annuel") return null; // même logique que le PHP
  
    const edition = new Date(editionDate);
    const caution = new Date(cautionDate);
    const chequeCount = edition >= LIMIT_DATE ? 1 : 3;
  
    const formattedPrice =
      typeof price === "number"
        ? new Intl.NumberFormat("fr-FR", { minimumFractionDigits: 0 }).format(price)
        : price;
  
    const formattedCautionDate = caution.toLocaleDateString("fr-FR", {
      weekday: "long",
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  
    const soussigne = parentTitle.toLowerCase().includes("mme") ? "soussignée" : "soussigné";
  
    return (
      <div className="space-y-4">
        <strong className="poppins-title-bold">
          Contrat d&apos;encaissement de chèque de caution&nbsp;:
        </strong>
  
        <ul className="list-disc list-inside space-y-2">
          <li>
            En qualité de représentant légal, je {soussigne}, {parentTitle} {parentFirstName} {parentLastName}, m&apos;engage à
            remettre à GENIUS {chequeCount === 1 ? "un chèque de caution" : `un total de ${chequeCount} chèques de caution d'un montant de ${formattedPrice}€ chacun`}
            {chequeCount === 1 ? ` d'un montant de ${formattedPrice}€` : ""}, libellé{chequeCount === 1 ? "" : "s"} à l&apos;ordre de GENIUS, à déposer au plus tard le {formattedCautionDate}.
          </li>
          <li>
            En cas de retard ou de refus de paiement, les chèques de caution pourront être encaissés sans
            que des séances de soutien scolaire puissent être réclamées en retour jusqu&apos;à mise à jour du
            moyen de paiement et dépôt de nouveaux chèques de caution.
          </li>
          <li>
            GENIUS détruira les chèques de caution restants à l&apos;issue de l&apos;abonnement du Client.
          </li>
        </ul>
      </div>
    );
  };
  