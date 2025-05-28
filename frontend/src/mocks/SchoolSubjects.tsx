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