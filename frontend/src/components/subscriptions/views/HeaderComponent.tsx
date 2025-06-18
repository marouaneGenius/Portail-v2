import React, { use, useEffect, useState } from 'react';
import { nbSeancesMap } from '../../../mocks/mocks';

export interface ContractHeaderProps {
  student?: any;
  subscriptionType?: string;
  subscription?: any;
  price?:any;
}

const ContractHeader: React.FC<ContractHeaderProps> = ({ student, subscription,  subscriptionType, }) => {
  const [parent, setParent] = useState(student?.parents[0] || {});
  const [showStageData, setshowStageData] = useState(false);

  const nbSeances = nbSeancesMap[subscription.session_per_week -1];
  const subjects = subscription.school_subjects ? subscription.school_subjects.join(', ') : '';

  useEffect(() => {
    if(subscriptionType && subscriptionType === 'stage') {
      setshowStageData(true);
    }
  },[subscriptionType])

  return (
    <div className="space-y-8 text-sm">
      {/* En-tête du Devis */}
      <div className="text-base md:text-lg">
        <p className="font-semibold">Devis de</p>
        <p className="mb-4">
          <strong className="text-body font-bold">GENIUS</strong> – Soutien scolaire<br/>
         {student.centers.address}
          <br/>
           {student.centers.city}   
        </p>
      </div>

     <div className="text-right text-base md:text-lg">
        <p className="font-semibold">À destination de</p>
        <p className="mb-4 leading-tight">
          <strong className="text-base md:text-lg">
            {parent.firstname} {parent.lastname}
          </strong><br/>
          {parent.address} {parent.zipcode}<br/>
          {parent.email}, {parent.phone}
        </p>
      </div>


       <div className="space-y-2 text-base md:text-lg">
        <p>
          <strong className="font-bold">Pour l'élève :</strong>
          {' '}
          {student.firstname} {student.lastname} en classe de {student.class}
        </p>
        <p>
          <strong className="font-bold">Désignation :</strong>
          {' '}

          {
            subscriptionType === 'stage' && `Stage de ${subscription.week_count} semaines à raison de 3 heures de cours par jour du lundi au vendredi`
          }
          {
            subscriptionType === 'annuel' && `Abonnement annuel à raison de (${nbSeances})` 
          }
          {
            subscriptionType === 'preinscription' && `Abonnement  Pré-inscription à raison de (${nbSeances})` 
          }

        </p>
       {subjects && (
          <p>
            <strong className="font-bold">Matière(s) :</strong>
            {' '}
            {subjects}
          </p>
        )} {/*  */}
      </div>

     {showStageData && subscription.known_weeks !== 'unknown' ? (
        <div className="text-base">
          <p>
            <strong className="text-body">Semaines choisies :</strong>
            {
              subscription.selected_weeks.map((week:any, index:any) => (
                <span key={index}>
                  {week}
                  {index < subscription.selected_weeks.length - 1 ? ', ' : ''}
                </span>
              ))
            }
            <br/>

          </p>
        </div>
      ): showStageData ? 'Semaines Inconnues': ''}  {/**/}

    </div>
  );
};

export default ContractHeader;




{/*  <div className="space-y-1">
        <p>
          <strong className="font-semibold">Identifiants de connexion</strong>
        </p>
        <p>
          Site parent :{' '}
          <a
            href="https://gestion.geniusclass.fr"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 underline"
          >
            gestion.geniusclass.fr
          </a>
        </p>
        <p>
          Identifiant : <span className="font-mono">{parent.title.toLowerCase()}.{prenomKey.toLowerCase()}</span><br/>
          Mot de passe : <span className="font-mono">{password}</span>
        </p>
      </div>   */}