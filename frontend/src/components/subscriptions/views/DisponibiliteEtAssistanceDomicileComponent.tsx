import React from "react";

/**
 * DisponibiliteAssistanceNotice
 * ------------------------------
 * Bloc statique : détails sur la disponibilité de l’assistance pédagogique à domicile.
 */
const DisponibiliteAssistanceNotice: React.FC = () => (
  <div className="space-y-4">
    <strong className="poppins-title-bold">Disponibilité et Assistance à Domicile&nbsp;:</strong>

    <ul className="list-disc list-inside space-y-2">
      <li>
        GENIUS met à disposition un service de soutien scolaire accessible 7 jours sur 7. Les élèves
        peuvent solliciter de l’assistance pédagogique via WhatsApp, appels téléphoniques, SMS ou
        visioconférence (Google Meet, etc.). Les demandes sont traitées dans un délai raisonnable,
        assurant un accompagnement continu pour maximiser la réussite.
      </li>
    </ul>
  </div>
);

export default DisponibiliteAssistanceNotice;
