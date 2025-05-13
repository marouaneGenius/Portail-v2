import { FormField } from "../components/FormGenerator";

  export const userFields: FormField[] = [
    { name: 'email', label: 'Adresse e‑mail', type: 'email', required: true },
    { name: 'password', label: 'Mot de passe', type: 'password', required: true },
    { name: 'firstname', label: 'Prénom', type: 'text' },
    { name: 'lastname', label: 'Nom', type: 'text' },
    { name: 'phone', label: 'Télèphone', type: 'text' },
  ];
  
  export const centerFields: FormField[] = [
    { name: 'name', label: 'Nom du centre', type: 'text', required: true },
    { name: 'address', label: 'Adresse', type: 'text', required: true },
    { name: 'city', label: 'Ville', type: 'text', required: true },
  ];
  
  export const studentFields: FormField[] = [
    { name: 'firstname', label: 'Prénom', type: 'text', required: true },
    { name: 'lastname', label: 'Nom', type: 'text', required: true },
    { name: 'gender', label: 'Genre', type: 'select', required: true,
      options: [ { value: 'male', label: 'Homme' }, { value: 'female', label: 'Femme' } ]
    },
    { name: 'class', label: 'Classe', type: 'text', required: true },
    { name: 'email', label: 'E‑mail', type: 'email', required: true },
    { name: 'id_center', label: 'Centre', type: 'select', required: true,
      options: [ 
        { value: '1', label: 'Pierre-fitte' }, 
        { value: '2', label: 'Paris' },
        { value: '3', label: 'Gonesse' },
        { value: '4', label: 'Pontoise' }, 
        { value: '5', label: 'Asniere-sur-seine' }, 
      ]
    },
  ];

  export const parentFields: FormField[] = [
    { name: 'firstname', label: 'Prénom', type: 'text', required: true },
    { name: 'lastname', label: 'Nom', type: 'text', required: true },
    { name: 'gender', label: 'Genre', type: 'select', required: true,
      options: [ { value: 'male', label: 'Homme' }, { value: 'female', label: 'Femme' } ]
    },
    { name: 'email', label: 'E‑mail', type: 'email', required: true },
    { name: 'phone', label: 'Télèphone', type: 'text', required: true },
    { name: 'address', label: 'Adresse', type: 'text', required: true},
    { name: 'zip_code', label: 'Code Postal', type: 'text', required: true},
    { name: 'city', label: 'Ville', type: 'text', required: true},
  ];

  export const TranslateHeaderNames = (name:String) => {
    switch(name) {
      case 'id':
        return 'ID'
      case 'firstname':
        return 'Prénom'
      case 'lastname':
        return 'Nom'
      case 'name':
        return 'Nom'
      case 'address':
        return 'Adresse'
      case 'zip_code':
        return 'Code Postal'
      case 'city':
        return 'Ville'
      case 'gender':
        return 'Genre'
      case 'phone':
        return 'Télèphone'
      case 'id_center':
        return 'Centre'
      case 'password':
        return 'Mot de passe'
      case 'email':
        return 'E-mail'
      case 'roles':
        return 'Role'
      case 'is_active':
        return 'Activé'
      case 'created_at':
        return 'Création'
      case 'created_by':
        return 'Crée Par'
      case 'actions':
        return 'Actions'
    }
  }

  