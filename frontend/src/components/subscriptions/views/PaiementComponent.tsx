import React from "react";

/**
 * BehaviorNotice
 * --------------
 * Bloc statique « Paiement » sans variable.
 */
export const PaiementComponent: React.FC = () => (
  <div className="space-y-4 m-1 py-2" style={{ letterSpacing: '0.02em' }}>
    <strong className="poppins-title-bold">Paiement&nbsp;:</strong>

    <ul className="list-disc list-inside space-y-2">
      <li>
        Le paiement des cours s’effectue&nbsp;:
        <ul className="list-disc list-inside ml-5 mt-1 space-y-1">
          <li>
            <strong>En priorité via la solution ALMA</strong>, permettant d’échelonner le règlement en plusieurs fois&nbsp;;
          </li>
          <li>
            <strong>En complément, par mandat SEPA</strong> (prélèvement automatique trimestriel).
          </li>
        </ul>
      </li>
    </ul>
  </div>
);
