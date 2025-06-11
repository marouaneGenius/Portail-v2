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
import HeaderComponent from './HeaderComponent';
import TarificationCalculator from './TarificationCalculator';

export interface FullContractProps {
    Student:any;
    Subscription:any;
    SubscriptionType: any;

  }

const SingleSubscriptionContent: React.FC<FullContractProps>  = ({ Student, Subscription, SubscriptionType}) => {
    const [student, setStudent] = useState(Student);
    // const [subscription, setSubscription] = useState(Subscription);
    // const [subscriptionType, setSubscriptionType] = useState<any>(SubscriptionType);
    // const [center, setCenter] = useState<any>();
    // const [parent, setParent] = useState();
    // const [listeSeances, setListeSeances] = useState();
    // const [abonnementTitle, setAbonnementTitle] = useState(SubscriptionType);
    // const [showContractStart, setShowContractStart] = useState(false);
    // const [contractStartWeek, setContractStartWeek] = useState('');
    // const [contractDeadlineText, setContractDeadlineText] = useState('');
    // const [subjects, setSubjects] = useState('');
    // const [isLoading, setIsLoading] = useState(true);




    return (
        <div className="space-y-8 bg-red-500">
            <div className="bg-white p-6 text-sm text-gray-800">
                {
                    Student &&
                    <HeaderComponent student={student} subscriptionType={SubscriptionType} subscription={Subscription} />
                }

                {
                    Student && Subscription &&
                    <TarificationCalculator data={Subscription} />
                }


            </div>
        </div>
    );
};

export default SingleSubscriptionContent;
                {/* <AbsenceNotice /> */}
                {/* <BehaviorNotice /> */}
                {/* <UrssafNotice />
                <ModificationAnnulationNotice />
                <NonPaiementMensualitesNotice />
                <DisponibiliteAssistanceNotice />
                <EngagementPaiementNotice /> */}