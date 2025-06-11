// ContractPdfExporter.tsx
import React, { use, useEffect, useRef } from 'react';
import { Preview, print } from 'react-html2pdf';
import ContractContentComponent from './ContractContentComponent';

export interface FullContractProps {
  Student:any;
  Subscription:any;
}

const ContractPdfExporter: React.FC<FullContractProps> = ({
    Student,
    Subscription,
}) => {
    const previewId =`contract-preview`;

// the library force the style of the parent element to be absolute, so we change it to relative
// This effect runs once to set the parent element's position to relative
    useEffect(() => {
        const element = document.getElementById('contract-preview');
        if (element) {
          const parent = element.parentElement;
          if (parent) {
            parent.style.position = 'relative';
          }
        }
      }, [previewId]);

  return (
    <div className="space-y-8 w-full">
        <div  className="bg-white p-6 text-sm text-gray-800 ">
            <Preview id={previewId} >
                <ContractContentComponent Student={Student} Subscription={Subscription} />
            </Preview>
        </div>

        <button
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            onClick={() => print('contrat-genius.pdf', previewId)}
        >
            Générer le PDF
        </button>
    </div>
  );
};

export default ContractPdfExporter;
