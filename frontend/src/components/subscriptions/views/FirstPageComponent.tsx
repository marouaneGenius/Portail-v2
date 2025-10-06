import React from 'react';

export interface FirstPageProps {
  student?: any;
  subscription?: any;
  subscriptionType?: string;
}

const FirstPageComponent: React.FC<FirstPageProps> = ({ student, subscription, subscriptionType }) => {
  const studentName = student?.firstname || '';
  const devisNumber = subscription?.id || '';
  const devisDate = subscription?.created_at || '';

  let phrase = '';
  let nbSeances = 1;

  // Logique spécifique pour les stages
  if (subscriptionType === 'stage') {
    const weekCount = subscription?.week_count || 1;
    if (weekCount === 1) {
      phrase = '1 semaine';
    } else if (weekCount === 2) {
      phrase = '2 semaines';
    } else {
      phrase = `${weekCount} semaines`;
    }
  } else {
    // Logique existante pour les autres types d'abonnements
    const sessionPerWeek = subscription?.session_per_week || 1;
    const weeklyHours = subscription?.weekly_hours || '';

    if (sessionPerWeek === 2 || weeklyHours === '3h00/semaine') {
      nbSeances = 2;
      phrase = '3h';
    } else if (sessionPerWeek === 4 || weeklyHours === '6h00/semaine') {
      nbSeances = 4;
      phrase = '6h';
    } else if (sessionPerWeek === 3 || weeklyHours === '4h30/semaine') {
      nbSeances = 3;
      phrase = '4h30';
    } else {
      nbSeances = 1;
      phrase = '1h30';
    }

    // Si on a weeklyHours directement, l'utiliser
    if (weeklyHours && weeklyHours.includes('h')) {
      const match = weeklyHours.match(/(\d+h\d*)/);
      if (match) {
        phrase = match[1];
      }
    }
  }

  // Formatage de la date en français
  const formatDateFrench = (dateString: string) => {
    if (!dateString) return '';

    const date = new Date(dateString);
    const jours = ["Dim.", "Lun.", "Mar.", "Mer.", "Jeu.", "Ven.", "Sam."];
    const mois = ["", "Janvier", "Février", "Mars", "Avril", "Mai", "Juin", "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"];

    const jourSemaine = jours[date.getDay()];
    const jour = date.getDate();
    const moisNom = mois[date.getMonth() + 1];
    const annee = date.getFullYear();
    const heure = date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });

    return `${jourSemaine} ${jour} ${moisNom} ${annee} à ${heure}`;
  };

  return (
    <div
      className="firstpage page-break"
      style={{
        minHeight: '110vh',
        backgroundImage: "url('/logo/GENIUS-THUNDERBOLD-FILIGRANE.png')",
        backgroundRepeat: 'no-repeat',
        backgroundSize: '80%',
        backgroundPosition: '50% 50%',
        WebkitPrintColorAdjust: 'exact',
        printColorAdjust: 'exact',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
      }}
    >
      {/* Contenu principal */}
      <div>
        <div>
          <h1 style={{ fontSize: 80 }}>
            {subscriptionType === 'stage' ? (
              <>
                Accompagnons {studentName} avec{' '}
                <strong className="poppins-title-bold">
                  <span className="text-warning">{phrase}</span> de
                </strong>{' '}
                <strong className="bold-title poppins-title-bold">stage</strong>
              </>
            ) : (
              <>
                Accompagnons {studentName} avec{' '}
                <strong className="poppins-title-bold">
                  <span className="text-warning">{phrase}</span> de cours par
                </strong>{' '}
                <strong className="bold-title poppins-title-bold">semaine</strong>
              </>
            )}
          </h1>
        </div>
        <br />

        <p style={{ fontSize: 30 }} className="text-muted mt-10 mb-5">
          {subscriptionType} 2025&nbsp;-&nbsp;2026
        </p>

        <p className="h4 mb-5 mt-5">
          Devis #{devisNumber} éditée le&nbsp;{formatDateFrench(devisDate)}
        </p>

      </div>

      {/* Bas de page - logos */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <img
            className="img-fluid mb-4"
            src="/logo/GENIUS-LOGO.png"
            alt="..."
            style={{ maxWidth: '10rem' }}
          />
          <img
            className="img-fluid mb-4"
            src="/logo/GENIUS-BLOC-MARQUE.png"
            alt="..."
            style={{ maxWidth: '15rem' }}
          />
        </div>
      </div>
    </div>
  );
};

export default FirstPageComponent;