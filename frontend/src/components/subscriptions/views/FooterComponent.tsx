import React from "react";

interface FooterInfosProps {
  adresse: string;
  codePostal: string;
  ville: string;
}

const FooterInfos: React.FC<FooterInfosProps> = ({
  adresse,
  codePostal,
  ville,
}) => (
  <div className="text-center text-xs mt-10 print:text-[10px]">
    <small>
      GENUIS
      <br />
      {adresse} {codePostal}, {ville} – Contact : 07.66.18.28.36
      <br />
      SAS au capital social de 5 000&nbsp;€ – N° SIRET 90501854500061 – N° identification TVA :
      FR39905018545 – R.C.S Pontoise – Code APE : 8559B
    </small>
  </div>
);

export default FooterInfos;
