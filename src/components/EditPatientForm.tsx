// src/components/EditPatientForm.tsx
import { updatePatient } from "@/api/patient";
import type { Patient } from "@/types/entities/patient";
import { toast } from "sonner";

interface Props {
  patient: Patient;
  onSuccess: () => void;
  onClose: () => void;
}

export default function EditPatientForm({ patient, onSuccess, onClose }: Props) {
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Теперь currentTarget точно HTMLFormElement
    const form = e.currentTarget;
    const formData = new FormData(form);

    // Приводим к нужному типу безопасно
    const updated = {
      full_name: formData.get("full_name") as string,
      birth_date: formData.get("birth_date") as string,
      address: formData.get("address") as string,
      workplace: (formData.get("workplace") as string) || null,
    };

    // Проверка на обязательные поля
    if (!updated.full_name || !updated.birth_date || !updated.address) {
      toast.error("Заполните все обязательные поля");
      return;
    }

    try {
      await updatePatient(patient.id, updated);
      toast.success("Данные пациента обновлены");
      onSuccess();
      onClose();
    } catch {
      toast.error("Ошибка сохранения");
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full max-h-screen overflow-y-auto">
        <h3 className="text-xl font-bold mb-6">Редактировать пациента</h3>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">ФИО *</label>
            <input
              name="full_name"
              type="text"
              defaultValue={patient.full_name}
              required
              className="w-full border rounded px-4 py-2"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Дата рождения *</label>
            <input
              name="birth_date"
              type="date"
              defaultValue={patient.birth_date}
              required
              className="w-full border rounded px-4 py-2"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Адрес *</label>
            <input
              name="address"
              type="text"
              defaultValue={patient.address}
              required
              className="w-full border rounded px-4 py-2"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Место работы</label>
            <input
              name="workplace"
              type="text"
              defaultValue={patient.workplace || ""}
              placeholder="Не указано"
              className="w-full border rounded px-4 py-2"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded font-medium"
            >
              Сохранить
            </button>
            <button
              type="button"
              onClick={onClose}
              className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-3 rounded font-medium"
            >
              Отмена
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
