
  
interface SplitValues {
    mainValues: Record<string, any>;
    parentValues: Record<string, any>;
}

export function renameFields<T extends { name?: string }>(fields: T[]): T[] {
    return fields.map((field) => {
      // Si pas de name, on laisse le champ tel quel
      if (!field.name) {
        return field;
      }
      // On spread d’abord, puis on override name
      return {
        ...field,
        name: `${field.name}_parent`,
      };
    });
}


export function splitParentKeys(values: Record<string, any>, resource:any) {

  if(resource === "tutorschedule") {
    return values;
  } else {
    const mainValues: Record<string, any> = {};
    const parentValues: Record<string, any> = {};
  
    Object.entries(values).forEach(([key, val]) => {
        if (key.endsWith('_parent')) {
        // on retire le suffixe "_parent" pour la clé dans parentValues
        const baseKey = key.slice(0, -'_parent'.length);
        parentValues[baseKey] = val;
        } else {
        mainValues[key] = val;
        }
    });
  
    return { mainValues, parentValues };
  }
}

export const getDate = (value:string, showhour?:boolean) => {
  const date = new Date(value);
  if (!isNaN(date.getTime())) {
    // Format français « 13/05/2025 à 11:32 »
    const datePart = date.toLocaleDateString('fr-FR');
    const timePart = date.toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit',
    });
    return  showhour ? `${datePart} à ${timePart}`: `${datePart}`;
  }
} 

export const showDataDetails = (value:any, key: any) => {
  if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/.test(value)) {
      const date = getDate(value, true);
      return date;
  }
  // console.log( value)

  if(typeof value === 'object' && value !== null ) {
    return '';
  } 

  if(key === 'is_active') {
      return value === true ?
      (
          <span className="inline-flex items-center rounded-md bg-green-50 px-2 py-1 text-xs font-medium text-green-700 ring-1 ring-green-600/10 ring-inset">Activé</span>
      ):
      (
          <span className="inline-flex items-center rounded-md bg-red-50 px-2 py-1 text-xs font-medium text-red-700 ring-1 ring-red-600/10 ring-inset">Désactivé</span>
      )
  }

  if(key === 'center' || key === 'parents' || key === 'students' ) {
      return ''
  }
  
  // 2️⃣ Booléen
  if (typeof value === 'boolean') {
      return value ? 'Oui' : 'Non';
  }

  // 3️⃣ Null ou undefined
  if (value == null) {
      return 'N/C';
  }
  
  if(key === 'roles') {
  switch(value[0]) {
      case "ROLE_TUTOR":
          return "Tuteur"
      case "ROLE_USER":
          return "Utilisateur"
      case "ROLE_ADMIN":
          return "Admin"
  }
  }
  
  return String(value);
}

export interface PasswordValidation {
  isValid: boolean;
  errors: string[];
}

export function validatePasswords(
  password: any,
  confirm_password: any
) {
  const errors: string[] = [];

  // Longueur
  if (password.length < 8) {
    errors.push("Doit contenir au moins 8 caractères.");
  }

  // Majuscule
  if (!/[A-Z]/.test(password)) {
    errors.push("Doit contenir une majuscule.");
  }

  // Caractère spécial
  if (!/[!@#$%^&*(),.?\":{}|<>]/.test(password)) {
    errors.push("Doit contenir un caractère spécial.");
  }

  // Correspondance des deux champs
  if (password !== confirm_password) {
    errors.push("Les mots de passe ne correspondent pas.");
  }

  console.log(password, confirm_password)




  // if(password.length > 8 && /[A-Z]/.test(password) && /[!@#$%^&*(),.?\":{}|<>]/.test(password) && password == confirm_password ) {
  //   console.log('bon')
  // }

  return { isValid: errors.length === 0, errors };
}

export const TranslateHeaderNames = (value:String) => {
    switch(value) {
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
      case 'class':
        return 'Classe'
      case 'is_deleted':
        return 'Compte Supprimé'
      case 'siret':
        return 'Siret'
      case 'updated_by':
        return 'Modifié Par'
      case 'updated_at':
        return 'Modifié le'
      case 'max_session':
        return 'Nombre de Seances Max'
      case 'price_per_hour':
        return 'Prix par heure'
      case 'tutor_schedules':
        return 'Planing'
      case 'reports':
        return 'Compte Rendu'
      case 'parents':
        return 'Parents'
      case 'center':
        return 'Centre'
      case 'centers':
        return 'Centres'
      case 'sessions':
        return 'Sessions'
      case 'students':
        return 'Élèves'
      case 'google_id':
        return 'Type de Compte'
    }
}
  
export const getFrenchDayLabel = (dateInput: string | Date): string => {
  const date = new Date(dateInput);
  return date.toLocaleDateString('fr-FR', { weekday: 'long' });
};

export const formatTime = (d: Date) => {
  const h = d.getHours().toString().padStart(2, '0');
  const m = d.getMinutes().toString().padStart(2, '0');
  return `${h}:${m}`;
};
