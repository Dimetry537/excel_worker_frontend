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
      <div>
        <div>
          <h3>Редактировать пациента</h3>

          <form onSubmit={handleSubmit}>
            <div>
              <label>ФИО *</label>
              <input
                name="full_name"
                type="text"
                defaultValue={patient.full_name}
                required
              />
            </div>

            <div>
              <label>Дата рождения *</label>
              <input
                name="birth_date"
                type="date"
                defaultValue={patient.birth_date}
                required
              />
            </div>

            <div>
              <label>Адрес *</label>
              <input
                name="address"
                type="text"
                defaultValue={patient.address}
                required
              />
            </div>

            <div>
              <label>Место работы</label>
              <input
                name="workplace"
                type="text"
                defaultValue={patient.workplace || ""}
                placeholder="Не указано"
              />
            </div>

            <div>
              <button type="submit">
                Сохранить
              </button>
              <button type="button" onClick={onClose}>
                Отмена
              </button>
            </div>
          </form>
        </div>
      </div>
    );
}
