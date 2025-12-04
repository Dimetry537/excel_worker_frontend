import { api } from "@/api/client";
import { OraclePatient } from "@/types/entities/oraclePatients";
import type { MedicalHistoryCreate, MedicalHistoryRead, MedicalHistoryFilters } from "@/types/entities/medicalHistory";

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

export const getMedicalHistoryById = (id: number) =>
  api<MedicalHistoryRead>(`/medical_history/${id}`);

export const updateMedicalHistory = (id: number, data: Partial<MedicalHistoryCreate>) =>
  api<MedicalHistoryRead>(`/medical_history/${id}`, {
    method: "PUT",
    body: data,
  });

export const startGenerateReport = (historyId: number) =>
  api<{ task_id: string; message: string }>(
    `/medical_history/${historyId}/report-async`,
    { method: "POST" }
  );
