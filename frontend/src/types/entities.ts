// Types pour les entités principales
export interface Center {
  id: number;
  name: string;
  address: string;
  city: string;
  zip_code: string;
  email: string;
  phone: string;
  siret?: string;
  created_at?: string;
  updated_at?: string;
  created_by?: string;
  updated_by?: string;
}

export interface Student {
  id: number;
  firstname: string;
  lastname: string;
  email: string;
  class: string;
  gender?: string;
  phone?: string;
  centers?: Center;
  school_subjects?: string[];
  is_active?: boolean;
  is_deleted?: boolean;
  created_at?: string;
  updated_at?: string;
  created_by?: string;
  updated_by?: string;
}

export interface Tutor {
  id: number;
  firstname: string;
  lastname: string;
  email: string;
  school_subjects?: string[];
  class?: Array<{
    subject: string;
    level: string;
  }>;
  centers?: Center[];
  events?: Array<{
    id: number;
    day: string;
    start_hour: string;
    end_hour: string;
    centers: Center;
  }>;
  price_per_hour?: number;
  max_session?: number;
  is_active?: boolean;
  created_at?: string;
  updated_at?: string;
  created_by?: string;
  updated_by?: string;
}