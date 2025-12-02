export interface Operation {
  id: number;
  oper_name: string;
  oper_protocol: string;
  medical_history_id: number;
  created_at: string;
  updated_at: string;
}

export type OperationRead = Operation;

export type OperationCreate = Omit<Operation, "id" | "created_at" | "updated_at">;
