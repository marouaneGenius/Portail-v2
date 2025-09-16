import React from 'react';

export interface WelcomePageProps {
  student?: any;
  subscription?: any;
  subscriptionType?: string;
}

const WelcomePageComponent: React.FC<WelcomePageProps> = ({ student, subscription, subscriptionType }) => {
  const parent = student?.parents?.[0] || {};
  // const nbSeances = subscription?.session_per_week || '';
  const favoriteSlots = subscription?.favorite_slots || [];

  // Récupère toutes les matières uniques (school_subjects + favorite_slots)
  const mainSubjects = Array.isArray(subscription.school_subjects) ? subscription.school_subjects : [];
  const slotSubjects = Array.isArray(favoriteSlots)
    ? favoriteSlots.flatMap((slot: any) => Array.isArray(slot.matieres) ? slot.matieres : [])
    : [];
  const allSubjects = Array.from(new Set([...mainSubjects, ...slotSubjects]));
  const subjects = allSubjects.join(', ');

  // const weeklyHours = subscription?.weekly_hours || nbSeances || '';
  const studentName = student?.firstname || '';
  const studentClass = student?.class || '';

  // Calculer le nombre d'heures basé sur les données disponibles
  const sessionPerWeek = subscription?.session_per_week || 1;
  const weeklyHours = subscription?.weekly_hours || '';

  let phrase = '';
  let nbSeances = 1;

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

  const contractType =
    subscriptionType === 'stage'
      ? `Stage de ${subscription.week_count} semaines à raison de 3h/jour du lundi au vendredi`
      : subscriptionType === 'annuel'
        ? `Abonnement annuel à raison de ${phrase}`
        : subscriptionType === 'preinscription'
          ? `Abonnement Pré-inscription à raison de ${phrase}`
          : subscriptionType === 'genius_access'
            ? `Abonnement Genius Access à raison de ${phrase}`
            : subscriptionType === 'genius_plus'
              ? `Abonnement Genius Plus à raison de ${phrase}`
              : subscriptionType === 'genius_premium'
                ? `Abonnement Genius Premium à raison de ${phrase}`
                : '';

  const contractStart = subscription?.subscription_start_date || subscription?.selected_weeks?.[0] || '';
  const formattedStartDate = contractStart
    ? new Date(contractStart).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })
    : '';

  const center = student?.centers || {};
  const centerName = center.name || '';
  const centerCity = center.city || '';
  const centerAddress = center.address || '';
  const centerPostal = center.zip_code || '';
  const centerSiret = center.siret || '90501854500012';

  return (
    <div className="nouvelle-page welcome-page" style={{
      minHeight: '105vh',
      backgroundImage: "url('/logo/GENIUS-THUNDERBOLD-FILIGRANE.png')",
      backgroundRepeat: 'no-repeat',
      backgroundSize: '80%',
      backgroundPosition: '50% 50%',
      WebkitPrintColorAdjust: 'exact',
      printColorAdjust: 'exact',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
    }}>
      {/* <div className="mini-logo-top-left">
        <img src="/logo/GENIUS-THUNDERBOLD-LITTLE.png" alt="Genius logo" style={{ height: 60 }} />
      </div> */}
      {/* <div className="left-0 top-0 ml-8">
        <img src="/logo/GENIUS-THUNDERBOLD-LITTLE.png" alt="Genius logo" style={{ height: 60 }} />
      </div> */}

      {/* <div className="second-page-style"> */}
      <div className="row" style={{ fontSize: 14 }}>
        <div className="welcomTitle col-md-12 fw-bolder" >
          <h1 className="welcomTitleFont poppins-title-bold">
            <strong>Bienvenue chez Genius <br />
              <span className="text-warning">{centerName}</span>
            </strong>
          </h1>
        </div>

        <div className="mt-5">
          <p style={{ fontSize: 18 }}>
            <strong className="poppins-title-bold">Devis de</strong>
          </p>
          <p className="mb-4">
            <strong className="text-body poppins-title-bold">GENIUS</strong> - Soutien &nbsp;scolaire
            <br />{centerAddress}
            <br />{centerPostal}, {centerCity}
            <br />SIRET : {centerSiret}

          </p>
        </div>

        <div className="col-md-12 text-end">
          <p style={{ fontSize: 18 }}>
            <strong className="poppins-title-bold">À destination de</strong>
          </p>
          <p className="mb-4">
            <strong style={{ fontSize: 14 }}>
              {parent.title ? parent.title + ' ' : ''}{parent.firstname} {parent.lastname}
            </strong>
            <br />{parent.address}
            <br />{parent.zip_code || parent.zipcode}, {parent.city}
          </p>
        </div>

        <div className="spaceDesignation" style={{ letterSpacing: '0.02em' }}>
          <p style={{ fontSize: 18 }}>
            <strong className="poppins-title-bold">Pour l'élève :</strong> {studentName} {student.lastname} en classe de {studentClass}
          </p>
        </div>

        <div className="spaceDesignation2">
          <span style={{ fontSize: 18 }}>
            <strong className="poppins-title-bold">Désignation : </strong>{contractType}
          </span><br />
          <span style={{ fontSize: 18 }}>
            <strong className="poppins-title-bold">Matière(s) : </strong>{subjects}
          </span>
        </div>

        <div>
          <span style={{ fontSize: 18 }}>
            <strong className="poppins-title-bold">Début du contrat : Semaine du {formattedStartDate} </strong>
            {/* Le ou les créneaux précis seront à définir d'ici le 4 Septembre 2025 (en fonction des disponibilités). */}
          </span>
        </div>
      </div>

      <div className="page-footer" style={{ textAlign: 'center', alignItems: 'center' }}>
        <small style={{ textAlign: 'center' }}>
          GENIUS<br />
          {centerAddress} {centerPostal}, {centerCity} – Contact : 07.66.18.28.36<br />
          SAS au capital social de 5000 € - N°SIRET {centerSiret}– N° identification&nbsp; TVA : FR39905018545&nbsp; R.C.S Pontoise Code APE : 8559B
        </small>
      </div>
      {/* </div> */}
    </div>
  );
};

export default WelcomePageComponent;