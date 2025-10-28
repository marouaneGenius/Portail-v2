import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button as MuiButton,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  Chip,
  Typography,
  Alert,
  InputAdornment
} from '@mui/material';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Wallet, Edit } from 'lucide-react';
import api from '../api/aixos';

interface DepositStatus {
  value: string;
  label: string;
  color: 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning';
}

interface StudentDepositManagerProps {
  studentId: number | string;
  currentAmount?: string | null;
  currentStatus?: string | null;
  onUpdate?: () => void;
}

export const StudentDepositManager: React.FC<StudentDepositManagerProps> = ({
  studentId,
  currentAmount,
  currentStatus,
  onUpdate
}) => {
  const [open, setOpen] = useState(false);
  const [depositAmount, setDepositAmount] = useState<string>(currentAmount || '');
  const [depositStatus, setDepositStatus] = useState<string>(currentStatus || '');
  const [statuses, setStatuses] = useState<DepositStatus[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    fetchDepositStatuses();
  }, []);

  useEffect(() => {
    setDepositAmount(currentAmount || '');
    setDepositStatus(currentStatus || '');
  }, [currentAmount, currentStatus]);

  const fetchDepositStatuses = async () => {
    try {
      const response = await api.get('/api/student/deposit/statuses');
      setStatuses(response.data.statuses);
    } catch (err) {
      console.error('Erreur lors de la récupération des statuts:', err);
    }
  };

  const handleOpen = () => {
    setOpen(true);
    setError(null);
    setSuccess(null);
  };

  const handleClose = () => {
    setOpen(false);
    setError(null);
    setSuccess(null);
  };

  const handleSave = async () => {
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const payload: any = {};

      if (depositAmount !== currentAmount) {
        payload.deposit_amount = depositAmount ? parseFloat(depositAmount) : null;
      }

      if (depositStatus !== currentStatus) {
        payload.deposit_status = depositStatus || null;
      }

      await api.patch(`/api/student/${studentId}/deposit`, payload);

      setSuccess('Caution mise à jour avec succès');

      setTimeout(() => {
        handleClose();
        if (onUpdate) {
          onUpdate();
        }
      }, 1500);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Erreur lors de la mise à jour de la caution');
    } finally {
      setLoading(false);
    }
  };

  const getStatusInfo = (statusValue: string | null) => {
    if (!statusValue) return null;
    return statuses.find(s => s.value === statusValue);
  };

  const currentStatusInfo = getStatusInfo(currentStatus || null);

  const getStatusBadgeColor = (status: string | null) => {
    if (!status) return 'bg-gray-100 text-gray-600 border-gray-200';
    switch (status) {
      case 'en_attente_reception':
        return 'bg-orange-100 text-orange-600 border-orange-200';
      case 'reception_centre':
        return 'bg-blue-100 text-blue-600 border-blue-200';
      case 'reception_siege':
        return 'bg-purple-100 text-purple-600 border-purple-200';
      case 'rendu_parent':
        return 'bg-green-100 text-green-600 border-green-200';
      default:
        return 'bg-gray-100 text-gray-600 border-gray-200';
    }
  };

  return (
    <>
      <Card className="border-fading-grey">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg text-mister-anthracite flex items-center gap-2">
              <Wallet className="w-5 h-5 text-green-500" />
              Caution
            </CardTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={handleOpen}
            >
              <Edit className="w-4 h-4 mr-2" />
              Gérer
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {currentAmount && parseFloat(currentAmount) > 0 ? (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-sm text-mister-anthracite/70">Montant</p>
                <p className="font-semibold text-mister-anthracite">
                  {parseFloat(currentAmount).toFixed(2)} €
                </p>
              </div>

              {currentStatusInfo && (
                <div className="flex items-center justify-between">
                  <p className="text-sm text-mister-anthracite/70">Statut</p>
                  <Badge className={getStatusBadgeColor(currentStatus)}>
                    {currentStatusInfo.label}
                  </Badge>
                </div>
              )}
            </div>
          ) : (
            <p className="text-sm text-mister-anthracite/70 italic">
              Aucune caution définie
            </p>
          )}
        </CardContent>
      </Card>

      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle>Gérer la caution de l'élève</DialogTitle>
        <DialogContent>
          {error && (
            <Alert severity="error" className="mb-4">
              {error}
            </Alert>
          )}

          {success && (
            <Alert severity="success" className="mb-4">
              {success}
            </Alert>
          )}

          <Box className="space-y-4 mt-4">
            <TextField
              fullWidth
              label="Montant de la caution"
              type="number"
              value={depositAmount}
              onChange={(e) => setDepositAmount(e.target.value)}
              InputProps={{
                endAdornment: <InputAdornment position="end">€</InputAdornment>,
              }}
              inputProps={{
                min: 0,
                step: 0.01
              }}
              helperText="Laisser vide ou 0 si aucune caution"
            />

            <FormControl fullWidth>
              <InputLabel>Statut de la caution</InputLabel>
              <Select
                value={depositStatus}
                onChange={(e) => setDepositStatus(e.target.value)}
                label="Statut de la caution"
              >
                <MenuItem value="">
                  <em>Aucun statut</em>
                </MenuItem>
                {statuses.map((status) => (
                  <MenuItem key={status.value} value={status.value}>
                    {status.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <Box className="bg-blue-50 p-3 rounded">
              <Typography variant="caption" className="text-blue-800">
                <strong>Statuts disponibles:</strong>
                <ul className="mt-2 ml-4 list-disc">
                  <li>En attente de réception de la caution</li>
                  <li>Caution réceptionnée en centre</li>
                  <li>Caution réceptionnée au siège</li>
                  <li>Caution rendue au parent</li>
                </ul>
              </Typography>
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <MuiButton onClick={handleClose} disabled={loading}>
            Annuler
          </MuiButton>
          <MuiButton
            onClick={handleSave}
            variant="contained"
            disabled={loading}
          >
            {loading ? 'Enregistrement...' : 'Enregistrer'}
          </MuiButton>
        </DialogActions>
      </Dialog>
    </>
  );
};
