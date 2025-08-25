import api from '../api/aixos';

/**
 * Service pour gérer les appels API liés à l'historique des modifications
 * 
 * Ce service centralise toutes les interactions avec l'API backend
 * pour consulter, filtrer et exporter l'historique des modifications.
 */

export interface ModificationFilter {
  user_id?: number;
  entity_type?: string;
  entity_id?: number;
  action?: string;
  field_name?: string;
  date_from?: string;
  date_to?: string;
  search?: string;
  student_name?: string;
  parent_name?: string;
}

export interface ModificationItem {
  id: number;
  created_at: string;
  created_at_human: string;
  user: {
    id?: number;
    name: string;
    email?: string;
  };
  entity_type: string;
  entity_type_label: string;
  entity_id: number;
  entity_name: string;
  field_name: string;
  field_label: string;
  action: string;
  action_label: string;
  old_value_display: string;
  new_value_display: string;
}

export interface ModificationDetail extends ModificationItem {
  old_value_raw: any;
  new_value_raw: any;
  ip_address?: string;
  user_agent?: string;
  metadata?: any;
}

export interface PaginationInfo {
  current_page: number;
  total_pages: number;
  total_items: number;
  per_page: number;
}

export interface ModificationResponse {
  success: boolean;
  data: ModificationItem[];
  pagination: PaginationInfo;
  filters_applied: ModificationFilter;
}

export interface FilterOptions {
  entity_types: string[];
  actions: string[];
  fields: string[];
  users: Array<{
    id: number;
    name: string;
    email: string;
  }>;
  students: Array<{
    id: number;
    name: string;
    class: string;
  }>;
  parents: Array<{
    id: number;
    name: string;
    email: string;
  }>;
  centers: Array<{
    id: number;
    name: string;
    city: string;
  }>;
}

export interface ModificationStats {
  modification_stats: Array<{
    entityType: string;
    action: string;
    count: number;
  }>;
  most_active_users: Array<{
    firstname: string;
    lastname: string;
    email: string;
    modifications_count: number;
  }>;
  period: {
    since: string;
    until: string;
  };
}

class HistoryService {
  private readonly baseUrl = '/api/historique';

  /**
   * Récupère la liste des modifications avec filtres et pagination
   */
  async getModifications(
    filters: ModificationFilter = {},
    page: number = 1,
    limit: number = 20
  ): Promise<ModificationResponse> {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      ...Object.fromEntries(
        Object.entries(filters).map(([key, value]) => [key, value?.toString() || ''])
      )
    });

    const response = await api.get(`${this.baseUrl}/modifications?${params}`);
    
    if (!response.data.success) {
      throw new Error(response.data.error || 'Erreur lors de la récupération des modifications');
    }

    return response.data;
  }

  /**
   * Récupère les options pour les filtres (dropdowns)
   */
  async getFilterOptions(): Promise<FilterOptions> {
    const response = await api.get(`${this.baseUrl}/filter-options`);
    
    if (!response.data.success) {
      throw new Error(response.data.error || 'Erreur lors de la récupération des options de filtre');
    }

    return response.data.options;
  }

  /**
   * Récupère les détails d'une modification spécifique
   */
  async getModificationDetail(id: number): Promise<ModificationDetail> {
    const response = await api.get(`${this.baseUrl}/modification/${id}`);
    
    if (!response.data.success) {
      throw new Error(response.data.error || 'Modification non trouvée');
    }

    return response.data.data;
  }

  /**
   * Récupère l'historique pour une entité spécifique
   */
  async getEntityHistory(entityType: string, entityId: number): Promise<ModificationItem[]> {
    const response = await api.get(`${this.baseUrl}/entity/${entityType}/${entityId}`);
    
    if (!response.data.success) {
      throw new Error(response.data.error || 'Erreur lors de la récupération de l\'historique');
    }

    return response.data.data;
  }

  /**
   * Exporte les modifications en CSV
   */
  async exportModifications(filters: ModificationFilter = {}): Promise<Blob> {
    const params = new URLSearchParams(
      Object.fromEntries(
        Object.entries(filters).map(([key, value]) => [key, value?.toString() || ''])
      )
    );

    const response = await api.get(`${this.baseUrl}/export?${params}`, {
      responseType: 'blob'
    });

    return response.data;
  }

  /**
   * Télécharge le fichier CSV d'export
   */
  async downloadExport(filters: ModificationFilter = {}, filename?: string): Promise<void> {
    try {
      const blob = await this.exportModifications(filters);
      
      // Créer un URL temporaire pour le blob
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename || `historique_modifications_${new Date().toISOString().slice(0, 10)}.csv`;
      
      // Déclencher le téléchargement
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Nettoyer l'URL temporaire
      window.URL.revokeObjectURL(url);
      
    } catch (error) {
      console.error('Erreur lors du téléchargement:', error);
      throw new Error('Impossible de télécharger le fichier d\'export');
    }
  }

  /**
   * Récupère les statistiques des modifications
   */
  async getStats(since?: string): Promise<ModificationStats> {
    const params = since ? new URLSearchParams({ since }) : '';
    const response = await api.get(`${this.baseUrl}/stats${params ? '?' + params : ''}`);
    
    if (!response.data.success) {
      throw new Error(response.data.error || 'Erreur lors de la récupération des statistiques');
    }

    return response.data.data;
  }

  /**
   * Formate une date pour l'affichage
   */
  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  /**
   * Formate une date relative (il y a X temps)
   */
  formatRelativeDate(dateString: string): string {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) {
      return 'Il y a quelques instants';
    }

    const diffInMinutes = Math.floor(diffInSeconds / 60);
    if (diffInMinutes < 60) {
      return `Il y a ${diffInMinutes} minute${diffInMinutes > 1 ? 's' : ''}`;
    }

    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) {
      return `Il y a ${diffInHours} heure${diffInHours > 1 ? 's' : ''}`;
    }

    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) {
      return `Il y a ${diffInDays} jour${diffInDays > 1 ? 's' : ''}`;
    }

    return this.formatDate(dateString);
  }

  /**
   * Obtient la couleur du badge selon le type d'entité
   */
  getEntityTypeBadgeColor(entityType: string): string {
    const colors: Record<string, string> = {
      'session': 'bg-indigo-100 text-indigo-800',
      'student': 'bg-blue-100 text-blue-800',
      'parent': 'bg-green-100 text-green-800',
      'center': 'bg-purple-100 text-purple-800',
      'user': 'bg-orange-100 text-orange-800',
      'team': 'bg-red-100 text-red-800'
    };

    return colors[entityType] || 'bg-gray-100 text-gray-800';
  }

  /**
   * Obtient la couleur du badge selon l'action
   */
  getActionBadgeColor(action: string): string {
    const colors: Record<string, string> = {
      'create': 'bg-green-100 text-green-800',
      'update': 'bg-yellow-100 text-yellow-800',
      'delete': 'bg-red-100 text-red-800'
    };

    return colors[action] || 'bg-gray-100 text-gray-800';
  }

  /**
   * Valide les filtres avant envoi
   */
  validateFilters(filters: ModificationFilter): string[] {
    const errors: string[] = [];

    if (filters.date_from && filters.date_to) {
      const dateFrom = new Date(filters.date_from);
      const dateTo = new Date(filters.date_to);
      
      if (dateFrom > dateTo) {
        errors.push('La date de début doit être antérieure à la date de fin');
      }
    }

    if (filters.user_id && filters.user_id < 1) {
      errors.push('ID utilisateur invalide');
    }

    if (filters.entity_id && filters.entity_id < 1) {
      errors.push('ID entité invalide');
    }

    return errors;
  }

  /**
   * Crée une URL de recherche avec les filtres actuels
   */
  buildSearchUrl(filters: ModificationFilter, page: number = 1): string {
    const params = new URLSearchParams({
      page: page.toString(),
      ...Object.fromEntries(
        Object.entries(filters).map(([key, value]) => [key, value?.toString() || ''])
      )
    });

    return `/historique?${params}`;
  }
}

// Instance singleton
const historyService = new HistoryService();

export default historyService;