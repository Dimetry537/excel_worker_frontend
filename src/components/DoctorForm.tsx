import { useEffect, useState } from "react";
import {
  createDoctor,
  getDoctors,
  deleteDoctor,
  updateDoctor,
  toggleDoctor,
} from "../api/doctors";
import type { Doctor } from "../api/doctors";

export default function DoctorForm() {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [name, setName] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [showInactive, setShowInactive] = useState(false);

  const fetchDoctors = async () => {
    try {
      const data = await getDoctors();
      setDoctors(data);
    } catch (error) {
      console.error("Ошибка загрузки врачей:", error);
    }
  };

  useEffect(() => {
    fetchDoctors();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingId !== null) {
        await updateDoctor(editingId, { full_name: name });
        setEditingId(null);
      } else {
        await createDoctor({ full_name: name });
      }
      setName("");
      await fetchDoctors();
    } catch (error) {
      console.error("Ошибка при сохранении:", error);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Удалить врача?")) return;
    try {
      await deleteDoctor(id);
      await fetchDoctors();
    } catch (error) {
      console.error("Ошибка при удалении:", error);
    }
  };

  const handleEdit = (doctor: Doctor) => {
    setEditingId(doctor.id);
    setName(doctor.full_name);
  };

  const handleToggleActive = async (id: number) => {
    try {
      await toggleDoctor(id);
      await fetchDoctors();
    } catch (error) {
      console.error("Ошибка при изменении активности:", error);
    }
  };

  const filteredDoctors = showInactive
    ? doctors
    : doctors.filter((doc) => doc.is_active);

  return (
    <div>
      <div>
        <h2>
          {editingId ? "Редактировать врача" : "Добавить врача"}
        </h2>

        <form onSubmit={handleSubmit}>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="ФИО врача"
          />
          <button
            type="submit"
          >
            {editingId ? "Сохранить" : "Добавить"}
          </button>
          {editingId !== null && (
            <button
              type="button"
              onClick={() => {
                setEditingId(null);
                setName("");
              }}
            >
              Отмена
            </button>
          )}
        </form>

        <div>
          <label>
            <input
              type="checkbox"
              checked={showInactive}
              onChange={(e) => setShowInactive(e.target.checked)}
            />
            Показать скрытых
          </label>
        </div>

        <ul>
          {filteredDoctors.map((doc) => (
            <li
              key={doc.id}
            >
              <span>{doc.full_name}</span>
              <div>
                <button
                  onClick={() => handleEdit(doc)}
                >
                  ✏️ Редактировать
                </button>
                <button
                  onClick={() => handleToggleActive(doc.id)}
                >
                  {doc.is_active ? "🙈 Скрыть" : "👁 Показать"}
                </button>
                <button
                  onClick={() => handleDelete(doc.id)}
                >
                  🗑 Удалить
                </button>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
