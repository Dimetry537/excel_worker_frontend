import { api } from "./client";

export interface CaxCode {
  id: number;
  cax_code: number;
  cax_name: string;
}

export async function getCaxCodes(): Promise<CaxCode[]> {
  return api<CaxCode[]>("/cax_codes");
}

export async function createCaxCode(data: { cax_code: number; cax_name: string }): Promise<CaxCode> {
  return api<CaxCode>("/cax_codes", {
    method: "POST",
    body: data,
  });
}

export async function updateCaxCode(id: number, data: { cax_code: number; cax_name: string }): Promise<CaxCode> {
  return api<CaxCode>(`/cax_codes/${id}`, {
    method: "PUT",
    body: data,
  });
}

export async function deleteCaxCode(id: number): Promise<void> {
  return api<void>(`/cax_codes/${id}`, {
    method: "DELETE",
  });
}