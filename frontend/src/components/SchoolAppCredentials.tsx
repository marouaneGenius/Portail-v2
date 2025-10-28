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
  Typography,
  Alert,
  IconButton,
  InputAdornment
} from '@mui/material';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Eye, EyeOff, BookOpen, Edit, ExternalLink } from 'lucide-react';
import api from '../api/aixos';

interface SchoolAppCredentialsProps {
  studentId: number | string;
  currentApp?: string | null;
  currentUrl?: string | null;
  currentUsername?: string | null;
  onUpdate?: () => void;
}

export const SchoolAppCredentials: React.FC<SchoolAppCredentialsProps> = ({
  studentId,
  currentApp,
  currentUrl,
  currentUsername,
  onUpdate
}) => {
  const [open, setOpen] = useState(false);
  const [schoolApp, setSchoolApp] = useState<string>(currentApp || '');
  const [schoolAppUrl, setSchoolAppUrl] = useState<string>(currentUrl || '');
  const [schoolAppUsername, setSchoolAppUsername] = useState<string>(currentUsername || '');
  const [schoolAppPassword, setSchoolAppPassword] = useState<string>('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    setSchoolApp(currentApp || '');
    setSchoolAppUrl(currentUrl || '');
    setSchoolAppUsername(currentUsername || '');
  }, [currentApp, currentUrl, currentUsername]);

  const handleOpen = () => {
    setOpen(true);
    setError(null);
    setSuccess(null);
    setSchoolAppPassword(''); // Réinitialiser le mot de passe à chaque ouverture
  };

  const handleClose = () => {
    setOpen(false);
    setError(null);
    setSuccess(null);
    setSchoolAppPassword('');
  };

  const handleSave = async () => {
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const payload: any = {
        school_app: schoolApp || null,
        school_app_url: schoolAppUrl || null,
        school_app_username: schoolAppUsername || null,
      };

      // N'envoyer le mot de passe que s'il a été modifié
      if (schoolAppPassword) {
        payload.school_app_password = schoolAppPassword;
      }

      await api.put(`/api/student/${studentId}`, payload);

      setSuccess('Informations de vie scolaire mises à jour avec succès');

      setTimeout(() => {
        handleClose();
        if (onUpdate) {
          onUpdate();
        }
      }, 1500);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Erreur lors de la mise à jour des informations');
    } finally {
      setLoading(false);
    }
  };

  const getAppLabel = (app: string | null) => {
    if (!app) return null;
    if (app === 'pronote') return 'Pronote';
    if (app === 'ecole_directe') return 'École Directe';
    return app;
  };

  const handleClickShowPassword = () => {
    setShowPassword(!showPassword);
  };

  const getAppBadgeColor = (app: string | null) => {
    if (app === 'pronote') return 'bg-blue-100 text-blue-600 border-blue-200';
    if (app === 'ecole_directe') return 'bg-purple-100 text-purple-600 border-purple-200';
    return 'bg-gray-100 text-gray-600 border-gray-200';
  };

  return (
    <>
      <Card className="border-fading-grey">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg text-mister-anthracite flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-indigo-500" />
              Application de vie scolaire
            </CardTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={handleOpen}
            >
              <Edit className="w-4 h-4 mr-2" />
              {currentApp ? 'Modifier' : 'Ajouter'}
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {currentApp ? (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-sm text-mister-anthracite/70">Application</p>
                <Badge className={getAppBadgeColor(currentApp)}>
                  {getAppLabel(currentApp)}
                </Badge>
              </div>

              {currentUrl && (
                <div className="flex items-center justify-between">
                  <p className="text-sm text-mister-anthracite/70">URL</p>
                  <a
                    href={currentUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-blue-600 hover:text-blue-800 flex items-center gap-1 truncate max-w-[200px]"
                  >
                    <ExternalLink className="w-3 h-3" />
                    {currentUrl}
                  </a>
                </div>
              )}

              {currentUsername && (
                <div className="flex items-center justify-between">
                  <p className="text-sm text-mister-anthracite/70">Identifiant</p>
                  <p className="font-medium text-mister-anthracite text-sm">
                    {currentUsername}
                  </p>
                </div>
              )}
            </div>
          ) : (
            <p className="text-sm text-mister-anthracite/70 italic">
              Aucune information renseignée
            </p>
          )}
        </CardContent>
      </Card>

      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle>Accès à l'application de vie scolaire</DialogTitle>
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
            <FormControl fullWidth>
              <InputLabel>Application de vie scolaire</InputLabel>
              <Select
                value={schoolApp}
                onChange={(e) => setSchoolApp(e.target.value)}
                label="Application de vie scolaire"
              >
                <MenuItem value="">
                  <em>Aucune</em>
                </MenuItem>
                <MenuItem value="pronote">Pronote</MenuItem>
                <MenuItem value="ecole_directe">École Directe</MenuItem>
              </Select>
            </FormControl>

            <TextField
              fullWidth
              label="URL de connexion"
              type="url"
              value={schoolAppUrl}
              onChange={(e) => setSchoolAppUrl(e.target.value)}
              placeholder="https://..."
              helperText="L'URL complète de connexion à l'application"
            />

            <TextField
              fullWidth
              label="Identifiant"
              type="text"
              value={schoolAppUsername}
              onChange={(e) => setSchoolAppUsername(e.target.value)}
              helperText="Le nom d'utilisateur pour se connecter"
            />

            <TextField
              fullWidth
              label="Mot de passe"
              type={showPassword ? 'text' : 'password'}
              value={schoolAppPassword}
              onChange={(e) => setSchoolAppPassword(e.target.value)}
              helperText="Laisser vide pour ne pas modifier le mot de passe existant"
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label="toggle password visibility"
                      onClick={handleClickShowPassword}
                      edge="end"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />

            <Box className="bg-blue-50 p-3 rounded">
              <Typography variant="caption" className="text-blue-800">
                <strong>ℹ️ Information:</strong> Ces informations permettent d'accéder aux notes et
                à l'emploi du temps de l'élève sur l'application de vie scolaire.
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
