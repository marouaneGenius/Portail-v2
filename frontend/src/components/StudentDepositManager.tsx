import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
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

  return (
    <>
      <Box className="bg-gray-50 p-4 rounded-lg">
        <div className="flex justify-between items-start mb-2">
          <Typography variant="h6" className="font-medium text-gray-700">
            Caution
          </Typography>
          <Button
            variant="outlined"
            size="small"
            onClick={handleOpen}
          >
            Gérer
          </Button>
        </div>

        {currentAmount && parseFloat(currentAmount) > 0 ? (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Typography variant="body2" className="text-gray-600">
                Montant:
              </Typography>
              <Typography variant="body1" className="font-semibold">
                {parseFloat(currentAmount).toFixed(2)} €
              </Typography>
            </div>

            {currentStatusInfo && (
              <div className="flex items-center justify-between">
                <Typography variant="body2" className="text-gray-600">
                  Statut:
                </Typography>
                <Chip
                  label={currentStatusInfo.label}
                  color={currentStatusInfo.color}
                  size="small"
                />
              </div>
            )}
          </div>
        ) : (
          <Typography variant="body2" className="text-gray-500 italic">
            Aucune caution définie
          </Typography>
        )}
      </Box>

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
          <Button onClick={handleClose} disabled={loading}>
            Annuler
          </Button>
          <Button
            onClick={handleSave}
            variant="contained"
            disabled={loading}
          >
            {loading ? 'Enregistrement...' : 'Enregistrer'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};
