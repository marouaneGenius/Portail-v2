export class AddressValidator {
  static isValidAddress(address: string): boolean {
    if (!address || address.trim().length < 5) {
      return false;
    }
    
    // Vérifie qu'il y a au moins un chiffre (numéro de rue)
    const hasNumber = /\d/.test(address);
    
    // Vérifie qu'il y a au moins des lettres (nom de rue)
    const hasLetters = /[a-zA-ZÀ-ÿ]/.test(address);
    
    return hasNumber && hasLetters;
  }

  static isValidZipCode(zipCode: string): boolean {
    if (!zipCode) return false;
    
    // Code postal français : 5 chiffres
    const frenchZipPattern = /^[0-9]{5}$/;
    return frenchZipPattern.test(zipCode.replace(/\s/g, ''));
  }

  static isValidCity(city: string): boolean {
    if (!city || city.trim().length < 2) {
      return false;
    }
    
    // Vérifie que la ville contient seulement des lettres, espaces, traits d'union et apostrophes
    const cityPattern = /^[a-zA-ZÀ-ÿ\s'\-]+$/;
    return cityPattern.test(city.trim());
  }

  static normalizeAddress(address: string): string {
    if (!address) return '';
    
    // Nettoyer les espaces multiples
    let normalized = address.trim().replace(/\s+/g, ' ');
    
    // Capitaliser les mots principaux
    normalized = normalized.replace(/\b\w+/g, (word) => {
      // Mots à ne pas capitaliser (articles, prépositions)
      const lowercaseWords = ['de', 'du', 'des', 'le', 'la', 'les', 'à', 'au', 'aux', 'en', 'sur', 'sous'];
      
      if (lowercaseWords.includes(word.toLowerCase())) {
        return word.toLowerCase();
      }
      
      return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
    });
    
    // Capitaliser le premier mot
    normalized = normalized.charAt(0).toUpperCase() + normalized.slice(1);
    
    return normalized;
  }

  static normalizeCity(city: string): string {
    if (!city) return '';
    
    // Nettoyer et capitaliser
    let normalized = city.trim().replace(/\s+/g, ' ');
    normalized = normalized.replace(/\b\w+/g, (word) => {
      return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
    });
    
    return normalized;
  }

  static formatZipCode(zipCode: string): string {
    if (!zipCode) return '';
    
    // Supprimer tous les espaces et caractères non numériques
    const cleaned = zipCode.replace(/[^\d]/g, '');
    
    // Formater en XXXXX
    if (cleaned.length === 5) {
      return cleaned;
    }
    
    return zipCode; // Retourner tel quel si format invalide
  }

  static getValidationMessage(field: 'address' | 'city' | 'zip_code', value: string): string {
    switch (field) {
      case 'address':
        if (!value || value.trim().length < 5) {
          return 'L\'adresse doit contenir au moins 5 caractères';
        }
        if (!/\d/.test(value)) {
          return 'L\'adresse doit contenir un numéro';
        }
        if (!/[a-zA-ZÀ-ÿ]/.test(value)) {
          return 'L\'adresse doit contenir le nom de la rue';
        }
        break;
        
      case 'city':
        if (!value || value.trim().length < 2) {
          return 'Le nom de ville doit contenir au moins 2 caractères';
        }
        if (!/^[a-zA-ZÀ-ÿ\s'\-]+$/.test(value.trim())) {
          return 'Le nom de ville contient des caractères invalides';
        }
        break;
        
      case 'zip_code':
        if (!value) {
          return 'Le code postal est requis';
        }
        if (!/^[0-9]{5}$/.test(value.replace(/\s/g, ''))) {
          return 'Le code postal doit contenir 5 chiffres';
        }
        break;
    }
    
    return '';
  }

  static validateAddressData(data: {
    address?: string;
    city?: string;
    zip_code?: string;
  }): { isValid: boolean; errors: Record<string, string> } {
    const errors: Record<string, string> = {};

    if (data.address && !this.isValidAddress(data.address)) {
      errors.address = this.getValidationMessage('address', data.address);
    }

    if (data.city && !this.isValidCity(data.city)) {
      errors.city = this.getValidationMessage('city', data.city);
    }

    if (data.zip_code && !this.isValidZipCode(data.zip_code)) {
      errors.zip_code = this.getValidationMessage('zip_code', data.zip_code);
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors
    };
  }
}