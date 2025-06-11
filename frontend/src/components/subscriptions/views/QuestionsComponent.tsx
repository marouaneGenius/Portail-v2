import React from "react";
import Logo from "@/assets/logo/GENIUS-THUNDERBOLD-LITTLE.png";

export interface QuestionsNoticeProps {
  /** Email du service Facturation (généralement support@geniusclass.fr) */
  billingEmail: string;
  /** Email du centre (utilisé pour Organisation & Pédagogique) */
  centreEmail: string;
  /** Email de contact parental (identifiant sur la plateforme) */
  parentEmail: string;
  /** Mot de passe temporaire ou généré */
  parentPassword: string;
  /** Adresse complète du centre (rue + code postal + ville) */
  centreAddressLine: string;
  /** Numéro de téléphone générique du footer */
  contactPhone: string;
  /** Données légales (texte brut, par ex. "SAS au capital..., SIRET..., TVA..., RCS..., APE...") */
  legalNotice: string;
}

const QuestionsNotice: React.FC<QuestionsNoticeProps> = ({
  billingEmail,
  centreEmail,
  parentEmail,
  parentPassword,
  centreAddressLine,
  contactPhone,
  legalNotice,
}) => (
  <div className="space-y-8">
    {/* Logo */}
    <div>
      <img src={Logo} alt="GENIUS Logo" className="h-16" />
    </div>

    {/* Titre */}
    <h2 className="poppins-title-bold text-2xl" style={{ display: "none" }}>
      Des questions ?
    </h2>

    {/* Tableau de contacts */}
    <div className="overflow-x-auto">
      <table className="min-w-full table-auto border border-gray-800 text-center align-middle text-lg">
        <thead className="bg-gray-900 text-yellow-400">
          <tr>
            <th className="p-4">À propos</th>
            <th className="p-4">En charge</th>
            <th className="p-4">Contact</th>
          </tr>
        </thead>
        <tbody>
          <tr className="border-b border-gray-300">
            <th className="font-bold p-5">Facturation</th>
            <td>Service Facturation</td>
            <td>✉️ {billingEmail}</td>
          </tr>
          <tr className="border-b border-gray-300">
            <th className="font-bold p-5">Organisation</th>
            <td>Votre responsable de centre</td>
            <td className="text-left space-y-1">
              <div>✉️ {centreEmail}</div>
              <div>📍 Sur place aux horaires d’ouverture</div>
            </td>
          </tr>
          <tr className="border-b border-gray-300">
            <th className="font-bold p-5">Pédagogique</th>
            <td>Votre responsable de centre</td>
            <td className="text-left space-y-1">
              <div>✉️ {centreEmail}</div>
              <div>📍 Sur place aux horaires d’ouverture</div>
            </td>
          </tr>
          <tr>
            <th className="font-bold p-5">Autres demandes</th>
            <td>Service SAV</td>
            <td>✉️ {billingEmail}</td>
          </tr>
        </tbody>
      </table>
    </div>

    {/* Section plateforme parent */}
    <div className="mt-6 space-y-1 text-lg">
      <h5 className="font-semibold">Site Gestion parent</h5>
      <p>
        Site :{" "}
        <a
          href="https://gestion.geniusclass.fr"
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 underline"
        >
          https://gestion.geniusclass.fr
        </a>
      </p>
      <p>
        Identifiant :{" "}
        <span className="px-1 rounded bg-gray-100">{parentEmail}</span>
      </p>
      <p>
        Mot de passe :{" "}
        <span className="px-1 rounded bg-gray-100">{parentPassword}</span>
      </p>
    </div>

    {/* Footer légal (optionnel) */}
    <div className="text-center text-xs text-gray-500" style={{ display: "none" }}>
      <small>
        {centreAddressLine} – Contact : {contactPhone}
        <br />
        {legalNotice}
      </small>
    </div>
  </div>
);

export default QuestionsNotice;

// import QuestionsNotice from "@/components/QuestionsNotice";

// export default function SupportSection() {
//   return (
//     <QuestionsNotice
//       billingEmail="support@geniusclass.fr"
//       centreEmail="centre@example.com"
//       parentEmail="parent@example.com"
//       parentPassword="TempPass123"
//       centreAddressLine="12 rue des Lilas, 95000 Pontoise"
//       contactPhone="07 66 18 28 36"
//       legalNotice="SAS au capital social de 5 000 € – N° SIRET 905 018 545 00061 – TVA : FR39905018545 – R.C.S Pontoise – Code APE 8559B"
//     />
//   );
// }
