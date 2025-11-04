import { useEffect, useState } from 'react';
import api from '../api/aixos';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { BookOpen, Calendar, FileText, Clock } from 'lucide-react';

interface PronoteGrade {
  id: number;
  date: string;
  subject: string;
  grade: string;
  scrapedAt: string;
}

interface PronoteExam {
  id: number;
  day: string;
  month: string;
  subject: string;
  dateTime: string;
  salle: string | null;
  scrapedAt: string;
}

interface PronoteHomework {
  id: number;
  date: string;
  subject: string;
  status: string | null;
  description: string | null;
  scrapedAt: string;
}

interface PronoteData {
  grades: PronoteGrade[];
  exams: PronoteExam[];
  homework: PronoteHomework[];
}

interface PronoteDataCardsProps {
  studentId: number;
  refreshTrigger?: number;
}

export const PronoteDataCards: React.FC<PronoteDataCardsProps> = ({ studentId, refreshTrigger = 0 }) => {
  const [data, setData] = useState<PronoteData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await api.get(`/api/pronote/data/${studentId}`);
        setData(response.data);
        setError(null);
      } catch (err: any) {
        console.error('Erreur lors de la récupération des données Pronote:', err);
        setError(err.response?.data?.message || 'Erreur lors du chargement des données');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [studentId, refreshTrigger]);

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="animate-pulse">
          <CardHeader>
            <div className="h-6 bg-gray-200 rounded w-1/2"></div>
          </CardHeader>
          <CardContent>
            <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          </CardContent>
        </Card>
        <Card className="animate-pulse">
          <CardHeader>
            <div className="h-6 bg-gray-200 rounded w-1/2"></div>
          </CardHeader>
          <CardContent>
            <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          </CardContent>
        </Card>
        <Card className="animate-pulse">
          <CardHeader>
            <div className="h-6 bg-gray-200 rounded w-1/2"></div>
          </CardHeader>
          <CardContent>
            <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <Card className="border-red-200 bg-red-50">
        <CardContent className="pt-6">
          <p className="text-red-600">{error}</p>
        </CardContent>
      </Card>
    );
  }

  if (!data) return null;

  return (
    <div className="space-y-6">
      {/* Notes */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-blue-600" />
            <CardTitle>Notes</CardTitle>
          </div>
          <CardDescription>
            {data.grades.length > 0
              ? `${data.grades.length} note${data.grades.length > 1 ? 's' : ''} récupérée${data.grades.length > 1 ? 's' : ''}`
              : 'Aucune note disponible'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {data.grades.length > 0 ? (
            <div className="space-y-3">
              {data.grades.slice(0, 10).map((grade, index) => (
                <div key={grade.id}>
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <p className="font-medium text-sm">{grade.subject}</p>
                      <p className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                        <Calendar className="h-3 w-3" />
                        {grade.date}
                      </p>
                    </div>
                    <Badge variant="secondary" className="text-lg font-bold">
                      {grade.grade}
                    </Badge>
                  </div>
                  {index < Math.min(data.grades.length, 10) - 1 && <Separator className="mt-3" />}
                </div>
              ))}
              {data.grades.length > 10 && (
                <p className="text-xs text-gray-500 text-center pt-2">
                  et {data.grades.length - 10} autre{data.grades.length - 10 > 1 ? 's' : ''} note{data.grades.length - 10 > 1 ? 's' : ''}...
                </p>
              )}
            </div>
          ) : (
            <p className="text-sm text-gray-500 text-center py-4">Aucune note disponible</p>
          )}
        </CardContent>
      </Card>

      {/* Examens */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-orange-600" />
            <CardTitle>Prochains DS</CardTitle>
          </div>
          <CardDescription>
            {data.exams.length > 0
              ? `${data.exams.length} examen${data.exams.length > 1 ? 's' : ''} à venir`
              : 'Aucun examen planifié'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {data.exams.length > 0 ? (
            <div className="space-y-3">
              {data.exams.map((exam, index) => (
                <div key={exam.id}>
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <p className="font-medium text-sm">{exam.subject}</p>
                      <div className="flex flex-wrap gap-2 mt-2">
                        <Badge variant="outline" className="text-xs">
                          <Calendar className="h-3 w-3 mr-1" />
                          {exam.day} {exam.month}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          <Clock className="h-3 w-3 mr-1" />
                          {exam.dateTime}
                        </Badge>
                        {exam.salle && (
                          <Badge variant="outline" className="text-xs">
                            Salle {exam.salle}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                  {index < data.exams.length - 1 && <Separator className="mt-3" />}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-500 text-center py-4">Aucun examen planifié</p>
          )}
        </CardContent>
      </Card>

      {/* Devoirs */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-green-600" />
            <CardTitle>Travail à faire</CardTitle>
          </div>
          <CardDescription>
            {data.homework.length > 0
              ? `${data.homework.length} devoir${data.homework.length > 1 ? 's' : ''} en cours`
              : 'Aucun devoir en cours'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {data.homework.length > 0 ? (
            <div className="space-y-3">
              {data.homework.slice(0, 10).map((hw, index) => (
                <div key={hw.id}>
                  <div className="space-y-2">
                    <div className="flex justify-between items-start">
                      <p className="font-medium text-sm">{hw.subject}</p>
                      {hw.status && (
                        <Badge
                          variant={hw.status === 'Fait' ? 'default' : 'secondary'}
                          className="text-xs"
                        >
                          {hw.status}
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      Pour le {hw.date}
                    </p>
                    {hw.description && (
                      <p className="text-sm text-gray-700 bg-gray-50 p-2 rounded">
                        {hw.description}
                      </p>
                    )}
                  </div>
                  {index < Math.min(data.homework.length, 10) - 1 && <Separator className="mt-3" />}
                </div>
              ))}
              {data.homework.length > 10 && (
                <p className="text-xs text-gray-500 text-center pt-2">
                  et {data.homework.length - 10} autre{data.homework.length - 10 > 1 ? 's' : ''} devoir{data.homework.length - 10 > 1 ? 's' : ''}...
                </p>
              )}
            </div>
          ) : (
            <p className="text-sm text-gray-500 text-center py-4">Aucun devoir en cours</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
