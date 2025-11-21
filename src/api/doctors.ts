import { api } from "./client";
import type { Personal, PersonalCreateData } from "@/types/personal";

export async function getDoctors(): Promise<Personal[]> {
    return api<Personal[]>('/doctors');
}

export async function createDoctor(data: PersonalCreateData): Promise<Personal> {
    return api<Personal>('/doctors', {
        method: 'POST',
        body: data,
    });
}

export async function updateDoctor(id: number, data: PersonalCreateData): Promise<Personal> {
    return api<Personal>(`/doctors/${id}`, {
        method: 'PUT',
        body: data,
    });
}

export async function deleteDoctor(id: number): Promise<Personal> {
    return api<Personal>(`/doctors/${id}`, {
        method: 'DELETE',
    });
}

export async function toggleDoctor(id: number): Promise<Personal> {
  return api<Personal>(`/doctors/${id}/toggle_active`, {
    method: "PATCH",
  });
}
