import { api } from "./client";

export interface Nurse {
  id: number;
  full_name: string;
  is_active: boolean;
}

export async function getNurses(): Promise<Nurse[]> {
  return api<Nurse[]>("/nurses");
}

export async function createNurse(data: { full_name: string }): Promise<Nurse> {
  return api<Nurse>("/nurses", {
    method: "POST",
    body: data,
  });
}

export async function updateNurse(id: number, data: { full_name: string }): Promise<Nurse> {
  return api<Nurse>(`/nurses/${id}`, {
    method: "PUT",
    body: data,
  });
}

export async function deleteNurse(id: number): Promise<void> {
  return api<void>(`/nurses/${id}`, {
    method: "DELETE",
  });
}

export async function toggleNurse(id: number) {
  return api<Nurse>(`/nurses/${id}/toggle_active`, {
    method: "PATCH",
  });
}
