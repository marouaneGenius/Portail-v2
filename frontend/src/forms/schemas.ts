import { FormField } from "../components/FormGenerator";
import { WeeksOptions } from "../mocks/mocks";


export interface ArrayField  extends FormField   {
  type: 'array';
  itemFields: FormField[];      // définition des champs à l’intérieur
  addLabel?: string;            // label du bouton « Ajouter »
  name:any;
  required: false;
  label:any;
}

export const userFields: FormField[] = [
  { name: 'firstname', label: 'Prénom', type: 'text', className: 'col-span-1' },
  { name: 'lastname', label: 'Nom', type: 'text' },
  { name: 'phone', label: 'Télèphone', type: 'text' },
  { name: 'email', label: 'Adresse e‑mail', type: 'email', required: true },
  { name: 'password', label: 'Mot de passe', type: 'password', required: true },
  { name: 'role', label: 'Role', type: 'select', required: true, 
    options: [ 
      { value: 'ROLE_USER', label: 'User' }, 
      { value: 'ROLE_ADMIN', label: 'Admin' }, 
      { value: 'ROLE_TUTOR', label: 'Tuteur' }, 
    ]
  },
  { name: 'price_per_hour', label: 'Prix Par Heure', type: 'text' },
  { name: 'max_session', label: 'Nombre de seance Max', type: 'text' },
  { name: 'siret', label: 'Siret', type: 'text', className: 'col-span-2' },
  { name: 'school_subjects', label: 'Matieres', type: 'select',  multiple: true },
  { name: 'centers', label: 'Centers', type: 'select',  multiple: true },
];

export const centerFields: FormField[] = [
  { name: 'name', label: 'Nom du centre', type: 'text', required: true },
  { name: 'address', label: 'Adresse', type: 'text', required: true },
  { name: 'city', label: 'Ville', type: 'text', required: true ,className: 'col-span-2'},
];

export const studentFields: FormField[] = [
  { name: 'firstname', label: 'Prénom', type: 'text', required: true },
  { name: 'lastname', label: 'Nom', type: 'text', required: true },
  { name: 'gender', label: 'Genre', type: 'select', required: true,
    options: [ 
      { value: 'male', label: 'Homme' }, 
      { value: 'female', label: 'Femme' } 
    ]
  },
  { name: 'class', label: 'Classe', type: 'select', required: true },
  { name: 'email', label: 'E‑mail', type: 'email', required: true },
  { name: 'id_center', label: 'Centre', type: 'select', required: true },
  { name: 'school_subjects', label: 'Matieres', type: 'select', className: 'col-span-2', multiple: true },
];

export const parentFields: FormField[] = [
  { name: 'firstname', label: 'Prénom', type: 'text', required: true },
  { name: 'lastname', label: 'Nom', type: 'text', required: true },
  { name: 'gender', label: 'Genre', type: 'select', required: true,
    options: [ 
      { value: 'male', label: 'Homme' }, 
      { value: 'female', label: 'Femme' } 
    ]
  },
  { name: 'email', label: 'E‑mail', type: 'email', required: true },
  { name: 'phone', label: 'Télèphone', type: 'text', required: true ,className: 'col-span-2'},
  { name: 'address', label: 'Adresse', type: 'text', required: true,className: 'col-span-2'},
  { name: 'zip_code', label: 'Code Postal', type: 'text', required: true},
  { name: 'city', label: 'Ville', type: 'text', required: true},
];

export const tutorScheduleFields: (FormField|ArrayField)[] = [
  {
    name: 'schedules',
    label: 'Créneaux',
    type: 'array',
    required: false,
    addLabel: 'Ajouter un créneau',
    itemFields: [
      {
        name: 'day',
        label: 'Jour',
        type: 'select',
        required: true,
        options: [

        ]
      },
      { name: 'start_hour', label: 'Heure début', type: 'time', required: true },
      { name: 'end_hour',   label: 'Heure fin',   type: 'time', required: true },
      { name: 'centers', label: 'Centers', type: 'select', className: 'col-span-2', multiple: true },
    ]
  },
];

// subscription_start_date, paiment_mode, date_caution
export const AnnuelFields: FormField[] = [
  { name: 'school_subjects', label: 'Matieres', type: 'select',  multiple: true, required: true },
  { name: 'favorite_slots', label: 'Tuteur planing', type: 'select',  multiple: true, required: true },
  { name: 'payment_mode', label: 'Le Mode de paiment', type: 'select',
    options: [ 
      { value: 'mensuelle', label: 'Mensuelle' }, 
      { value: 'trimestrielle', label: 'Trimestrielle' }, 
      { value: 'anuelle', label: 'Anuelle' }, 
    ]
  },
  { name: 'subscription_end_date', label: 'Finis le', type: 'date'},
  { name: 'first_debit_date', label: 'Date du premier prélèvement', type: 'date'},
  { name: 'membership_fee', label: 'Frais d\'inscription', type: 'text', value:'90'},

  // { name: 'recurrent_debit_date', label: 'Prélevé tous les ', type: 'select',    options: [
  //   { value: '5', label: '5 du mois' },
  //   { value: '15', label: '15 du mois' },
  //   { value: '28', label: '28 du mois' },
  // ]},
  // { name: 'subscription_start_date', label: 'On commaence le', type: 'date'},

  { name: 'offer_amount', label: 'Offre', type: 'text'},
  // { name: 'offer_type', label: 'Type d\'Offre', type: 'text'},
  // { name: 'discount', label: 'Reduction', type: 'text',  },
];

export const StageFields: FormField[] = [
  { name: 'week_count', label: 'Nombre de semaines', type: 'select', required: true, options:WeeksOptions},
  { name: 'subscription_start_date', label: 'On commaence le', type: 'date'},
  // { name: 'known_weeks', label: 'semaines choisis', type: 'select', required: true, options: [
  //   { value: 'known', label: 'Je connais toutes mes semaines' },
  //   { value: 'unknown', label: 'Dates non connues pour le moment' },
  //   { value: 'partial', label: 'Une partie connue, le reste à définir plus tard' },
  // ] },
  { name: 'installement_count', label: 'Échelonnement du paiement ', type: 'select', required: true,
    options: [ 
      { value: '1', label: 'Paiement en une seule fois' }, 
      { value: '2', label: 'Paiement en 2 fois (mensuel)' }, 
      { value: '3', label: 'Paiement en 3 fois (mensuel)' }, 
    ] },
  { name: 'first_debit_date', label: 'Date du premier paiement ', type: 'date'},
  { name: 'school_subjects', label: 'Matieres', type: 'select',  multiple: true, required: true },
  { name: 'discount', label: 'Reduction', type: 'text',  },
]

// caution(oui, non), Préférences de créneaux (json)
export const PreinscriptionFields: FormField[] = [
  { name: 'session_per_week', label: 'Durée de cours par semaine :', type: 'select', required: true,
    options: [
      { value: '1', label: '1h30' },
      { value: '2', label: '3h' },
      { value: '3', label: '4h30' },
      { value: '4', label: '6h' },
    ]
  },
  { name: 'subscription_start_date', label: 'On commence le', type: 'date'},
  { name: 'school_subjects', label: 'Matieres', type: 'select',  multiple: true, required: true },
  { name: 'first_debit_date', label: 'Date de paiement', type: 'date'},
  { name: 'caution', label: 'caution', type: 'select' , 
    options: [
      { value: 'yes', label: 'Oui, déposer un chèque de caution' },
      { value: 'no', label: 'Non, pas de chèque de caution' },
    ]
  },
  { name: 'discount', label: 'Reduction', type: 'text',  },
  { name: 'favorite_slots', label: 'Préférences de créneaux', type: 'radio', required: true, 
    options: [
      { value: 'known', label: 'Je connais tous mes créneaux' },
      { value: 'unknown', label: 'Créneaux non connues pour le moment' },
      { value: 'partial', label: 'Créneaux non connues pour le moment' },
    ] 
  },

]