import { api } from "./client";
import type { Patient } from "@/types/entities/patient";

export type PatientCreate = Omit<Patient, "id" | "is_active" | "created_at" | "updated_at">;

export const getPatients = () =>
  api<Patient[]>("/patients");

export const getPatientById = (id: number) =>
  api<Patient>(`/patients/${id}`);

export const createPatient = (data: PatientCreate) =>
  api<Patient>("/patients", { method: "POST", body: data });

export const updatePatient = (id: number, data: PatientCreate) =>
  api<Patient>(`/patients/${id}`, { method: "PUT", body: data });

export const deletePatient = (id: number) =>
  api<Patient>(`/patients/${id}`, { method: "DELETE" });

export const togglePatientActive = (id: number) =>
  api<Patient>(`/patients/${id}/toggle_active`, { method: "PATCH" });
