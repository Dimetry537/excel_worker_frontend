import { api } from "@/api/client";
import type { Personal, PersonalCreateData } from "@/types/entities/personal";

export async function getNurses(): Promise<Personal[]> {
    return api<Personal[]>('/nurses');
}

export async function createNurse(data: PersonalCreateData): Promise<Personal> {
    return api<Personal>('/nurses', {
        method: 'POST',
        body: data,
    });
}

export async function updateNurse(id: number, data: PersonalCreateData): Promise<Personal> {
    return api<Personal>(`/nurses/${id}`, {
        method: 'PUT',
        body: data,
    });
}

export async function deleteNurse(id: number): Promise<Personal> {
    return api<Personal>(`/nurses/${id}`, {
        method: 'DELETE',
    });
}

export async function toggleNurse(id: number): Promise<Personal> {
  return api<Personal>(`/nurses/${id}/toggle_active`, {
    method: "PATCH",
  });
}
