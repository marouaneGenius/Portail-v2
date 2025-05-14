
  
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


export function splitParentKeys(values: Record<string, any>): SplitValues {
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
      case 'sessions':
        return 'Sessions'
      case 'students':
        return 'Élèves'
    }
  }
  