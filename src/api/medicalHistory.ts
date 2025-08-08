import { api } from "./client";

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

export async function createMedicalHistory(data: MedicalHistoryCreate) {
  const response = await fetch("/medical_history/", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    const err = await response.json();
    throw new Error(err.detail || "Ошибка при сохранении");
  }
  return response.json();
}

export async function getCaxCodes() {
  return api("/cax_codes");
}

export async function getDoctors() {
  return api("/doctors");
}

export async function getNurses() {
  return api("/nurses");
}
