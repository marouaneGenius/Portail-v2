import React, { useState } from 'react';
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
    /* on range les valeurs par section (annuel / stage…) */
    setCollectedValues((prev) => ({
      ...prev,
      [section.toLowerCase()]: stepValues,
    }));

    if (isLastStep) {
      setShowReview(true);              // on passe à l’écran récap
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
    onSubmit(collectedValues);          // POST final
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
            key={currentStep.title} 
            title={currentStep.title}
            fields={currentStep.fields}
            isLast={isLastStep}
            initialValues={collectedValues}
            onBack={handleBack}
            onNext={handleNextStep}
          />
        }
      </div>
      <div className="flex justify-center mt-6 space-x-2">
        {steps.map((step, idx) => (
          <div
            key={step.title}
            className={`w-3 h-3 rounded-full ${idx === stepIndex ? 'bg-indigo-600' : 'bg-gray-300'}`}
          />
        ))}
      </div>
    </>
  );
};

export default MultiStepFormWrapper;
