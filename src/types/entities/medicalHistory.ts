import type { Personal } from "@/types/entities/personal";
import type { Patient } from "@/types/entities/patient";
import type { CaxCode } from "@/types/entities/caxCode";

export interface MedicalHistoryCreate {
  admission_date: string;
  discharge_date?: string | null;
  full_name: string;
  birth_date: string;
  address: string;
  workplace?: string | null;
  diagnosis: string;
  icd10_code: string;
  cax_code_id: number;
  doctor_id: number;
  nurse_id: number;
}

export interface MedicalHistoryRead {
  id: number;
  history_number: number;
  admission_date: string;
  discharge_date?: string | null;
  diagnosis: string;
  icd10_code: string;
  cancelled?: string | null;
  created_at?: string | null;
  updated_at?: string | null;

  patient: Patient;
  doctor: Personal;
  nurse: Personal;
  cax_code: CaxCode;
}

export interface MedicalHistoryFilters {
  full_name?: string;
  start_date?: string;
  end_date?: string;
}
