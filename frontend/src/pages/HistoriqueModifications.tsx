import React, { useState, useEffect, useCallback } from 'react';
import { History, AlertCircle, CheckCircle2 } from 'lucide-react';
import HistoryFilters from '../components/HistoryFilters';
import HistoryTable from '../components/HistoryTable';
import historyService, { 
  ModificationFilter, 
  ModificationItem, 
  PaginationInfo, 
  ModificationResponse 
} from '../services/historyService';

/**
 * Page principale pour consulter l'historique des modifications
 * 
 * Cette page permet de visualiser toutes les modifications apportées
 * aux entités de l'application avec des filtres avancés et la pagination.
 */
const HistoriqueModifications: React.FC = () => {
  // États principaux
  const [data, setData] = useState<ModificationItem[]>([]);
  const [pagination, setPagination] = useState<PaginationInfo>({
    current_page: 1,
    total_pages: 1,
    total_items: 0,
    per_page: 20
  });
  const [filters, setFilters] = useState<ModificationFilter>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // États pour la pagination et les paramètres
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(20);

  /**
   * Charge les données avec les filtres et la pagination actuels
   */
  const loadData = useCallback(async (
    newFilters: ModificationFilter = filters,
    page: number = currentPage,
    limit: number = itemsPerPage
  ) => {
    setLoading(true);
    setError(null);

    try {
      const response: ModificationResponse = await historyService.getModifications(
        newFilters,
        page,
        limit
      );

      setData(response.data);
      setPagination(response.pagination);
      
      // Mettre à jour l'URL sans recharger la page
      updateURL(newFilters, page);

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors du chargement des données';
      setError(errorMessage);
      console.error('Erreur lors du chargement de l\'historique:', err);
    } finally {
      setLoading(false);
    }
  }, [filters, currentPage, itemsPerPage]);

  /**
   * Met à jour l'URL avec les paramètres actuels
   */
  const updateURL = (newFilters: ModificationFilter, page: number) => {
    const params = new URLSearchParams();
    
    // Ajouter la page si différente de 1
    if (page > 1) {
      params.set('page', page.toString());
    }

    // Ajouter les filtres non vides
    Object.entries(newFilters).forEach(([key, value]) => {
      if (value !== undefined && value !== '') {
        params.set(key, value.toString());
      }
    });

    const newURL = params.toString() ? 
      `${window.location.pathname}?${params.toString()}` : 
      window.location.pathname;
    
    window.history.replaceState({}, '', newURL);
  };

  /**
   * Charge les paramètres depuis l'URL au montage
   */
  const loadFromURL = useCallback(() => {
    const urlParams = new URLSearchParams(window.location.search);
    
    const urlFilters: ModificationFilter = {};
    const page = parseInt(urlParams.get('page') || '1');

    // Extraire tous les filtres de l'URL
    ['user_id', 'entity_type', 'entity_id', 'action', 'field_name', 'date_from', 'date_to', 'search', 'student_name', 'parent_name'].forEach(key => {
      const value = urlParams.get(key);
      if (value) {
        if (key === 'user_id' || key === 'entity_id') {
          urlFilters[key as keyof ModificationFilter] = parseInt(value);
        } else {
          urlFilters[key as keyof ModificationFilter] = value;
        }
      }
    });

    setFilters(urlFilters);
    setCurrentPage(page);
    
    return { filters: urlFilters, page };
  }, []);

  // Chargement initial
  useEffect(() => {
    const { filters: urlFilters, page } = loadFromURL();
    loadData(urlFilters, page);
  }, []); // Dépendances vides pour exécuter une seule fois

  /**
   * Gère le changement de filtres
   */
  const handleFiltersChange = (newFilters: ModificationFilter) => {
    setFilters(newFilters);
    setCurrentPage(1); // Reset à la première page
    loadData(newFilters, 1);
  };

  /**
   * Gère le changement de page
   */
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    loadData(filters, page);
    
    // Scroll vers le haut de la table
    document.getElementById('history-table')?.scrollIntoView({ 
      behavior: 'smooth', 
      block: 'start' 
    });
  };

  /**
   * Gère l'export CSV
   */
  const handleExport = async () => {
    try {
      setLoading(true);
      await historyService.downloadExport(filters);
      setSuccess('Export CSV téléchargé avec succès');
      
      // Masquer le message de succès après 3 secondes
      setTimeout(() => setSuccess(null), 3000);
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de l\'export';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Gère le changement du nombre d'éléments par page
   */
  const handleItemsPerPageChange = (newLimit: number) => {
    setItemsPerPage(newLimit);
    setCurrentPage(1);
    loadData(filters, 1, newLimit);
  };

  /**
   * Actualise les données
   */
  const refreshData = () => {
    loadData();
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* En-tête de page */}
        <div className="mb-8">
          <div className="flex items-center mb-4">
            <div className="flex items-center">
              <div className="bg-[#FFB800] p-3 rounded-lg mr-4">
                <History className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  Historique des modifications
                </h1>
                <p className="text-gray-600 mt-1">
                  Consultez toutes les modifications apportées aux sessions, élèves, parents, centres et équipes
                </p>
              </div>
            </div>
          </div>

          {/* Statistiques rapides */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white p-4 rounded-lg shadow-sm border">
              <div className="flex items-center">
                <div className="bg-blue-100 p-2 rounded-lg">
                  <History className="h-5 w-5 text-blue-600" />
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-600">Total modifications</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {pagination.total_items.toLocaleString()}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white p-4 rounded-lg shadow-sm border">
              <div className="flex items-center">
                <div className="bg-green-100 p-2 rounded-lg">
                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-600">Page actuelle</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {pagination.current_page} / {pagination.total_pages}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white p-4 rounded-lg shadow-sm border">
              <div className="flex items-center">
                <div className="bg-yellow-100 p-2 rounded-lg">
                  <History className="h-5 w-5 text-yellow-600" />
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-600">Par page</p>
                  <div className="flex items-center space-x-2">
                    <select
                      value={itemsPerPage}
                      onChange={(e) => handleItemsPerPageChange(parseInt(e.target.value))}
                      className="text-lg font-bold text-gray-900 bg-transparent border-none focus:ring-0 p-0"
                    >
                      <option value={10}>10</option>
                      <option value={20}>20</option>
                      <option value={50}>50</option>
                      <option value={100}>100</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white p-4 rounded-lg shadow-sm border">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="bg-purple-100 p-2 rounded-lg">
                    <History className="h-5 w-5 text-purple-600" />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-600">Actions</p>
                    <p className="text-lg font-bold text-gray-900">Actualiser</p>
                  </div>
                </div>
                <button
                  onClick={refreshData}
                  disabled={loading}
                  className="p-2 text-gray-400 hover:text-gray-600 disabled:opacity-50"
                  title="Actualiser les données"
                >
                  <History className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Messages d'état */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center">
              <AlertCircle className="h-5 w-5 text-red-400 mr-3" />
              <div className="flex-1">
                <h3 className="text-sm font-medium text-red-800">Erreur</h3>
                <div className="mt-1 text-sm text-red-700">{error}</div>
              </div>
              <button
                onClick={() => setError(null)}
                className="text-red-400 hover:text-red-600"
              >
                <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          </div>
        )}

        {success && (
          <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center">
              <CheckCircle2 className="h-5 w-5 text-green-400 mr-3" />
              <div className="flex-1">
                <h3 className="text-sm font-medium text-green-800">Succès</h3>
                <div className="mt-1 text-sm text-green-700">{success}</div>
              </div>
              <button
                onClick={() => setSuccess(null)}
                className="text-green-400 hover:text-green-600"
              >
                <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          </div>
        )}

        {/* Filtres */}
        <div className="mb-8">
          <HistoryFilters
            filters={filters}
            onFiltersChange={handleFiltersChange}
            onExport={handleExport}
            loading={loading}
          />
        </div>

        {/* Tableau des résultats */}
        <div id="history-table">
          <HistoryTable
            data={data}
            pagination={pagination}
            loading={loading}
            onPageChange={handlePageChange}
          />
        </div>

        {/* Information complémentaire */}
        {!loading && data.length > 0 && (
          <div className="mt-6 text-center text-sm text-gray-500">
            <p>
              Les modifications sont triées par date décroissante. 
              Cliquez sur une ligne pour voir les détails complets.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default HistoriqueModifications;