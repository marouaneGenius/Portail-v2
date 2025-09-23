import React from "react";

/**
 * BehaviorNotice
 * --------------
 * Bloc statique « Comportement » sans variable.
 */
export const ComportementComponent: React.FC = () => (
  <div className="space-y-4 m-1 py-2" style={{ letterSpacing: '0.02em' }}>
    <strong className="poppins-title-bold">Comportement&nbsp;:</strong>

    <ul className="list-disc list-inside space-y-2">
      <li>
        En cas de problème de comportement de l&apos;enfant, si celui-ci reçoit trois avertissements écrits
        et que son comportement nuit à sa réussite et à celle de ses camarades, GENIUS se réserve le
        droit d&apos;interrompre les cours et d&apos;annuler toutes les séances restantes pour le trimestre en
        cours, sans possibilité de remboursement. <strong>Le trimestre en cours sera intégralement dû.</strong>
      </li>
      <li>
        Tout manquement de respect, intimidation, menace, violence verbale ou physique de la part des
        parents envers un membre de l&apos;équipe GENIUS entraînera la résiliation immédiate du contrat,
        selon les mêmes conditions mentionnées ci-dessus. GENIUS se réserve le droit de poursuivre en
        justice les actions répréhensibles par la loi.
      </li>
    </ul>
  </div>
);
