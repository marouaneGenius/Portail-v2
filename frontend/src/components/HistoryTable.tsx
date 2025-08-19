import React, { useState } from 'react';
import { 
  ChevronLeft, 
  ChevronRight, 
  ChevronsLeft, 
  ChevronsRight,
  Eye,
  Calendar,
  User,
  FileText,
  Activity
} from 'lucide-react';
import historyService, { ModificationItem, PaginationInfo, ModificationDetail } from '../services/historyService';

interface HistoryTableProps {
  data: ModificationItem[];
  pagination: PaginationInfo;
  loading: boolean;
  onPageChange: (page: number) => void;
  onRowClick?: (modification: ModificationItem) => void;
}

interface ModificationDetailModalProps {
  modification: ModificationDetail;
  onClose: () => void;
}

/**
 * Modal pour afficher les détails d'une modification
 */
const ModificationDetailModal: React.FC<ModificationDetailModalProps> = ({ 
  modification, 
  onClose 
}) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* En-tête */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">
              Détails de la modification #{modification.id}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Informations principales */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Date et heure</label>
                <div className="mt-1 flex items-center text-sm text-gray-900">
                  <Calendar className="w-4 h-4 mr-2 text-gray-400" />
                  {modification.created_at_human}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Utilisateur</label>
                <div className="mt-1 flex items-center text-sm text-gray-900">
                  <User className="w-4 h-4 mr-2 text-gray-400" />
                  {modification.user.name}
                  {modification.user.email && (
                    <span className="ml-2 text-gray-500">({modification.user.email})</span>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Action</label>
                <div className="mt-1">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    historyService.getActionBadgeColor(modification.action)
                  }`}>
                    <Activity className="w-3 h-3 mr-1" />
                    {modification.action_label}
                  </span>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Entité</label>
                <div className="mt-1">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    historyService.getEntityTypeBadgeColor(modification.entity_type)
                  }`}>
                    <FileText className="w-3 h-3 mr-1" />
                    {modification.entity_type_label}
                  </span>
                  <div className="text-sm text-gray-900 mt-1">
                    {modification.entity_name || `ID: ${modification.entity_id}`}
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Champ modifié</label>
                <div className="mt-1 text-sm text-gray-900">
                  {modification.field_label}
                </div>
              </div>

              {modification.ip_address && (
                <div>
                  <label className="block text-sm font-medium text-gray-700">Adresse IP</label>
                  <div className="mt-1 text-sm text-gray-900 font-mono">
                    {modification.ip_address}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Changements */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-3">Changements</label>
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-2">Ancienne valeur</label>
                  <div className="bg-red-50 border border-red-200 rounded p-3 text-sm">
                    {modification.old_value_display || <span className="text-gray-400 italic">Aucune</span>}
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-2">Nouvelle valeur</label>
                  <div className="bg-green-50 border border-green-200 rounded p-3 text-sm">
                    {modification.new_value_display || <span className="text-gray-400 italic">Aucune</span>}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Données techniques */}
          {(modification.user_agent || modification.metadata) && (
            <div className="border-t pt-6">
              <label className="block text-sm font-medium text-gray-700 mb-3">Informations techniques</label>
              
              {modification.user_agent && (
                <div className="mb-4">
                  <label className="block text-xs font-medium text-gray-600 mb-1">User Agent</label>
                  <div className="bg-gray-50 rounded p-2 text-xs text-gray-700 font-mono break-all">
                    {modification.user_agent}
                  </div>
                </div>
              )}

              {modification.metadata && Object.keys(modification.metadata).length > 0 && (
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Métadonnées</label>
                  <div className="bg-gray-50 rounded p-2 text-xs text-gray-700 font-mono">
                    <pre className="whitespace-pre-wrap">
                      {JSON.stringify(modification.metadata, null, 2)}
                    </pre>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

/**
 * Composant tableau principal pour afficher l'historique des modifications
 */
const HistoryTable: React.FC<HistoryTableProps> = ({
  data,
  pagination,
  loading,
  onPageChange,
  onRowClick
}) => {
  const [selectedModification, setSelectedModification] = useState<ModificationDetail | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);

  const handleRowClick = async (modification: ModificationItem) => {
    if (onRowClick) {
      onRowClick(modification);
      return;
    }

    // Charger les détails de la modification
    setLoadingDetail(true);
    try {
      const detail = await historyService.getModificationDetail(modification.id);
      setSelectedModification(detail);
    } catch (error) {
      console.error('Erreur lors du chargement des détails:', error);
      alert('Impossible de charger les détails de cette modification');
    } finally {
      setLoadingDetail(false);
    }
  };

  const renderPagination = () => {
    const { current_page, total_pages, total_items, per_page } = pagination;
    
    if (total_pages <= 1) return null;

    const startItem = (current_page - 1) * per_page + 1;
    const endItem = Math.min(current_page * per_page, total_items);

    return (
      <div className="flex items-center justify-between px-6 py-4 bg-gray-50 border-t">
        <div className="flex items-center text-sm text-gray-700">
          <span>
            Affichage de {startItem} à {endItem} sur {total_items} modifications
          </span>
        </div>

        <div className="flex items-center space-x-2">
          {/* Première page */}
          <button
            onClick={() => onPageChange(1)}
            disabled={current_page === 1}
            className="p-2 rounded-md border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
          >
            <ChevronsLeft size={16} />
          </button>

          {/* Page précédente */}
          <button
            onClick={() => onPageChange(current_page - 1)}
            disabled={current_page === 1}
            className="p-2 rounded-md border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
          >
            <ChevronLeft size={16} />
          </button>

          {/* Numéros de pages */}
          <div className="flex items-center space-x-1">
            {Array.from({ length: Math.min(5, total_pages) }, (_, i) => {
              let pageNum;
              if (total_pages <= 5) {
                pageNum = i + 1;
              } else if (current_page <= 3) {
                pageNum = i + 1;
              } else if (current_page >= total_pages - 2) {
                pageNum = total_pages - 4 + i;
              } else {
                pageNum = current_page - 2 + i;
              }

              return (
                <button
                  key={pageNum}
                  onClick={() => onPageChange(pageNum)}
                  className={`px-3 py-2 rounded-md text-sm ${
                    current_page === pageNum
                      ? 'bg-[#FFB800] text-white'
                      : 'border border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  {pageNum}
                </button>
              );
            })}
          </div>

          {/* Page suivante */}
          <button
            onClick={() => onPageChange(current_page + 1)}
            disabled={current_page === total_pages}
            className="p-2 rounded-md border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
          >
            <ChevronRight size={16} />
          </button>

          {/* Dernière page */}
          <button
            onClick={() => onPageChange(total_pages)}
            disabled={current_page === total_pages}
            className="p-2 rounded-md border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
          >
            <ChevronsRight size={16} />
          </button>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#FFB800]"></div>
          <span className="ml-3 text-gray-600">Chargement des modifications...</span>
        </div>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="text-center py-12">
          <FileText className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">Aucune modification trouvée</h3>
          <p className="mt-1 text-sm text-gray-500">
            Aucune modification ne correspond aux critères de recherche.
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
        {/* En-tête du tableau */}
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
          <h3 className="text-lg font-medium text-gray-900">
            Historique des modifications
          </h3>
          <p className="text-sm text-gray-600 mt-1">
            {pagination.total_items} modification{pagination.total_items > 1 ? 's' : ''} trouvée{pagination.total_items > 1 ? 's' : ''}
          </p>
        </div>

        {/* Tableau */}
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date/Heure
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Utilisateur
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Entité
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Champ
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Action
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Changement
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {data.map((modification) => (
                <tr 
                  key={modification.id}
                  className="hover:bg-gray-50 cursor-pointer transition-colors"
                  onClick={() => handleRowClick(modification)}
                >
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <div className="flex items-center">
                      <Calendar className="w-4 h-4 mr-2 text-gray-400" />
                      <div>
                        <div className="font-medium">{modification.created_at_human.split(' à ')[0]}</div>
                        <div className="text-gray-500 text-xs">{modification.created_at_human.split(' à ')[1]}</div>
                      </div>
                    </div>
                  </td>

                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <div className="flex items-center">
                      <User className="w-4 h-4 mr-2 text-gray-400" />
                      <div>
                        <div className="font-medium">{modification.user.name}</div>
                        {modification.user.email && (
                          <div className="text-gray-500 text-xs">{modification.user.email}</div>
                        )}
                      </div>
                    </div>
                  </td>

                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      historyService.getEntityTypeBadgeColor(modification.entity_type)
                    }`}>
                      {modification.entity_type_label}
                    </span>
                  </td>

                  <td className="px-6 py-4 text-sm text-gray-900 max-w-xs truncate">
                    <div className="font-medium truncate">
                      {modification.entity_name || `ID: ${modification.entity_id}`}
                    </div>
                  </td>

                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {modification.field_label}
                  </td>

                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      historyService.getActionBadgeColor(modification.action)
                    }`}>
                      {modification.action_label}
                    </span>
                  </td>

                  <td className="px-6 py-4 text-sm text-gray-900 max-w-xs">
                    <div className="space-y-1">
                      {modification.old_value_display && (
                        <div className="text-red-600 text-xs truncate">
                          <span className="font-medium">Avant:</span> {modification.old_value_display}
                        </div>
                      )}
                      {modification.new_value_display && (
                        <div className="text-green-600 text-xs truncate">
                          <span className="font-medium">Après:</span> {modification.new_value_display}
                        </div>
                      )}
                    </div>
                  </td>

                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRowClick(modification);
                      }}
                      disabled={loadingDetail}
                      className="text-[#FFB800] hover:text-[#FFA800] disabled:opacity-50"
                    >
                      <Eye size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {renderPagination()}
      </div>

      {/* Modal de détail */}
      {selectedModification && (
        <ModificationDetailModal
          modification={selectedModification}
          onClose={() => setSelectedModification(null)}
        />
      )}
    </>
  );
};

export default HistoryTable;