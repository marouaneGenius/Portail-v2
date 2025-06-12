// ContractPdfExporter.tsx
import React, { useEffect, useRef, useState } from 'react';
import SingleSubscriptionContent from './SingleSubscriptionContent';
import DownloadButtonsComponents from './DownloadButtonsComponents';

export interface FullContractProps {
    Student:any;
    Subscription:any;
}

const ContractContentComponent: React.FC<FullContractProps>  = ({ Student, Subscription}) => {
    const [subscription, setSubscription] = useState(Subscription);
    const [subscriptionType, setSubscriptionType] = useState<any[]>([]);

    useEffect(() => {
        if(Array.isArray(subscription)) {
            setSubscriptionType(subscription.map(sub => sub.subscription_type));
        } else {
            setSubscriptionType(subscription.subscription_type);
        }
    }, [Student, Subscription]);


  return (
    <div className="space-y-8">
        
        <div className="bg-white p-6 text-sm text-gray-800">
            {
                Array.isArray(Subscription) ?
                <>
                    {
                        subscription.map((sub:any) => {
                        return <SingleSubscriptionContent Student={Student} Subscription={sub} SubscriptionType={sub.subscription_type} />
                        })
                    }
                </>
                :
                <SingleSubscriptionContent Student={Student} Subscription={Subscription} SubscriptionType={subscriptionType} />
            }
        </div>
    </div>
  );
};

export default ContractContentComponent;