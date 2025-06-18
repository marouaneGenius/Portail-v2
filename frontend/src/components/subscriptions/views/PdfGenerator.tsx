import React, { useEffect, useState } from 'react';
import { Preview } from 'react-html2pdf';
import ContractContentComponent from './ContractContentComponent';
import DownloadButtonsComponents from './DownloadButtonsComponents';
import { RPConfig, RPDefaultLayout, RPPages, RPProvider } from '@pdf-viewer/react';

export interface FullContractProps {
  Student: any;
  Subscription: any;
}

const PdfGenerator: React.FC<FullContractProps> = ({ Student, Subscription }) => {
  const previewId = 'contract-preview';
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);

  useEffect(() => {
    const el = document.getElementById(previewId);
    if (el?.parentElement) el.parentElement.style.position = 'relative';
  }, []);

  const pdfOptions = {
    margin:      [10,10,10,10],
    filename:    'contrat-genius.pdf',
    image:       { type: 'jpeg', quality: 0.98 },
    html2canvas: { scale: 2 },
    jsPDF:       { unit: 'mm', format: 'a4', orientation: 'portrait' },
    pagebreak:   { mode: ['css','legacy'], before: '.page-break' },
  };

  const generatePdf = async () => {
    const el = document.getElementById(previewId);
    if (!el) return;

    try {
      const { default: html2pdf } = await import('html2pdf.js');
      const worker = html2pdf().set(pdfOptions).from(el);
      const blob: Blob = await worker.outputPdf('blob');
      setPdfUrl(URL.createObjectURL(blob));
    } catch (err) {
      console.error('Erreur génération PDF :', err);
    }
  };

  // const seeContract = async () => {
  //   const el = document.getElementById(previewId);
  //   if (!el) return;

  //   try {
  //     const { default: html2pdf } = await import('html2pdf.js');
  //     const worker = html2pdf().set(pdfOptions).from(el);
  //     const blob: Blob = await worker.outputPdf('blob');
  //     setPdfUrl(URL.createObjectURL(blob));
  //   } catch (err) {
  //     console.error('Erreur génération PDF :', err);
  //   }
  // };

  return (
    <div className="space-y-0  ">
        <DownloadButtonsComponents 
          student={Student}  
          subscription={Subscription}    
          previewId={previewId}
          onGenerate={generatePdf}
          // seeContract={seeContract}
          pdfUrl={pdfUrl} />

        <style>{`
          .page-break { page-break-before: always; }
          #${previewId} { width: 900px; }
        `}</style>
        {
          !pdfUrl &&
          <div className="p-0 ">
            <Preview id={previewId}>
              <ContractContentComponent Student={Student} Subscription={Subscription} />
            </Preview>
          </div>
        }
        {pdfUrl && (
            <div className="mt-0 w-full h-[1000px] border">
              <RPConfig>
                <RPProvider src={pdfUrl} >
                  <RPDefaultLayout style={{ height: '660px' }}>
                    <RPPages />
                  </RPDefaultLayout>
                </RPProvider>
              </RPConfig>
            </div>
          )}
    </div>
  );
};

export default PdfGenerator;
