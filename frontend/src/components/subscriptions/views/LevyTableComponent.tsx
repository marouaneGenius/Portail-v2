{/* <table class="table my-4">
<thead>
    <tr>
        <th class="px-0 bg-transparent border-top-0"><span class="h6">Description</span></th>
        <th class="px-0 bg-transparent border-top-0"><span class="h6">Date du prélèvement</span>
        </th>
        <th class="px-0 bg-transparent border-top-0 text-end"><span class="h6">Nombre de
                séances</span></th>
        <th class="px-0 bg-transparent border-top-0 text-end"><span class="h6">Tarif TTC (avant
                réduction)</span></th>
        <th class="px-0 bg-transparent border-top-0 text-end"><span class="h6">Tarif TTC (après
                réduction)</span></th>
    </tr>
</thead>
<tbody>
    <?php

    $total_apres_reduction = 0;
    $total_heures = 0;
    $duree_seance = 1.5;

    // Fonction pour trouver la date standard la plus proche
    function getClosestStandardDate($date)
    {
        $day = date('d', strtotime($date));
        $standard_days = [5, 15, 28];

        // Si c'est déjà une date standard, on la garde
        if (in_array($day, $standard_days)) {
            return $date;
        }

        // Sinon, on trouve la plus proche
        $closest = null;
        $min_diff = PHP_INT_MAX;

        foreach ($standard_days as $std_day) {
            $diff = abs($day - $std_day);
            if ($diff < $min_diff) {
                $min_diff = $diff;
                $closest = $std_day;
            }
        }

        // Créer la nouvelle date avec le jour standard
        return date('Y-m-', strtotime($date)) . str_pad($closest, 2, '0', STR_PAD_LEFT);
    }

    if ($is_combined && $is_combined_stage) {
        if ($classe == "CP" || $classe == "CE1" || $classe == "CE2" || $classe == "CM1" || $classe == "CM2") {
            $price_by_class = [
                1 => 125,
                2 => 215,
                3 => 250,
                4 => 320,
            ];
        } else {
            $price_by_class = [
                1 => 150,
                2 => 240,
                3 => 290,
                4 => 370,
            ];
        }
    } else if ($is_combined) {
        if ($classe == "CP" || $classe == "CE1" || $classe == "CE2" || $classe == "CM1" || $classe == "CM2") {
            $price_by_class = [
                1 => 125,
                2 => 215,
                3 => 250,
                4 => 320,
            ];
        } else {
            $price_by_class = [
                1 => 150,
                2 => 240,
                3 => 290,
                4 => 370,
            ];
        }
    } else {
        if ($classe == "CP" || $classe == "CE1" || $classe == "CE2" || $classe == "CM1" || $classe == "CM2") {
            $price_by_class = [
                1 => 160,
                2 => 250,
                3 => 310,
                4 => 370,
            ];
        } else {
            $price_by_class = [
                1 => 180,
                2 => 290,
                3 => 340,
                4 => 410,
            ];
        }
    }

    $prix_variable = $price_by_class[$nbSeances];

    if ($data->mode_paiement == 'annuel') {
        $debut_annee = new DateTime($data->date_debut_abo);
        $fin_annee = new DateTime($data->date_fin_abo);

        // Ajuster la date de début au lundi suivant si nécessaire
        if ($debut_annee->format('N') != 1) { // Si pas un lundi
            $debut_annee->modify('next monday');
        }

        // Ajuster la date de fin au dimanche précédent si nécessaire
        if ($fin_annee->format('N') != 7) { // Si pas un dimanche
            $fin_annee->modify('last sunday');
        }

        // Calcul du nombre exact de semaines complètes
        $nbWeeksTotal = 0;
        $currentWeek = clone $debut_annee;

        while ($currentWeek <= $fin_annee) {
            $nbWeeksTotal++;
            $currentWeek->modify('+7 days');
        }

        // Si les dates ajustées sont invalides (début > fin)
        if ($debut_annee > $fin_annee) {
            $nbWeeksTotal = 0;
        }

        $nb_seances_annuel = $nbSeances * $nbWeeksTotal;
        $prix_total_annuel = (($prix_variable / 4) * $nbWeeksTotal) * 2;
        $prix_moitie_annuel = $prix_total_annuel / 2;
        ?>
        <tr>
            <td class="px-0">Annuel</td>
            <td class="px-0">
                <?php
                $datefr = $jour[date("w", strtotime($data->date_prelevement))] . " " .
                    date("d", strtotime($data->date_prelevement)) . " " .
                    $mois[date("n", strtotime($data->date_prelevement))] . " " .
                    date("Y", strtotime($data->date_prelevement));
                echo $datefr;
                ?>
            </td>
            <td class="px-0 text-end"><?= $nb_seances_annuel ?></td>
            <td class="px-0 text-end"><?= number_format($prix_total_annuel, 0, ',', ' ') ?>€</td>
            <td class="px-0 text-end"><?= number_format($prix_moitie_annuel, 0, ',', ' ') ?>€</td>
        </tr>
        <?php

        $total_apres_reduction += $prix_moitie_annuel;
        $total_heures += $nb_seances_annuel * $duree_seance;

    } else if ($data->mode_paiement == 'trimestriel') {
        $debut_annee = new DateTime($data->date_debut_abo);
        $fin_annee = new DateTime($data->date_fin_abo);
        $interval_total = $debut_annee->diff($fin_annee);
        $mois_total = ($interval_total->y * 12) + $interval_total->m;
        $prix_variable = $price_by_class[$nbSeances];
        $nb_trimestres = ceil($mois_total / 3);
        // Boucle sur chaque trimestre
        for ($t = 1; $t <= $nb_trimestres; $t++) {
            $quarterStart = clone $debut_annee;
            $quarterStart->modify('+' . (($t - 1) * 3) . ' months');
            $quarterEnd = clone $quarterStart;
            $quarterEnd->modify('+3 months');
            if ($quarterEnd > $fin_annee) {
                $quarterEnd = clone $fin_annee;
            }

            if ($quarterStart->format('N') != 1) { // Si pas un lundi
                $quarterStart->modify('next monday');
            }

            if ($quarterEnd->format('N') != 7) { // Si pas un dimanche
                $quarterEnd->modify('last sunday');
            }

            $interval = $quarterStart->diff($quarterEnd);
            $nbWeeks = floor($interval->days / 7) + 1; // +1 car on compte la semaine en cours
    
            if ($quarterStart > $quarterEnd) {
                $nbWeeks = 0; // Cas où la période est trop courte pour une semaine complète
            }

            $nbWeeks = 0;
            $currentWeekStart = clone $quarterStart;

            while ($currentWeekStart <= $quarterEnd) {
                $currentWeekEnd = clone $currentWeekStart;
                $currentWeekEnd->modify('+6 days');
                $currentWeekStart->modify('+7 days');
                $nbWeeks++; // On incrémente après l'affichage
            }

            $intervalQuarter = $quarterStart->diff($quarterEnd);
            $jours = $intervalQuarter->days;
            $nbWeeks = ceil($jours / 7);

            $nb_seances_trimestre = $nbSeances * $nbWeeks;
            $prix_total = (($prix_variable / 4) * $nbWeeks) * 2;
            $prix_moitie = (($prix_variable / 4) * $nbWeeks);

            $baseDate = new DateTime($data->date_prelevement);




            ?>
                <tr>
                    <td class="px-0">
                    <?= ($t == 1) ? '1ère' : $t . 'ème' ?> - trimestriel
                    </td>
                    <td class="px-0">
                        <?=
                            $datefr = $jour[date("w", strtotime($data->date_prelevement))] . " " .
                            date("d", strtotime($data->date_prelevement)) . " " .
                            $mois[date("n", strtotime($data->date_prelevement))] . " " .
                            date("Y", strtotime($data->date_prelevement));
                        ?>
                    </td>
                    <td class="px-0 text-end"><?= $nbWeeks * $nbSeances ?></td>
                    <td class="px-0 text-end"><?= number_format($prix_total, 0, ',', ' ') ?>€</td>
                    <td class="px-0 text-end"><?= number_format($prix_moitie, 0, ',', ' ') ?>€</td>
                </tr>
            <?php

        }

        $total_apres_reduction += $prix_moitie;
        $total_heures += $nbWeeks * $nbSeances * $duree_seance;


    } else {

        $req = $bdd_tab[$_GET['centre']]->_PDO->prepare("SELECT * FROM devis WHERE id_rand = ?");
        $req->execute(array($_GET['id']));
        $data = $req->fetch();

        // Récupération des jours de séance (exemple : "Lundi | Mercredi")
        $jours_seances = explode(' | ', $data['liste_seances']);
        $seances_par_semaine = count($jours_seances);
        $date_prelevement = $data['date_prelevement'];

        // Configuration des dates
        $date_cours = new DateTime($data['date_debut_abo']);
        $date_fin = new DateTime($data['date_fin_abo']);


        $interval = $date_cours->diff($date_fin);
        $jours = $interval->days + 1;

        if($jours > 8 ) {
            $nbSemaines = ceil($jours / 7);
        } else {
            $nbSemaines = ceil( max(0, $jours - 1) / 7 );
        }
        $totalSeances = $nbSemaines * $seances_par_semaine;

        $nb_mois = ceil($totalSeances / ($seances_par_semaine * 4));

        for ($i = 0; $i < $nb_mois; $i++) {
            // Calcul du nombre de séances pour ce mois
            if ($i == $nb_mois - 1) {
                $nb_seances_mois = $totalSeances - ($i * $seances_par_semaine * 4);
            } else {
                $nb_seances_mois = $seances_par_semaine * 4;
            }

            $nb_semaines_mois = ceil($nb_seances_mois / $seances_par_semaine);
            // NOUVELLE APPROCHE - Utilisation d'une seule variable de date
            $date_paiement = new DateTime($data['date_prelevement']);

            if ($i === 0) {
                // Premier mois - date originale
                $datefr = $jour[$date_paiement->format('w')] . " " .
                    $date_paiement->format('d') . " " .
                    $mois[$date_paiement->format('n')] . " " .
                    $date_paiement->format('Y');
            } else {
                // Mois suivants
                $jour_original = $date_paiement->format('d');
                $date_paiement->modify("first day of +" . ($i) . " month");

                // Trouver le jour le plus proche
                $jours_reference = [5, 15, 28];
                $jour_plus_proche = null;
                $ecart_min = null;

                foreach ($jours_reference as $jr) {
                    $ecart = abs($jour_original - $jr);
                    if ($ecart_min === null || $ecart < $ecart_min) {
                        $ecart_min = $ecart;
                        $jour_plus_proche = $jr;
                    }
                }

                $date_paiement->modify("+" . ($jour_plus_proche - 1) . " days");

                $datefr = $jour[$date_paiement->format('w')] . " " .
                    $date_paiement->format('d') . " " .
                    $mois[$date_paiement->format('n')] . " " .
                    $date_paiement->format('Y');
            }

            // Calcul des prix (inchangé mais maintenant fonctionnel)
            $prix_total = ($nb_semaines_mois * $prix_variable) / 4;
            $prix_reduit = !empty($d->_remise) ? $prix_total * (1 - $d->_remise / 100) : $prix_total;
            $prix_moitie = $prix_reduit / 2;

            // var_dump($nb_semaines_mois );

            ?>
                <tr>

                    <td class="px-0">
                    <?= ($i + 1 == 1) ? '1ère' : ($i + 1) . 'ème' ?> - mensualité
                    </td>
                    <td class="px-0"><?= $datefr ?></td>

                    
                    <td class="px-0 text-end"><?= $nb_seances_mois ?></td>
                    <td class="px-0 text-end"><?= number_format($prix_reduit * 2, 0, ',', ' ') ?>€</td>
                    <td class="px-0 text-end"><?= number_format($prix_reduit, 0, ',', ' ') ?>€</td>
                </tr>
                <?php
                $total_apres_reduction += $prix_reduit;
                $total_heures += $nb_seances_mois * $duree_seance;
        }
    }


    $cout_horaire = $total_heures > 0 ? $total_apres_reduction / $total_heures : 0;

    ?>
</tbody>

<tfoot>

    <tr>
        <th colspan="4" class="text-end">Total après réduction :</th>
        <th class="text-end"><?= number_format($total_apres_reduction, 0, ',', ' ') ?> €</th>
    </tr>

    <tr>
        <th colspan="4" class="text-end">Coût horaire :</th>
        <th class="text-end"><?= number_format($cout_horaire, 2, ',', ' ') ?> € / heure</th>
    </tr>

</tfoot>

</table> */}

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
            <td className="text-right">{ligne.tarifAvant.toLocaleString("fr-FR")} €</td>
            <td className="text-right">{ligne.tarifApres.toLocaleString("fr-FR")} €</td>
          </tr>
        ))}
      </tbody>

      <tfoot>
        <tr>
          <th colSpan={4} className="text-right font-semibold">
            Total après réduction :
          </th>
          <th className="text-right">{totalApresReduction.toLocaleString("fr-FR")} €</th>
        </tr>
        <tr>
          <th colSpan={4} className="text-right font-semibold">
            Coût horaire :
          </th>
          <th className="text-right">{coutHoraire.toFixed(2)} € / heure</th>
        </tr>
      </tfoot>
    </table>
  );
};

export default TarificationTable;
