// ContractPdfExporter.tsx
import React, { useEffect, useRef, useState } from 'react';
import { Preview, print } from 'react-html2pdf';
import ModificationAnnulationNotice from './ModificationAnnulationComponent';
import NonPaiementMensualitesNotice from './NonPaiementMensualitesModifieesComponent';
import AbsenceNotice from './AbsencesComponent';
import UrssafNotice from './CreationGestionCompteURSSAFComponent';
import DisponibiliteAssistanceNotice from './DisponibiliteEtAssistanceDomicileComponent';
import EngagementPaiementNotice from './EngagementDePaiementComponent';
import HeaderComponent from './HeaderComponent';
import TarificationCalculator from './TarificationCalculator';
import FraisInscriptionComponent from './FraisInscriptionComponent';
import { ComportementComponent } from './ComportementComponent';
import DisponibiliteEtAssistanceDomicileComponent from './DisponibiliteEtAssistanceDomicileComponent';
import AbsencesComponent from './AbsencesComponent';
import CreationGestionCompteURSSAFComponent from './CreationGestionCompteURSSAFComponent';
import ChequeDeCautionComponent from './ChequeDeCautionComponent';
import { getNiveauScolaire, getPrice } from '../SubscriptionFunctions';
import { nbSeancesperWeek } from '../../../mocks/mocks';

export interface FullContractProps {
    Student:any;
    Subscription:any;
    SubscriptionType: any;

  }

const SingleSubscriptionContent: React.FC<FullContractProps>  = ({ Student, Subscription, SubscriptionType}) => {
    const [student, setStudent] = useState(Student);
    const [price, setPrice] = useState(0);

    useEffect(() => {
        if(SubscriptionType && typeof SubscriptionType  === 'string'){
            const isCombined = Array.isArray(Subscription);
            const isMember = false //getIfStudentIsMember(student, SubscriptionType);
            const niveau:any = getNiveauScolaire(student.class);
            let formule = nbSeancesperWeek[Subscription.session_per_week -1];
            const newPrice = getPrice(SubscriptionType, Subscription.session_per_week, niveau, { combined: isCombined, isMember: isMember })
            setPrice(newPrice)
        }   


        // const chequeMontant = Tarifs[niveau][formule]?.prix * 3;
    } ,[Student, Subscription, SubscriptionType]);





    return (
        <div className="space-y-8 bg-red-500">
            <div className="bg-white p-6 text-sm text-gray-800">
                {
                    Student &&
                    <HeaderComponent student={student} subscriptionType={SubscriptionType} subscription={Subscription} />
                }
                {
                    Student && Subscription &&
                    <TarificationCalculator data={Subscription} price={price} />
                }
                    <FraisInscriptionComponent student={student} subscriptionType={SubscriptionType} subscription={Subscription}  price={price} />
                    <EngagementPaiementNotice />
                {
                    SubscriptionType !== 'stage'&&
                    <>
                        {
                            price !== 0 && 
                            <ChequeDeCautionComponent student={student} subscriptionType={SubscriptionType} subscription={Subscription} price={price}  />
                        }
                        <ComportementComponent />
                        <DisponibiliteEtAssistanceDomicileComponent />
                        <AbsencesComponent />
                        <CreationGestionCompteURSSAFComponent />
                    </>
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