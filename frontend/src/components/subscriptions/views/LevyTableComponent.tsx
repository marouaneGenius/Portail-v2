import React from "react";

export interface TarificationLigne {
  description: string;
  datePrelevement: string; // date déjà formatée en FR
  nbSeances: number;
  tarifAvant: number;
  tarifApres: number;
}

export interface TarificationTableProps {
  lignes: TarificationLigne[];
  totalApresReduction: number;
  coutHoraire: number;
}

const TarificationTable: React.FC<TarificationTableProps> = ({
  lignes,
  totalApresReduction,
  coutHoraire,
}) => {
  return (
    <>    
    <table className="table-auto w-full my-4 text-sm border-separate border-spacing-y-2">
      <thead>
        <tr>
          <th className="text-left">Description</th>
          <th className="text-left">Date du prélèvement</th>
          <th className="text-right">Nombre de séances</th>
          <th className="text-right">Tarif TTC (avant réduction)</th>
          <th className="text-right">Tarif TTC (après réduction)</th>
        </tr>
      </thead>

      <tbody>
        {lignes.map((ligne, i) => (
          <tr key={i}>
            <td>{ligne.description}</td>
            <td>{ligne.datePrelevement}</td>
            <td className="text-right">{ligne.nbSeances}</td>
            {/* <td className="text-right">{ligne.tarifAvant.toLocaleString("fr-FR")} €</td>
            <td className="text-right">{ligne.tarifApres.toLocaleString("fr-FR")} €</td> */}
            <td className="text-right">{ligne.tarifAvant} €</td>
            <td className="text-right">{ligne.tarifApres} €</td>
          </tr>
        ))}
      </tbody>

      <tfoot>
        <tr>
          <th colSpan={4} className="text-right font-semibold">
            Total après réduction :
          </th>
          <th className="text-right">{totalApresReduction} €</th>
          {/* <th className="text-right">{totalApresReduction.toLocaleString("fr-FR")} €</th> */}

        </tr>
        <tr>
          <th colSpan={4} className="text-right font-semibold">
            Coût horaire :
          </th>
          <th className="text-right">{coutHoraire.toFixed(2)} € / heure</th>
        </tr>
      </tfoot>
    </table>
    </>

  );
};

export default TarificationTable;
