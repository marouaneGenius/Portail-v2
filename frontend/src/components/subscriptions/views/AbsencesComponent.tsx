import React from "react";

/**
 * AbsenceNotice
 * -------------
 * Composant **statique** : le texte est figé et aucune prop n’est nécessaire,
 * puisque ce bloc ne contient plus de variables ni de calculs.
 */
const AbsencesComponent: React.FC = () => (
  <div className="space-y-4">
    <strong className="poppins-title-bold">Absences&nbsp;:</strong>

    <ul className="list-disc list-inside space-y-2">
      <li>
        Toute absence non notifiée 72&nbsp;heures à l&apos;avance sur notre plateforme de gestion&nbsp;
        (<a
          href="https://gestion.geniusclass.fr/"
          className="underline hover:text-blue-700 focus:text-blue-700"
          target="_blank"
          rel="noopener noreferrer"
        >
          gestion.geniusclass.fr
        </a>) génère une séance non récupérable et non remboursable.
      </li>
      <li>
        Le Client bénéficie d&apos;un mois de cours rattrapables tous les trois mois, selon les
        disponibilités restantes mises à jour sur la plateforme de gestion. Aucun remboursement ou
        déduction ne sera accordé.
      </li>
    </ul>
  </div>
);

export default AbsencesComponent;
