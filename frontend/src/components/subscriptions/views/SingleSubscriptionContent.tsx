// ContractPdfExporter.tsx
import React, { useEffect, useRef, useState } from 'react';
import ModificationAnnulationNotice from './ModificationAnnulationComponent';
import NonPaiementMensualitesNotice from './NonPaiementMensualitesModifieesComponent';
import EngagementPaiementNotice from './EngagementDePaiementComponent';
import HeaderComponent from './HeaderComponent';
import TarificationCalculator from './TarificationCalculator';
import FraisInscriptionComponent from './FraisInscriptionComponent';
import { ComportementComponent } from './ComportementComponent';
import DisponibiliteEtAssistanceDomicileComponent from './DisponibiliteEtAssistanceDomicileComponent';
import AbsencesComponent from './AbsencesComponent';
import CreationGestionCompteURSSAFComponent from './CreationGestionCompteURSSAFComponent';
import ChequeDeCautionComponent from './ChequeDeCautionComponent';
import { getNiveauScolaire, getPrice, getStagePrice, showSubscriptionPrice } from '../SubscriptionFunctions';
import ProcedureResiliationNotice from './ProcedureResiliationComponent';
import SignatureComponent from './SignatureComponent';

export interface FullContractProps {
    Student:any;
    Subscription:any;
    SubscriptionType: any;
}

const SingleSubscriptionContent: React.FC<FullContractProps>  = ({ Student, Subscription, SubscriptionType}) => {
    const [student, setStudent] = useState(Student);
    const [price, setPrice] = useState(0);
    const [showFraisInscriptionComponent, setshowFraisInscriptionComponent] = useState(true);
    const [isCombined, setIsCombined] = useState(Subscription.combined_id ? true : false);

    useEffect(() => {
        const isMember = false //getIfStudentIsMember(student, SubscriptionType);
        const niveau:any = getNiveauScolaire(student.class);
        let newPrice;

        if(SubscriptionType === 'stage'){
             newPrice = getStagePrice(Subscription.week_count, isCombined, isMember)
        } else {
             newPrice = getPrice(SubscriptionType, Subscription.session_per_week, niveau, { combined: isCombined, isMember: isMember })
        }
        
        setPrice(newPrice)

        if(isCombined) {
            showSubscriptionPrice(Subscription).then((res) => {
                if(res.includes('annuel') && SubscriptionType == 'annuel') {
                    setshowFraisInscriptionComponent(true)
                } else if(!res.includes('annuel') && res.includes('preinscription') && SubscriptionType == 'preinscription'){
                    setshowFraisInscriptionComponent(true)
                } else {
                    setshowFraisInscriptionComponent(false)
                }
            })
        }

    } ,[Student, Subscription, SubscriptionType]);

    return (
        <div className="space-y-8 ">
            <div className="p-0 text-sm ">
                {
                    Student &&
                    <HeaderComponent student={student} subscriptionType={SubscriptionType} subscription={Subscription} />
                }
                {
                    Student && Subscription &&
                    <TarificationCalculator data={Subscription} price={price} />
                }

                {
                    SubscriptionType && showFraisInscriptionComponent &&
                    <FraisInscriptionComponent student={student} subscriptionType={SubscriptionType} subscription={Subscription}  price={price} />
                }
                    <EngagementPaiementNotice />
                {
                    SubscriptionType !== 'stage' &&
                    <>
                        {
                            price  && 
                            <ChequeDeCautionComponent student={student} subscriptionType={SubscriptionType} subscription={Subscription} price={price}  />
                        }
                        <ComportementComponent />
                        <DisponibiliteEtAssistanceDomicileComponent />
                        <AbsencesComponent />
                        <CreationGestionCompteURSSAFComponent />
                        <ModificationAnnulationNotice />
                        <ProcedureResiliationNotice subscriptionType={SubscriptionType} subscription={Subscription} />
                        <NonPaiementMensualitesNotice />
                    </>
                }
                    <SignatureComponent student={student} subscription={Subscription} />
            </div>
        </div>
    );
};

export default SingleSubscriptionContent;