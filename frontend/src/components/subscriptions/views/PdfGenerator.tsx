// // ContractPdfExporter.tsx
// import React, { use, useEffect, useRef } from 'react';
// import { Preview, print } from 'react-html2pdf';
// import ContractContentComponent from './ContractContentComponent';

// export interface FullContractProps {
//   Student:any;
//   Subscription:any;
// }

// const ContractPdfExporter: React.FC<FullContractProps> = ({ Student, Subscription}) => {
//     const previewId =`contract-preview`;

//     // the library force the style of the parent element to be absolute, so we change it to relative
//     // This effect runs once to set the parent element's position to relative
//   useEffect(() => {
//     const element = document.getElementById('contract-preview');
//     if (element) {
//       const parent = element.parentElement;
//       if (parent) {
//         parent.style.position = 'relative';
//       }
//     }
//   }, [previewId]);

//   const pdfOptions = {
//     jsPDF: { unit: 'pt', format: 'a4', orientation: 'portrait' },
//     pagebreak: {
//       mode: ['css', 'legacy'],     // honor CSS page‐break rules
//       before: '.page-break',       // insert a break before any element with this class
//     }
//   };

//     return (
//         <div className="space-y-8 w-full">
//               <style>
//                 {`
//                   /* any element with .page-break will start a new PDF page */
//                   .page-break { page-break-before: always; }
//                   /* ensure content just flows otherwise */
//                   #${previewId} { width: 210mm; } 
//                 `}
//               </style>
//             <div  className="bg-white p-0 ">
//                 <Preview id={previewId} >
//                    {/* 
//                       If your ContractContentComponent spans multiple "screen" pages,
//                       you can sprinkle <div className="page-break" /> between sections 
//                       where you want to force a page break.
//                     */}
//                     <ContractContentComponent Student={Student} Subscription={Subscription} />
//                 </Preview>
//             </div>

//             <button
//                 className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
//                 onClick={() => print('contrat-genius.pdf', previewId)}
//             >
//                 Générer le PDF
//             </button>
//         </div>
//     );
// };

// export default ContractPdfExporter;

// PdfGenerator.tsx
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
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [showGeneratedPdf, setShowGeneratedPdf] = useState<boolean>(false);


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
          <iframe
            src={pdfUrl}
            title="Aperçu du contrat PDF"
            width="100%"
            height="100%"
          />
        </div>
      )}
      {/*  <div className="flex space-x-4">
        <button
          onClick={generatePdf}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Générer et Prévisualiser
        </button>

        {pdfUrl && (
          <a
            href={pdfUrl}
            download="contrat-genius.pdf"
            className="mt-4 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
          >
            Télécharger le PDF
          </a>
        )} 
      </div>*/}
    </div>
  );
};

export default PdfGenerator;
