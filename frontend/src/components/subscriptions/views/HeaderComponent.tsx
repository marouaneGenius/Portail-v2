import React from 'react';
import { nbSeancesMap } from '../../../mocks/mocks';

export interface ContractHeaderProps {
  student?: any;
  subscriptionType?: string;
  subscription?: any;
  price?: any;
}

const HeaderComponent: React.FC<ContractHeaderProps> = ({ student, subscription, subscriptionType }) => {
  const parent = student?.parents?.[0] || {};
  const nbSeances = nbSeancesMap[subscription.session_per_week - 1];
  const favoriteSlots = subscription?.favorite_slots || [];
  // Récupère toutes les matières uniques (school_subjects + favorite_slots)
  const mainSubjects = Array.isArray(subscription.school_subjects) ? subscription.school_subjects : [];
  const slotSubjects = Array.isArray(favoriteSlots)
    ? favoriteSlots.flatMap((slot: any) => Array.isArray(slot.matieres) ? slot.matieres : [])
    : [];
  const allSubjects = Array.from(new Set([...mainSubjects, ...slotSubjects]));
  const subjects = allSubjects.join(', ');
  const weeklyHours = subscription?.weekly_hours || nbSeances || '';
  const studentName = student?.firstname || '';
  const studentClass = student?.class || '';
  const contractType =
    subscriptionType === 'stage'
      ? `Stage de ${subscription.week_count} semaines à raison de 3h/jour du lundi au vendredi`
      : subscriptionType === 'annuel'
        ? `Abonnement annuel à raison de ${nbSeances}`
        : subscriptionType === 'preinscription'
          ? `Abonnement Pré-inscription à raison de ${nbSeances}`
          : '';
  const contractStart = subscription?.subscription_start_date || subscription?.selected_weeks?.[0] || '';
  const formattedStartDate = contractStart
    ? new Date(contractStart).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })
    : '';
  const devisNumber = subscription?.id || '';
  const devisDate = subscription?.created_at || '';
  const center = student?.centers || {};
  const centerName = center.name || '';
  const centerCity = center.city || '';
  const centerAddress = center.address || '';
  const centerPostal = center.zipcode || '';
  const centerSiret = center.siret || '90501854500012';

  return null;
};

export default HeaderComponent;
