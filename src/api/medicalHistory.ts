import { api } from "./client";

export interface CaxCode {
  id: number;
  cax_name: string;
}

export interface Doctor {
  id: number;
  full_name: string;
}

export interface Nurse {
  id: number;
  full_name: string;
}

export interface MedicalHistoryCreate {
  admission_date: string;
  discharge_date?: string;
  full_name: string;
  birth_date: string;
  address: string;
  diagnosis: string;
  icd10_code: string;
  cax_code_id: number;
  doctor_id: number;
  nurse_id: number;
}

export interface MedicalHistory {
  id: number;
  history_number: number;
  admission_date: string;
  discharge_date?: string;
  full_name: string;
  birth_date: string;
  address: string;
  diagnosis: string;
  icd10_code: string;
  cancelled?: string | null;

  doctor: {
    id: number;
    full_name: string;
  };
  nurse: {
    id: number;
    full_name: string;
  };
  cax_code: {
    id: number;
    cax_name: string;
  };
}

export async function createMedicalHistory(data: MedicalHistoryCreate) {
  return api("/medical_history/", {
    method: "POST",
    body: data,
  });
}

export async function getMedicalHistoriesFiltered(
  full_name?: string,
  admission_date?: string
): Promise<MedicalHistory[]> {
  const params = new URLSearchParams();
  if (full_name) params.append("full_name", full_name);
  if (admission_date) params.append("admission_date", admission_date);

  return api<MedicalHistory[]>(`/medical_history/?${params.toString()}`);
}

export async function getCaxCodes(): Promise<CaxCode[]> {
  return api<CaxCode[]>("/cax_codes");
}

export async function getDoctors(): Promise<Doctor[]> {
  return api<Doctor[]>("/doctors");
}

export async function getNurses(): Promise<Nurse[]> {
  return api<Nurse[]>("/nurses");
}
