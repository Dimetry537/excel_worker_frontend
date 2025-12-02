export interface Patient {
  id: number;
  full_name: string;
  birth_date: string;
  address: string;
  workplace?: string | null;
  is_active: boolean;
  created_at?: string | null;
  updated_at?: string | null;
}

export type PatientCreate = {
  full_name: string;
  birth_date: string;
  address: string;
  workplace?: string | null;
};
