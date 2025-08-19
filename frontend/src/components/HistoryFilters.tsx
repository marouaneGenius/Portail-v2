import React, { useState, useEffect } from 'react';
import { Search, X, Calendar, Filter, RotateCcw, Download } from 'lucide-react';
import historyService, { ModificationFilter, FilterOptions } from '../services/historyService';

interface HistoryFiltersProps {
  filters: ModificationFilter;
  onFiltersChange: (filters: ModificationFilter) => void;
  onExport: () => void;
  loading?: boolean;
}

/**
 * Composant de filtres avancés pour l'historique des modifications
 * 
 * Permet de filtrer les modifications par utilisateur, type d'entité,
 * dates, actions et recherche textuelle avec interface intuitive.
 */
const HistoryFilters: React.FC<HistoryFiltersProps> = ({
  filters,
  onFiltersChange,
  onExport,
  loading = false
}) => {
  const [localFilters, setLocalFilters] = useState<ModificationFilter>(filters);
  const [filterOptions, setFilterOptions] = useState<FilterOptions | null>(null);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [loadingOptions, setLoadingOptions] = useState(true);
  const [searchTerm, setSearchTerm] = useState(filters.search || '');

  // Charger les options de filtres au montage
  useEffect(() => {
    loadFilterOptions();
  }, []);

  // Synchroniser les filtres locaux avec les props
  useEffect(() => {
    setLocalFilters(filters);
    setSearchTerm(filters.search || '');
  }, [filters]);

  const loadFilterOptions = async () => {
    try {
      const options = await historyService.getFilterOptions();
      setFilterOptions(options);
    } catch (error) {
      console.error('Erreur lors du chargement des options de filtres:', error);
    } finally {
      setLoadingOptions(false);
    }
  };

  const handleFilterChange = (key: keyof ModificationFilter, value: any) => {
    const newFilters = { ...localFilters, [key]: value };
    setLocalFilters(newFilters);
  };

  const applyFilters = () => {
    // Valider les filtres
    const errors = historyService.validateFilters(localFilters);
    if (errors.length > 0) {
      alert(errors.join('\n'));
      return;
    }

    onFiltersChange(localFilters);
  };

  const resetFilters = () => {
    const emptyFilters: ModificationFilter = {};
    setLocalFilters(emptyFilters);
    setSearchTerm('');
    onFiltersChange(emptyFilters);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);
    handleFilterChange('search', value);
  };

  const hasActiveFilters = () => {
    return Object.values(localFilters).some(value => value !== undefined && value !== '');
  };

  if (loadingOptions) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#FFB800]"></div>
          <span className="ml-2 text-gray-600">Chargement des filtres...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border">
      {/* En-tête avec recherche principale */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-4 flex-1">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Rechercher dans les modifications..."
              value={searchTerm}
              onChange={handleSearchChange}
              className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FFB800] focus:border-transparent"
            />
            {searchTerm && (
              <button
                onClick={() => {
                  setSearchTerm('');
                  handleFilterChange('search', '');
                }}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X size={16} />
              </button>
            )}
          </div>

          <button
            onClick={() => setShowAdvanced(!showAdvanced)}
            className={`flex items-center space-x-2 px-4 py-2 border rounded-lg transition-colors ${
              showAdvanced 
                ? 'bg-[#FFB800] text-white border-[#FFB800]' 
                : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
            }`}
          >
            <Filter size={16} />
            <span>Filtres avancés</span>
            {hasActiveFilters() && (
              <span className="ml-1 bg-red-500 text-white rounded-full px-2 py-0.5 text-xs">
                {Object.values(localFilters).filter(v => v !== undefined && v !== '').length}
              </span>
            )}
          </button>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={applyFilters}
            disabled={loading}
            className="flex items-center space-x-2 px-4 py-2 bg-[#FFB800] text-white rounded-lg hover:bg-[#FFA800] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <span>Rechercher</span>
          </button>

          <button
            onClick={onExport}
            disabled={loading}
            className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Download size={16} />
            <span>Export CSV</span>
          </button>

          {hasActiveFilters() && (
            <button
              onClick={resetFilters}
              className="flex items-center space-x-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              <RotateCcw size={16} />
              <span>Réinitialiser</span>
            </button>
          )}
        </div>
      </div>

      {/* Filtres avancés */}
      {showAdvanced && filterOptions && (
        <div className="border-t pt-4 space-y-4">
          {/* Première ligne : Type d'entité et Action */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Type d'entité
              </label>
              <select
                value={localFilters.entity_type || ''}
                onChange={(e) => handleFilterChange('entity_type', e.target.value || undefined)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#FFB800] focus:border-transparent"
              >
                <option value="">Tous les types</option>
                <option value="student">Élèves</option>
                <option value="parent">Parents</option>
                <option value="center">Centres</option>
                <option value="user">Utilisateurs</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Action
              </label>
              <select
                value={localFilters.action || ''}
                onChange={(e) => handleFilterChange('action', e.target.value || undefined)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#FFB800] focus:border-transparent"
              >
                <option value="">Toutes les actions</option>
                <option value="create">Création</option>
                <option value="update">Modification</option>
                <option value="delete">Suppression</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Date de début
              </label>
              <input
                type="date"
                value={localFilters.date_from || ''}
                onChange={(e) => handleFilterChange('date_from', e.target.value || undefined)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#FFB800] focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Date de fin
              </label>
              <input
                type="date"
                value={localFilters.date_to || ''}
                onChange={(e) => handleFilterChange('date_to', e.target.value || undefined)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#FFB800] focus:border-transparent"
              />
            </div>
          </div>

          {/* Deuxième ligne : Sélecteurs spécifiques */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Utilisateur
              </label>
              <select
                value={localFilters.user_id || ''}
                onChange={(e) => handleFilterChange('user_id', e.target.value ? parseInt(e.target.value) : undefined)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#FFB800] focus:border-transparent"
              >
                <option value="">Tous les utilisateurs</option>
                {filterOptions.users.map(user => (
                  <option key={user.id} value={user.id}>
                    {user.name} ({user.email})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Élève spécifique
              </label>
              <select
                value={localFilters.entity_type === 'student' ? localFilters.entity_id || '' : ''}
                onChange={(e) => {
                  const studentId = e.target.value ? parseInt(e.target.value) : undefined;
                  if (studentId) {
                    handleFilterChange('entity_type', 'student');
                    handleFilterChange('entity_id', studentId);
                  } else {
                    handleFilterChange('entity_id', undefined);
                  }
                }}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#FFB800] focus:border-transparent"
              >
                <option value="">Tous les élèves</option>
                {filterOptions.students.map(student => (
                  <option key={student.id} value={student.id}>
                    {student.name} ({student.class})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Parent spécifique
              </label>
              <select
                value={localFilters.entity_type === 'parent' ? localFilters.entity_id || '' : ''}
                onChange={(e) => {
                  const parentId = e.target.value ? parseInt(e.target.value) : undefined;
                  if (parentId) {
                    handleFilterChange('entity_type', 'parent');
                    handleFilterChange('entity_id', parentId);
                  } else {
                    handleFilterChange('entity_id', undefined);
                  }
                }}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#FFB800] focus:border-transparent"
              >
                <option value="">Tous les parents</option>
                {filterOptions.parents.map(parent => (
                  <option key={parent.id} value={parent.id}>
                    {parent.name} ({parent.email})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Troisième ligne : Centre et champ spécifique */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Centre
              </label>
              <select
                value={localFilters.entity_type === 'center' ? localFilters.entity_id || '' : ''}
                onChange={(e) => {
                  const centerId = e.target.value ? parseInt(e.target.value) : undefined;
                  if (centerId) {
                    handleFilterChange('entity_type', 'center');
                    handleFilterChange('entity_id', centerId);
                  } else {
                    handleFilterChange('entity_id', undefined);
                  }
                }}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#FFB800] focus:border-transparent"
              >
                <option value="">Tous les centres</option>
                {filterOptions.centers.map(center => (
                  <option key={center.id} value={center.id}>
                    {center.name} ({center.city})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Champ modifié
              </label>
              <select
                value={localFilters.field_name || ''}
                onChange={(e) => handleFilterChange('field_name', e.target.value || undefined)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#FFB800] focus:border-transparent"
              >
                <option value="">Tous les champs</option>
                {filterOptions.fields.slice(0, 20).map(field => (
                  <option key={field} value={field}>
                    {field}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Filtres rapides par période */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Filtres rapides
            </label>
            <div className="flex flex-wrap gap-2">
              {[
                { label: 'Aujourd\'hui', days: 0 },
                { label: 'Cette semaine', days: 7 },
                { label: 'Ce mois', days: 30 },
                { label: 'Ce trimestre', days: 90 }
              ].map(({ label, days }) => (
                <button
                  key={label}
                  onClick={() => {
                    const date = new Date();
                    date.setDate(date.getDate() - days);
                    handleFilterChange('date_from', date.toISOString().split('T')[0]);
                    handleFilterChange('date_to', new Date().toISOString().split('T')[0]);
                  }}
                  className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Récapitulatif des filtres actifs */}
      {hasActiveFilters() && (
        <div className="mt-4 p-3 bg-blue-50 rounded-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="text-sm font-medium text-blue-800">Filtres actifs :</span>
              <div className="flex flex-wrap gap-2">
                {Object.entries(localFilters).map(([key, value]) => {
                  if (!value) return null;
                  return (
                    <span
                      key={key}
                      className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800"
                    >
                      {key}: {typeof value === 'string' ? value : value.toString()}
                    </span>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HistoryFilters;