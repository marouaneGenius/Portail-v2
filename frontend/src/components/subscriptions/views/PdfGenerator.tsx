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
        <link rel="preconnect" href="https://fonts.gstatic.com/" />
        <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;700&display=swap" rel="stylesheet" />
        <link href="https://fonts.googleapis.com/css2?family=Source+Serif+4:wght@300&display=swap" rel="stylesheet" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link href="https://fonts.googleapis.com/css2?family=Poppins:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,100;1,200;1,300;1,400;1,500;1,600;1,700;1,800;1,900&display=swap" rel="stylesheet" />
        <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.0.2/dist/css/bootstrap.min.css" rel="stylesheet" integrity="sha384-EVSTQN3/azprG1Anm3QDgpJLIm9Nao0Yz1ztcQTwFspd3yD65VohhpuuCOmLASjC" crossOrigin="anonymous" />
        <DownloadButtonsComponents 
          student={Student}  
          subscription={Subscription}    
          previewId={previewId}
        />
        <style>{`
          .page-break { page-break-before: always; }
          #${previewId} { width: 900px; }
          
          .defaut_invisible {
            display: none;
          }
          .poppins{
            font-family: "Poppins", sans-serif;
          }
          * {
            font-family: "Source Serif 4", serif;
          }
          strong {
            font-family: "Poppins", sans-serif;
          }
          span {
            font-family: "Poppins", sans-serif;
          }

          .firstpage {
            display: flex;
            flex-direction: column;
            justify-content: space-between;
            min-height: 95vh;
            background-image: url('/logo/GENIUS-THUNDERBOLD-FILIGRANE.png');
            background-repeat: no-repeat;
            background-size: 80%;
            background-position: 50% 50%;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
          
          .firstpage .page-number-print {
            display: none !important;
          }

          @media screen {
            .page-number-print {
              display: none;
            }
          }

          @media print {
            .poppins-title-bold {
              font-family: "Poppins", sans-serif;
              font-weight: 900;
            }
            .impression_invisible {
              display: none
            }
            .impression_visible {
              display: block
            }
            body {
              font-size: 12px;
              margin: 0 !important;
              padding: 0 !important;
              background: none !important;
            }

            #conditions {
              font-size: 8px;
            }

            .nouvelle-page {
              page-break-before: always;
              break-before: page;
              -webkit-region-break: before;
              display: block;
              position: relative;
              -webkit-region-break: before;
              font-family: 'Poppins', sans-serif;
              min-height: 90vh;
              background-image: url('/logo/GENIUS-THUNDERBOLD-FILIGRANE.png');
              background-repeat: no-repeat;
              background-size: 80%;
              background-position: 50% 50%;
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
            }

            .mini-logo-top-left {
              background-image: url('/logo/GENIUS-THUNDERBOLD-LITTLE.png');
              background-repeat: no-repeat;
              background-size: 6%;
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
              min-height: 10vh;
            }
            .questions {
              display: flex !important;
              min-height: 100vh;
            }
            .page-footer {
              display: block !important;
            }
            .second-page-style{
              display: flex !important;
              flex-direction: column;
              justify-content: space-between;
              min-height: 90vh;
            }
            .other-page-style{
              display: flex !important;
              flex-direction: column;
              justify-content: space-between;
              min-height: 85vh;
            }
            .welcomTitle{
              display: block !important;
            }
            .welcomTitleFont{
              font-size: 45px;
            }
            .table-page-style{
              display: flex !important;
              flex-direction: column;
              justify-content: space-between;
              min-height: 90vh;
            }
            .last-page-style{
              display: flex !important;
              flex-direction: column;
              justify-content: space-between;
              min-height: 100vh;
            }
            .paiementPhrase{
              font-size: 15px;
            }
            .new-page-style{
              display: flex !important;
              flex-direction: column;
              justify-content: space-between;
              min-height: 70vh;
            }
            .spaceDesignation{
              margin-top: 80px;
            }
            .spaceDesignation2{
              margin-top: 100px;
            }
            .page-number-print {
              position: absolute;
              top: 60px;
              right: 30px;
              font-size: 18px;
              color: #000000;
              font-weight: bold; 
            }
            .remise {
              display: none;
            }
            .firstpage{
              display: flex !important;
              flex-direction: column !important;
              justify-content: space-between !important;
              height: 100vh !important;
              min-height: 100vh !important;
              background-image: url('/logo/GENIUS-THUNDERBOLD-FILIGRANE.png') !important;
              background-repeat: no-repeat !important;
              background-size: 80% !important;
              background-position: 50% 50% !important;
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
              page-break-after: always !important;
            }
            
            .firstpage .page-number-print {
              display: none !important;
            }
          }
        `}</style>
        <script dangerouslySetInnerHTML={{
          __html: `
            (function () {
              window.onload = function () {
                const preloader = document.querySelector('.page-loading');
                if (preloader) {
                  preloader.classList.remove('active');
                  setTimeout(function () {
                    preloader.remove();
                  }, 1000);
                }
              };
            })();
            
            function addPagination() {
              // Sélectionner toutes les pages avec classe .nouvelle-page
              const nouvellesPages = document.querySelectorAll('.nouvelle-page');
              
              // Filtrer pour exclure les pages avec classe .firstpage
              const paginatedPages = Array.from(nouvellesPages).filter(page => 
                !page.classList.contains('firstpage')
              );
              
              const total = paginatedPages.length;

              // Supprimer les numéros de page existants
              paginatedPages.forEach(page => {
                const existingPageNumber = page.querySelector('.page-number-print');
                if (existingPageNumber) {
                  existingPageNumber.remove();
                }
              });

              // Ajouter les nouveaux numéros de page
              paginatedPages.forEach((page, index) => {
                const pageNumber = document.createElement('div');
                pageNumber.classList.add('page-number-print');
                pageNumber.textContent = \`\${index + 1}/\${total}\`;
                page.appendChild(pageNumber);
                page.style.position = 'relative';
              });
            }

            // Exécuter au chargement initial
            document.addEventListener("DOMContentLoaded", addPagination);
            
            // Exécuter après un délai pour les contenus dynamiques
            setTimeout(addPagination, 1000);
          `
        }} />
        {
          <div className="p-0" style={{
            backgroundImage: "url('/logo/GENIUS-THUNDERBOLD-FILIGRANE.png')",
            backgroundRepeat: 'no-repeat',
            backgroundPosition: 'center center',
            backgroundSize: '30%',
            backgroundAttachment: 'fixed',
            WebkitPrintColorAdjust: 'exact',
            printColorAdjust: 'exact'
          }}>
            <Preview id={previewId}>
              <ContractContentComponent Student={Student} Subscription={Subscription}  />
            </Preview>
          </div>
        }
    </div>
  );
};

export default PdfGenerator;
