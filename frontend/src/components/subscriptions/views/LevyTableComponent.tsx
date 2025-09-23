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
  subscription_type: any
}

const TarificationTable: React.FC<TarificationTableProps> = ({
  lignes,
  totalApresReduction,
  coutHoraire,
  subscription_type
}) => {

  const isStage = subscription_type === "stage";

  // Vérifier si lignes est défini et est un tableau
  if (!lignes || !Array.isArray(lignes) || lignes.length === 0) {
    return <div>Aucune donnée de tarification disponible</div>;
  }

  return (
    <div className="nouvelle-page" style={{
      minHeight: '105vh',
      backgroundImage: "url('/logo/GENIUS-THUNDERBOLD-FILIGRANE.png')",
      backgroundRepeat: 'no-repeat',
      backgroundSize: '80%',
      backgroundPosition: '50% 50%',
      WebkitPrintColorAdjust: 'exact',
      printColorAdjust: 'exact',
      display: 'flex',
      flexDirection: 'column',
    }}>
      <div className="second-page-style w-full">
        <div className="table-responsive w-full">
          <table className="table my-4 w-full" style={{ letterSpacing: '0.02em', width: '100%' }}>
            <thead>
              <tr>
                <th className="px-0 bg-transparent border-top-0">
                  <span className="h6">Mensualité&nbsp;</span>
                </th>
                <th className="px-0 bg-transparent border-top-0">
                  <span className="h6">Date du prélèvement</span>
                </th>
                {!isStage && (
                  <th className="px-0 bg-transparent border-top-0 text-end">
                    <span className="h6">Séances/mois</span>
                  </th>
                )}
                <th className="px-0 bg-transparent border-top-0 text-end">
                  <span className="h6">Tarif TTC</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {lignes.map((ligne, i) => (
                <tr key={i}>
                  <td className="px-0" style={{ whiteSpace: 'pre-line' }}>{ligne.description || ''}</td>
                  <td className="px-0">{ligne.datePrelevement || ''}</td>
                  {!isStage && <td className="px-0 text-end">{ligne.nbSeances || 0}</td>}
                  <td className="px-0 text-end">{(ligne.tarifAvant || 0).toLocaleString('fr-FR')} €</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr>
                <th colSpan={isStage ? 3 : 4} className="text-end">Total :</th>
                <th className="text-end">{(totalApresReduction || 0).toLocaleString('fr-FR')} €</th>
              </tr>
              <tr>
                <th colSpan={isStage ? 3 : 4} className="text-end">Coût horaire :</th>
                <th className="text-end">{(coutHoraire || 0).toFixed(2).replace('.', ',')} € / heure</th>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  );
};

export default TarificationTable;
