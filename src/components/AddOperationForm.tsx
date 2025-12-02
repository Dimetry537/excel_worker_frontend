import { useState } from "react";
import { createOperation } from "@/api/operation";
import type { OperationCreate } from "@/types/entities/operation";
import { toast } from "sonner";

interface Props {
  historyId: number;
  onSuccess: () => void;
}

export default function AddOperationForm({ historyId, onSuccess }: Props) {
  const [form, setForm] = useState<OperationCreate>({
    oper_name: "",
    oper_protocol: "",
    medical_history_id: historyId,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.oper_name.trim() || !form.oper_protocol.trim()) {
      return toast.error("Заполните все поля");
    }

    try {
      await createOperation(form);
      toast.success("Операция добавлена");
      setForm({ oper_name: "", oper_protocol: "", medical_history_id: historyId });
      onSuccess();
    } catch {
      toast.error("Ошибка добавления операции");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 p-4 bg-gray-50 rounded-lg">
      <input
        type="text"
        placeholder="Название операции"
        value={form.oper_name}
        onChange={(e) => setForm({ ...form, oper_name: e.target.value })}
        className="w-full border rounded px-4 py-2"
        required
      />
      <textarea
        placeholder="Протокол операции"
        rows={4}
        value={form.oper_protocol}
        onChange={(e) => setForm({ ...form, oper_protocol: e.target.value })}
        className="w-full border rounded px-4 py-2"
        required
      />
      <button type="submit" className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded font-medium">
        Добавить операцию
      </button>
    </form>
  );
}
