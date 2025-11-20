import { api } from "./client";

export interface CaxCode {
  id: number;
  cax_name: string;
  is_active?: boolean;
}

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

export interface Patient {
  pname: string;
  birthdate: string;
  address: string | null;
  lastworkplace: string | null;
  position: string | null;
}
export interface MedicalHistoryCreate {
  admission_date: string;
  discharge_date?: string;
  full_name: string;
  birth_date: string;
  address: string;
  workplace?: string;
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
  discharge_date?: string | null;
  full_name: string;
  birth_date: string;
  address: string;
  diagnosis: string;
  icd10_code: string;
  cancelled?: string | null;
  doctor: { id: number; full_name: string };
  nurse: { id: number; full_name: string };
  cax_code: { id: number; cax_name: string };
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
