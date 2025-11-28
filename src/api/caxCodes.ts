import { api } from "./client";
import type { CaxCode } from "@/types/entities/caxCode";

export async function getCaxCodes(): Promise<CaxCode[]> {
  return api<CaxCode[]>("/cax_codes");
}

export async function createCaxCode(data: { cax_code: number; cax_name: string; quantity_of_days: number }): Promise<CaxCode> {
  return api<CaxCode>("/cax_codes", {
    method: "POST",
    body: data,
  });
}

export async function updateCaxCode(id: number, data: { cax_code: number; cax_name: string; quantity_of_days: number }): Promise<CaxCode> {
  return api<CaxCode>(`/cax_codes/${id}`, {
    method: "PUT",
    body: data,
  });
}

export async function deleteCaxCode(id: number): Promise<CaxCode> {
  return api<CaxCode>(`/cax_codes/${id}`, {
    method: "DELETE",
  });
}

export async function toggleCaxCodeActive(id: number): Promise<CaxCode> {
  return api<CaxCode>(`/cax_codes/${id}/toggle_active`, {
    method: "PATCH",
  });
}
