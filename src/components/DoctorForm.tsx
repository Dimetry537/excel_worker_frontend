import { useState, useEffect } from "react";
import {
  getDoctors,
  createDoctor,
  updateDoctor,
  deleteDoctor,
  toggleDoctor,
} from "@/api/doctors";
import type { Personal } from "@/types/entities/personal";
import { toast } from "sonner";

export default function DoctorForm() {
  const [doctors, setDoctors] = useState<Personal[]>([]);
  const [name, setName] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [showInactive, setShowInactive] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const fetchDoctors = async () => {
    setIsLoading(true);
    try {
      const data = await getDoctors();
      setDoctors(data);
    } catch {
      toast.error("Не удалось загрузить список врачей");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDoctors();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      return toast.error("Введите ФИО врача");
    }

    setIsLoading(true);
    try {
      if (editingId !== null) {
        await updateDoctor(editingId, { full_name: name.trim() });
        toast.success("Врач успешно обновлён");
        setEditingId(null);
      } else {
        await createDoctor({ full_name: name.trim() });
        toast.success("Врач успешно добавлен");
      }
      setName("");
      await fetchDoctors();
    } catch {
      toast.error("Ошибка при сохранении врача");
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (doctor: Personal) => {
    setEditingId(doctor.id);
    setName(doctor.full_name);
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setName("");
  };

  const handleToggleActive = async (id: number, currentActive: boolean) => {
    if (!confirm(currentActive ? "Деактивировать врача?" : "Активировать врача?")) {
      return;
    }

    try {
      const updated = await toggleDoctor(id);
      toast.success(currentActive ? "Врач деактивирован" : "Врач активирован");
      setDoctors(prev => prev.map(d => d.id === id ? updated : d));
    } catch {
      toast.error("Не удалось изменить статус");
    }
  };

  const handleDelete = async (id: number, fullName: string) => {
    if (!confirm(`Удалить врача "${fullName}"? Это действие необратимо.`)) {
      return;
    }

    try {
      const deleted = await deleteDoctor(id);
      toast.success(`Врач "${deleted.full_name}" полностью удалён`);
      await fetchDoctors();
    } catch (err: unknown) {
      if (
        err &&
        typeof err === "object" &&
        "status" in err &&
        (err as { status?: number }).status === 400
      ) {
        const errorData = err as { data?: { detail?: string } };
        toast.info(
          errorData.data?.detail ||
            "Врач деактивирован вместо удаления (есть связанные записи)"
        );
        await fetchDoctors();
      } else {
        toast.error("Ошибка при удалении врача");
      }
    }
  };

  const filteredDoctors = doctors.filter(doctor => showInactive || doctor.is_active);

  if (isLoading && doctors.length === 0) {
    return <div>Загрузка врачей...</div>;
  }

  return (
    <div>
      <h2>{editingId ? "Редактировать врача" : "Добавить врача"}</h2>

      <form onSubmit={handleSubmit}>
        <div>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="ФИО врача"
            disabled={isLoading}
          />
          <button type="submit" disabled={isLoading || !name.trim()}>
            {isLoading ? "..." : editingId ? "Сохранить" : "Добавить"}
          </button>

          {editingId !== null && (
            <button type="button" onClick={handleCancelEdit}>
              Отмена
            </button>
          )}
        </div>
      </form>

      <div>
        <label>
          <input
            type="checkbox"
            checked={showInactive}
            onChange={(e) => setShowInactive(e.target.checked)}
          />{" "}
          Показать деактивированных
        </label>
      </div>

      <ul>
        {filteredDoctors.map((doctor) => (
          <li key={doctor.id}>
            <span>
              {doctor.full_name}
              {!doctor.is_active && " (неактивен)"}
            </span>

            <div>
              <button onClick={() => handleEdit(doctor)}>
                ✏️ Редактировать
              </button>

              <button onClick={() => handleToggleActive(doctor.id, doctor.is_active)}>
                {doctor.is_active ? "🙈 Скрыть" : "👁 Показать"}
              </button>

              <button onClick={() => handleDelete(doctor.id, doctor.full_name)}>
                🗑 Удалить
              </button>
            </div>
          </li>
        ))}
      </ul>

      {filteredDoctors.length === 0 && (
        <p>
          {showInactive
            ? "Нет врачей (включая деактивированных)"
            : "Нет активных врачей"}
        </p>
      )}
    </div>
  );
}
