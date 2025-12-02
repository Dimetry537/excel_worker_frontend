import { api } from "./client";
import type { Operation, OperationCreate } from "@/types/entities/operation";

export const getOperations = () =>
  api<Operation[]>("/operations");

export const getOperationById = (id: number) =>
  api<Operation>(`/operations/${id}`);

export const getOperationsByHistoryId = (historyId: number) =>
  api<Operation[]>(`/operations/${historyId}`);

export const createOperation = (data: OperationCreate) =>
  api<Operation>("/operations", { method: "POST", body: data });

export const updateOperation = (id: number, data: OperationCreate) =>
  api<Operation>(`/operations/${id}`, { method: "PUT", body: data });

export const deleteOperation = (id: number) =>
  api<Operation>(`/operations/${id}`, { method: "DELETE" });
