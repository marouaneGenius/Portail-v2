import React from "react";

export interface ContractHeaderProps {
  subscriptionType: number; // 1 = mensuel/preinscription, sinon annuel
  subscription: {
    subscription_start_date: string; // ex: "2025-09-01"
  };
}

const ProcedureResiliationNotice: React.FC<ContractHeaderProps> = ({ subscriptionType, subscription }) => {
  const TOTAL_MONTHS = 9;    // étalement sur 9 mois maximum
  const INTERVAL = 3;        // tous les 3 mois
  const offsetDays = 7;

  // formateur FR
  const formatFR = (d: Date) =>
    d.toLocaleDateString("fr-FR", {
      weekday: "long",
      day: "2-digit",
      month: "long",
      year: "numeric",
    });

  // point de départ
  const startDate = subscription.subscription_start_date ? subscription.subscription_start_date : "2025-09-01";
  const defaultStart = new Date();
  const currentYear = defaultStart.getFullYear();
  const sept15 = new Date(currentYear, 8, 15); // mois 8 = septembre
  const sept15Iso = sept15.toISOString().split("T")[0];
  const startDateIso = subscription.subscription_start_date || sept15Iso;
  const start = new Date(startDateIso);
  // on fixe toujours le 1er du mois
  const day = 1;

  // on ne veut que m = 3, 6, 9
  const endDates: Date[] = [];
  for (let m = INTERVAL; m <= TOTAL_MONTHS; m += INTERVAL) {
    const d = new Date(start);
    d.setMonth(start.getMonth() + m);
    d.setDate(day);
    endDates.push(d);
  }

  // prépare l'affichage (date de fin + date-limite)
  const items = endDates.map((end) => {
    const deadline = new Date(end);
    deadline.setDate(end.getDate() - offsetDays);
    return {
      endFr: formatFR(end),
      deadlineFr: formatFR(deadline),
    };
  });

  return (
    <div className="space-y-4 m-1 py-2" style={{ letterSpacing: '0.02em' }}>
      <strong className="text-body">Procédure de Résiliation &nbsp;:</strong>
      <p>
        La résiliation doit être notifiée sur la plateforme de gestion&nbsp;
        <a
          href="https://portailv2.geniusclass.fr/login"
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 underline"
        >
          portailv2.geniusclass.fr/login
        </a>
        &nbsp;aux dates suivantes : 
      </p>
      <ul className="list-disc list-inside space-y-2 text-sm">
        {items.map(({ endFr, deadlineFr }, idx) => (
          <li key={idx}>
            {endFr} <br />
            <em>Résiliation  au plus tard  le  : {deadlineFr}</em>
          </li>
        ))}
      </ul>

      <p>
        À défaut de résiliation dans les délais indiqués, <strong>le contrat est automatiquement reconduit pour un nouveau trimestre </strong>, selon les conditions de l’article 1.
      </p>
    </div>
  );
};

export default ProcedureResiliationNotice;
