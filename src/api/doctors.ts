import { api } from "./client";

export interface Doctor {
    id: number;
    full_name: string;
}

export async function getDoctors(): Promise<Doctor[]> {
    return api<Doctor[]>('/doctors');
}

export async function createDoctor(data: {full_name: string}): Promise<Doctor> {
    return api<Doctor>('/doctors', {
        method: 'POST',
        body: data,
    });
}

export async function updateDoctor(id: number, data: {full_name: string}): Promise<Doctor> {
    return api<Doctor>(`/doctors/${id}`, {
        method: 'PUT',
        body: data,
    });
}

export async function deleteDoctor(id: number): Promise<void> {
    return api<void>(`/doctors/${id}`, {
        method: 'DELETE',
    });
}
