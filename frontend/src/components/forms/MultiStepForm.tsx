import React, { useState } from 'react';
import { FormField } from '../FormGenerator';
import FieldStepper from './FieldStepper';
import { MultiSelectWrapper } from './customInput';

interface MultiStepFormProps {
  steps: { title: string; fields: FormField[] }[];
  onSubmit: (values: Record<string, any>) => void;
}

const MultiStepFormWrapper: React.FC<MultiStepFormProps> = ({ steps, onSubmit }) => {
  const [stepIndex, setStepIndex] = useState(0);
  const [collectedValues, setCollectedValues] = useState<Record<string, any>>({});

  const currentStep = steps[stepIndex];
  const isLastStep = stepIndex === steps.length - 1;

  const handleNextStep = (stepValues: Record<string, any>) => {
    setCollectedValues((prev) => ({ ...prev, ...stepValues }));
    if (isLastStep) {
      onSubmit({ ...collectedValues, ...stepValues });
    } else {
      setStepIndex((i) => i + 1);
    }
  };

  const handleBack = () => {
    setStepIndex((i) => Math.max(i - 1, 0));
  };

  return (
    <>
      <div className='full-screen'>
        <FieldStepper
          title={currentStep.title}
          fields={currentStep.fields}
          isLast={isLastStep}
          initialValues={collectedValues}
          onBack={handleBack}
          onNext={handleNextStep}
        />
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
