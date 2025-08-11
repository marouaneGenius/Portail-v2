
  
interface SplitValues {
    mainValues: Record<string, any>;
    parentValues: Record<string, any>;
}
type DoctrineDate = { date: string; timezone_type: number; timezone: string };


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

  if(Array.isArray(value) && value.length !== 0 && key === 'school_subjects') {
    if(value[0] && typeof value[0] === 'object' && value[0].id) {
      return value.map((v:any) => v.id).join(', ');
    } else {
      return value.join(', ');
    }
  }

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
      return 'Non défini';
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
      case 'school_subjects':
        return 'Matières Scolaires'
      case 'email':
        return 'E-mail'
      case 'roles':
        return 'Rôle'
      case 'is_active':
        return 'Activé'
      case 'created_at':
        return 'Date de création'
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
      case 'payment_mode':
        return 'Type de Paiement'
      case 'recurrent_debit_date':
        return 'Prelever tous les'
      case 'favorite_slots':
        return 'Créneaux choisis'
      case 'subscription_start_date':
        return 'Date du debut d\'abonnement'
      case 'offer_amount':
        return 'L\'offre'
      case 'discount':
        return 'Remise'
      case 'offer_type':
        return 'Type d\'offre'
      case  'first_debit_date':
        return 'Date du premier prélèvement'
      case  'week_count':
        return 'Nombre de semaines'
      case 'known_weeks':
        return 'Nombre de semaines'
      case 'installment_count':
        return 'Nombre de versements'
      case 'selected_weeks':
        return 'Semaines sélectionnées'
      case 'session_per_week':
        return 'Séances par semaine'
      case 'caution':
        return 'Caution'
      case 'favorite_slots_mode':
        return 'Creneaux choisis'

    }
}
  
export const getFrenchDayLabel = (dateInput: string | Date): string => {
  const date = new Date(dateInput);
  return date.toLocaleDateString('fr-FR', { weekday: 'long' });
};
export const formatTime = (timeString: string) => {
  const isoMatch = timeString.match(/T(\d{2}:\d{2})/);
  if (isoMatch) return isoMatch[1];
  const simpleMatch = timeString.match(/^(\d{2}:\d{2})/);
  if (simpleMatch) return simpleMatch[1];

  return '';
};
export const normalizeHour = (str: string) => {
  const match = str.match(/^(\d{1,2})h(\d{0,2})$/);
  if (!match) return str; // déjà au bon format
  const h = match[1].padStart(2, '0');
  const m = match[2] || '00';
  return `${h}:${m}`;
};

export function formatDateToYYYYMMDD(dateString:any) {
  const date = new Date(dateString);
  return [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, '0'),
    String(date.getDate()).padStart(2, '0')
  ].join('-');
}

export function uuid () {
  // n’importe quel générateur unique : crypto, nanoid, Date.now()+Math…
  return (crypto.randomUUID?.() ?? Math.random().toString(36).slice(2) + Date.now());
}

// export const extractExactHour = (isoString: string | null | undefined): string => {
//   if (!isoString) return ""; // sécurité
//   const date = new Date(isoString);
//   if (isNaN(date.getTime())) return ""; // sécurité Invalid Date

//   // Affiche dans la timezone du navigateur
//   const hours = date.getHours();
//   const minutes = date.getMinutes().toString().padStart(2, "0");
//   return `${hours}h${minutes}`;
// };

export const extractExactHour = (dateInput: Date | string | null | undefined): string => {
  if (!dateInput) return "";
  
  const date = dateInput instanceof Date ? dateInput : new Date(dateInput);
  if (isNaN(date.getTime())) return "";

  const hours = date.getHours();
  const minutes = date.getMinutes().toString().padStart(2, "0");
  return `${hours}h${minutes}`;
};

export function formatScheduledAt(isoDateTime: string, slot: string): string {
  // Extraire la partie date seule (avant 'T' ou avant l'espace)
  const datePart = isoDateTime.includes('T')
    ? isoDateTime.split('T')[0]
    : isoDateTime.split(' ')[0];

  // Récupérer heures et minutes depuis "13h30"
  const [h, m = '0'] = slot.split('h').map(Number);

  // Formatter les composants
  const HH = String(h).padStart(2, '0');
  const MM = String(m).padStart(2, '0');

  return `${datePart} ${HH}:${MM}:00`;
}


export function buildSessions(
  startDate: string,
  endDate: string,
  slots: Array<{
    day: string;
    hour: string;
    matieres: string[];
    tutorId: number;
  }>,
  perWeek: number
) {
  const daysMap: Record<string, number> = {
    dimanche: 0,
    lundi: 1,
    mardi: 2,
    mercredi: 3,
    jeudi: 4,
    vendredi: 5,
    samedi: 6
  };

  const start = new Date(startDate);
  const finish = new Date(endDate);
  const sessions:any = [];

  slots.forEach(slot => {
    const targetWeekday = daysMap[slot.day.toLowerCase()];
    if (targetWeekday === undefined) {
      throw new Error(`Jour inconnu: ${slot.day}`);
    }

    const firstDate = new Date(start); // Nouvelle copie pour chaque slot
    const diff = (targetWeekday + 7 - firstDate.getDay()) % 7;
    firstDate.setDate(firstDate.getDate() + diff);

    while (firstDate <= finish) {
      const [h, m = '0']:any = slot.hour.split('h').map(Number);
      const scheduled = new Date(firstDate);
      scheduled.setHours(h, m, 0, 0);

      const y = scheduled.getFullYear();
      const mon = String(scheduled.getMonth()+1).padStart(2,'0');
      const d = String(scheduled.getDate()).padStart(2,'0');
      const hh = String(scheduled.getHours()).padStart(2,'0');
      const mm = String(scheduled.getMinutes()).padStart(2,'0');
      const scheduled_at = `${y}-${mon}-${d}T${hh}:${mm}:00`;

      sessions.push({
        scheduled_at,
        tutor_id: slot.tutorId,
        school_subjects: slot.matieres
      });

      firstDate.setDate(firstDate.getDate() + 7);
    }
  });

  return sessions;
}


export function pad(n: number): string {
  return String(n).padStart(2, '0');
}

export const  toLocalDateString = (date:any) => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}


export function formatDate(dateStr:any) {
  const d = new Date(dateStr);
  const yyyy = d.getFullYear();
  const mm   = String(d.getMonth() + 1).padStart(2, '0');
  const dd   = String(d.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

export const timeToMinutes = (time: string | DoctrineDate): number => {
  // Si c'est un objet Doctrine, prends la propriété "date"
  if (typeof time === 'object' && time !== null && 'date' in time) {
    time = time.date;
  }

  if (typeof time === 'string' && /^\d{2}:\d{2}$/.test(time)) {
    const [hour, minute] = time.split(':');
    return Number(hour) * 60 + Number(minute);
  }
  

  if (typeof time === 'string' && time.includes('T')) {
    const date = new Date(time);
    return date.getUTCHours() * 60 + date.getUTCMinutes();
  }

  if (typeof time === 'string' && time.match(/^\d{4}-\d{2}-\d{2} /)) {
    const [, hour, minute] = time.match(/(\d{2}):(\d{2})/) || [];
    return (Number(hour) || 0) * 60 + (Number(minute) || 0);
  }

  if (typeof time === 'string' && time.includes('h')) {
    const [hours, minutes] = time.replace('h', ':').split(':').map(Number);
    return hours * 60 + (minutes || 0);
  }

  return 0;
};



export const formatDateTime = (date: Date | null): string | null => {
  if (!date) return null;
  
  const pad = (num: number) => num.toString().padStart(2, '0');
  
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ` +
         `${pad(date.getHours())}:${pad(date.getMinutes())}:00`;
};