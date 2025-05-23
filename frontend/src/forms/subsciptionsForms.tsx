import { FormField } from "../components/FormGenerator";

export const parentFields: FormField[] = [
  { name: 'week_count', label: 'Nombre de semaines', type: 'select', required: true,
    options: [ 
      { value: '1', label: 'Semaine 1' }, 
      { value: '2', label: 'Semaine 2' }, 
      { value: '3', label: 'Semaine 3' }, 
      { value: '4', label: 'Semaine 4' }, 
      { value: '5', label: 'Semaine 5' }, 
      { value: '6', label: 'Semaine 6' }, 
      { value: '7', label: 'Semaine 7' }, 
      { value: '8', label: 'Semaine 8' }, 
    ]
  },
  {
    name: 'known_weeks', label: 'Semaines connues ?', type: 'radio',  required: true,
    options: [
      { value: 'known',     label: 'Connu' },
      { value: 'unknown',   label: 'Non connu' },
      { value: 'partial',   label: 'Partiel' },
    ],
  },
  { name: 'installment_count', label: 'Échelonnement du paiement', type: 'select', required: true,
    options: [ 
      { value: '1', label: 'Paiement en une seule fois' }, 
      { value: '2', label: 'Paiement en 2 fois' }, 
      { value: '3', label: 'Paiement en 3 fois' }, 
    ]
  },

  { name: 'membership_fee', label: 'Frais d\'inscription', type: 'text', required: true ,className: 'col-span-2'},
];