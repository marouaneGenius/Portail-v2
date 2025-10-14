import React from 'react';
import { Chip } from '@mui/material';

interface DepositStatusBadgeProps {
  status: string | null | undefined;
  amount?: string | null;
}

export const DepositStatusBadge: React.FC<DepositStatusBadgeProps> = ({ status, amount }) => {
  if (!amount || parseFloat(amount) === 0) {
    return null;
  }

  const getStatusConfig = (statusValue: string | null | undefined) => {
    switch (statusValue) {
      case 'en_attente_reception':
        return {
          label: 'Caution en attente',
          color: 'warning' as const
        };
      case 'reception_centre':
        return {
          label: 'Caution au centre',
          color: 'info' as const
        };
      case 'reception_siege':
        return {
          label: 'Caution au siège',
          color: 'primary' as const
        };
      case 'rendu_parent':
        return {
          label: 'Caution rendue',
          color: 'success' as const
        };
      default:
        return {
          label: 'Caution définie',
          color: 'default' as const
        };
    }
  };

  const config = getStatusConfig(status);

  return (
    <Chip
      label={`${config.label} (${parseFloat(amount).toFixed(2)}€)`}
      color={config.color}
      size="small"
    />
  );
};
