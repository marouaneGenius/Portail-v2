// ContractPdfExporter.tsx
import React, { useEffect, useRef, useState } from 'react';
import MultiSubscriptionsContent from './MultiSubscriptionsContent';
import SingleSubscriptionContent from './SingleSubscriptionContent';

export interface FullContractProps {
    Student:any;
    Subscription:any;
  }

const ContractContentComponent: React.FC<FullContractProps>  = ({ Student, Subscription}) => {
    const [student, setStudent] = useState(Student);
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
    <div className="space-y-8 bg-red-500">
        <div className="bg-white p-6 text-sm text-gray-800">
            {
                Array.isArray(subscription) ?
                <MultiSubscriptionsContent Student={Student} Subscription={Subscription} SubscriptionType={subscriptionType} />
                :
                <SingleSubscriptionContent Student={Student} Subscription={Subscription} SubscriptionType={subscriptionType} />
            }
        </div>
    </div>
  );
};

export default ContractContentComponent;