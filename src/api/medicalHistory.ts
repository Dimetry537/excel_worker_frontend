import { api } from "./client";
import type { Personal } from "./personal";
import type { Patient } from "./patient";
import type { CaxCode } from "./caxCodes";
import { OraclePatient } from "@/types/oraclePatients";

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
  return api<MedicalHistoryRead>("/medical_history/", {
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

export async function cancelMedicalHistory(historyId: number) {
  return api<MedicalHistoryRead>(`/medical_history/${historyId}/cancel`, { method: "POST" });
}

export async function reactivateMedicalHistory(historyId: number) {
  return api<MedicalHistoryRead>(`/medical_history/${historyId}/reactivate`, { method: "POST" });
}

export async function searchPatients(params: {
  lastname?: string;
  firstname?: string;
  secondname?: string;
  birthdate?: string;
  address?: string;
}): Promise<OraclePatient[] | { error: string }> {
  const searchParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value) searchParams.append(key, value);
  });

  return api<OraclePatient[] | { error: string }>(
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
