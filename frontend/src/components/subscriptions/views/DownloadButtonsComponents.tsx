import React from "react";

export interface NavBarDevisProps {
  centreId: string;
  eleveId: string;
  devisId: string;
  /** Identifiant de l’abonnement prépayé, si applicable */
  idPre?: string;
  /** Identifiant de l’abonnement stage, si applicable */
  idStage?: string;
  /** Rang de l’utilisateur ("1" pour administrateur) */
  rang: string;
  /** Nombre de devis déjà liés (0 = aucun) */
  linkedDevisCount: number;
  /** Indique si le (ou les) contrat(s) est(ent) déjà validé(s) */
  isContractValid: boolean;
  /** Callback lancé lorsqu’on clique sur “Ajouter Identifiant” */
  onAddIdentifiant: () => void;
}

const NavBarDevis: React.FC<NavBarDevisProps> = ({
  centreId,
  eleveId,
  devisId,
  idPre,
  idStage,
  rang,
  linkedDevisCount,
  isContractValid,
  onAddIdentifiant,
}) => {
  // construit l’URL de détail en fonction des paramètres
  const buildDetailsUrl = () => {
    const params = new URLSearchParams();
    params.set("centre", centreId);
    params.set("id", devisId);
    if (idPre) params.set("id_pre", idPre);
    if (idStage) params.set("id_stage", idStage);
    params.set("eleve", eleveId);
    return `/details_dates${idPre && !idStage ? "_annuel_pre" : ""}.php?${params.toString()}`;
  };

  // construit l’URL de validation de contrat
  const buildValidateUrl = () => {
    const params = new URLSearchParams();
    params.set("centre", centreId);
    params.set("id", devisId);
    if (idPre) params.set("id_pre", idPre);
    if (idStage) params.set("id_stage", idStage);
    params.set("eleve", eleveId);
    return `/validate_contract.php?${params.toString()}`;
  };

  return (
    <nav className="bg-gray-100 print:hidden">
      <div className="container mx-auto px-4 flex flex-wrap items-center justify-between py-2">
        <span className="font-semibold text-lg">Devis</span>
        <div className="space-x-2">
          <a
            href={`../fiche-eleve.php?id=${eleveId}&centre=${centreId}`}
            className="inline-block px-3 py-1 border border-gray-500 rounded hover:bg-gray-200"
          >
            Retour à la fiche élève
          </a>
          <button
            onClick={() => window.print()}
            className="inline-block px-3 py-1 border border-gray-500 rounded hover:bg-gray-200"
          >
            Imprimer
          </button>
          {/* Bouton “Afficher les détails” selon contexte */}
          {!idPre && !idStage && devisId && (
            <a
              href={buildDetailsUrl()}
              className="inline-block px-3 py-1 border border-green-500 text-green-500 rounded hover:bg-green-50"
            >
              Afficher le détail
            </a>
          )}
          {(idPre || idStage) && (
            <a
              href={buildDetailsUrl()}
              className="inline-block px-3 py-1 border border-red-500 text-red-500 rounded hover:bg-red-50"
            >
              Afficher les détails
            </a>
          )}
          {/* Ajouter Identifiant */}
          {linkedDevisCount === 0 && (
            <button
              onClick={onAddIdentifiant}
              className="inline-block px-3 py-1 border border-blue-500 text-blue-500 rounded hover:bg-blue-50"
            >
              Ajouter Identifiant
            </button>
          )}
          {/* Valider le contrat (rang=1) */}
          {rang === "1" && (
            <a
              href={buildValidateUrl()}
              className={`inline-block px-3 py-1 rounded ${
                isContractValid
                  ? "border border-green-500 text-green-500 bg-green-50 cursor-not-allowed opacity-50"
                  : "border border-yellow-500 text-yellow-600 hover:bg-yellow-50"
              }`}
            >
              {isContractValid ? "Contrat validé" : "Valider le contrat"}
            </a>
          )}
        </div>
      </div>
    </nav>
  );
};

export default NavBarDevis;
