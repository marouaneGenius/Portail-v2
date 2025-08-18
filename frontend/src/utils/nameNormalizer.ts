/**
 * Utilitaire de normalisation des noms côté frontend
 * Synchronisé avec le service PHP NameNormalizerService
 */

export class NameNormalizer {
  
  /**
   * Normalise un nom de famille
   */
  static normalizeName(name: string): string {
    if (!name) return '';
    
    return this.cleanAndFormat(name, false);
  }

  /**
   * Normalise un prénom (avec support des prénoms composés)
   */
  static normalizeFirstname(firstname: string): string {
    if (!firstname) return '';
    
    return this.cleanAndFormat(firstname, true);
  }

  /**
   * Nettoie et formate le texte
   */
  private static cleanAndFormat(input: string, isFirstname = false): string {
    // Supprimer les espaces en début/fin et multiples espaces
    let cleaned = input.trim().replace(/\s+/g, ' ');
    
    // Convertir en minuscules
    cleaned = cleaned.toLowerCase();
    
    if (isFirstname) {
      // Pour les prénoms composés avec trait d'union ou espace
      cleaned = cleaned.replace(/\b\w+/g, (word) => 
        word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
      );
    } else {
      // Pour les noms de famille - capitalisation simple
      cleaned = cleaned.charAt(0).toUpperCase() + cleaned.slice(1).toLowerCase();
    }

    return cleaned;
  }

  /**
   * Valide les caractères d'un nom
   */
  static validateCharacters(input: string, allowHyphen = false): string {
    // Caractères autorisés : lettres, espaces, apostrophes
    let allowedPattern = /[^a-zA-ZÀ-ÿ\s']/g;
    
    if (allowHyphen) {
      // Pour les prénoms, autoriser aussi les traits d'union
      allowedPattern = /[^a-zA-ZÀ-ÿ\s'\-]/g;
    }
    
    // Supprimer les caractères non autorisés
    let cleaned = input.replace(allowedPattern, '');
    
    // Nettoyer les caractères spéciaux en double
    cleaned = cleaned.replace(/['\-]{2,}/g, '');
    cleaned = cleaned.replace(/\s+/g, ' ');
    
    return cleaned.trim();
  }

  /**
   * Valide si un nom/prénom est acceptable
   */
  static isValidName(name: string, minLength = 2, maxLength = 50): boolean {
    const normalized = name.trim();
    
    if (normalized.length < minLength || normalized.length > maxLength) {
      return false;
    }
    
    // Vérifier qu'il contient au moins une lettre
    if (!/[a-zA-ZÀ-ÿ]/.test(normalized)) {
      return false;
    }
    
    return true;
  }

  /**
   * Normalise automatiquement pendant la saisie
   */
  static normalizeOnInput(value: string, isFirstname = false): string {
    // Validation des caractères d'abord
    const validated = this.validateCharacters(value, isFirstname);
    
    // Puis normalisation si c'est un nom complet
    if (validated.length > 1 && validated.endsWith(' ')) {
      return isFirstname ? this.normalizeFirstname(validated) : this.normalizeName(validated);
    }
    
    return validated;
  }

  /**
   * Génère des suggestions en cas d'erreur
   */
  static getSuggestions(input: string): string[] {
    const suggestions: string[] = [];
    
    if (input) {
      // Suggestion de capitalisation
      const capitalized = this.normalizeName(input);
      if (capitalized !== input) {
        suggestions.push(capitalized);
      }
      
      // Suggestion sans caractères spéciaux
      const cleaned = input.replace(/[^a-zA-ZÀ-ÿ\s]/g, '');
      if (cleaned !== input && cleaned) {
        const normalizedCleaned = this.normalizeName(cleaned);
        if (!suggestions.includes(normalizedCleaned)) {
          suggestions.push(normalizedCleaned);
        }
      }
    }
    
    return suggestions;
  }

  /**
   * Hook pour les inputs React - normalise en temps réel
   */
  static createInputHandler(
    isFirstname = false, 
    onChange: (value: string) => void
  ) {
    return (event: React.ChangeEvent<HTMLInputElement>) => {
      const rawValue = event.target.value;
      const normalizedValue = this.normalizeOnInput(rawValue, isFirstname);
      
      // Ne pas interférer avec la saisie en cours
      if (normalizedValue !== rawValue) {
        // Seulement si l'utilisateur a fini de taper (timeout)
        setTimeout(() => {
          onChange(normalizedValue);
        }, 500);
      } else {
        onChange(normalizedValue);
      }
    };
  }
}