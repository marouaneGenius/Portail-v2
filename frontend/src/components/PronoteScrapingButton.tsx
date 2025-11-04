import React, { useState } from 'react';
import api from '../api/aixos';
import { Button } from '@/components/ui/button';
import { Download, Loader2, CheckCircle, XCircle } from 'lucide-react';
import { toast } from 'sonner';

interface PronoteScrapingButtonProps {
  studentId: number;
  hasPronoteCredentials: boolean;
  onSuccess?: () => void;
}

const PronoteScrapingButton: React.FC<PronoteScrapingButtonProps> = ({
  studentId,
  hasPronoteCredentials,
  onSuccess,
}) => {
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const handleScrape = async () => {
    if (!hasPronoteCredentials) {
      toast.error('Identifiants Pronote manquants', {
        description: 'Veuillez d\'abord configurer les identifiants Pronote pour cet élève.',
      });
      return;
    }

    setLoading(true);
    setStatus('idle');

    toast.info('Scraping Pronote en cours...', {
      description: 'Cette opération peut prendre quelques instants.',
    });

    try {
      const response = await api.post(`/api/pronote/scrape/${studentId}`);

      if (response.data.success) {
        setStatus('success');
        toast.success('Scraping Pronote réussi !', {
          description: 'Les données ont été récupérées avec succès.',
        });

        // Afficher les données récupérées
        console.log('Données Pronote:', response.data.data);

        if (onSuccess) {
          onSuccess();
        }

        // Reset le statut après 3 secondes
        setTimeout(() => setStatus('idle'), 3000);
      } else {
        throw new Error(response.data.message || 'Échec du scraping');
      }
    } catch (error: any) {
      setStatus('error');
      const errorMessage = error.response?.data?.error || error.message || 'Erreur inconnue';

      toast.error('Échec du scraping Pronote', {
        description: errorMessage,
      });

      // Reset le statut après 3 secondes
      setTimeout(() => setStatus('idle'), 3000);
    } finally {
      setLoading(false);
    }
  };

  const getButtonContent = () => {
    if (loading) {
      return (
        <>
          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          Scraping en cours...
        </>
      );
    }

    if (status === 'success') {
      return (
        <>
          <CheckCircle className="w-4 h-4 mr-2" />
          Succès !
        </>
      );
    }

    if (status === 'error') {
      return (
        <>
          <XCircle className="w-4 h-4 mr-2" />
          Erreur
        </>
      );
    }

    return (
      <>
        <Download className="w-4 h-4 mr-2" />
        Récupérer les données Pronote
      </>
    );
  };

  const getButtonVariant = () => {
    if (status === 'success') return 'default';
    if (status === 'error') return 'destructive';
    return 'outline';
  };

  return (
    <Button
      variant={getButtonVariant()}
      size="sm"
      onClick={handleScrape}
      disabled={loading || !hasPronoteCredentials}
      className={`
        ${status === 'success' ? 'bg-green-600 hover:bg-green-700 text-white' : ''}
        ${!hasPronoteCredentials ? 'opacity-50 cursor-not-allowed' : ''}
      `}
    >
      {getButtonContent()}
    </Button>
  );
};

export default PronoteScrapingButton;
