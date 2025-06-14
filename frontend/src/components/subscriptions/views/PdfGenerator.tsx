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
  const [showGeneratedPdf, setShowGeneratedPdf] = useState<boolean>(false);
  const [pdfBlob, setPdfBlob] = useState<Blob | null>(null)


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
      // dynamic import to get the real default export at runtime
      const { default: html2pdf } = await import('html2pdf.js');
      const worker = html2pdf().set(pdfOptions).from(el);
      const blob: Blob = await worker.outputPdf('blob');
      setPdfUrl(URL.createObjectURL(blob));
    } catch (err) {
      console.error('Erreur génération PDF :', err);
    }
  };

  return (
    <div className="space-y-8 w-full">

      <DownloadButtonsComponents 
        student={Student}  
        subscription={Subscription}    
        previewId={previewId}
        onGenerate={generatePdf}
        pdfUrl={pdfUrl} />

      <style>{`
        .page-break { page-break-before: always; }
        #${previewId} { width: 210mm; }
      `}</style>
      {
        !pdfUrl &&
        <div className="bg-white p-0">
          
        <Preview id={previewId}>
          <ContractContentComponent Student={Student} Subscription={Subscription} />
        </Preview>
      </div>
      }
     {pdfUrl && (
        <div className="mt-6 w-full h-[1000px] border">
          {/* <iframe
            src={pdfUrl}
            title="Aperçu du contrat PDF"
            width="100%"
            height="100%"
          /> */}
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
