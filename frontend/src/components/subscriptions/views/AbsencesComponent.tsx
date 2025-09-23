import React from "react";

interface AbsencesComponentProps {
  parent?: { email?: string; firstname?: string; lastname?: string };
}

/**
 * AbsenceNotice
 * -------------
 * Composant statique, mais affiche les identifiants parent si fournis.
 */
const AbsencesComponent: React.FC<AbsencesComponentProps> = ({ parent }) => {
  // Génère le mot de passe par défaut si prénom et nom sont présents
  const password =
    parent?.firstname && parent?.lastname
      ? `${parent.firstname}${parent.lastname}2025`.replace(/\s/g, '').toLowerCase()
      : undefined;

  return (
    <div className="space-y-4 m-1 py-2" style={{ letterSpacing: '0.02em' }}>
      <strong className="poppins-title-bold">Absences&nbsp;:</strong>

      <ul className="list-disc list-inside space-y-2">
        <li>
          Toute absence non notifiée <strong>72&nbsp;heures à l&apos;avance</strong> sur notre plateforme de gestion&nbsp;
          (<a
            href="https://portailv2.geniusclass.fr/login"
            className="underline hover:text-blue-700 focus:text-blue-700"
            target="_blank"
            rel="noopener noreferrer"
          >
            portailv2.geniusclass.fr/login
          </a>) génère une séance non récupérable et non remboursable.
        </li>
        <li>
          Le Client bénéficie d&apos;un mois de cours rattrapables tous les trois mois, selon les
          disponibilités restantes mises à jour sur la plateforme de gestion. Aucun remboursement ou
          déduction ne sera accordé.
        </li>
        {parent?.email && password && (
          <li className="mt-2">
            <span className="font-semibold">Identifiants parent pour la plateforme :</span>
            <br />
            <span>
              <strong>Email&nbsp;:</strong> {parent.email}
              <br />
              <strong>Mot de passe&nbsp;:</strong> {password}
            </span>
          </li>
        )}
      </ul>
    </div>
  );
};

export default AbsencesComponent;
