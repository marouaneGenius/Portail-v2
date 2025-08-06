import React from 'react';
import { nbSeancesMap } from '../../../mocks/mocks';

export interface ContractHeaderProps {
  student?: any;
  subscriptionType?: string;
  subscription?: any;
  price?: any;
}

const HeaderComponent: React.FC<ContractHeaderProps> = ({ student, subscription, subscriptionType }) => {
  const parent = student?.parents?.[0] || {};
  const nbSeances = nbSeancesMap[subscription.session_per_week - 1];
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
        ? `Abonnement annuel à raison de ${nbSeances}`
        : subscriptionType === 'preinscription'
          ? `Abonnement Pré-inscription à raison de ${nbSeances}`
          : '';
  const contractStart = subscription?.subscription_start_date || subscription?.selected_weeks?.[0] || '';
  const formattedStartDate = contractStart
    ? new Date(contractStart).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })
    : '';
  const devisNumber = subscription?.id || '';
  const devisDate = subscription?.created_at || '';
  const center = student?.centers || {};
  const centerName = center.name || '';
  const centerCity = center.city || '';
  const centerAddress = center.address || '';
  const centerPostal = center.zipcode || '';
  const centerSiret = center.siret || '90501854500012';

  return (
    <>
      {/* PAGE 1 : Accompagnons ... */}
      <div className="nouvelle-page firstpage flex flex-col justify-between min-h-[95vh] relative" style={{
        minHeight: '100vh',
        backgroundImage: "url('/public/logo/GENIUS-THUNDERBOLD-FILIGRANE.png')",
        backgroundRepeat: 'no-repeat',
        backgroundSize: '45%',
        backgroundPosition: '50% 50%',
      }}>

        {/* Titre principal */}
        <div>
          <h1 style={{ fontSize: 80 }} className="mt-5 poppins-title-bold welcomTitleFont font-extrabold text-mister-anthracite leading-tight">
            Accompagnons {studentName}
            <span className="poppins-title-bold text-hello-yellow"> {weeklyHours} </span>
            <span className="poppins-title-bold">de cours</span> par <span className="bold-title poppins-title-bold">semaine</span>
          </h1>
        </div>
        <p style={{ fontSize: 30 }}className="text-xl text-mister-anthracite/60 mt-6 poppins">{subscriptionType} 2025-2026</p>
        <p className="h4 mb-5 text-lg poppins">
          Devis #{devisNumber} éditée le {devisDate}
        </p>
        {/* Logos en bas */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <img src="/public/logo/GENIUS-LOGO.png" alt="Genius logo" style={{ maxWidth: '10rem' }} />
          <img src="/public/logo/GENIUS-BLOC-MARQUE.png" alt="Genius logo" style={{ maxWidth: '15rem' }} />
        </div>
      </div>

      {/* PAGE 2 : Infos complémentaires */}
      <div className="nouvelle-page mt-12 flex flex-col min-h-[95vh] relative" style={{
        minHeight: '100vh',
        backgroundImage: "url('/public/logo/GENIUS-THUNDERBOLD-FILIGRANE.png')",
        backgroundRepeat: 'no-repeat',
        backgroundSize: '45%',
        backgroundPosition: '50% 50%',
      }}>
        {/* Logo en haut à gauche */}
        <div className="absolute left-0 top-0 mt-8 ml-8">
          <img src="/public/logo/GENIUS-THUNDERBOLD-LITTLE.png" alt="Genius logo" style={{ height: 60 }} />
        </div>
        <h1 style={{ fontSize: 60 }} className="mt-12 poppins-title-bold welcomTitleFont font-extrabold text-mister-anthracite leading-tight">
          Bienvenue chez Genius<br />
          <span className="text-hello-yellow">{centerName}</span>
        </h1>
        <div className="mt-8">
          <p style={{ fontSize: 18 }} className="font-bold poppins-title-bold mb-2">
            <strong>Devis de</strong>
          </p>
          <p className="mb-4">
            <strong className="text-body poppins-title-bold">GENIUS</strong> - Soutien scolaire<br />
            {centerAddress}<br />
            {centerPostal}, {centerCity}<br />
            <strong className="text-body poppins-title-bold">SIRET : </strong>{centerSiret}<br />
          </p>
        </div>
        <div className="text-end mt-8">
          <p style={{ fontSize: 18 }} className="font-bold poppins-title-bold mb-2">
            <strong>À destination de</strong>
          </p>
          <p className="mb-4">
            <strong style={{ fontSize: 14 }}>
              {parent.title ? parent.title + ' ' : ''}
              {parent.firstname} {parent.lastname}
            </strong><br />
            {parent.address}<br />
            {parent.zip_code || parent.zipcode}, {parent.city}
          </p>
        </div>
        <div className="spaceDesignation mt-8">
          <p style={{ fontSize: 18 }} className="poppins-title mb-2">
            <strong>Pour l'élève :</strong> {studentName} {student.lastname} en classe de {studentClass}
          </p>
        </div>
        <div className="spaceDesignation2 mt-8">
          <span style={{ fontSize: 18 }} className="font-bold poppins-title-bold">
            <strong>Désignation : </strong>{contractType}
          </span><br />
          <span style={{ fontSize: 18 }} className="font-bold poppins-title-bold">
            <strong>Matière(s) : </strong>{subjects}
          </span>
        </div>
        <div className="mt-8">
          <strong className="text-body">Début du contrat : Semaine du {formattedStartDate}</strong>. Le ou les créneaux précis seront à valider d'ici le 4 Septembre 2025 (en fonction des disponibilités).
        </div>
        {/* Footer */}
        <div className="page-footer mt-8 text-center" style={{ display: 'block', textAlign: 'center', alignItems: 'center' }}>
          <small>
            GENIUS<br />
            {centerAddress} {centerPostal}, {centerCity} – Contact : 07.66.18.28.36<br />
            SAS au capital social de 5000 € - N°SIRET 90501854500012– N° identification TVA : FR39905018545 R.C.S Pontoise Code APE : 8559B
          </small>
        </div>
      </div>
    </>
  );
};

export default HeaderComponent;
