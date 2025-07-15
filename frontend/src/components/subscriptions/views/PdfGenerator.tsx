import React, { useEffect, useState } from 'react';
import { Preview } from 'react-html2pdf';
import ContractContentComponent from './ContractContentComponent';
import DownloadButtonsComponents from './DownloadButtonsComponents';

export interface FullContractProps {
  Student: any;
  Subscription: any;
}

const PdfGenerator: React.FC<FullContractProps> = ({ Student, Subscription }) => {
  const previewId = 'contract-preview';

  useEffect(() => {
    const el = document.getElementById(previewId);
    if (el?.parentElement) el.parentElement.style.position = 'relative';
  }, []);

  return (
    <div className="space-y-0  ">
        <DownloadButtonsComponents 
          student={Student}  
          subscription={Subscription}    
          previewId={previewId}
        />
        <style>{`
          .page-break { page-break-before: always; }
          #${previewId} { width: 900px; }
        `}</style>
        {
          <div className="p-0 ">
            <Preview id={previewId}>
              <ContractContentComponent Student={Student} Subscription={Subscription}  />
            </Preview>
          </div>
        }
    </div>
  );
};

export default PdfGenerator;
