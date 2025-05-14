
  
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
  