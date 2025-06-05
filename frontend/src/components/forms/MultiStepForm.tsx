import React, { useState } from 'react';
import { FormField } from '../FormGenerator';
import FieldStepper from './FieldStepper';

interface MultiStepFormProps {
  steps: { title: string; fields: FormField[] }[];
  onSubmit: (values: Record<string, any>) => void;
}

const MultiStepFormWrapper: React.FC<MultiStepFormProps> = ({ steps, onSubmit }) => {
  const [stepIndex, setStepIndex] = useState(0);
  const [collectedValues, setCollectedValues] = useState<Record<string, any>>({});
  const currentStep = steps[stepIndex];
  const isLastStep = stepIndex === steps.length - 1;

  const handleNextStep = (section: string, stepValues: Record<string, any>) => {
    setCollectedValues(prev => ({
      ...prev,
      [section.toLowerCase()]: stepValues    // Annuel ➜ prev.annuel = {...}
    }));

    if (isLastStep) {
      onSubmit({
        ...collectedValues,                  // ce qu’on avait déjà
        [section.toLowerCase()]: stepValues  // + la toute dernière étape
      });
    } else {
      setStepIndex(i => i + 1);
    }
  };

  const handleBack = () => {
    setStepIndex((i) => Math.max(i - 1, 0));
  };

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
