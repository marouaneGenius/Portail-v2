import React, { useState } from 'react';
import { FormField } from '../FormGenerator';

interface MultiStepFormProps {
  steps: { title: string; fields: FormField[] }[];
  onSubmit: (values: Record<string, any>) => void;
}

const MultiStepForm: React.FC<MultiStepFormProps> = ({ steps, onSubmit }) => {
    const [stepIndex, setStepIndex] = useState(0);
    const [formData, setFormData] = useState<Record<string, any>>({});
    const [disabledSteps, setDisabledSteps] = useState<boolean[]>(steps.map(() => false));
  
    const handleChange = (name: string, value: any) => {
      setFormData((prev) => ({ ...prev, [name]: value }));
    };
  
    const toggleStep = (index: number) => {
      setDisabledSteps((prev) => {
        const updated = [...prev];
        updated[index] = !updated[index];
        return updated;
      });
    };
  
    const isLastStep = stepIndex === steps.length - 1;
    const onlyOneStep = steps.length === 1;
    const currentStep = steps[stepIndex];
  
    const handleNext = () => setStepIndex((i) => Math.min(i + 1, steps.length - 1));
    const handlePrev = () => setStepIndex((i) => Math.max(i - 1, 0));
    const handleSubmit = () => onSubmit(formData);
  
    const cn = (...classes: (string | false | undefined)[]) => classes.filter(Boolean).join(" ");
  
    return (
      <div className="max-w-4xl mx-auto p-4  bg-white shadow rounded">
        {steps.map((step, idx) => (
          <div
            key={step.title}
            className={cn(
              'transition-all duration-500 overflow-hidden border shadow rounded p-4',
              idx === stepIndex ? 'opacity-100 max-h-[1000px]' : 'opacity-0 max-h-0 pointer-events-none',
              disabledSteps[idx] && 'bg-gray-100 opacity-50'
            )}
          >
            <div className="flex justify-between items-center mb-2">
              <h2 className="text-xl font-bold">{step.title}</h2>
              <button
                type="button"
                className="text-sm text-indigo-600 underline"
                onClick={() => toggleStep(idx)}
              >
                {disabledSteps[idx] ? 'Réactiver' : 'Annuler'}
              </button>
            </div>
  
            {!disabledSteps[idx] && (
              <div className="space-y-3">
                {step.fields.map((f) => (
                  <div key={f.name}>
                    <label className="block text-sm font-medium mb-1">{f.label}</label>
                    <input
                      type={f.type || 'text'}
                      name={f.name}
                      value={formData[f.name] || ''}
                      onChange={(e) => handleChange(f.name, e.target.value)}
                      className="w-full border rounded px-3 py-2"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
  
        {/* Boutons de navigation */}
        <div className={cn(
          "mt-4 flex",
          onlyOneStep ? "justify-center" : "justify-between"
        )}>
          {!onlyOneStep && (
            <button
              onClick={handlePrev}
              disabled={stepIndex === 0}
              className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300"
            >
              Précédent
            </button>
          )}
  
          <button
            onClick={onlyOneStep || isLastStep ? handleSubmit : handleNext}
            className="px-4 py-2 rounded bg-indigo-600 text-white hover:bg-indigo-700"
          >
            {onlyOneStep || isLastStep ? "Enregistrer" : "Suivant"}
          </button>
        </div>
      </div>
    );
};
  

export default MultiStepForm;
