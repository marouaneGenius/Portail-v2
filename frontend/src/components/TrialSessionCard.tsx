import React, { useEffect, useState } from 'react';
import { Button } from "@mui/material";
import { Calendar, CreditCard, CheckCircle, Clock, AlertCircle, Copy, Check } from "lucide-react";
import api from '../api/aixos';
import { getDate } from '../services/functions';
import { useAuth } from '@/Hooks/auth';

interface TrialSession {
  id: number;
  date_slot: string;
  scheduled_at: string;
  is_canceled: boolean;
  is_paid: boolean;
  session_type: string;
  payment_link?: string; // Lien de paiement Stripe
  id_tutor?: any; // Pour vérifier si la séance a été programmée
}

interface TrialSessionCardProps {
  studentId: string | number;
  sessions: TrialSession[];
  onSessionUpdate: () => void;
}

export const PaymentStatus: React.FC<TrialSessionCardProps> = ({
  studentId,
  sessions,
  onSessionUpdate
}) => {
  const [paymentStatuses, setPaymentStatuses] = useState<{[key: number]: any}>({});
  const [loading, setLoading] = useState<{[key: number]: boolean}>({});
  const [copiedLink, setCopiedLink] = useState<number | null>(null);
  const { user }:any = useAuth();

  const copyToClipboard = async (link: string, sessionId: number) => {
    try {
      await navigator.clipboard.writeText(link);
      setCopiedLink(sessionId);
      setTimeout(() => setCopiedLink(null), 2000);
    } catch (error) {
      console.error('Erreur lors de la copie:', error);
      alert('Erreur lors de la copie du lien');
    }
  };

  const upcomingTrialSessions = sessions.filter(session => 
    session.session_type === 'trial_session'
  );

  // Ne pas vérifier automatiquement le statut de paiement

  const checkPaymentStatus = async (sessionId: number) => {
    setLoading(prev => ({ ...prev, [sessionId]: true }));
    try {
      const response = await api.get(`/api/sessions/${sessionId}/payment-status`);
      setPaymentStatuses(prev => ({ 
        ...prev, 
        [sessionId]: response.data 
      }));
    } catch (error) {
      console.error('Erreur lors de la vérification du paiement:', error);
      setPaymentStatuses(prev => ({ 
        ...prev, 
        [sessionId]: { is_paid: false, error: true } 
      }));
    } finally {
      setLoading(prev => ({ ...prev, [sessionId]: false }));
    }
  };

  const cancelSession = async (session: TrialSession) => {
    try {
      const values = {
        is_canceled: !session.is_canceled,
        canceled_by: user.id
      };
      
      await api.patch(`/api/sessions/${session.id}/action`, values);
      alert('Séance modifiée avec succès');
      onSessionUpdate();
    } catch (error) {
      console.error('Erreur lors de la modification:', error);
      alert('Erreur lors de la modification de la séance');
    }
  };


  if (upcomingTrialSessions.length === 0) {
    return null;
  }



  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-2xl border-2 border-hello-yellow p-6 shadow-lg">
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 bg-hello-yellow/20 rounded-xl">
          <Calendar className="w-6 h-6 text-hello-yellow" />
        </div>
        <div>
          <h3 className="text-xl font-bold text-mister-anthracite">Séances d'essai</h3>
          {/* <p className="text-sm text-mister-anthracite/60">
            {upcomingTrialSessions.length} séance(s) d'essai à venir
          </p> */}
        </div>
      </div>

      <div className="space-y-4">
        {upcomingTrialSessions.map((session) => {
          const paymentStatus = paymentStatuses[session.id];
          const isLoading = loading[session.id];
          const isPaid = paymentStatus?.is_paid || session.is_paid;
          
          return (
            <div key={session.id} className={`border rounded-xl p-4 ${
              session.is_canceled 
                ? 'border-red-200 bg-red-50/60' 
                : 'border-fading-grey bg-white/60'
            }`}>
              {/* En-tête avec date et statut */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-50 rounded-lg">
                    <Calendar className="w-4 h-4 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-mister-anthracite">
                        {session.scheduled_at &&
                          new Date(session.scheduled_at).toLocaleDateString('fr-FR', {
                            weekday: 'long',
                            day: '2-digit',
                            month: 'long'
                          })
                            .replace(/^\w/, c => c.toUpperCase()) // Majuscule sur le premier caractère
                        }
                    </p>
                    {session.scheduled_at && (
                      <p className="text-sm text-mister-anthracite/60">
                        à {new Date(session.scheduled_at).toISOString().slice(11, 16)}
                      </p>
                    )}
                  </div>
                </div>

                {/* Statut de paiement */}
                <div className="flex items-center gap-2">
                  {session.is_canceled ? (
                    <div className="flex items-center gap-2 text-red-600 bg-red-100 px-3 py-1 rounded-full">
                      <AlertCircle className="w-4 h-4" />
                      <span className="text-xs font-medium">Annulée</span>
                    </div>
                  ) : isLoading ? (
                    <div className="flex items-center gap-2 text-gray-500">
                      <Clock className="w-4 h-4 animate-spin" />
                      <span className="text-xs">Vérification...</span>
                    </div>
                  ) : isPaid ? (
                    <div className="flex items-center gap-2 text-green-600 bg-green-50 px-3 py-1 rounded-full">
                      <CheckCircle className="w-4 h-4" />
                      <span className="text-xs font-medium">Programmée</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-orange-600 bg-orange-50 px-3 py-1 rounded-full">
                      <AlertCircle className="w-4 h-4" />
                      <span className="text-xs font-medium">En attente</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Détails du paiement si disponible */}
              {paymentStatus?.payment_details && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-3">
                  <p className="text-sm text-green-700 font-medium mb-1">
                    ✅ Paiement confirmé
                  </p>
                  <p className="text-xs text-green-600">
                    Montant: {paymentStatus.payment_details.amount_paid}€ • 
                    Payé le: {new Date(paymentStatus.payment_details.payment_date).toLocaleDateString('fr-FR')}
                  </p>
                </div>
              )}

              {/* Actions */}
              {!session.is_canceled && (
                <div className="flex gap-2 pt-2">
                  {isPaid ? (
                    // Si payé, séance automatiquement programmée
                    <div className="flex-1">
                      <p className="text-sm text-green-600 font-medium">
                        ✅ Séance automatiquement programmée après paiement
                      </p>
                    </div>
                  ) : (
                    // Si pas payé, afficher le bouton de vérification
                    <div className="flex-1 space-y-2">
                      <p className="text-xs text-orange-600">
                        ⏳ En attente du paiement pour programmer cette séance
                      </p>
                      <div className="flex gap-2">
                        <Button
                          variant="outlined"
                          color="primary"
                          size="small"
                          onClick={() => checkPaymentStatus(session.id)}
                          disabled={isLoading}
                          className="flex-1"
                          startIcon={<CreditCard />}
                        >
                          {isLoading ? 'Vérification...' : 'Vérifier paiement'}
                        </Button>
                        {paymentStatus?.payment_link_url && (
                          <Button
                            variant="outlined"
                            color="warning"
                            size="small"
                            onClick={() => window.open(paymentStatus.payment_link_url, '_blank')}
                            startIcon={<CreditCard />}
                          >
                            Lien
                          </Button>
                        )}
                      </div>

                      {/* Bouton pour copier le lien de paiement */}
                      {session.payment_link && (
                        <Button
                          variant="outlined"
                          fullWidth
                          size="small"
                          onClick={() => copyToClipboard(session.payment_link!, session.id)}
                          startIcon={copiedLink === session.id ? <Check /> : <Copy />}
                          sx={{
                            borderColor: copiedLink === session.id ? '#10b981' : '#d1d5db',
                            color: copiedLink === session.id ? '#10b981' : '#6b7280',
                            '&:hover': {
                              borderColor: copiedLink === session.id ? '#059669' : '#9ca3af',
                              backgroundColor: copiedLink === session.id ? '#f0fdf4' : '#f9fafb',
                            },
                            textTransform: 'none',
                            fontWeight: 400,
                          }}
                        >
                          {copiedLink === session.id ? 'Lien copié !' : 'Copier le lien de paiement'}
                        </Button>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};