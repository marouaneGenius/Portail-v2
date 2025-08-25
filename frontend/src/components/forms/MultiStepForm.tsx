import React, { useEffect, useState } from 'react';
import { FormField } from '../FormGenerator';
import FieldStepper from './FieldStepper';
import ReviewStep from '../subscriptions/ReviewStep';

interface MultiStepFormProps {
  steps: { title: string; fields: FormField[] }[];
  onSubmit: (values: Record<string, any>) => void;
}

const MultiStepFormWrapper: React.FC<MultiStepFormProps> = ({ steps, onSubmit }) => {
  const [stepIndex, setStepIndex] = useState(0);
  const [collectedValues, setCollectedValues] = useState<Record<string, any>>({});
  const currentStep = steps[stepIndex];
  const isLastStep = stepIndex === steps.length - 1;
  const [showReview, setShowReview] = useState(false);

  const handleNextStep = (section: string, stepValues: Record<string, any>) => {
    // setCollectedValues((prev) => ({
    //   ...prev,
    //   [section.toLowerCase()]: stepValues,
    // }));
    setCollectedValues(prev => ({
      ...prev,
      [section.toLowerCase()]: structuredClone(stepValues),
    }));
    if (isLastStep) {
      setShowReview(true);              
    } else {
      setStepIndex((i) => i + 1);
    }
  };


  const handleEdit = (section: string) => {
    const newIdx = steps.findIndex(
      (s) => s.title.toLowerCase() === section.toLowerCase()
    );
    if (newIdx !== -1) {
      setStepIndex(newIdx);
      setShowReview(false);
    }
  };

  const handleConfirm = () => {
    const payload = structuredClone(collectedValues);
    if (payload.annuel?.favorite_slots_annuel) {
      payload.annuel.favorite_slots = payload.annuel.favorite_slots_annuel;
      delete payload.annuel.favorite_slots_annuel;
    }
    onSubmit(payload);         
  };


  const handleBack = () => {
    setStepIndex((i) => Math.max(i - 1, 0));
  };

  if (showReview) {
    return (
      <ReviewStep
        values={collectedValues}
        order={steps.map((s) => s.title.toLowerCase())}
        onEdit={handleEdit}
        onConfirm={handleConfirm}
      />
    );
  }

  return (
    <>
      <div className='full-screen'>
        {
          currentStep && 
          <FieldStepper
            title={currentStep.title}
            fields={currentStep.fields}
            isLast={isLastStep}
            initialValues={collectedValues[currentStep.title.toLowerCase()] ?? {}}
            onBack={handleBack}
            onNext={handleNextStep}
          />
        }
      </div>
      {/* Barre de progression améliorée */}
      <div className="mt-8 px-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-mister-anthracite">
            Étape {stepIndex + 1} sur {steps.length}
          </span>
          <span className="text-sm text-mister-anthracite/60">
            {Math.round(((stepIndex + 1) / steps.length) * 100)}% complété
          </span>
        </div>
        
        {/* Barre de progression */}
        <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
          <div 
            className="bg-gradient-to-r from-hello-yellow to-crazy-magenta h-2 rounded-full transition-all duration-500 ease-out"
            style={{ width: `${((stepIndex + 1) / steps.length) * 100}%` }}
          ></div>
        </div>
        
        {/* Étapes avec noms */}
        <div className="flex justify-between">
          {steps.map((step, idx) => (
            <div key={step.title} className="flex flex-col items-center flex-1">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 ${
                  idx < stepIndex 
                    ? 'bg-green-500 text-white' 
                    : idx === stepIndex 
                    ? 'bg-hello-yellow text-mister-anthracite shadow-lg scale-110' 
                    : 'bg-gray-300 text-gray-500'
                }`}
              >
                {idx < stepIndex ? '✓' : idx + 1}
              </div>
              <span className={`text-xs mt-2 text-center capitalize ${
                idx === stepIndex ? 'font-semibold text-mister-anthracite' : 'text-gray-500'
              }`}>
                {step.title}
              </span>
            </div>
          ))}
        </div>
      </div>
    </>
  );
};

export default MultiStepFormWrapper;
