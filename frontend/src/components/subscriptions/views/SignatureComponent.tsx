import React from "react";

export interface SignatureNoticeProps {
  /** Ville où est établi le document */
  city: string;
  /** Date à afficher (ISO string ou Date), formatée automatiquement en français */
  date: string | Date;
  /** Civilité du parent ("M.", "Mme.", etc.) */
  parentTitle: string;
  /** Prénom du parent */
  parentFirstName: string;
  /** Nom du parent */
  parentLastName: string;
}

/**
 * SignatureNotice
 * ---------------
 * Affiche la mention "Fait à {ville}, le {date formatted}"
 * suivie de la ligne de signature du parent.
 */
const SignatureNotice: React.FC<SignatureNoticeProps> = ({
  city,
  date,
  parentTitle,
  parentFirstName,
  parentLastName,
}) => {
  // Normalise la date en Date
  const d = typeof date === "string" ? new Date(date) : date;

  // Formatte la date en français complet
  const formattedDate = d.toLocaleDateString("fr-FR", {
    weekday: "long",
    day: "2-digit",
    month: "long",
    year: "numeric",
  });

  return (
    <div className="space-y-4">
      <p>
        Fait à <strong>{city}</strong>, le <strong>{formattedDate}</strong>
      </p>
      <h6 className="uppercase mt-12">
        Signature de {parentTitle} {parentFirstName} {parentLastName}{" "}
        <span className="italic">précédé de la mention "Lu et approuvé"</span>
      </h6>
    </div>
  );
};

export default SignatureNotice;



// import SignatureNotice from "@/components/SignatureNotice";

// export default function ContratPage() {
//   return (
//     <div className="p-6">
//       {/* ... autres blocs ... */}
//       <SignatureNotice
//         city="Pontoise"
//         date={new Date()}            // ou "2025-06-10"
//         parentTitle="Mme."
//         parentFirstName="Marie"
//         parentLastName="Dupont"
//       />
//     </div>
//   );
// }
