import { useState, useEffect } from "react";
import { createOperation, updateOperation, deleteOperation } from "@/api/operation";
import type { OperationCreate, OperationRead } from "@/types/entities/operation";
import { toast } from "sonner";

interface Props {
  historyId: number;
  operation?: OperationRead | null;
  onSuccess: () => void;
  onCancel?: () => void;
}

export default function OperationForm({ historyId, operation, onSuccess, onCancel }: Props) {
  const isEdit = !!operation;

  const [form, setForm] = useState<OperationCreate>({
    oper_name: operation?.oper_name || "",
    oper_protocol: operation?.oper_protocol || "",
    medical_history_id: historyId,
  });

  useEffect(() => {
    if (operation) {
      setForm({
        oper_name: operation.oper_name,
        oper_protocol: operation.oper_protocol,
        medical_history_id: historyId,
      });
    }
  }, [operation, historyId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.oper_name.trim() || !form.oper_protocol.trim()) {
      return toast.error("Заполните все поля");
    }

    try {
      if (isEdit && operation?.id) {
        await updateOperation(operation.id, form);
        toast.success("Операция обновлена");
      } else {
        await createOperation(form);
        toast.success("Операция добавлена");
        setForm({ oper_name: "", oper_protocol: "", medical_history_id: historyId });
      }
      onSuccess();
    } catch {
      toast.error(`Ошибка при ${isEdit ? "обновлении" : "добавлении"} операции`);
    }
  };

  const handleDelete = async () => {
    if (!operation?.id) return;
    if (!confirm("Удалить операцию? Это действие нельзя отменить.")) return;

    try {
      await deleteOperation(operation.id);
      toast.success("Операция удалена");
      onSuccess();
    } catch {
      toast.error("Ошибка при удалении");
    }
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-lg border">
      <h3 className="text-xl font-bold mb-5 text-gray-800">
        {isEdit ? "Редактировать операцию" : "Добавить операцию"}
      </h3>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Название операции
          </label>
          <input
            type="text"
            value={form.oper_name}
            onChange={(e) => setForm({ ...form, oper_name: e.target.value })}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
            placeholder="Например: Аппендэктомия"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Протокол операции
          </label>
          <textarea
            rows={6}
            value={form.oper_protocol}
            onChange={(e) => setForm({ ...form, oper_protocol: e.target.value })}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition resize-none"
            placeholder="Опишите ход операции..."
            required
          />
        </div>

        <div className="flex gap-3 pt-4">
          <button
            type="submit"
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-6 py-3 rounded-lg transition shadow"
          >
            {isEdit ? "Сохранить изменения" : "Добавить операцию"}
          </button>

          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="bg-gray-500 hover:bg-gray-600 text-white font-medium px-6 py-3 rounded-lg transition"
            >
              Отмена
            </button>
          )}

          {isEdit && (
            <button
              type="button"
              onClick={handleDelete}
              className="bg-red-600 hover:bg-red-700 text-white font-medium px-6 py-3 rounded-lg transition shadow ml-auto"
            >
              Удалить
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
