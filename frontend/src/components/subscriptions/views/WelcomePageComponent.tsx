import React from 'react';

export interface WelcomePageProps {
  student?: any;
  subscription?: any;
  subscriptionType?: string;
}

const WelcomePageComponent: React.FC<WelcomePageProps> = ({ student, subscription, subscriptionType }) => {
  const parent = student?.parents?.[0] || {};
  const nbSeances = subscription?.session_per_week || '';
  const favoriteSlots = subscription?.favorite_slots || [];
  
  // Récupère toutes les matières uniques (school_subjects + favorite_slots)
  const mainSubjects = Array.isArray(subscription.school_subjects) ? subscription.school_subjects : [];
  const slotSubjects = Array.isArray(favoriteSlots)
    ? favoriteSlots.flatMap((slot: any) => Array.isArray(slot.matieres) ? slot.matieres : [])
    : [];
  const allSubjects = Array.from(new Set([...mainSubjects, ...slotSubjects]));
  const subjects = allSubjects.join(', ');
  
  const weeklyHours = subscription?.weekly_hours || nbSeances || '';
  const studentName = student?.firstname || '';
  const studentClass = student?.class || '';
  
  const contractType =
    subscriptionType === 'stage'
      ? `Stage de ${subscription.week_count} semaines à raison de 3h/jour du lundi au vendredi`
      : subscriptionType === 'annuel'
        ? `Abonnement annuel à raison de ${weeklyHours}`
        : subscriptionType === 'preinscription'
          ? `Abonnement Pré-inscription à raison de ${weeklyHours}`
          : '';
          
  const contractStart = subscription?.subscription_start_date || subscription?.selected_weeks?.[0] || '';
  const formattedStartDate = contractStart
    ? new Date(contractStart).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })
    : '';
    
  const center = student?.centers || {};
  const centerName = center.name || '';
  const centerCity = center.city || '';
  const centerAddress = center.address || '';
  const centerPostal = center.zipcode || '';
  const centerSiret = center.siret || '90501854500012';

  return (
    <div className="nouvelle-page">
      <div className="mini-logo-top-left"></div>

      <div className="second-page-style">
        <div className="row" style={{ fontSize: 14 }}>
          <div className="welcomTitle col-md-12 fw-bolder" style={{ display: 'none' }}>
            <h1 className="welcomTitleFont poppins-title-bold">
              <strong>Bienvenue chez Genius <br/>
                <span className="text-warning">{centerName}</span>
              </strong>
            </h1>
          </div>

          <div className="mt-5">
            <p style={{ fontSize: 18 }}>
              <strong className="poppins-title-bold">Devis de</strong>
            </p>
            <p className="mb-4">
              <strong className="text-body poppins-title-bold">GENIUS</strong> - Soutien scolaire
              <br/>{centerAddress}
              <br/>{centerPostal}, {centerCity}
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
              <br/>{parent.address}
              <br/>{parent.zip_code || parent.zipcode}, {parent.city}
            </p>
          </div>

          <div className="spaceDesignation">
            <p style={{ fontSize: 18 }}>
              <strong className="poppins-title-bold">Pour l'élève :</strong> {studentName} {student.lastname} en classe de {studentClass}
            </p>
          </div>

          <div className="spaceDesignation2">
            <span style={{ fontSize: 18 }}>
              <strong className="poppins-title-bold">Désignation : </strong>{contractType}
            </span><br/>
            <span style={{ fontSize: 18 }}>
              <strong className="poppins-title-bold">Matière(s) : </strong>{subjects}
            </span>
          </div>

          <div>
            <strong className="text-body">Début du contrat : Semaine du {formattedStartDate}</strong>. 
            Le ou les créneaux précis seront à définir d'ici le 4 Septembre 2025 (en fonction des disponibilités).
          </div>
        </div>

        <div className="page-footer" style={{ display: 'none', textAlign: 'center', alignItems: 'center' }}>
          <small style={{ textAlign: 'center' }}>
            GENIUS<br/>
            {centerAddress} {centerPostal}, {centerCity} – Contact : 07.66.18.28.36<br/>
            SAS au capital social de 5000 € - N°SIRET {centerSiret}– N° identification TVA : FR39905018545 R.C.S Pontoise Code APE : 8559B
          </small>
        </div>
      </div>
    </div>
  );
};

export default WelcomePageComponent;