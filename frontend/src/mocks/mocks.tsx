import { Action } from "../components/CustomAlert";

export const ClassesOptions = [
    { value: 'CP',        label: 'CP' },
    { value: 'CE1',       label: 'CE1' },
    { value: 'CE2',       label: 'CE2' },
    { value: 'CM1',       label: 'CM1' },
    { value: 'CM2',       label: 'CM2' },
    { value: '6ème',      label: '6ème' },
    { value: '5ème',      label: '5ème' },
    { value: '4ème',      label: '4ème' },
    { value: '3ème',      label: '3ème' },
    { value: '2nde',      label: '2nde' },
    { value: '1ère',      label: '1ère' },
    { value: 'Terminale', label: 'Terminale' },
  ];


   export const actions: Action[] = [
    { label: 'Ajouter un Abonnement', to: (id) => `/abonnements/${id}` },
    { label: "Créer une séance d'essai", to: (id) => `/students/${id}/trial-session` },
    { label: 'Voir plus de détails', to: (id) => `/student/${id}` },
    { label: 'Ajouter une facture', to: (id) => `/students/${id}/invoices/new` },
    { label: 'Rupture de contrat', to: (id) => `/students/${id}/terminate` },
    { label: "Modifier l'élève", to: (id) => `/student/${id}/edit` },
  ];


  export const Days = [
    { value: 'lundi', label: 'Lundi'  }, 
    { value: 'mardi', label: 'Mardi'  },
    { value: 'mercredi', label: 'Mercredi' },
    { value: 'jeudi', label: 'Jeudi'  },
    { value: 'vendredi', label: 'Vendredi' },
    { value: 'samedi', label: 'Samedi'  },
    { value: 'dimanche', label: 'Dimanche' },
  ];

  export const SchoolSubjects = [
    { value: 'physique', label: 'Physique' },
    { value: 'maths', label: 'Maths' },
    { value: 'français', label: 'Français' },
    { value: 'ses', label: 'SES' },
    { value: 'philosophie', label: 'Philosophie' },
    { value: 'anglais', label: 'Anglais' },
    { value: 'espagnole', label: 'Espagnole' },
    { value: 'svt', label: 'SVT' },
    { value: 'nsi', label: 'NSI' },
    { value: 'histoire', label: 'Histoire' },
    { value: 'si', label: 'SI' },
    { value: 'droit-et-economie', label: 'Droit et Economie' },
    { value: 'aggsp', label: 'AGGSP' },
    { value: 'amc', label: 'AMC' },
    { value: 'aide-aux-devoirs', label: 'Aide aux devoirs' },
    { value: 'hggsp', label: 'HGGSP' },
    { value: 'management', label: 'Management' },
    { value: 'mathematiques', label: 'Mathématiques' },
  ];
  

  export const tiers = [
    {
      id: "stage",
      title: "Stage d'été",
      img: "/images/stage-ete.svg",
      gradient: "from-rose-400 to-orange-400",
    },
    {
      id: "annuel",
      title: "Annuel",
      img: "/images/annuel.svg",
      gradient: "from-sky-400 to-indigo-500",
    },
    {
      id: "preinscription",
      title: "Pré‑inscription",
      img: "/images/pre-inscription.svg",
      gradient: "from-emerald-400 to-lime-400",
    },
  ] as const;


  export const SessionOptions = [
    { value: '1', label: '1h30', duration: 90 },
    { value: '2', label: '3h', duration: 180 },
    { value: '3', label: '4h30', duration: 270 },
    { value: '4', label: '6h', duration: 360 }
  ];


  export const HoursOptions = [
    { value: '9h30', label: '9h30'},
    { value: '11h00', label: '11h00'},
    { value: '12h30', label: '12h30'},
    { value: '14h00', label: '14h00'},
    { value: '15h30', label: '15h30'},
    { value: '17h00', label: '17h00'},
    { value: '18h30', label: '18h30' }
  ];


  export const WeeksOptions = [
    { value: '1', label: '1 semaine' },
    { value: '2', label: '2 semaines' },
    { value: '3', label: '3 semaines' },
    { value: '4', label: '4 semaines' },
    { value: '5', label: '5 semaines' },
    { value: '6', label: '6 semaines' },
    { value: '7', label: '7 semaines' },
    { value: '8', label: '8 semaines' }];

  export const WeeksOptionss = [
    '1 semaine' ,
    '2 semaines' ,
    '3 semaines' ,
    '4 semaines' ,
    '5 semaines' ,
    '6 semaines' ,
    '7 semaines' ,
    '8 semaines' ];


  export const nbSeancesMap = [
    '1h30/semaine',
    '3h00/semaine',
    '4h30/semaine',
    '6h00/semaine',
  ]

export const StandardDays = [5, 15, 28];
