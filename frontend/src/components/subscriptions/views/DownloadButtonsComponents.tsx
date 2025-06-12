import React from "react";
import { ContractHeaderProps } from "./HeaderComponent";

const DownloadButtonsComponents: React.FC<any> =  ({ subscriptionType, subscription, previewId,onGenerate,pdfUrl, }) => {
  // construit l’URL de détail en fonction des paramètres
  const buildDetailsUrl = () => {
    // const params = new URLSearchParams();
    // params.set("centre", centreId);
    // params.set("id", devisId);
    // if (idPre) params.set("id_pre", idPre);
    // if (idStage) params.set("id_stage", idStage);
    // params.set("eleve", eleveId);
    // return `/details_dates${idPre && !idStage ? "_annuel_pre" : ""}.php?${params.toString()}`;
  };

  // construit l’URL de validation de contrat
  const buildValidateUrl = () => {
    // const params = new URLSearchParams();
    // params.set("centre", centreId);
    // params.set("id", devisId);
    // if (idPre) params.set("id_pre", idPre);
    // if (idStage) params.set("id_stage", idStage);
    // params.set("eleve", eleveId);
    // return `/validate_contract.php?${params.toString()}`;
  };

  return (
    <nav className="bg-gray-100 print:hidden">
      <div className="container mx-auto px-4 flex flex-wrap items-center justify-between py-2">
        <span className="font-semibold text-lg">Devis</span>
        <div className="space-x-2">
          <div className="flex space-x-4">
            <button
              onClick={onGenerate}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Générer et Prévisualiser
            </button>

            {pdfUrl && (
              <a
                href={pdfUrl}
                download="contrat-genius.pdf"
                className="mt-4 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
              >
                Télécharger le PDF
              </a>
            )}
          </div>
          {/* Bouton “Afficher les détails” selon contexte */}
          {/* {!idPre && !idStage && devisId && (
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
          {linkedDevisCount === 0 && (
            <button
              onClick={onAddIdentifiant}
              className="inline-block px-3 py-1 border border-blue-500 text-blue-500 rounded hover:bg-blue-50"
            >
              Ajouter Identifiant
            </button>
          )}
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
          )} */}
        </div>
      </div>
    </nav>
  );
};

export default DownloadButtonsComponents;
