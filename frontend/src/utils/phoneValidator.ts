/**
 * Utilitaire de validation et normalisation des numéros de téléphone côté frontend
 * Synchronisé avec le service PHP PhoneValidatorService
 */

export interface PhoneValidationResult {
  original: string;
  cleaned: string;
  isValid: boolean;
  formatted: string;
  type: 'landline' | 'mobile' | 'special' | 'voip' | 'invalid' | 'unknown';
  suggestions: string[];
}

export class PhoneValidator {
  
  /**
   * Normalise un numéro de téléphone français
   */
  static normalizePhone(phone: string): string {
    if (!phone) return '';
    
    const cleaned = this.cleanPhone(phone);
    return this.formatFrenchPhone(cleaned);
  }

  /**
   * Valide si un numéro de téléphone est correct
   */
  static isValidPhone(phone: string): boolean {
    if (!phone) return false;
    
    const cleaned = this.cleanPhone(phone);
    
    return this.hasValidLength(cleaned) && 
           this.hasValidFormat(cleaned) && 
           this.hasValidPrefix(cleaned);
  }

  /**
   * Nettoie un numéro de téléphone
   */
  private static cleanPhone(phone: string): string {
    // Supprimer tous les caractères non numériques sauf le +
    let cleaned = phone.replace(/[^\d+]/g, '');
    
    // Gérer les préfixes internationaux
    if (cleaned.startsWith('+33')) {
      cleaned = '0' + cleaned.substring(3);
    } else if (cleaned.startsWith('0033')) {
      cleaned = '0' + cleaned.substring(4);
    } else if (cleaned.startsWith('33') && cleaned.length === 11) {
      cleaned = '0' + cleaned.substring(2);
    }
    
    return cleaned;
  }

  /**
   * Formate un numéro au format français standard
   */
  private static formatFrenchPhone(cleaned: string): string {
    if (cleaned.length !== 10 || !cleaned.startsWith('0')) {
      return cleaned;
    }
    
    return cleaned.substring(0, 2) + ' ' + 
           cleaned.substring(2, 4) + ' ' + 
           cleaned.substring(4, 6) + ' ' + 
           cleaned.substring(6, 8) + ' ' + 
           cleaned.substring(8, 10);
  }

  /**
   * Vérifie la longueur
   */
  private static hasValidLength(cleaned: string): boolean {
    return cleaned.length === 10;
  }

  /**
   * Vérifie le format de base
   */
  private static hasValidFormat(cleaned: string): boolean {
    return /^0\d{9}$/.test(cleaned);
  }

  /**
   * Vérifie le préfixe
   */
  private static hasValidPrefix(cleaned: string): boolean {
    if (cleaned.length < 2) return false;
    
    const prefix = cleaned.substring(0, 2);
    const validPrefixes = ['01', '02', '03', '04', '05', '06', '07', '08', '09'];
    
    return validPrefixes.includes(prefix);
  }

  /**
   * Génère des suggestions
   */
  static getSuggestions(phone: string): string[] {
    const suggestions: string[] = [];
    const cleaned = this.cleanPhone(phone);
    
    if (cleaned) {
      // Suggestion avec formatage
      if (this.isValidPhone(phone)) {
        const formatted = this.normalizePhone(phone);
        if (formatted !== phone) {
          suggestions.push(formatted);
        }
      }
      
      // Suggestions courantes
      if (cleaned.length === 9 && !cleaned.startsWith('0')) {
        const withZero = this.formatFrenchPhone('0' + cleaned);
        if (this.isValidPhone('0' + cleaned)) {
          suggestions.push(withZero);
        }
      }
      
      if (cleaned.length === 11 && cleaned.startsWith('33')) {
        const frenchFormat = this.formatFrenchPhone('0' + cleaned.substring(2));
        if (this.isValidPhone('0' + cleaned.substring(2))) {
          suggestions.push(frenchFormat);
        }
      }
    }
    
    return [...new Set(suggestions)];
  }

  /**
   * Obtient le type de numéro
   */
  static getPhoneType(phone: string): PhoneValidationResult['type'] {
    const cleaned = this.cleanPhone(phone);
    
    if (!this.isValidPhone(phone)) {
      return 'invalid';
    }
    
    const prefix = cleaned.substring(0, 2);
    
    switch (prefix) {
      case '01':
      case '02':
      case '03':
      case '04':
      case '05':
        return 'landline';
      case '06':
      case '07':
        return 'mobile';
      case '08':
        return 'special';
      case '09':
        return 'voip';
      default:
        return 'unknown';
    }
  }

  /**
   * Validation complète
   */
  static validateAndFormat(phone: string): PhoneValidationResult {
    const cleaned = this.cleanPhone(phone);
    const isValid = this.isValidPhone(phone);
    
    return {
      original: phone,
      cleaned,
      isValid,
      formatted: isValid ? this.normalizePhone(phone) : '',
      type: this.getPhoneType(phone),
      suggestions: !isValid ? this.getSuggestions(phone) : []
    };
  }

  /**
   * Normalisation en temps réel pour les inputs
   */
  static normalizeOnInput(value: string): string {
    if (!value) return '';
    
    // Permettre la saisie progressive
    const cleaned = this.cleanPhone(value);
    
    // Formater seulement si on a un numéro complet
    if (cleaned.length === 10 && this.isValidPhone(value)) {
      return this.formatFrenchPhone(cleaned);
    }
    
    return value;
  }

  /**
   * Créer un handler pour les inputs React
   */
  static createInputHandler(onChange: (value: string) => void) {
    return (event: React.ChangeEvent<HTMLInputElement>) => {
      const rawValue = event.target.value;
      
      // Permettre la saisie libre mais suggérer le formatage
      onChange(rawValue);
      
      // Auto-formater après une pause
      setTimeout(() => {
        const normalized = this.normalizeOnInput(rawValue);
        if (normalized !== rawValue && this.isValidPhone(rawValue)) {
          onChange(normalized);
        }
      }, 1000);
    };
  }

  /**
   * Validation pour affichage d'erreurs
   */
  static getValidationMessage(phone: string): string | null {
    if (!phone) return 'Le numéro de téléphone est requis';
    
    const cleaned = this.cleanPhone(phone);
    
    if (cleaned.length === 0) {
      return 'Le numéro de téléphone ne peut pas être vide';
    }
    
    if (cleaned.length < 10) {
      return 'Le numéro de téléphone est trop court (10 chiffres requis)';
    }
    
    if (cleaned.length > 10) {
      return 'Le numéro de téléphone est trop long (10 chiffres maximum)';
    }
    
    if (!cleaned.startsWith('0')) {
      return 'Le numéro doit commencer par 0';
    }
    
    if (!this.hasValidPrefix(cleaned)) {
      return 'Préfixe de numéro invalide (01-09 autorisés)';
    }
    
    if (!/^\d+$/.test(cleaned)) {
      return 'Le numéro ne doit contenir que des chiffres';
    }
    
    return null; // Valide
  }
}