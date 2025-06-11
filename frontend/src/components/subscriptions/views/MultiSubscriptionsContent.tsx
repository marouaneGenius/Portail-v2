// ContractPdfExporter.tsx
import React, { useEffect, useRef, useState } from 'react';
import { Preview, print } from 'react-html2pdf';
import ModificationAnnulationNotice from './ModificationAnnulationComponent';
import NonPaiementMensualitesNotice from './NonPaiementMensualitesModifieesComponent';
import AbsenceNotice from './AbsencesComponent';
import { BehaviorNotice } from './ComportementComponent';
import UrssafNotice from './CreationGestionCompteURSSAFComponent';
import DisponibiliteAssistanceNotice from './DisponibiliteEtAssistanceDomicileComponent';
import EngagementPaiementNotice from './EngagementDePaiementComponent';

export interface FullContractProps {
    Student:any;
    Subscription:any;
    SubscriptionType: any;
  }

const MultiSubscriptionsContent: React.FC<FullContractProps>  = ({ Student, Subscription, SubscriptionType}) => {
    const [student, setStudent] = useState(Student);
    const [subscription, setSubscription] = useState(Subscription);
    const [subscriptionType, setSubscriptionType] = useState<any>(SubscriptionType);


  return (
    <div className="space-y-8 bg-red-500">
      <div className="bg-white p-6 text-sm text-gray-800">


        {/* <AbsenceNotice /> */}
        {/* <BehaviorNotice /> */}
        {/* <UrssafNotice />
        <ModificationAnnulationNotice />
        <NonPaiementMensualitesNotice />
        <DisponibiliteAssistanceNotice />
        <EngagementPaiementNotice /> */}
        
      </div>


      </div>
  );
};

export default MultiSubscriptionsContent;
