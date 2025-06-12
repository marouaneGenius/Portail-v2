import React, { useState } from "react";
import { ContractHeaderProps } from "./HeaderComponent";


const SignatureComponent: React.FC<ContractHeaderProps> = ({ student, subscription}) => {
  // Normalise la date en Date
   const d = typeof subscription.created_at === "string" ? new Date(subscription.created_at) : subscription.created_at;
   const [parent, setParent] = useState(student?.parents[0] || {});
   const [center, setCenter] = useState(student?.centers || {});

  // Formatte la date en français complet
  const formattedDate = d.toLocaleDateString("fr-FR", {
    weekday: "long",
    day: "2-digit",
    month: "long",
    year: "numeric",
  });

  return (
    <div className="space-y-4 my-4 p-2">
      <p>
        Fait à <strong>{center.city}</strong>, le <strong>{formattedDate}</strong>
      </p>
      <h6 className="uppercase mt-12">
        Signature de {parent.firstname} {parent.lastname} {" "}
        <span className="italic">précédé de la mention "Lu et approuvé"</span>
      </h6>
    </div>
  );
};

export default SignatureComponent;