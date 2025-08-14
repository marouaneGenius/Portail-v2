// ContractPdfExporter.tsx (refactor: split logic for stage vs non-stage)
import React, { useEffect, useMemo, useState } from 'react';
import ModificationAnnulationNotice from './ModificationAnnulationComponent';
import NonPaiementMensualitesNotice from './NonPaiementMensualitesModifieesComponent';
import EngagementPaiementNotice from './EngagementDePaiementComponent';
import HeaderComponent from './HeaderComponent';
import FirstPageComponent from './FirstPageComponent';
import WelcomePageComponent from './WelcomePageComponent';
import TarificationCalculator from './TarificationCalculator';
import FraisInscriptionComponent from './FraisInscriptionComponent';
import { ComportementComponent } from './ComportementComponent';
import DisponibiliteEtAssistanceDomicileComponent from './DisponibiliteEtAssistanceDomicileComponent';
import AbsencesComponent from './AbsencesComponent';
import CreationGestionCompteURSSAFComponent from './CreationGestionCompteURSSAFComponent';
import ChequeDeCautionComponent from './ChequeDeCautionComponent';
import { getNiveauScolaire, getPrice, getStagePrice, IsStudentIsMember, showSubscriptionPrice } from '../SubscriptionFunctions';
import ProcedureResiliationNotice from './ProcedureResiliationComponent';
import SignatureComponent from './SignatureComponent';

export interface FullContractProps {
    Student: any;
    Subscription: any;
    SubscriptionType: any; // 'annuel' | 'preinscription' | 'stage'
}

/**
 * Small helper to render a printer-friendly new page with our shared background.
 */
const pageBgStyle: React.CSSProperties = {
    minHeight: '110vh',
    backgroundImage: "url('/logo/GENIUS-THUNDERBOLD-FILIGRANE.png')",
    backgroundRepeat: 'no-repeat',
    backgroundSize: '80%',
    backgroundPosition: '50% 50%',
    WebkitPrintColorAdjust: 'exact',
    printColorAdjust: 'exact',
    display: 'flex',
    flexDirection: 'column',
};

const Page: React.FC<React.PropsWithChildren<{ className?: string }>> = ({ children, className }) => (
    <div className={`nouvelle-page ${className ?? ''}`} style={pageBgStyle}>
        {children}
    </div>
);

/**
 * Encapsulated pricing & flags logic so UI stays clean.
 */
function useSubscriptionLogic(Student: any, Subscription: any, SubscriptionType: any) {
    const isCombined = useMemo(() => Boolean(Subscription?.combined_id), [Subscription?.combined_id]);
    const [price, setPrice] = useState<number>(0);
    const [showFraisInscription, setShowFraisInscription] = useState<boolean>(true);

    useEffect(() => {
        let cancelled = false;
        async function compute() {
            const isMember = await IsStudentIsMember(Student?.id);
            const niveau: any = getNiveauScolaire(Student?.class);

            const computedPrice = SubscriptionType === 'stage'
                ? getStagePrice(Subscription?.week_count, isCombined, isMember)
                : getPrice(SubscriptionType, Subscription?.session_per_week, niveau, { combined: isCombined, isMember });

            if (!cancelled) setPrice(computedPrice ?? 0);

            // Frais d'inscription visibility rules
            // - Non-combiné: visible par défaut (comportement historique)
            // - Combiné: visible uniquement pour le type principal déterminé par showSubscriptionPrice()
            // - Stage dans un combiné: masqué (comportement historique)
            if (!isCombined) {
                if (!cancelled) setShowFraisInscription(true);
            } else {
                if (SubscriptionType === 'stage') {
                    if (!cancelled) setShowFraisInscription(false);
                } else {
                    const res = await showSubscriptionPrice(Subscription);
                    const shouldShow = (
                        (SubscriptionType === 'annuel' && res?.includes('annuel')) ||
                        (SubscriptionType === 'preinscription' && !res?.includes('annuel') && res?.includes('preinscription'))
                    );
                    if (!cancelled) setShowFraisInscription(Boolean(shouldShow));
                }
            }
        }

        compute();
        return () => { cancelled = true; };
    }, [Student?.id, Student?.class, SubscriptionType, Subscription?.week_count, Subscription?.session_per_week, isCombined, Subscription]);

    return { price, isCombined, showFraisInscription };
}

/**
 * Stage-only contract flow. Keeping pages minimal and explicit for stage.
 */
const StageSubscriptionContent: React.FC<FullContractProps & { price: number; showFraisInscription: boolean }>
    = ({ Student, Subscription, SubscriptionType, price, showFraisInscription }) => {
        return (
            <div className="space-y-8">
                <div className="p-0 text-sm">
                    {Student && (
                        <FirstPageComponent student={Student} subscriptionType={SubscriptionType} subscription={Subscription} />
                    )}

                    {Student && (
                        <div className="nouvelle-page welcome-page second-page-style">
                            <WelcomePageComponent student={Student} subscriptionType={SubscriptionType} subscription={Subscription} />
                        </div>
                    )}

                    {Student && Subscription && (
                        <Page className="table-page-style">
                            <TarificationCalculator data={Subscription} price={price} />
                        </Page>
                    )}

                    <Page>
                        {showFraisInscription && (
                            <FraisInscriptionComponent
                                student={Student}
                                subscriptionType={SubscriptionType}
                                subscription={Subscription}
                                price={price}
                            />
                        )}

                        {/* No chèque de caution / comportement for stage */}
                        <EngagementPaiementNotice />
                        <SignatureComponent student={Student} subscription={Subscription} />
                    </Page>

                </div>
            </div>
        );
    };

/**
 * Non-stage contract flow (annuel / preinscription) – mirrors historical layout.
 */
const NonStageSubscriptionContent: React.FC<FullContractProps & { price: number; showFraisInscription: boolean }>
    = ({ Student, Subscription, SubscriptionType, price, showFraisInscription }) => {
        return (
            <div className="space-y-8">
                <div className="p-0 text-sm">
                    {Student && (
                        <FirstPageComponent student={Student} subscriptionType={SubscriptionType} subscription={Subscription} />
                    )}

                    {Student && (
                        <div className="nouvelle-page welcome-page second-page-style">
                            <WelcomePageComponent student={Student} subscriptionType={SubscriptionType} subscription={Subscription} />
                        </div>
                    )}

                    {Student && Subscription && (
                        <Page className="table-page-style">
                            <TarificationCalculator data={Subscription} price={price} />
                        </Page>
                    )}

                    <Page>
                        {showFraisInscription && (
                            <FraisInscriptionComponent
                                student={Student}
                                subscriptionType={SubscriptionType}
                                subscription={Subscription}
                                price={price}
                            />
                        )}

                        <EngagementPaiementNotice />

                        {!!price && (
                            <ChequeDeCautionComponent
                                student={Student}
                                subscriptionType={SubscriptionType}
                                subscription={Subscription}
                                price={price}
                            />
                        )}

                        <ComportementComponent />
                    </Page>

                    <Page>
                        <DisponibiliteEtAssistanceDomicileComponent />
                        <AbsencesComponent />
                        <CreationGestionCompteURSSAFComponent />
                        <ModificationAnnulationNotice />
                    </Page>

                    <Page className="page-break">
                        <ProcedureResiliationNotice subscriptionType={SubscriptionType} subscription={Subscription} />
                        <NonPaiementMensualitesNotice />
                        <SignatureComponent student={Student} subscription={Subscription} />

                    </Page>
                </div>
            </div>
        );
    };

/**
 * Public entry: delegates to Stage vs Non-Stage flows while keeping a single export name.
 */
const SingleSubscriptionContent: React.FC<FullContractProps> = ({ Student, Subscription, SubscriptionType }) => {
    const { price, showFraisInscription } = useSubscriptionLogic(Student, Subscription, SubscriptionType);
    const isStage = SubscriptionType === 'stage';

    if (isStage) {
        return (
            <StageSubscriptionContent
                Student={Student}
                Subscription={Subscription}
                SubscriptionType={SubscriptionType}
                price={price}
                showFraisInscription={showFraisInscription}
            />
        );
    }

    return (
        <NonStageSubscriptionContent
            Student={Student}
            Subscription={Subscription}
            SubscriptionType={SubscriptionType}
            price={price}
            showFraisInscription={showFraisInscription}
        />
    );
};

export default SingleSubscriptionContent;
