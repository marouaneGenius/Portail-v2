import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { usePermissions } from '../Hooks/usePermissions';
import { getDashboardStats } from '../api/api';

interface DashboardStats {
  totalStudents: number;
  totalTutors: number;
  totalCenters: number;
  sessionsThisMonth: number;
  upcomingSessions: number;
  activeSubscriptions: number;
  sessionsToday: number;
  monthlyRevenue: number;
  studentGrowth: number;
  sessionGrowth: number;
  validatedContracts: number;
  contractsByType: Array<{
    type: string;
    count: number;
  }>;
  recentActivity: Array<{
    id: number;
    action: string;
    entityType: string;
    entityName: string | null;
    fieldName: string;
    createdAt: string;
    user: { id: number; firstname: string; lastname: string } | null;
  }>;
}

const Dashboard: React.FC = () => {
  const { isParent } = usePermissions();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await getDashboardStats();
        setStats(data);
      } catch (err) {
        setError('Impossible de charger les statistiques');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  // Si l'utilisateur est un parent, le rediriger vers son dashboard dédié
  if (isParent()) {
    return <Navigate to="/parent-dashboard" replace />;
  }

  if (loading) {
    return (
      <main className="mx-auto max-w-7xl p-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-lg text-gray-600">Chargement des statistiques...</div>
        </div>
      </main>
    );
  }

  if (error || !stats) {
    return (
      <main className="mx-auto max-w-7xl p-8">
        <div className="rounded-lg bg-red-50 p-4 text-red-800">
          {error || 'Erreur lors du chargement des données'}
        </div>
      </main>
    );
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return 'il y a quelques secondes';
    if (diffInSeconds < 3600) return `il y a ${Math.floor(diffInSeconds / 60)} min`;
    if (diffInSeconds < 86400) return `il y a ${Math.floor(diffInSeconds / 3600)}h`;
    if (diffInSeconds < 604800) return `il y a ${Math.floor(diffInSeconds / 86400)}j`;
    return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
  };

  const getActionText = (activity: DashboardStats['recentActivity'][0]) => {
    const userName = activity.user
      ? `${activity.user.firstname} ${activity.user.lastname}`
      : 'Système';

    const entityTypeMap: Record<string, string> = {
      'student': 'élève',
      'parent': 'parent',
      'user': 'utilisateur',
      'center': 'centre',
      'session': 'séance',
      'subscription': 'abonnement',
    };

    const actionMap: Record<string, string> = {
      'create': 'a créé',
      'update': 'a modifié',
      'delete': 'a supprimé',
    };

    const entityLabel = entityTypeMap[activity.entityType] || activity.entityType;
    const actionLabel = actionMap[activity.action] || activity.action;
    const entityName = activity.entityName ? ` "${activity.entityName}"` : '';

    return `${userName} ${actionLabel} ${entityLabel}${entityName}`;
  };

  const getActivityIcon = (action: string) => {
    switch (action) {
      case 'create':
        return (
          <div className="rounded-full bg-green-500/20 p-2 ring-2 ring-green-500/30">
            <svg className="h-4 w-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          </div>
        );
      case 'update':
        return (
          <div className="rounded-full bg-hello-yellow/30 p-2 ring-2 ring-hello-yellow/40">
            <svg className="h-4 w-4 text-hello-yellow" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </div>
        );
      case 'delete':
        return (
          <div className="rounded-full bg-crazy-magenta/20 p-2 ring-2 ring-crazy-magenta/30">
            <svg className="h-4 w-4 text-crazy-magenta" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </div>
        );
      default:
        return (
          <div className="rounded-full bg-mister-anthracite/10 p-2 ring-2 ring-mister-anthracite/20">
            <svg className="h-4 w-4 text-mister-anthracite" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        );
    }
  };

  return (
    <main className="min-h-screen bg-gray-50/30">
      <div className="mx-auto max-w-7xl p-6 sm:p-8">
        {/* Header simplifié */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-mister-anthracite mb-2">
            Tableau de bord
          </h1>
        </div>

        {/* Bannière principale */}
        {/* <section className="rounded-3xl bg-gradient-to-r from-hello-yellow via-amber-400 to-crazy-magenta p-8 sm:p-10 text-white shadow-lg mb-8 animate-fade-in relative overflow-hidden">
          <div className="relative z-10">
            <h2 className="text-2xl sm:text-3xl font-bold mb-3">
              Bienvenue sur Genius
            </h2>
            <p className="text-white/90 mb-6 max-w-2xl">
              Gérez efficacement votre centre de soutien scolaire avec notre plateforme intuitive.
            </p>
          </div>
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32"></div>
          <div className="absolute bottom-0 right-20 w-40 h-40 bg-white/10 rounded-full -mb-20"></div>
        </section> */}

      {/* KPI Cards Grid */}
      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 mb-8">
        {/* Total Étudiants */}
        <div className="rounded-2xl bg-white p-5 shadow-sm hover:shadow-md transition-all duration-200 border border-gray-100">
          <div className="flex items-center gap-2 mb-3">
            <div className="rounded-lg bg-green-50 p-2">
              <svg className="h-5 w-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </div>
          </div>
          <div>
            <p className="text-xs font-medium text-mister-anthracite/60 mb-1">Étudiants inscrits</p>
            <p className="text-2xl font-bold text-mister-anthracite">{stats.totalStudents}</p>
            {stats.studentGrowth !== 0 && (
              <p className={`mt-1 text-xs font-semibold ${stats.studentGrowth > 0 ? 'text-green-600' : 'text-red-600'}`}>
                {stats.studentGrowth > 0 ? '+' : ''}{stats.studentGrowth}% ce mois
              </p>
            )}
          </div>
        </div>

        {/* Total Centres */}
        <div className="rounded-2xl bg-white p-5 shadow-sm hover:shadow-md transition-all duration-200 border border-gray-100">
          <div className="flex items-center gap-2 mb-3">
            <div className="rounded-lg bg-blue-50 p-2">
              <svg className="h-5 w-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
          </div>
          <div>
            <p className="text-xs font-medium text-mister-anthracite/60 mb-1">Centres ouverts</p>
            <p className="text-2xl font-bold text-mister-anthracite">{stats.totalCenters}</p>
            <p className="mt-1 text-xs font-semibold text-mister-anthracite/40">Actifs</p>
          </div>
        </div>

        {/* Séances cette semaine */}
        <div className="rounded-2xl bg-white p-5 shadow-sm hover:shadow-md transition-all duration-200 border border-gray-100">
          <div className="flex items-center gap-2 mb-3">
            <div className="rounded-lg bg-pink-50 p-2">
              <svg className="h-5 w-5 text-pink-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
          </div>
          <div>
            <p className="text-xs font-medium text-mister-anthracite/60 mb-1">Séances ce mois</p>
            <p className="text-2xl font-bold text-mister-anthracite">{stats.sessionsThisMonth}</p>
            {stats.sessionGrowth !== 0 && (
              <p className={`mt-1 text-xs font-semibold ${stats.sessionGrowth > 0 ? 'text-green-600' : 'text-red-600'}`}>
                {stats.sessionGrowth > 0 ? '+' : ''}{stats.sessionGrowth}% ce mois
              </p>
            )}
          </div>
        </div>

        {/* Séances aujourd'hui */}
        <div className="rounded-2xl bg-white p-5 shadow-sm hover:shadow-md transition-all duration-200 border border-gray-100">
          <div className="flex items-center gap-2 mb-3">
            <div className="rounded-lg bg-orange-50 p-2">
              <svg className="h-5 w-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          <div>
            <p className="text-xs font-medium text-mister-anthracite/60 mb-1">Séances aujourd'hui</p>
            <p className="text-2xl font-bold text-mister-anthracite">{stats.sessionsToday}</p>
            <p className="mt-1 text-xs font-semibold text-mister-anthracite/40">En cours</p>
          </div>
        </div>

        {/* Séances à venir */}
        <div className="rounded-2xl bg-white p-5 shadow-sm hover:shadow-md transition-all duration-200 border border-gray-100">
          <div className="flex items-center gap-2 mb-3">
            <div className="rounded-lg bg-purple-50 p-2">
              <svg className="h-5 w-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
          </div>
          <div>
            <p className="text-xs font-medium text-mister-anthracite/60 mb-1">Séances à venir</p>
            <p className="text-2xl font-bold text-mister-anthracite">{stats.upcomingSessions}</p>
            <p className="mt-1 text-xs font-semibold text-mister-anthracite/40">Planifiées</p>
          </div>
        </div>

        {/* Tuteurs */}
        <div className="rounded-2xl bg-white p-5 shadow-sm hover:shadow-md transition-all duration-200 border border-gray-100">
          <div className="flex items-center gap-2 mb-3">
            <div className="rounded-lg bg-indigo-50 p-2">
              <svg className="h-5 w-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
          </div>
          <div>
            <p className="text-xs font-medium text-mister-anthracite/60 mb-1">Tuteurs actifs</p>
            <p className="text-2xl font-bold text-mister-anthracite">{stats.totalTutors}</p>
            <p className="mt-1 text-xs font-semibold text-mister-anthracite/40">Disponibles</p>
          </div>
        </div>
      </section>

      {/* Section Contrats */}
      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 mb-8">
        {/* Contrats validés */}
        <div className="rounded-2xl bg-white p-6 shadow-sm hover:shadow-md transition-all duration-200 border border-gray-100">
          <div className="flex items-center gap-3 mb-4">
            <div className="rounded-lg bg-emerald-50 p-2">
              <svg className="h-6 w-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <p className="text-xs font-medium text-mister-anthracite/60">Contrats validés</p>
              <p className="text-3xl font-bold text-mister-anthracite">{stats.validatedContracts}</p>
            </div>
          </div>
        </div>

        {/* Contrats par type */}
        <div className="rounded-2xl bg-white p-6 shadow-sm hover:shadow-md transition-all duration-200 border border-gray-100 lg:col-span-2">
          <h3 className="text-sm font-semibold text-mister-anthracite mb-4">Répartition par type de contrat</h3>
          {stats.contractsByType && stats.contractsByType.length > 0 ? (
            <div className="space-y-3">
              {stats.contractsByType.map((contract, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center gap-3 flex-1">
                    <div className={`h-2 w-2 rounded-full ${
                      index % 3 === 0 ? 'bg-hello-yellow' :
                      index % 3 === 1 ? 'bg-crazy-magenta' :
                      'bg-blue-500'
                    }`}></div>
                    <span className="text-sm font-medium text-mister-anthracite capitalize">
                      {contract.type || 'Non spécifié'}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-32 h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${
                          index % 3 === 0 ? 'bg-hello-yellow' :
                          index % 3 === 1 ? 'bg-crazy-magenta' :
                          'bg-blue-500'
                        }`}
                        style={{
                          width: `${(contract.count / stats.validatedContracts) * 100}%`
                        }}
                      ></div>
                    </div>
                    <span className="text-sm font-bold text-mister-anthracite min-w-[2rem] text-right">
                      {contract.count}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-mister-anthracite/60 text-center py-4">Aucun contrat validé</p>
          )}
        </div>
      </section>

      {/* Activité Récente */}
      <section className="rounded-2xl bg-white p-6 shadow-sm border border-gray-100">
        <h2 className="text-lg font-bold text-mister-anthracite mb-1">Activité récente</h2>
        <p className="text-sm text-mister-anthracite/60 mb-6">Les dernières actions effectuées dans votre centre</p>
        {stats.recentActivity && stats.recentActivity.length > 0 ? (
          <div className="space-y-1">
            {stats.recentActivity.map((activity, index) => (
              <div
                key={activity.id}
                className="flex items-start gap-4 p-4 rounded-xl hover:bg-gray-50 transition-all duration-200 group"
              >
                {getActivityIcon(activity.action)}
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-mister-anthracite font-medium leading-relaxed">
                    {getActionText(activity)}
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <div className="flex items-center gap-1 text-xs text-mister-anthracite/50">
                      <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      {getTimeAgo(activity.createdAt)}
                    </div>
                    {activity.user && (
                      <div className="flex items-center gap-1">
                        <div className="h-6 w-6 rounded-full bg-gradient-to-br from-hello-yellow to-crazy-magenta flex items-center justify-center text-white text-xs font-bold">
                          {activity.user.firstname?.charAt(0)}{activity.user.lastname?.charAt(0)}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="rounded-full bg-gray-100 p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
              <svg className="h-8 w-8 text-mister-anthracite/30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
              </svg>
            </div>
            <p className="text-mister-anthracite/60 text-sm">Aucune activité récente</p>
          </div>
        )}
      </section>
      </div>
    </main>
  );
};

export default Dashboard;