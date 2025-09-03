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
    <div className="bg-gray-100 px-2 pt-4 h-[33vh]">
      <div className="bg-green-200 rounded-2xl shadow-lg p-6 w-96">
        <h2 className="text-xl font-bold mb-3 text-blue-800 text-center">
          {editingId ? "Редактировать врача" : "Добавить врача"}
        </h2>

        <form onSubmit={handleSubmit} className="flex gap-2 mb-2">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="flex-1 border border-gray-300 rounded-lg px-2 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="ФИО врача"
          />
          <button
            type="submit"
            className="bg-blue-600 hover:bg-blue-700 text-white text-lg font-semibold px-3 py-2 rounded-lg"
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
              className="bg-gray-500 hover:bg-gray-600 text-white text-lg font-semibold px-3 py-2 rounded-lg"
            >
              Отмена
            </button>
          )}
        </form>

        <div className="flex justify-between items-center mb-2">
          <label className="flex items-center gap-1 text-sm">
            <input
              type="checkbox"
              checked={showInactive}
              onChange={(e) => setShowInactive(e.target.checked)}
            />
            Показать скрытых
          </label>
        </div>

        <ul className="space-y-2">
          {filteredDoctors.map((doc) => (
            <li
              key={doc.id}
              className={`flex justify-between items-center border-b pb-1 ${
                !doc.is_active ? "opacity-50" : ""
              }`}
            >
              <span className="text-sm">{doc.full_name}</span>
              <div className="space-x-4">
                <button
                  onClick={() => handleEdit(doc)}
                  className="text-yellow-600 hover:underline text-lg"
                >
                  ✏️ Редактировать
                </button>
                <button
                  onClick={() => handleToggleActive(doc.id)}
                  className="text-blue-600 hover:underline text-lg"
                >
                  {doc.is_active ? "🙈 Скрыть" : "👁 Показать"}
                </button>
                <button
                  onClick={() => handleDelete(doc.id)}
                  className="text-red-600 hover:underline text-lg"
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
