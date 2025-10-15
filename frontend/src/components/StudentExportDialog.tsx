import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Download, Loader2, FileDown } from 'lucide-react';
import api from '../api/aixos';

interface Center {
  id: number;
  name: string;
}

interface Status {
  value: string;
  label: string;
}

interface ExportOptions {
  centers: Center[];
  classes: string[];
  statuses: Status[];
}

interface StudentExportDialogProps {
  onClose?: () => void;
}

const StudentExportDialog: React.FC<StudentExportDialogProps> = ({ onClose }) => {
  const [options, setOptions] = useState<ExportOptions | null>(null);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [previewCount, setPreviewCount] = useState<number | null>(null);

  // États des filtres sélectionnés
  const [selectedCenters, setSelectedCenters] = useState<number[]>([]);
  const [selectedClasses, setSelectedClasses] = useState<string[]>([]);
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>([]);

  useEffect(() => {
    fetchExportOptions();
  }, []);

  const fetchExportOptions = async () => {
    try {
      setLoading(true);
      const response = await api.get('/api/student/export/options');
      setOptions(response.data);
    } catch (error) {
      console.error('Erreur lors du chargement des options d\'export:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCenterToggle = (centerId: number) => {
    setSelectedCenters(prev =>
      prev.includes(centerId)
        ? prev.filter(id => id !== centerId)
        : [...prev, centerId]
    );
    setPreviewCount(null); // Reset preview when filters change
  };

  const handleClassToggle = (className: string) => {
    setSelectedClasses(prev =>
      prev.includes(className)
        ? prev.filter(c => c !== className)
        : [...prev, className]
    );
    setPreviewCount(null);
  };

  const handleStatusToggle = (statusValue: string) => {
    setSelectedStatuses(prev =>
      prev.includes(statusValue)
        ? prev.filter(s => s !== statusValue)
        : [...prev, statusValue]
    );
    setPreviewCount(null);
  };

  const handleSelectAllCenters = () => {
    if (options && selectedCenters.length === options.centers.length) {
      setSelectedCenters([]);
    } else if (options) {
      setSelectedCenters(options.centers.map(c => c.id));
    }
    setPreviewCount(null);
  };

  const handleSelectAllClasses = () => {
    if (options && selectedClasses.length === options.classes.length) {
      setSelectedClasses([]);
    } else if (options) {
      setSelectedClasses([...options.classes]);
    }
    setPreviewCount(null);
  };

  const handleSelectAllStatuses = () => {
    if (options && selectedStatuses.length === options.statuses.length) {
      setSelectedStatuses([]);
    } else if (options) {
      setSelectedStatuses(options.statuses.map(s => s.value));
    }
    setPreviewCount(null);
  };

  const handlePreview = async () => {
    try {
      const response = await api.post('/api/student/export/preview', {
        centers: selectedCenters,
        classes: selectedClasses,
        statuses: selectedStatuses,
      });
      setPreviewCount(response.data.count);
    } catch (error) {
      console.error('Erreur lors de la prévisualisation:', error);
    }
  };

  const handleExport = async () => {
    try {
      setExporting(true);
      const response = await api.post('/api/student/export', {
        centers: selectedCenters,
        classes: selectedClasses,
        statuses: selectedStatuses,
      }, {
        responseType: 'blob', // Important pour récupérer le fichier
      });

      // Créer un lien de téléchargement
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `export_eleves_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      link.parentNode?.removeChild(link);
      window.URL.revokeObjectURL(url);

      // Fermer le dialogue après l'export
      if (onClose) {
        onClose();
      }
    } catch (error) {
      console.error('Erreur lors de l\'export:', error);
      alert('Une erreur est survenue lors de l\'export. Veuillez réessayer.');
    } finally {
      setExporting(false);
    }
  };

  if (loading) {
    return (
      <Card className="w-full max-w-4xl mx-auto">
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin" />
        </CardContent>
      </Card>
    );
  }

  if (!options) {
    return (
      <Card className="w-full max-w-4xl mx-auto">
        <CardContent className="py-8">
          <p className="text-center text-muted-foreground">
            Impossible de charger les options d'export
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileDown className="h-5 w-5" />
          Export des élèves
        </CardTitle>
        <CardDescription>
          Sélectionnez les filtres à appliquer avant d'exporter la liste des élèves au format CSV
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Filtres Centres */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label className="text-base font-semibold">Centres</Label>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleSelectAllCenters}
            >
              {selectedCenters.length === options.centers.length ? 'Tout désélectionner' : 'Tout sélectionner'}
            </Button>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {options.centers.map((center) => (
              <div key={center.id} className="flex items-center space-x-2">
                <Checkbox
                  id={`center-${center.id}`}
                  checked={selectedCenters.includes(center.id)}
                  onCheckedChange={() => handleCenterToggle(center.id)}
                />
                <Label
                  htmlFor={`center-${center.id}`}
                  className="text-sm font-normal cursor-pointer"
                >
                  {center.name}
                </Label>
              </div>
            ))}
          </div>
        </div>

        <Separator />

        {/* Filtres Classes */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label className="text-base font-semibold">Classes</Label>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleSelectAllClasses}
            >
              {selectedClasses.length === options.classes.length ? 'Tout désélectionner' : 'Tout sélectionner'}
            </Button>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 max-h-64 overflow-y-auto">
            {options.classes.map((className) => (
              <div key={className} className="flex items-center space-x-2">
                <Checkbox
                  id={`class-${className}`}
                  checked={selectedClasses.includes(className)}
                  onCheckedChange={() => handleClassToggle(className)}
                />
                <Label
                  htmlFor={`class-${className}`}
                  className="text-sm font-normal cursor-pointer"
                >
                  {className}
                </Label>
              </div>
            ))}
          </div>
        </div>

        <Separator />

        {/* Filtres Statuts */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label className="text-base font-semibold">Statut de l'élève</Label>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleSelectAllStatuses}
            >
              {selectedStatuses.length === options.statuses.length ? 'Tout désélectionner' : 'Tout sélectionner'}
            </Button>
          </div>
          <div className="space-y-2">
            {options.statuses.map((status) => (
              <div key={status.value} className="flex items-center space-x-2">
                <Checkbox
                  id={`status-${status.value}`}
                  checked={selectedStatuses.includes(status.value)}
                  onCheckedChange={() => handleStatusToggle(status.value)}
                />
                <Label
                  htmlFor={`status-${status.value}`}
                  className="text-sm font-normal cursor-pointer"
                >
                  {status.label}
                </Label>
              </div>
            ))}
          </div>
        </div>

        {/* Prévisualisation */}
        {previewCount !== null && (
          <div className="bg-muted p-4 rounded-md">
            <p className="text-sm font-medium">
              Nombre d'élèves à exporter : <span className="text-primary font-bold">{previewCount}</span>
            </p>
          </div>
        )}
      </CardContent>

      <CardFooter className="flex justify-between gap-4">
        <Button
          variant="outline"
          onClick={handlePreview}
          disabled={exporting}
        >
          Prévisualiser
        </Button>
        <div className="flex gap-2">
          {onClose && (
            <Button
              variant="ghost"
              onClick={onClose}
              disabled={exporting}
            >
              Annuler
            </Button>
          )}
          <Button
            onClick={handleExport}
            disabled={exporting}
          >
            {exporting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Export en cours...
              </>
            ) : (
              <>
                <Download className="h-4 w-4" />
                Exporter en CSV
              </>
            )}
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
};

export default StudentExportDialog;
