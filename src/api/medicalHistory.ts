import { api } from "./client";
import { Patient } from "./patient";
import { Personal } from "./personal";
import { CaxCode } from "./caxCodes";

export interface Doctor {
  id: number;
  full_name: string;
  is_active?: boolean;
}

export interface Nurse {
  id: number;
  full_name: string;
  is_active?: boolean;
}

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

export async function createMedicalHistory(data: MedicalHistoryCreate) {
  return api("/medical_history/", {
    method: "POST",
    body: data,
  });
}


export const getMedicalHistoriesFiltered = async (
  filters: MedicalHistoryFilters = {}
): Promise<MedicalHistoryRead[]> => {
  const params = new URLSearchParams();
  if (filters.full_name) params.append("full_name", filters.full_name);
  if (filters.start_date) params.append("start_date", filters.start_date);
  if (filters.end_date) params.append("end_date", filters.end_date);

  return api<MedicalHistoryRead[]>(`/medical_history?${params.toString()}`);
};

export async function getCaxCodes(): Promise<CaxCode[]> {
  return api<CaxCode[]>("/cax_codes");
}

export async function getDoctors(): Promise<Personal[]> {
  return api<Personal[]>("/doctors");
}

export async function getNurses(): Promise<Personal[]> {
  return api<Personal[]>("/nurses");
}

export async function cancelMedicalHistory(historyId: number) {
  return api(`/medical_history/${historyId}/cancel`, { method: "POST" });
}

export async function reactivateMedicalHistory(historyId: number) {
  return api(`/medical_history/${historyId}/reactivate`, { method: "POST" });
}

export async function searchPatients(params: {
  lastname?: string;
  firstname?: string;
  secondname?: string;
  birthdate?: string;
  address?: string;
}): Promise<Patient[] | { error: string }> {
  const searchParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value) searchParams.append(key, value);
  });

  return api<Patient[] | { error: string }>(
    `/oracle/patient-search?${searchParams.toString()}`
  );
}

export async function suggestDischargeDate(data: {
  admission_date: string;
  cax_code_id: number;
}): Promise<{ discharge_date: string }> {
  return api("/dates/suggest_discharge_date", {
    method: "POST",
    body: data,
  });
}
